'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginCard from '@/components/landing/LoginCard';

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: '#f5f0e8' }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
        style={{ background: 'rgba(201, 164, 92, 0.18)' }} />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'rgba(138, 154, 123, 0.20)' }} />
      <div className="relative z-10">
        <LoginCard error={error} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f0e8' }}>
        <div className="text-[#6b7a5e]">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
