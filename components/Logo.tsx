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
    sm: { height: 36, width: 140 },
    md: { height: 48, width: 185 },
    lg: { height: 60, width: 230 },
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
          className="h-auto w-auto object-contain max-h-12"
        />
      </div>
    </Link>
  )
}
