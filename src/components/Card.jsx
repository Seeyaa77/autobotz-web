export default function Card({ 
  children, 
  className = '',
  interactive = false,
  highlight = false,
  ...props 
}) {
  const baseClass = 'bg-white border-2 border-brand-dark rounded-2xl transition-all duration-150'
  const shadowClass = highlight
    ? 'shadow-brutalist-pink hover:shadow-brutalist-pink-lg hover:-translate-x-0.5 hover:-translate-y-0.5'
    : interactive
      ? 'shadow-brutalist hover:shadow-brutalist-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-none active:translate-x-1 active:translate-y-1'
      : 'shadow-none'

  return (
    <div 
      className={`${baseClass} ${shadowClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
