import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'wheat' | 'topaz' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-grass to-grass-dark text-white shadow-[0_4px_0_#3a6b1f] hover:brightness-105',
  wheat:
    'bg-gradient-to-b from-wheat to-wheat-dark text-soil-dark shadow-[0_4px_0_#b8841f] hover:brightness-105',
  topaz:
    'bg-gradient-to-b from-topaz to-[#5546c9] text-white shadow-[0_4px_0_#3d3296] hover:brightness-110',
  ghost:
    'bg-[var(--panel)] text-[var(--ink)] border-2 border-[var(--panel-line)] hover:border-grass',
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-extrabold',
        'transition active:translate-y-[2px] disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  )
}
