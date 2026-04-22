// Visualizer bus — lets DOM text dissolve into the canvas flow field.
//
// DOM can't composite into canvas directly, so we mirror the text: a component
// rasterizes its own rendered form into an offscreen canvas at the exact
// bounding rect, then dispatches that bitmap here. The AudioVisualizer picks
// it up on the next frame and stamps it into its feedback buffer, where the
// engine's warp + decay naturally smears it into the color flow.

export interface TextEmission {
    source: HTMLCanvasElement;  // rasterized text bitmap (same size as rect)
    x: number;                  // CSS px, canvas-local
    y: number;
    w: number;
    h: number;
    durationMs: number;
    createdAt: number;          // performance.now()
}

const emissions: TextEmission[] = [];

export function pushEmission(e: Omit<TextEmission, 'createdAt'>): void {
    emissions.push({ ...e, createdAt: performance.now() });
}

export function getActiveEmissions(now: number): TextEmission[] {
    // Drop expired in place. Callers read by reference so we don't reallocate.
    for (let i = emissions.length - 1; i >= 0; i--) {
        if (now - emissions[i].createdAt > emissions[i].durationMs) {
            emissions.splice(i, 1);
        }
    }
    return emissions;
}

export function clearEmissions(): void {
    emissions.length = 0;
}

// Rasterize the visible text inside `host` into an offscreen canvas sized to
// the host's bounding rect. Uses the host's computed font so what lands in the
// canvas matches what the user reads. Returns the canvas + rect, or null if
// the host has no layout / is empty.
export function rasterizeTextElement(host: HTMLElement): {
    canvas: HTMLCanvasElement;
    x: number;
    y: number;
    w: number;
    h: number;
} | null {
    const text = (host.textContent || '').trim();
    if (!text) return null;

    const rect = host.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return null;

    const cs = window.getComputedStyle(host);
    const fontSize = parseFloat(cs.fontSize) || 24;
    const fontWeight = cs.fontWeight || '300';
    const fontFamily = cs.fontFamily || 'system-ui, sans-serif';
    const letterSpacing = parseFloat(cs.letterSpacing) || 0;
    const textTransform = cs.textTransform;
    const display = textTransform === 'uppercase' ? text.toUpperCase()
        : textTransform === 'lowercase' ? text.toLowerCase()
        : text;

    // Color: use the computed foreground. The engine stamps with 'source-over'
    // tinted by the rasterized alpha, so this color becomes the emission tint.
    const color = cs.color || 'rgba(42, 38, 34, 0.9)';

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const buf = document.createElement('canvas');
    buf.width = Math.ceil(rect.width * dpr);
    buf.height = Math.ceil(rect.height * dpr);
    const ctx = buf.getContext('2d');
    if (!ctx) return null;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.textAlign = cs.textAlign === 'center' ? 'center' : 'left';

    // Manual letter-spacing: canvas 2D letterSpacing is newer; fall back to walk
    // so older browsers still work. Spacing is small so this is cheap.
    if ((ctx as unknown as { letterSpacing?: string }).letterSpacing !== undefined && letterSpacing) {
        (ctx as unknown as { letterSpacing: string }).letterSpacing = `${letterSpacing}px`;
        const x = ctx.textAlign === 'center' ? rect.width / 2 : 0;
        ctx.fillText(display, x, rect.height / 2);
    } else if (letterSpacing) {
        let cursor = 0;
        const totalAdvance = Array.from(display).reduce(
            (acc, ch) => acc + ctx.measureText(ch).width + letterSpacing,
            -letterSpacing,
        );
        if (ctx.textAlign === 'center') cursor = (rect.width - totalAdvance) / 2;
        const prevAlign = ctx.textAlign;
        ctx.textAlign = 'left';
        for (const ch of display) {
            ctx.fillText(ch, cursor, rect.height / 2);
            cursor += ctx.measureText(ch).width + letterSpacing;
        }
        ctx.textAlign = prevAlign;
    } else {
        const x = ctx.textAlign === 'center' ? rect.width / 2 : 0;
        ctx.fillText(display, x, rect.height / 2);
    }

    return { canvas: buf, x: rect.left, y: rect.top, w: rect.width, h: rect.height };
}
