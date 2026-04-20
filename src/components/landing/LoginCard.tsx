'use client';

import { useState } from 'react';
import ReactiveText from '@/components/text/ReactiveText';

type LoginCardProps = {
  error?: string | null;
};

// Wordmark font — heavy Geist at display size. Must match Tailwind's text-6xl font-bold.
const WORDMARK_FONT = '700 60px "Geist", system-ui, -apple-system, sans-serif';

export default function LoginCard({ error }: LoginCardProps) {
  const [handingOff, setHandingOff] = useState(false);

  const handlePatreonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setHandingOff(true);
    // Hold the overlay long enough to be visible, then navigate.
    // The post-OAuth /dreampeace arrival fade takes over from the same #f5f0e8.
    setTimeout(() => {
      window.location.href = '/api/auth/patreon';
    }, 700);
  };

  return (
    <>
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="text-center mb-10">
          <p className="text-[#a88a45] text-xs font-medium uppercase tracking-[0.3em] mb-4">
            Exclusive Access
          </p>
          <ReactiveText
            as="h1"
            text="Devin"
            font={WORDMARK_FONT}
            className="leading-none tracking-tight"
            style={{ color: '#25221e', letterSpacing: '-0.02em', display: 'block' }}
          />
          <ReactiveText
            as="h1"
            text="Townsend"
            font={WORDMARK_FONT}
            className="leading-none tracking-tight"
            style={{ letterSpacing: '-0.02em', display: 'block' }}
            gradientBg="linear-gradient(90deg, #a88a45, #c9a45c)"
          />
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#a88a45] to-transparent mx-auto mt-6 mb-4" />
          <p className="text-[#6b7a5e] text-sm">
            Patreon subscribers only
          </p>
        </div>

        {error === 'not_subscribed' && (
          <div className="w-full p-4 mb-6 rounded-xl bg-[#b04a4a]/10 border border-[#b04a4a]/30">
            <p className="text-[#8a2e2e] text-sm font-medium">
              Active Patreon subscription required
            </p>
            <p className="text-[#8a2e2e]/70 text-sm mt-1">
              You need an active subscription to Devin Townsend&apos;s Patreon.
            </p>
            <a
              href="https://www.patreon.com/devintownsend"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-[#a88a45] hover:text-[#c9a45c] underline underline-offset-2 transition-colors"
            >
              Subscribe on Patreon
            </a>
          </div>
        )}

        {error === 'auth_failed' && (
          <div className="w-full p-4 mb-6 rounded-xl bg-[#b04a4a]/10 border border-[#b04a4a]/30">
            <p className="text-[#8a2e2e] text-sm font-medium">Authentication failed</p>
            <p className="text-[#8a2e2e]/70 text-sm mt-1">Something went wrong. Please try again.</p>
          </div>
        )}

        <a
          href="/api/auth/patreon"
          onClick={handlePatreonClick}
          className="group flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-full bg-[#FF424D] text-white font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,66,77,0.35)] hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14.82 2.41c3.96 0 7.18 3.24 7.18 7.21 0 3.96-3.22 7.18-7.18 7.18-3.97 0-7.21-3.22-7.21-7.18 0-3.97 3.24-7.21 7.21-7.21M2 21.6h3.5V2.41H2V21.6z" />
          </svg>
          Sign in with Patreon
        </a>
      </div>

      {/* Pre-OAuth handoff overlay — paints to #f5f0e8 so the return to /dreampeace feels continuous */}
      <div
        aria-hidden
        className={`fixed inset-0 z-[200] pointer-events-none transition-opacity duration-700 ease-out ${
          handingOff ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: '#f5f0e8',
        }}
      >
        <div className="absolute inset-0 animate-handoff-breath" />
        <style jsx>{`
          @keyframes handoff-breath {
            0%,
            100% {
              background: radial-gradient(ellipse at center, #ede7db 0%, #f5f0e8 60%);
            }
            50% {
              background: radial-gradient(ellipse at center, #f5f0e8 0%, #f5f0e8 60%);
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
