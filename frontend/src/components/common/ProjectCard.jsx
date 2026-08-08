import { forwardRef, useRef, useCallback } from 'react'
import { useWaveCanvas } from '../../hooks/useWaveCanvas'

/**
 * ProjectCard
 * Scale là CSS-driven (scroll-item scale 0.80 → 1.08 active).
 * Tilt là JS-driven trên .scroll-item__tilt riêng biệt — tránh
 * CSS transition fighting với scale transition.
 */
const ProjectCard = forwardRef(function ProjectCard(
  { project, isActive, isFeature, floatStyle, onClick, index, total = 6 },
  ref
) {
  const itemRef    = useRef(null)   /* .scroll-item */
  const tiltRef    = useRef(null)   /* .scroll-item__tilt */
  const containerRef = useRef(null) /* .poster-image-container */
  const snapTimerRef = useRef(null)

  /* WebGL wave */
  useWaveCanvas(containerRef, project.coverImage, isActive)

  /* 3D tilt — set vars trên tiltRef, không đụng scroll-item */
  const onMouseMove = useCallback((e) => {
    if (!isActive) return
    const tilt = tiltRef.current
    if (!tilt) return
    if (tilt.closest('.carousel-scene')?.classList.contains('is-transitioning')) return

    clearTimeout(snapTimerRef.current)
    tilt.classList.remove('snap-back')

    const rect = itemRef.current.getBoundingClientRect()
    const dx   = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)
    const dy   = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)
    const MAX  = 7
    tilt.style.setProperty('--tilt-x', `${-dy * MAX * 0.55}deg`)
    tilt.style.setProperty('--tilt-y', `${ dx * MAX}deg`)
  }, [isActive])

  /* Spring back */
  const onMouseLeave = useCallback(() => {
    const tilt = tiltRef.current
    if (!tilt) return
    tilt.classList.add('snap-back')
    tilt.style.setProperty('--tilt-x', '0deg')
    tilt.style.setProperty('--tilt-y', '0deg')
    snapTimerRef.current = setTimeout(() => tilt?.classList.remove('snap-back'), 550)
  }, [])

  const idxLabel = String((index ?? 0) + 1).padStart(2, '0')
  const totLabel = String(total).padStart(2, '0')

  return (
    <div
      ref={ref}
      className={`carousel-card-wrap${isActive ? ' active' : ''}`}
      onClick={onClick}
    >
      {/* Scale layer */}
      <div
        ref={itemRef}
        className={[
          'scroll-item',
          isFeature ? 'feature' : '',
          isActive  ? 'active'  : '',
        ].filter(Boolean).join(' ')}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {/* Index badge */}
        <span className="scroll-item__index" aria-hidden="true">
          {idxLabel} / {totLabel}
        </span>

        {/* Tilt layer — isolated from scale */}
        <div ref={tiltRef} className="scroll-item__tilt">
          <div className="poster-float-wrap" style={floatStyle}>
            <div
              ref={containerRef}
              className={`poster-image-container${isActive ? ' wave-active' : ''}`}
            >
              <img
                src={project.coverImage}
                alt={project.title}
                className="poster-image"
                draggable={false}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="poster-metadata">
            <span className="poster-metadata__title">{project.title}</span>
            {(project.subtitle || project.category) && (
              <span className="poster-metadata__sub">
                {project.subtitle || project.category}
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  )
})

export default ProjectCard
