'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Fixed chrome rendered on /dreampeace pages for authed users.
 * Top-left: small home glyph + Dreampeace wordmark linking to /dreampeace.
 * Top-right: avatar dropdown with Sign Out.
 *
 * Mounted in the root layout; gates its own visibility on pathname + auth so
 * it does not appear on /, /login, or pre-auth states.
 */
export default function PortalChrome() {
    const pathname = usePathname();
    const { user, isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!menuOpen) return;
        function handleOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [menuOpen]);

    if (!pathname?.startsWith('/dreampeace')) return null;
    if (!isAuthenticated || !user) return null;

    const handleLogout = async () => {
        setMenuOpen(false);
        await logout();
        window.location.href = '/';
    };

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] flex items-center justify-between px-5 py-4">
            <Link
                href="/dreampeace"
                className="pointer-events-auto group flex items-center gap-2.5 text-[var(--foreground,#25221e)]"
                aria-label="Dreampeace home"
            >
                <HomeGlyph />
                <span className="text-sm font-light tracking-[0.18em] uppercase transition-opacity group-hover:opacity-80">
                    Dreampeace
                </span>
            </Link>

            <div className="pointer-events-auto relative" ref={menuRef}>
                <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full p-1 pr-3 transition-colors hover:bg-black/10"
                    aria-haspopup="menu"
                    aria-expanded={menuOpen}
                >
                    <span className="relative block h-8 w-8 overflow-hidden rounded-full bg-[#8a9a7b]/40 ring-1 ring-[#8a9a7b]/30">
                        {user.avatarUrl ? (
                            <Image
                                src={user.avatarUrl}
                                alt={user.displayName}
                                fill
                                sizes="32px"
                                className="object-cover"
                            />
                        ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs font-medium text-[#25221e]">
                                {user.displayName.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </span>
                </button>

                {menuOpen && (
                    <div
                        role="menu"
                        className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-black/10 bg-[#f5f0e8]/95 shadow-[0_10px_40px_rgba(37,34,30,0.12)] backdrop-blur"
                    >
                        <div className="border-b border-black/5 px-3 py-2.5">
                            <p className="truncate text-sm font-medium text-[#25221e]">{user.displayName}</p>
                            {user.email ? (
                                <p className="truncate text-xs text-[#6b7a5e]">{user.email}</p>
                            ) : null}
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full px-3 py-2.5 text-left text-sm text-[#25221e] transition-colors hover:bg-black/5"
                            role="menuitem"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function HomeGlyph() {
    // Triangle roof sitting on a circle body — "house" built from the palette's sage.
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="text-[#8a9a7b]"
            aria-hidden="true"
        >
            <polygon points="8,2 3,7 13,7" />
            <circle cx="8" cy="11" r="4" />
        </svg>
    );
}
