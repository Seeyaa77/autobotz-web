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
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
        )}
        <div className="animate-pulse bg-gray-200 h-11 rounded-xl border-2 border-gray-300 w-full" />
      </div>
    )
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-heading font-bold uppercase tracking-wider text-brand-dark mb-1.5">
          {label}
        </label>
      )}
      <input 
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error) || undefined}
        className={`input-brutalist ${
          error ? 'border-brand-pink bg-red-50 focus:border-brand-pink focus:shadow-[3px_3px_0px_0px_#FD1843]' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs font-mono font-bold text-brand-pink mt-1.5 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
