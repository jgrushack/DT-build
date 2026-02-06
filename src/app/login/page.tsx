'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error === 'not_following') {
      window.open('https://audius.co/RAC', '_blank');
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-natural flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Layered ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--amber)]/6 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[var(--sage)]/8 rounded-full blur-[100px] animate-pulse-soft" />
      <div className="absolute top-1/3 right-1/6 w-72 h-72 bg-[var(--earth-dark)]/15 rounded-full blur-[80px] animate-float" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Title lockup */}
        <div className="text-center mb-12">
          <p className="text-[var(--amber)] text-xs font-medium uppercase tracking-[0.3em] mb-4">
            Exclusive Access
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-[var(--cream)] leading-none tracking-tight">
            Devin
          </h1>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-amber leading-none tracking-tight">
            Townsend
          </h1>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[var(--amber)] to-transparent mx-auto mt-6 mb-4" />
          <p className="text-[var(--sage-light)] text-sm">
            Sign in to enter the portal
          </p>
        </div>

        {/* Error states */}
        {error === 'not_subscribed' && (
          <div className="w-full liquid-glass p-4 mb-6 border border-red-500/20">
            <p className="text-red-400 text-sm font-medium">
              Active Patreon subscription required
            </p>
            <p className="text-red-400/60 text-sm mt-1">
              You need an active subscription to Devin Townsend&apos;s Patreon.
            </p>
            <a
              href="https://www.patreon.com/devintownsend"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-sm text-[var(--amber)] hover:text-[var(--amber-light)] underline underline-offset-2 transition-colors"
            >
              Subscribe on Patreon
            </a>
          </div>
        )}

        {error === 'not_following' && (
          <div className="w-full liquid-glass p-4 mb-6 border border-red-500/20">
            <p className="text-red-400 text-sm font-medium">
              Follow RAC on Audius to get access
            </p>
            <p className="text-red-400/60 text-sm mt-1">
              We&apos;ve opened their profile in a new tab.
            </p>
            <a
              href="/api/auth/audius"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-[#7E1BCC] hover:bg-[#6f18b3] text-white text-sm font-semibold transition-colors"
            >
              I&apos;ve followed RAC — try again
            </a>
          </div>
        )}

        {error === 'auth_failed' && (
          <div className="w-full liquid-glass p-4 mb-6 border border-red-500/20">
            <p className="text-red-400 text-sm font-medium">
              Authentication failed
            </p>
            <p className="text-red-400/60 text-sm mt-1">
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        {/* Sign-in buttons */}
        <div className="w-full space-y-3">
          <a
            href="/api/auth/patreon"
            className="group flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-full bg-[#FF424D] text-white font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,66,77,0.3)] hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.82 2.41c3.96 0 7.18 3.24 7.18 7.21 0 3.96-3.22 7.18-7.18 7.18-3.97 0-7.21-3.22-7.21-7.18 0-3.97 3.24-7.21 7.21-7.21M2 21.6h3.5V2.41H2V21.6z" />
            </svg>
            Sign in with Patreon
          </a>

          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[var(--glass-border)]" />
            <span className="text-[var(--sage)] text-[10px] uppercase tracking-[0.2em]">or</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[var(--glass-border)]" />
          </div>

          <a
            href="/api/auth/audius"
            className="group flex items-center justify-center gap-3 w-full px-6 py-3.5 rounded-full bg-[#7E1BCC] text-white font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_30px_rgba(126,27,204,0.3)] hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 56 48" fill="currentColor">
              <path d="M55.82 46.04L42.46 23.35 36.19 12.7 29.09.66c-.51-.87-1.8-.88-2.32 0L13.38 23.33l-5.47 9.26c-.52.87.12 1.96 1.15 1.97h10.34c.48 0 .92-.25 1.16-.65l5.37-9.1.82-1.39c.03-.05.07-.11.1-.15.57-.72 1.73-.66 2.21.16l5.58 9.47 1.03 1.75c.06.1.1.2.13.31.23.8-.38 1.66-1.29 1.66H22.36c-.48 0-.92.25-1.16.65l-5.18 8.76c-.51.87.13 1.96 1.16 1.97h10.72l13.37.01 13.39.01c1.03 0 1.67-1.09 1.16-1.96" />
            </svg>
            Sign in with Audius
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-natural flex items-center justify-center">
        <div className="text-[var(--sage)]">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
