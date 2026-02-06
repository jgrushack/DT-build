import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PlayerWrapper from "@/components/player/PlayerWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGate from "@/components/layout/AuthGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artist Portal",
  description: "Exclusive artist portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <AuthGate>
            <PlayerWrapper />
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
