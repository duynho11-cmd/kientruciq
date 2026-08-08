import { useState, useEffect, useRef, memo } from 'react'

const SLIDE_DIST = '0.45em'

/**
 * MorphTitle
 * Title cũ slide-out, title mới slide-in từ hướng ngược lại.
 * Props: title, type, dir (+1/-1/0)
 */
const MorphTitle = memo(function MorphTitle({ title, type, dir }) {
  const [layers, setLayers] = useState([
    { id: 0, text: title, type, phase: 'active', dir: 0, outDir: 0 },
  ])
  const counterRef   = useRef(1)
  const prevTitleRef = useRef(title)

  useEffect(() => {
    if (title === prevTitleRef.current) return
    prevTitleRef.current = title

    const outDir = dir >= 0 ? -1 : 1

    setLayers((prev) => {
      const id      = counterRef.current++
      const exiting = prev.map((l) => ({ ...l, phase: 'exit', outDir }))
      return [...exiting, { id, text: title, type, phase: 'enter', dir, outDir: 0 }]
    })

    const t = setTimeout(() => {
      setLayers((prev) =>
        prev
          .filter((l) => l.phase !== 'exit')
          .map((l) => ({ ...l, phase: 'active' }))
      )
    }, 550)

    return () => clearTimeout(t)
  }, [title, type, dir])

  return (
    <div className="work-names morph-title-root">

      {/* Ghost — static CSS offset */}
      {layers
        .filter((l) => l.phase === 'active' || l.phase === 'enter')
        .slice(-1)
        .map((l) => (
          <span key={`ghost-${l.id}`} className="work-names__title-2" aria-hidden="true">
            {l.text}
          </span>
        ))}

      {/* Title layers */}
      <div className="morph-title-stage" aria-live="polite">
        {layers.map((l) => (
          <h2
            key={l.id}
            className={`work-names__title morph-layer morph-layer--${l.phase}`}
            aria-label={l.phase !== 'exit' ? l.text : undefined}
            aria-hidden={l.phase === 'exit' ? 'true' : undefined}
            style={{
              '--slide-out': l.outDir > 0 ? SLIDE_DIST : l.outDir < 0 ? `-${SLIDE_DIST}` : '0',
              '--slide-in':  l.dir    > 0 ? SLIDE_DIST : l.dir    < 0 ? `-${SLIDE_DIST}` : '0',
            }}
          >
            {Array.from(l.text).map((ch, i) => (
              <span
                key={i}
                className="work-names__char"
                aria-hidden="true"
                style={ch === ' ' ? { display: 'inline-block', width: '0.28em' } : undefined}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </h2>
        ))}
      </div>

      {/* Lightning bar */}
      <div className="work-names__bar">
        <svg viewBox="0 0 300 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M0 3 L50 3 L68 0.5 L80 5.5 L92 0.5 L104 5.5 L116 3 L300 3"
            stroke="var(--on-surface)"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Type / category */}
      {type && <p className="work-names__type">{type}</p>}

    </div>
  )
})

export default MorphTitle
