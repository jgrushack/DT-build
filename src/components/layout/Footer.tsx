import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="glass-light border-t border-[var(--glass-border)] py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* Logo & Copyright */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--sage)] to-[var(--forest-mid)] flex items-center justify-center">
                            <span className="text-[var(--cream)] font-bold text-sm">DT</span>
                        </div>
                        <span className="text-[var(--sage)] text-sm">
                            © {new Date().getFullYear()} Devin Townsend. Powered by Audius.
                        </span>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        <Link
                            href="https://audius.co"
                            target="_blank"
                            className="text-[var(--sage)] hover:text-[var(--sage-light)] text-sm transition-colors"
                        >
                            Audius
                        </Link>
                        <Link
                            href="/catalog"
                            className="text-[var(--sage)] hover:text-[var(--sage-light)] text-sm transition-colors"
                        >
                            Explore
                        </Link>
                        <Link
                            href="/dreampeace"
                            className="text-[var(--sage)] hover:text-[var(--amber)] text-sm transition-colors"
                        >
                            Dreampeace
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
