import { AlertCircle } from 'lucide-react'

export default function Input({
  label,
  type = 'text',
  placeholder = '',
  error = '',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  if (loading) {
    return (
      <div className="space-y-1.5">
        {label && (
          <div className="h-4 w-28 bg-white/10 rounded animate-pulse" />
        )}
        <div className="animate-pulse bg-white/[0.06] h-11 rounded-xl border border-white/10 w-full" />
      </div>
    )
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-[#CBD3E1] mb-1.5">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        className={`input-brutalist ${
          error ? 'border-[#FD1843] ring-1 ring-[#FD1843]/40 focus:border-[#FD1843]' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs font-mono font-semibold text-[#FF6B86] mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
