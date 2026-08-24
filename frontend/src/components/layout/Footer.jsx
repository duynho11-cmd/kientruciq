import { NavLink, useLocation } from 'react-router'
import logoSrc     from '../../assets/logo/logo.png'
import icFacebook  from '../../assets/iconMedia/icfacebook.png'
import icZalo      from '../../assets/iconMedia/iczalo.png'
import icTiktok    from '../../assets/iconMedia/ictiktok.png'
import icInstagram from '../../assets/iconMedia/icinstagram.png'

/* ── Icon helpers ─────────────────────────────────────────── */
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 9 9l1.09-1.09a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const IconFacebook = () => (
  <img src={icFacebook} alt="Facebook" width="50" height="50" style={{ display: 'block', objectFit: 'contain' }} />
)

const IconZalo = () => (
  <img src={icZalo} alt="Zalo" width="50" height="50" style={{ display: 'block', objectFit: 'contain' }} />
)

const IconTiktok = () => (
  <img src={icTiktok} alt="TikTok" width="50" height="50" style={{ display: 'block', objectFit: 'contain' }} />
)

const IconInstagram = () => (
  <img src={icInstagram} alt="Instagram" width="50" height="50" style={{ display: 'block', objectFit: 'contain' }} />
)

const SOCIAL_LINKS = [
  { label: 'Facebook',  href: 'https://www.facebook.com/kientruciq', Icon: IconFacebook },
  { label: 'Zalo',      href: 'https://zalo.me/0000000000', Icon: IconZalo },
  { label: 'TikTok',    href: 'https://www.tiktok.com/@kientruciq?is_from_webapp=1&sender_device=pc', Icon: IconTiktok },
  { label: 'Instagram', href: 'https://instagram.com/yourpage',        Icon: IconInstagram },
]

/*  Quick links data  */
const QUICK_LINKS = [
  { label: 'Mẫu thiết kế', to: '/' },
  { label: 'Giới thiệu', to: '/about' },
  { label: 'Liên hệ', to: '/contact' },
]

const SERVICES = [
  'Thiết Kế Kiến Trúc',
  'Thiết Kế Nội Thất',
  'Thiết Kế Sân Vườn',
]

/* ═══════════════════════════════════════════════════════════ */
const Footer = () => {
  const year = new Date().getFullYear()
  const { pathname } = useLocation()
  const isHome = pathname === '/' || pathname.startsWith('/project/')

  return (
    <footer style={{
      borderTop: '1px solid var(--outline-variant)',
      backgroundColor: 'var(--surface-container)',
      fontFamily: 'var(--font-body)',
    }}>

      {/* ── Main 5-column grid — ẩn ở HomePage ────────────── */}
      {!isHome && (
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: 'clamp(3rem, 5vw, 5rem) var(--margin-edge) clamp(2rem, 3vw, 3rem)',
      }}>

        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1.2fr 1fr 1fr 1.8fr',
          gap: 'clamp(2rem, 4vw, 3.5rem)',
          alignItems: 'start',
        }}>

          {/* ── COL 1: Logo + Slogan ─────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none' }}>
              <img
                src={logoSrc}
                alt="Kiến Trúc IQ logo"
                style={{ height: '28px', width: 'auto', display: 'block' }}
              />
              <span style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: '16px', fontWeight: 400,
                color: 'var(--on-surface)', letterSpacing: '0.02em',
              }}>
                Kiến Trúc IQ
              </span>
            </NavLink>

            <p style={{
              fontSize: '13.5px', lineHeight: 1.75,
              color: 'var(--on-surface-variant)',
              maxWidth: '240px',
            }}>
              "Đẹp trong thiết kế, Thông minh trong sử dụng."
            </p>

            {/* Social */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              {SOCIAL_LINKS.map((social) => {
                const SocialIcon = social.Icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    style={{
                      width: '34px', height: '34px',
                      borderRadius: '50%',
                      border: '1px solid var(--outline-variant)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--on-surface-variant)',
                      transition: 'border-color 0.2s, background 0.2s',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--on-surface)'
                      e.currentTarget.style.background = 'var(--surface)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--outline-variant)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <SocialIcon />
                  </a>
                )
              })}
            </div>
          </div>

          {/* ── COL 2: Địa chỉ + Giờ mở cửa ──────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{
              fontSize: '10.5px', fontWeight: 700,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              color: 'var(--on-surface)', margin: 0,
            }}>
              Văn phòng
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', color: 'var(--on-surface-variant)' }}>
                <IconPin />
                <span style={{ fontSize: '13.5px', lineHeight: 1.65 }}>
                  90 Đ. Nguyễn Tuân, Thanh Xuân, Hà Nội 100000, Việt Nam
                </span>
              </div>

            </div>

            {/* Giờ mở cửa */}
            <div style={{
              borderTop: '1px solid var(--outline-variant)',
              paddingTop: '1.1rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', gap: '0.6rem', color: 'var(--on-surface-variant)', alignItems: 'flex-start' }}>
                <IconClock />
                <div style={{ fontSize: '13.5px', lineHeight: 1.65 }}>
                  <div>Thứ 2: <span style={{ color: 'var(--on-surface)' }}>09:00 - 17:00</span></div>
                  <div>Thứ 3 - 7: <span style={{ color: 'var(--on-surface)' }}>09:00 - 19:00</span></div>
                  <div>Chủ Nhật: <span style={{ color: 'var(--on-surface)' }}>09:00 - 17:00</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* ── COL 3: Liệt kê nhanh ───────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{
              fontSize: '10.5px', fontWeight: 700,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              color: 'var(--on-surface)', margin: 0,
            }}>
              Điều hướng
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {QUICK_LINKS.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  style={{ textDecoration: 'none' }}
                >
                  {({ isActive }) => (
                    <span style={{
                      fontSize: '13.5px',
                      color: isActive ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                      transition: 'color 0.2s',
                      display: 'inline-block',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--on-surface)' }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--on-surface-variant)' }}
                    >
                      {link.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>

            <div style={{
              borderTop: '1px solid var(--outline-variant)',
              paddingTop: '1.1rem',
              display: 'flex', flexDirection: 'column', gap: '0.55rem',
            }}>
              <p style={{
                fontSize: '10.5px', fontWeight: 700,
                letterSpacing: '0.13em', textTransform: 'uppercase',
                color: 'var(--on-surface)', margin: '0 0 0.3rem',
              }}>
                Dịch vụ
              </p>
              {SERVICES.map((s) => (
                <span key={s} style={{
                  fontSize: '13.5px',
                  color: 'var(--on-surface-variant)',
                  cursor: 'default',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* ── COL 4: Liên hệ ─────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{
              fontSize: '10.5px', fontWeight: 700,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              color: 'var(--on-surface)', margin: 0,
            }}>
              Liên hệ
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href="tel:+84937752468"
                style={{ display: 'flex', gap: '0.6rem', color: 'var(--on-surface-variant)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--on-surface)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--on-surface-variant)' }}
              >
                <IconPhone />
                <span style={{ fontSize: '13.5px', lineHeight: 1.65 }}>093 775 2468</span>
              </a>

              <a
                href="mailto:quang.iqa.vn@gmail.com"
                style={{ display: 'flex', gap: '0.6rem', color: 'var(--on-surface-variant)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--on-surface)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--on-surface-variant)' }}
              >
                <IconMail />
                <span style={{ fontSize: '13.5px', lineHeight: 1.65 }}>quang.iqa.vn@gmail.com</span>
              </a>
            </div>

            {/* CTA */}
            <a
              href="tel:+84901234567"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                marginTop: '0.5rem',
                padding: '0.55rem 1.1rem',
                border: '1px solid var(--outline-variant)',
                borderRadius: '3px',
                fontSize: '11.5px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--on-surface)',
                textDecoration: 'none',
                transition: 'background 0.2s, border-color 0.2s',
                width: 'fit-content',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--surface)'
                e.currentTarget.style.borderColor = 'var(--on-surface)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'var(--outline-variant)'
              }}
            >
              Tư vấn miễn phí
            </a>
          </div>

          {/* ── COL 5: Map ─────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h4 style={{
              fontSize: '10.5px', fontWeight: 700,
              letterSpacing: '0.13em', textTransform: 'uppercase',
              color: 'var(--on-surface)', margin: 0,
            }}>
              Bản đồ
            </h4>

            <div style={{
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid var(--outline-variant)',
              aspectRatio: '16 / 10',
              backgroundColor: 'var(--surface)',
            }}>
              <iframe
                title="Vị trí Kiến Trúc IQ"
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d4583.402633200098!2d105.8053572!3d20.9956816!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac961c2fdbad%3A0xbdf5767d8016f54c!2zOTAgxJAuIE5ndXnhu4VuIFR1w6JuLCBUaGFuaCBYdcOibiwgSMOgIE7hu5lpIDEwMDAwMCwgVmnhu4d0IE5hbQ!5e1!3m2!1svi!2s!4v1787216905931!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <p style={{
              fontSize: '12px',
              color: 'var(--on-surface-variant)',
              margin: 0,
              lineHeight: 1.6,
            }}>
              90 Đ. Nguyễn Tuân, Thanh Xuân, Hà Nội 100000, Việt Nam
            </p>
          </div>

        </div>
      </div>
      )} {/* end !isHome */}

      {/* ── Bottom bar ───────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid var(--outline-variant)',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: '1.25rem var(--margin-edge)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <p style={{
          fontSize: '12px',
          color: 'var(--on-surface-variant)',
          margin: 0,
        }}>
          © {year} Kiến Trúc IQ. All rights reserved.
        </p>
        <p style={{
          fontSize: '12px',
          color: 'var(--on-surface-variant)',
          margin: 0,
          letterSpacing: '0.04em',
        }}>
          "Đẹp trong thiết kế, Thông minh trong sử dụng."

        </p>
      </div>

      {/* ── Responsive ───────────────────────────────────── */}
      <style>{`
        @media (max-width: 1100px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
          .footer-grid > div:nth-child(4),
          .footer-grid > div:nth-child(5) {
            grid-column: span 1;
          }
        }
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .footer-grid > div:nth-child(5) {
            grid-column: 1 / -1;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
          .footer-grid > div {
            grid-column: 1 !important;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer
