import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import FirstSelfieLogo from '@/components/Logo'
import Link from 'next/link'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FirstSelfie — Creator Equipment & Studio Gear',
  description:
    'Your First Frame to a Million Faces. Hand-curated cameras, lighting, mics, and studio equipment for high-growth creators.',
  openGraph: {
    title: 'FirstSelfie — Creator Equipment & Studio Gear',
    description:
      'Your First Selfie to Your First Crore. Discover handpicked cameras, lighting, and audio equipment.',
    url: 'https://firstselfie.com',
    siteName: 'FirstSelfie',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&h=630&q=80',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FirstSelfie — Creator Equipment & Studio Gear',
    description: 'Your First Frame to a Million Faces.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${bricolage.variable}`}>
      <body className="bg-[#0A0A0B] font-sans text-zinc-100 antialiased selection:bg-[#FF6B00] selection:text-black">
        {/* Subtle Ambient Radial Lighting */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-[#FF6B00]/7 to-transparent blur-[140px] pointer-events-none z-0" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between">
          {/* Minimalist Top Studio Bar */}
          <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0B]/85 backdrop-blur-xl transition-colors">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
              <FirstSelfieLogo size="md" />

              <div className="flex items-center gap-4">
                <a
                  href="https://www.youtube.com/@firstselfietamil"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span>YouTube</span>
                </a>
                <a
                  href="https://www.instagram.com/firstselfie_tamil/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1 text-[11px] font-semibold text-pink-400 hover:bg-pink-500/20 transition-colors"
                >
                  <span>Instagram</span>
                </a>
                <a
                  href="https://whatsapp-community.firstselfie.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <span>Join Community</span>
                </a>
              </div>
            </div>
          </header>

          {/* Main Body Content */}
          <main className="flex-1">{children}</main>

          {/* Persistent Non-Dismissible FTC Disclosure & Brand Footer */}
          <footer className="border-t border-[#1F1F1F] bg-[#0A0A0A] py-8 text-center">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Mandatory FTC Disclosure */}
              <div className="mx-auto max-w-2xl rounded-xl border border-[#262626] bg-[#1A1A1A]/70 px-4 py-3 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200">Affiliate Disclosure:</span>{" "}
                As an Amazon Associate I earn from qualifying purchases. We only recommend gear tested and trusted for creator production.
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
                <p>© {new Date().getFullYear()} FirstSelfie. All rights reserved. Your First Frame to a Million Faces.</p>
                <div className="flex items-center gap-6">
                  <Link href="/privacy" className="hover:text-zinc-300 transition">
                    Privacy Policy
                  </Link>
                  <Link href="/disclosure" className="hover:text-zinc-300 transition">
                    FTC Compliance
                  </Link>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
