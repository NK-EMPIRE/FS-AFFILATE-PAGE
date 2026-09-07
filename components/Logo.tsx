import React from 'react'
import Link from 'next/link'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function FirstSelfieLogo({ className = '', size = 'md' }: LogoProps) {
  const heights = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
  }

  return (
    <Link href="/" className={`inline-flex items-center gap-2 select-none group ${className}`}>
      <div className={`relative flex items-center justify-center ${heights[size]}`}>
        <svg viewBox="0 0 210 65" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* "f" */}
          <text x="5" y="38" fill="#FFFFFF" fontSize="36" fontWeight="800" fontFamily="var(--font-poppins), sans-serif">
            f
          </text>
          
          {/* Selfie Stick "1" (representing i) */}
          <g transform="translate(26, 4)">
            {/* Tilted phone atop stick */}
            <rect x="5" y="4" width="20" height="13" rx="2.5" transform="rotate(-12 15 10)" stroke="#FF6B00" strokeWidth="2.5" fill="#0A0A0A" />
            {/* Flash sparkles */}
            <line x1="26" y1="2" x2="31" y2="-1" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="8" x2="33" y2="8" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" />
            <circle cx="19" cy="8" r="1.5" fill="#FF6B00" />
            {/* Orange Stick angled 1 */}
            <path d="M12 19 L20 15 L17 36 L10 36 Z" fill="#FF6B00" />
            <rect x="10.5" y="39" width="6" height="9" rx="1.5" fill="#FF6B00" />
          </g>

          {/* "rst" */}
          <text x="60" y="38" fill="#FFFFFF" fontSize="36" fontWeight="800" fontFamily="var(--font-poppins), sans-serif">
            rst
          </text>

          {/* selfie in wide orange tracking */}
          <text x="6" y="58" fill="#FF6B00" fontSize="13" fontWeight="700" fontFamily="var(--font-poppins), sans-serif" letterSpacing="6">
            SELFIE
          </text>
        </svg>
      </div>
    </Link>
  )
}
