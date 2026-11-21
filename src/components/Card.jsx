export default function Card({
  children,
  className = '',
  interactive = false,
  highlight = false,
  ...props
}) {
  const baseClass = highlight
    ? 'bg-[#161B28]/70 backdrop-blur-xl border border-[#FD1843]/45 rounded-2xl shadow-[0_0_40px_rgba(253,24,67,0.16),inset_0_1px_0_rgba(255,255,255,0.12)] text-[#F4F6FA] transition-all duration-200'
    : interactive
      ? 'bg-[#121621]/55 backdrop-blur-md border border-white/[0.09] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-[#F4F6FA] transition-all duration-200 hover:bg-[#171C2B]/70 hover:border-white/[0.18] hover:-translate-y-0.5'
      : 'bg-[#121621]/55 backdrop-blur-md border border-white/[0.09] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-[#F4F6FA]'

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  )
}
