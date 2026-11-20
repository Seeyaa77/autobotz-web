export default function Badge({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) {
  const variantClasses = {
    default: 'bg-brand-chill-white text-brand-dark',
    success: 'bg-brand-mint text-brand-dark',
    mint: 'bg-brand-mint text-brand-dark',
    warning: 'bg-brand-amber text-brand-dark',
    info: 'bg-brand-blue text-white',
    pink: 'bg-brand-pink text-white',
    dark: 'bg-brand-dark text-white',
  }

  return (
    <span 
      className={`badge-sticker ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
