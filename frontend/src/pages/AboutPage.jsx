import { useEffect, useState } from 'react'
import anh from '../assets/imgMeLinh/18.jpg'

/* ── Social link data ────────────────────────────────────────── */
const SOCIALS = [
  { label: 'Facebook',  href: 'https://www.facebook.com/kientruciq?_rdc=1&_rdr#' },
  { label: 'Instagram', href: '*' },
  { label: 'Zalo',  href: '*' },
]

const TAGS = ['Kiến trúc', 'Nội thất', 'Sân vườn']

function AboutPage() {
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  const reveal = (delayMs) => ({
    opacity:    entered ? 1 : 0,
    transform:  entered ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.98)',
    filter:     entered ? 'blur(0)' : 'blur(3px)',
    transition: [
      `opacity   0.7s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
      `transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delayMs}ms`,
      `filter    0.5s ease                        ${delayMs}ms`,
    ].join(', '),
  })

  const hoverLink = {
    onMouseEnter: (e) => { e.currentTarget.style.color = 'var(--on-surface)' },
    onMouseLeave: (e) => { e.currentTarget.style.color = 'var(--on-surface-variant)' },
  }

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: 'calc(var(--navbar-h) + 2rem)',
      paddingLeft: 'var(--margin-edge)',
      paddingRight: 'var(--margin-edge)',
      paddingBottom: '4rem',
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr)',
        gap: 'clamp(3rem, 6vw, 7rem)',
        alignItems: 'start',
        width: '100%',
      }}>

        {/* ── Portrait ─────────────────────────────────────── */}
        <div style={{ position: 'sticky', top: 'calc(var(--navbar-h) + 2rem)', ...reveal(0) }}>
          <div style={{
            aspectRatio: '3 / 4',
            overflow: 'hidden',
            borderRadius: '4px',
            backgroundColor: 'var(--surface-container)',
            maxWidth: '380px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <img
              src={anh}
              alt="Kiến Trúc IQ"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
            />
          </div>
        </div>

        {/* ── Bio column ───────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.25rem' }}>

          {/* Eyebrow + title */}
          <div style={reveal(80)}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '10.5px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--on-surface-variant)',
              marginBottom: '0.6rem',
            }}>
              About
            </p>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'clamp(30px, 4vw, 46px)',
              fontWeight: 300,
              lineHeight: 1.1,
              letterSpacing: '0.01em',
              color: 'var(--on-surface)',
            }}>
              Kiếm Trúc IQ
            </h1>
          </div>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--outline-variant)',
            ...reveal(140),
            transform: entered ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
          }} />

          {/* Bio paragraphs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', ...reveal(160) }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              lineHeight: 1.75,
              color: 'var(--on-surface)',
            }}>
              Kiến trúc sư và nhà thiết kế với niềm đam mê về không gian, chữ viết và hình ảnh.
              Công việc của chúng tôi nằm ở giao điểm giữa thiết kế truyền thống và cảm quan thị giác đương đại.
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              lineHeight: 1.75,
              color: 'var(--on-surface-variant)',
            }}>
              Mỗi dự án là một cuộc khám phá — từ nhà ở đến công trình công cộng, từ nội thất
              đến quy hoạch. Chúng tôi tin vào sức mạnh của sự tối giản có chủ đích và khoảng trống biết nói.
            </p>
          </div>

          {/* Tags */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.45rem 1.25rem',
            ...reveal(220),
          }}>
            {TAGS.map((tag) => (
              <span key={tag} style={{
                fontFamily: 'var(--font-body)',
                fontSize: '10.5px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--on-surface-variant)',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div style={{
            height: '1px',
            background: 'var(--outline-variant)',
            ...reveal(260),
            transform: entered ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
          }} />

          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', ...reveal(280) }}>
            <a
              href="mailto:hello@ktshoaclac.vn"
              style={{
                alignSelf: 'flex-start',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--on-surface)',
                textDecoration: 'none',
                borderBottom: '1.5px solid var(--on-surface)',
                paddingBottom: '2px',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.45' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              quang.iqa.vn@gmail.com
            </a>

            <a
              href="tel:+84123456789"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                fontWeight: 400,
                color: 'var(--on-surface-variant)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              {...hoverLink}
            >
              093 775 24 68
            </a>

            <address style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              lineHeight: 1.55,
              color: 'var(--on-surface-variant)',
              fontStyle: 'normal',
            }}>
              16N3, 90 Nguyễn Tuân, Thanh Xuân, Hà Nội
            </address>
          </div>

          {/* Social links */}
          <div style={{ display: 'flex', gap: '1.5rem', ...reveal(340) }}>
            {SOCIALS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '10.5px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--on-surface-variant)',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease',
                }}
                {...hoverLink}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile grid override */}
      <style>{`
        @media (max-width: 768px) {
          main > div {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
          main > div > div:first-child {
            position: static !important;
            max-width: 100% !important;
          }
        }
      `}</style>
    </main>
  )
}

export default AboutPage
