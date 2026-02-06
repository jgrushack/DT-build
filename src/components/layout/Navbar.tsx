'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user, isAuthenticated, isLoading, logout } = useAuth();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        setIsMenuOpen(false);
        await logout();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-heavy border-b border-[var(--glass-border)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--sage)] to-[var(--forest-mid)] flex items-center justify-center shadow-lg group-hover:shadow-[var(--shadow-glow)] transition-all duration-300">
                            <span className="text-[var(--foreground)] font-bold text-lg">DT</span>
                        </div>
                        <span className="text-[var(--foreground)] font-semibold text-lg tracking-wide group-hover:text-[var(--amber)] transition-colors">
                            Devin Townsend
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="/catalog"
                            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium"
                        >
                            Explore
                        </Link>
                        <Link
                            href="/dreampeace"
                            className="text-[var(--foreground-muted)] hover:text-[var(--amber)] transition-colors text-sm font-medium flex items-center gap-1.5"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage)]"></span>
                            Dreampeace
                        </Link>

                        {isLoading ? (
                            <div className="w-20 h-9 rounded-full bg-[var(--forest-mid)] animate-pulse" />
                        ) : isAuthenticated && user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full glass hover:bg-white/10 transition-colors"
                                >
                                    {user.avatarUrl ? (
                                        <Image
                                            src={user.avatarUrl}
                                            alt={user.displayName}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-[var(--sage)] flex items-center justify-center">
                                            <span className="text-[var(--foreground)] text-xs font-medium">
                                                {user.displayName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className="text-[var(--foreground)] text-sm font-medium max-w-[120px] truncate">
                                        {user.displayName}
                                    </span>
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-lg glass-heavy border border-[var(--glass-border)] shadow-xl py-1">
                                        <div className="px-3 py-2 border-b border-[var(--glass-border)]">
                                            <p className="text-[var(--foreground)] text-sm font-medium truncate">{user.displayName}</p>
                                            <p className="text-[var(--foreground-muted)] text-xs truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2 text-sm text-[var(--foreground-muted)] hover:bg-white/5 hover:text-[var(--foreground)] transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="btn-secondary text-sm">
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden glass border-t border-[var(--glass-border)] animate-fade-in">
                    <div className="px-4 py-4 space-y-3">
                        <Link
                            href="/catalog"
                            className="block text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors text-sm font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Explore
                        </Link>
                        <Link
                            href="/dreampeace"
                            className="block text-[var(--foreground-muted)] hover:text-[var(--amber)] transition-colors text-sm font-medium py-2"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Dreampeace
                        </Link>

                        {isLoading ? (
                            <div className="w-full h-10 rounded-full bg-[var(--forest-mid)] animate-pulse" />
                        ) : isAuthenticated && user ? (
                            <div className="pt-2 border-t border-[var(--glass-border)] space-y-3">
                                <div className="flex items-center gap-2">
                                    {user.avatarUrl ? (
                                        <Image
                                            src={user.avatarUrl}
                                            alt={user.displayName}
                                            width={28}
                                            height={28}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-[var(--sage)] flex items-center justify-center">
                                            <span className="text-[var(--foreground)] text-xs font-medium">
                                                {user.displayName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-[var(--foreground)] text-sm font-medium">{user.displayName}</p>
                                        <p className="text-[var(--foreground-muted)] text-xs">{user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full btn-secondary text-sm mt-2"
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="block w-full btn-secondary text-sm mt-2 text-center"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
