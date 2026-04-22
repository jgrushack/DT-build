'use client';

import LoginCard from './LoginCard';

type FeverDreamProps = {
  loginError?: string | null;
};

export default function FeverDream({ loginError = null }: FeverDreamProps) {
  return (
    <div
      className="fixed inset-0 overflow-hidden flex items-center justify-center"
      style={{ background: '#f5f0e8' }}
    >
      {/* Dream atmosphere — drifts behind the login card from the first frame. */}
      <div aria-hidden className="absolute inset-0 opacity-80">
        <div className="absolute inset-0 animate-dream-drift-a" />
        <div className="absolute inset-0 animate-dream-drift-b" />
        <div className="absolute inset-0 animate-dream-pulse" />
      </div>

      {/* Login card — fades in immediately so the splash is never empty. */}
      <div className="relative z-20 animate-dream-card-in">
        <LoginCard error={loginError} />
      </div>

      <style jsx>{`
        @keyframes dream-drift-a {
          0%, 100% {
            background: radial-gradient(ellipse 80% 60% at 30% 40%, rgba(201, 164, 92, 0.14) 0%, transparent 60%);
          }
          50% {
            background: radial-gradient(ellipse 90% 70% at 60% 55%, rgba(201, 164, 92, 0.22) 0%, transparent 65%);
          }
        }
        @keyframes dream-drift-b {
          0%, 100% {
            background: radial-gradient(ellipse 70% 50% at 70% 60%, rgba(138, 154, 123, 0.12) 0%, transparent 60%);
          }
          50% {
            background: radial-gradient(ellipse 60% 45% at 35% 45%, rgba(138, 154, 123, 0.20) 0%, transparent 65%);
          }
        }
        @keyframes dream-pulse {
          0%, 100% {
            background: radial-gradient(ellipse at center, rgba(245, 240, 232, 0) 0%, rgba(229, 221, 208, 0.5) 100%);
          }
          50% {
            background: radial-gradient(ellipse at center, rgba(245, 240, 232, 0) 0%, rgba(229, 221, 208, 0.2) 100%);
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
        @keyframes dream-card-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-dream-card-in {
          animation: dream-card-in 1400ms cubic-bezier(0.22, 1, 0.36, 1) 200ms both;
        }
      `}</style>
    </div>
  );
}
