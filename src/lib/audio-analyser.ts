// Audio Analyser Singleton
// Provides Web Audio API analysis (frequency + waveform data) for visualizers.
// Lazily connects on first call to ensureConnected() — requires a user gesture.

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let connected = false;
let pendingAudio: HTMLAudioElement | null = null;

const FFT_SIZE = 256; // 128 frequency bins — enough for ambient visualizers

/**
 * Register an audio element for later connection.
 * Does NOT create the AudioContext yet (avoids suspended-context issues).
 */
export function registerAudioElement(audio: HTMLAudioElement): void {
    audio.crossOrigin = 'anonymous';
    pendingAudio = audio;
}

/**
 * Lazily connect the registered audio element to the Web Audio API analyser.
 * Call this from a user-gesture handler (e.g. play button click).
 * Safe to call multiple times — only connects once.
 */
export function ensureConnected(): void {
    if (connected || !pendingAudio) return;

    try {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = FFT_SIZE;
        analyser.smoothingTimeConstant = 0.82;

        sourceNode = audioContext.createMediaElementSource(pendingAudio);
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);

        connected = true;
    } catch (e) {
        console.warn('Audio analyser connection failed:', e);
        // Audio will still play normally through the default output
    }
}

/**
 * Resume AudioContext after user gesture (required by Chrome autoplay policy).
 */
export function resumeAudioContext(): void {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

/**
 * Get current frequency data (0-255 per bin).
 * Returns null if analyser is not connected.
 */
export function getFrequencyData(): Uint8Array | null {
    if (!analyser) return null;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    return data;
}

/**
 * Get current waveform (time-domain) data (0-255, 128 = silence).
 * Returns null if analyser is not connected.
 */
export function getTimeDomainData(): Uint8Array | null {
    if (!analyser) return null;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    return data;
}

/**
 * Get energy levels split into bass, mids, highs (0-1 normalized).
 */
export function getEnergyBands(): { bass: number; mids: number; highs: number } | null {
    const freq = getFrequencyData();
    if (!freq) return null;

    const binCount = freq.length;
    const bassEnd = Math.floor(binCount * 0.15);
    const midsEnd = Math.floor(binCount * 0.5);

    let bassSum = 0;
    let midsSum = 0;
    let highsSum = 0;

    for (let i = 0; i < bassEnd; i++) bassSum += freq[i];
    for (let i = bassEnd; i < midsEnd; i++) midsSum += freq[i];
    for (let i = midsEnd; i < binCount; i++) highsSum += freq[i];

    const bassAvg = bassSum / (bassEnd * 255);
    const midsAvg = midsSum / ((midsEnd - bassEnd) * 255);
    const highsAvg = highsSum / ((binCount - midsEnd) * 255);

    return { bass: bassAvg, mids: midsAvg, highs: highsAvg };
}

/**
 * Check if the analyser is connected and ready.
 */
export function isAnalyserReady(): boolean {
    return connected && analyser !== null;
}
