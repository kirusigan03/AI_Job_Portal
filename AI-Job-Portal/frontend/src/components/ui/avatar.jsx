import { useState } from 'react'
import { cn } from '@/lib/utils'

export function Avatar({ src, name = '', initials, size = 'default', className }) {
  const [broken, setBroken] = useState(false)

  const sizes = {
    sm: 'h-8 w-8 text-xs',
    default: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  }

  const showImage = src && !broken

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary-soft font-semibold text-primary',
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name ? `${name}'s profile photo` : 'Profile photo'}
          className="h-full w-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span aria-hidden="true">{initials || '?'}</span>
      )}
    </span>
  )
}
