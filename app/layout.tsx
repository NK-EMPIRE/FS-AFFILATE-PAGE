import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import FirstSelfieLogo from '@/components/Logo'
import Link from 'next/link'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
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
    <html lang="en" className={poppins.variable}>
      <body className="bg-[#0A0A0A] text-white antialiased selection:bg-[#FF6B00] selection:text-black">
        {/* Fixed dot grid background */}
        <div className="fixed inset-0 pointer-events-none bg-dot-grid z-0 opacity-50" />

        {/* Ambient Top Glow */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[250px] bg-[#FF6B00]/10 blur-[130px] pointer-events-none z-0" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between">
          {/* Main Navigation Bar */}
          <header className="sticky top-0 z-50 border-b border-[#1F1F1F] bg-[#0A0A0A]/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
              <FirstSelfieLogo size="md" />

              <div className="flex items-center gap-4 sm:gap-6">
                <Link
                  href="/"
                  className="text-xs sm:text-sm font-medium text-zinc-300 hover:text-[#FF6B00] transition"
                >
                  Storefront
                </Link>
                <Link
                  href="/disclosure"
                  className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition"
                >
                  Disclosure
                </Link>
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
