import { useEffect, useRef, useState } from 'react'

const ProjectModal = ({ project, onClose }) => {
  const scrollRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    // Lock body scroll
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  if (!project) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, clientWidth } = scrollRef.current
    const idx = Math.round(scrollLeft / clientWidth)
    setActiveIdx(idx)
  }

  return (
    /* Backdrop */
    <div
      onClick={handleBackdropClick}
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(251, 249, 246, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeModalIn 0.3s ease',
      }}
    >
      <style>{`
        @keyframes fadeModalIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideModalUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--surface-container-lowest)',
          border: '1px solid var(--outline-variant)',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideModalUp 0.35s cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid var(--outline-variant)',
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '20px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'var(--on-surface)',
                marginBottom: '2px',
              }}
            >
              {project.title}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--on-surface-variant)',
              }}
            >
              {project.category} / {project.year}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: 'var(--on-surface)',
              fontSize: '20px',
              lineHeight: 1,
              opacity: 0.6,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
          >
            ✕
          </button>
        </div>

        {/* Horizontal image scroller */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-hide"
          style={{
            display: 'flex',
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollSnapType: 'x mandatory',
            gap: '0',
            flexShrink: 0,
            height: '420px',
          }}
        >
          {project.images.map((src, i) => (
            <div
              key={i}
              style={{
                flexShrink: 0,
                width: '100%',
                scrollSnapAlign: 'start',
                backgroundColor: 'var(--surface-container)',
                overflow: 'hidden',
              }}
            >
              <img
                src={src}
                alt={`${project.title} — ${i + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
            padding: '0.875rem',
            borderTop: '1px solid var(--outline-variant)',
            flexShrink: 0,
          }}
        >
          {project.images.map((_, i) => (
            <button
              key={i}
              aria-label={`Image ${i + 1}`}
              onClick={() => {
                if (!scrollRef.current) return
                scrollRef.current.scrollTo({ left: i * scrollRef.current.clientWidth, behavior: 'smooth' })
                setActiveIdx(i)
              }}
              style={{
                width: activeIdx === i ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: activeIdx === i ? 'var(--on-surface)' : 'var(--outline-variant)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Description */}
        <div
          style={{
            padding: '1.25rem 1.75rem 1.75rem',
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'var(--on-surface-variant)',
            }}
          >
            {project.description}
          </p>
        </div>
      </div>

      {/* Hint */}
      <p
        style={{
          marginTop: '1.25rem',
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--outline)',
        }}
      >
        Esc or click outside to close
      </p>
    </div>
  )
}

export default ProjectModal
