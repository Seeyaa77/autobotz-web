import { Loader2 } from 'lucide-react'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    dark: 'btn-dark',
    ghost: 'btn-ghost',
  }

  const sizes = {
    sm: 'px-4 py-2 text-xs sm:text-sm rounded-xl',
    md: 'px-5 py-3 text-sm sm:text-base rounded-xl',
    lg: 'px-7 py-3.5 text-base sm:text-lg rounded-xl',
  }

  const isDisabled = disabled || loading

  return (
    <button 
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${
        loading ? 'cursor-wait opacity-90' : ''
      } ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {children}
    </button>
  )
}
