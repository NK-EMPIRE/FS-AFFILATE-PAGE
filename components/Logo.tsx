import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

export default function FirstSelfieLogo({
  className = '',
  size = 'md',
  variant = 'secondary',
}: LogoProps) {
  const dimensions = {
    sm: { height: 42, width: 160 },
    md: { height: 56, width: 220 },
    lg: { height: 72, width: 280 },
  }

  const logoSrc = variant === 'primary' ? '/logo-primary.png' : '/logo-secondary.png'
  const { height, width } = dimensions[size]

  return (
    <Link href="/" className={`inline-flex items-center gap-2 select-none group ${className}`}>
      <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]">
        <Image
          src={logoSrc}
          alt="FirstSelfie Logo"
          width={width}
          height={height}
          priority
          className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-sm"
        />
      </div>
    </Link>
  )
}
