import { useEffect } from 'react'

/**
 * FluxCode-style single-rAF scroll-linked depth & viewer-settle parallax engine.
 * - [data-flux-drift]: vertical scroll drift against scroll (e.g. -0.04 / +0.04 opposing columns)
 * - [data-flux-glyph]: large background geometric watermark drifting + rotating slowly
 * - [data-flux-viewer]: 3D perspective viewer that leans back on entry and settles flat at viewport center
 * Respects prefers-reduced-motion and gates updates via IntersectionObserver.
 */
export default function useFluxScrollParallax(containerRef) {
  useEffect(() => {
    const root = containerRef?.current
    if (!root) return

    const reduceMq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (reduceMq?.matches) return

    const driftNodes = Array.from(root.querySelectorAll('[data-flux-drift]'))
    const glyphNodes = Array.from(root.querySelectorAll('[data-flux-glyph]'))
    const viewerNodes = Array.from(root.querySelectorAll('[data-flux-viewer]'))
    const allNodes = [...driftNodes, ...glyphNodes, ...viewerNodes]
    if (!allNodes.length) return

    const visible = new Set()
    let rafId = 0

    const update = () => {
      rafId = 0
      const vh = window.innerHeight || 800
      const center = vh * 0.5

      driftNodes.forEach((el) => {
        const r0 = el.getBoundingClientRect(); if (r0.bottom < -220 || r0.top > vh + 220) return
        const speed = parseFloat(el.getAttribute('data-flux-drift') || '0')
        const maxPx = parseFloat(el.getAttribute('data-flux-max') || '36')
        const rect = el.getBoundingClientRect()
        const elCenter = rect.top + rect.height * 0.5
        const delta = Math.max(-maxPx, Math.min(maxPx, (elCenter - center) * speed))
        el.style.transform = `translate3d(0, ${delta.toFixed(1)}px, 0)`
      })

      glyphNodes.forEach((el) => {
        const r0 = el.getBoundingClientRect(); if (r0.bottom < -220 || r0.top > vh + 220) return
        const speed = parseFloat(el.getAttribute('data-flux-glyph') || '0.18')
        const turn = speed > 0 ? 0.016 : -0.016
        const rect = el.getBoundingClientRect()
        const offset = rect.top + rect.height * 0.5 - center
        const dy = Math.max(-180, Math.min(180, offset * speed))
        const deg = Math.max(-18, Math.min(18, offset * turn))
        el.style.transform = `translate3d(0, ${dy.toFixed(1)}px, 0) rotate(${deg.toFixed(2)}deg)`
      })

      viewerNodes.forEach((el) => {
        const r0 = el.getBoundingClientRect(); if (r0.bottom < -220 || r0.top > vh + 220) return
        const rect = el.getBoundingClientRect()
        const elCenter = rect.top + rect.height * 0.5
        // 0 at viewport center, rises smoothly toward 1 when entering from bottom
        const progress = Math.max(0, Math.min(1, (elCenter - center) / (vh * 0.62)))
        const eased = progress * progress * (3 - 2 * progress)
        const rx = eased * 11
        const ty = eased * 28
        const sc = 1 - eased * 0.055
        const op = 1 - eased * 0.22
        el.style.transform = `perspective(1200px) translate3d(0, ${ty.toFixed(1)}px, 0) rotateX(${rx.toFixed(2)}deg) scale(${sc.toFixed(4)})`
        el.style.opacity = op.toFixed(3)
      })
    }

    const queue = () => {
      if (!rafId) rafId = requestAnimationFrame(update)
    }

    let io
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) visible.add(e.target)
            else visible.delete(e.target)
          })
          queue()
        },
        { rootMargin: '160px 0px' }
      )
      allNodes.forEach((n) => io.observe(n))
    } else {
      allNodes.forEach((n) => visible.add(n))
    }

    window.addEventListener('scroll', queue, { passive: true })
    window.addEventListener('resize', queue, { passive: true })
    queue()

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (io) io.disconnect()
      window.removeEventListener('scroll', queue)
      window.removeEventListener('resize', queue)
      allNodes.forEach((el) => {
        el.style.transform = ''
        el.style.opacity = ''
      })
    }
  }, [containerRef])
}
