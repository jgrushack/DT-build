'use client';

import { useState } from 'react';

type LoginCardProps = {
  error?: string | null;
};

export default function LoginCard({ error }: LoginCardProps) {
  const [handingOff, setHandingOff] = useState(false);

  const handlePatreonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setHandingOff(true);
    // Hold the overlay long enough to be visible, then navigate.
    // The post-OAuth /dreampeace arrival fade will take over from the same #0a0908.
    setTimeout(() => {
      window.location.href = '/api/auth/patreon';
    }, 700);
  };

  return (
    <>
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="text-center mb-10">
          <p className="text-[#c9a45c] text-xs font-medium uppercase tracking-[0.3em] mb-4">
            Exclusive Access
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-[#f5f0e8] leading-none tracking-tight">
            Devin
          </h1>
          <h1 className="text-5xl md:text-6xl font-bold leading-none tracking-tight bg-gradient-to-r from-[#c9a45c] to-[#d9bc7e] bg-clip-text text-transparent">
            Townsend
          </h1>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c9a45c] to-transparent mx-auto mt-6 mb-4" />
          <p className="text-[#a4b396] text-sm">
            Patreon subscribers only
          </p>
        </div>

        {error === 'not_subscribed' && (
          <div className="w-full p-4 mb-6 rounded-xl bg-black/30 backdrop-blur border border-red-500/30">
            <p className="text-red-400 text-sm font-medium">
              Active Patreon subscription required
            </p>
            <p className="text-red-400/70 text-sm mt-1">
              You need an active subscription to Devin Townsend&apos;s Patreon.
            </p>
            <a
              href="https://www.patreon.com/devintownsend"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-[#c9a45c] hover:text-[#d9bc7e] underline underline-offset-2 transition-colors"
            >
              Subscribe on Patreon
            </a>
          </div>
        )}

        {error === 'auth_failed' && (
          <div className="w-full p-4 mb-6 rounded-xl bg-black/30 backdrop-blur border border-red-500/30">
            <p className="text-red-400 text-sm font-medium">Authentication failed</p>
            <p className="text-red-400/70 text-sm mt-1">Something went wrong. Please try again.</p>
          </div>
        )}

        <a
          href="/api/auth/patreon"
          onClick={handlePatreonClick}
          className="group flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-full bg-[#FF424D] text-white font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,66,77,0.3)] hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.82 2.41c3.96 0 7.18 3.24 7.18 7.21 0 3.96-3.22 7.18-7.18 7.18-3.97 0-7.21-3.22-7.21-7.18 0-3.97 3.24-7.21 7.21-7.21M2 21.6h3.5V2.41H2V21.6z" />
          </svg>
          Sign in with Patreon
        </a>
      </div>

      {/* Pre-OAuth handoff overlay — paints to #0a0908 so the return to /dreampeace feels continuous */}
      <div
        aria-hidden
        className={`fixed inset-0 z-[200] pointer-events-none transition-opacity duration-700 ease-out ${
          handingOff ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: '#0a0908',
        }}
      >
        <div className="absolute inset-0 animate-handoff-breath" />
        <style jsx>{`
          @keyframes handoff-breath {
            0%,
            100% {
              background: radial-gradient(ellipse at center, #141210 0%, #0a0908 60%);
            }
            50% {
              background: radial-gradient(ellipse at center, #0a0908 0%, #0a0908 60%);
            }
          }
          .animate-handoff-breath {
            animation: handoff-breath 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    </>
  );
}
