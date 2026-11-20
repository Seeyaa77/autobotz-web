import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-driven 3D Perspective Reveal & Interactive 3D Tilt Wrapper
 * Respects prefers-reduced-motion and uses real spring physics (cubic-bezier(0.22, 1, 0.36, 1)).
 */
export default function ScrollReveal3D({
  children,
  className = '',
  delay = 0,
  direction = 'up', // 'up' | 'left' | 'right'
  tilt = false,
  maxTilt = 7,
  threshold = 0.14
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [tiltTransform, setTiltTransform] = useState({ rx: 0, ry: 0, tz: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (mq?.matches) {
      setReducedMotion(true)
      setVisible(true)
      return
    }

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
          }
        })
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  const handleMouseMove = (e) => {
    if (!tilt || reducedMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const ry = (x - 0.5) * maxTilt * 2
    const rx = (0.5 - y) * maxTilt * 2
    setTiltTransform({
      rx: Number(rx.toFixed(2)),
      ry: Number(ry.toFixed(2)),
      tz: 8
    })
  }

  const handleMouseLeave = () => {
    if (!tilt) return
    setTiltTransform({ rx: 0, ry: 0, tz: 0 })
  }

  const getInitialTransform = () => {
    if (reducedMotion) return 'none'
    if (!visible) {
      if (direction === 'left') {
        return 'perspective(1100px) translate3d(-32px, 24px, -48px) rotateX(12deg) rotateY(10deg) scale(0.96)'
      }
      if (direction === 'right') {
        return 'perspective(1100px) translate3d(32px, 24px, -48px) rotateX(12deg) rotateY(-10deg) scale(0.96)'
      }
      return 'perspective(1100px) translate3d(0px, 34px, -48px) rotateX(14deg) rotateY(0deg) scale(0.96)'
    }
    return `perspective(1100px) translate3d(0px, 0px, ${tiltTransform.tz}px) rotateX(${tiltTransform.rx}deg) rotateY(${tiltTransform.ry}deg) scale(1)`
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        opacity: visible ? 1 : 0,
        transform: getInitialTransform(),
        transition:
          tiltTransform.rx !== 0 || tiltTransform.ry !== 0
            ? 'transform 120ms ease-out, opacity 500ms ease-out'
            : `transform 640ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, opacity 520ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
      }}
      className={`preserve-3d ${className}`}
    >
      {children}
    </div>
  )
}
