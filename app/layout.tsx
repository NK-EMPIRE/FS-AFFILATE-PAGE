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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://gadgets.firstselfie.in'
  ),
  title: {
    default: 'FirstSelfie Gadgets — Creator Equipment & Studio Production Gear',
    template: '%s | FirstSelfie Creator Gear',
  },
  description:
    'Your First Selfie to Your First Crore. Official creator studio stack, camera gear, wireless audio, and lighting tested and recommended by FirstSelfie.',
  keywords: [
    'FirstSelfie',
    'FirstSelfie Gadgets',
    'gadgets.firstselfie.in',
    'Creator Studio Setup',
    'Best YouTube Camera 2026',
    'Sony ZV-E10',
    'Wireless Button Microphone',
    'Hollyland Lark M2',
    'Godox Studio Lighting',
    'Sigma 16mm Lens',
    'Creator Equipment India',
    'FirstSelfie Tamil',
    'Affiliate Storefront',
    'Content Creation Gear',
  ],
  authors: [{ name: 'FirstSelfie', url: 'https://gadgets.firstselfie.in' }],
  creator: 'FirstSelfie',
  publisher: 'FirstSelfie',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: 'https://gadgets.firstselfie.in',
  },
  openGraph: {
    title: 'FirstSelfie Gadgets — Creator Equipment & Studio Gear',
    description:
      'Your First Selfie to Your First Crore. Discover handpicked cameras, lighting, and audio equipment for creators.',
    url: 'https://gadgets.firstselfie.in',
    siteName: 'FirstSelfie Gadgets',
    images: [
      {
        url: '/share-card.jpg',
        width: 1200,
        height: 630,
        alt: 'FirstSelfie — Your First Selfie to Your First Crore',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FirstSelfie Gadgets — Creator Equipment & Studio Gear',
    description: 'Your First Selfie to Your First Crore. Creator studio equipment stack.',
    images: ['/share-card.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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

              {/* Creative Studio Status Pill & Quick Action */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B00]"></span>
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-300">Studio Setup 2026</span>
                </div>

                <a
                  href="#checklist-section"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#FF6B00]/40 bg-[#FF6B00]/10 px-3.5 py-1 text-xs font-semibold text-[#FF9A3C] hover:bg-[#FF6B00] hover:text-black transition-all shadow-sm active:scale-95"
                >
                  <span>Core Stack Checklist</span>
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
