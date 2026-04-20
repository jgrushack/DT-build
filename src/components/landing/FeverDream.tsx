'use client';

import { useEffect, useState } from 'react';
import LoginCard from './LoginCard';

type Phase = 'dreaming' | 'login';

const DREAM_DURATION_MS = 5200;
const SKIP_AVAILABLE_AT_MS = 2000;

type FeverDreamProps = {
  loginError?: string | null;
};

export default function FeverDream({ loginError = null }: FeverDreamProps) {
  const [phase, setPhase] = useState<Phase>('dreaming');
  const [skipVisible, setSkipVisible] = useState(false);

  useEffect(() => {
    const skipTimer = setTimeout(() => setSkipVisible(true), SKIP_AVAILABLE_AT_MS);
    const advanceTimer = setTimeout(() => setPhase('login'), DREAM_DURATION_MS);
    return () => {
      clearTimeout(skipTimer);
      clearTimeout(advanceTimer);
    };
  }, []);

  const handleSkip = () => setPhase('login');

  return (
    <div
      className="fixed inset-0 overflow-hidden flex items-center justify-center"
      style={{ background: '#0a0908' }}
    >
      {/*
        VISUAL LAYER — placeholder.
        Visualizer Claude will replace this with the fever-dream visual component.
        Contract: full-bleed, absolute positioned, reads `phase` to know when to dim
        (or use the provided opacity class on the wrapper below).
      */}
      <div
        aria-hidden
        className={`absolute inset-0 transition-opacity duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === 'login' ? 'opacity-40' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 animate-dream-drift-a" />
        <div className="absolute inset-0 animate-dream-drift-b" />
        <div className="absolute inset-0 animate-dream-pulse" />
      </div>

      {/* Skip affordance — appears after SKIP_AVAILABLE_AT_MS */}
      <button
        type="button"
        onClick={handleSkip}
        className={`absolute bottom-10 left-1/2 -translate-x-1/2 z-10 text-[10px] uppercase tracking-[0.4em] text-[#a4b396]/60 hover:text-[#f5f0e8] transition-opacity duration-1000 ${
          skipVisible && phase === 'dreaming' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        Enter
      </button>

      {/* Login card — crossfades in during 'login' phase with 0.6s overlap */}
      <div
        className={`relative z-20 transition-opacity duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          phase === 'login' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          transitionDelay: phase === 'login' ? '600ms' : '0ms',
        }}
      >
        <LoginCard error={loginError} />
      </div>

      <style jsx>{`
        @keyframes dream-drift-a {
          0%, 100% {
            background: radial-gradient(ellipse 80% 60% at 30% 40%, rgba(201, 164, 92, 0.08) 0%, transparent 60%);
          }
          50% {
            background: radial-gradient(ellipse 90% 70% at 60% 55%, rgba(201, 164, 92, 0.14) 0%, transparent 65%);
          }
        }
        @keyframes dream-drift-b {
          0%, 100% {
            background: radial-gradient(ellipse 70% 50% at 70% 60%, rgba(138, 154, 123, 0.06) 0%, transparent 60%);
          }
          50% {
            background: radial-gradient(ellipse 60% 45% at 35% 45%, rgba(138, 154, 123, 0.10) 0%, transparent 65%);
          }
        }
        @keyframes dream-pulse {
          0%, 100% {
            background: radial-gradient(ellipse at center, rgba(20, 18, 16, 0.6) 0%, #0a0908 70%);
          }
          50% {
            background: radial-gradient(ellipse at center, rgba(20, 18, 16, 0.3) 0%, #0a0908 70%);
          }
        }
        .animate-dream-drift-a {
          animation: dream-drift-a 11s ease-in-out infinite;
        }
        .animate-dream-drift-b {
          animation: dream-drift-b 14s ease-in-out infinite;
          animation-delay: -4s;
        }
        .animate-dream-pulse {
          animation: dream-pulse 7s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
