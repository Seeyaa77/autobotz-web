export default function Badge({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  const variantClasses = {
    default: 'bg-white/[0.06] text-[#CBD3E1] border-white/[0.12]',
    neutral: 'bg-white/[0.06] text-[#CBD3E1] border-white/[0.12]',
    success: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/35',
    mint: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/35',
    warning: 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/35',
    info: 'bg-[#3897F0]/15 text-[#64B5EF] border-[#3897F0]/35',
    pink: 'bg-[#FD1843]/15 text-[#FF6B86] border-[#FD1843]/35',
    dark: 'bg-[#090C12]/80 text-[#F4F6FA] border-white/[0.14]',
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
