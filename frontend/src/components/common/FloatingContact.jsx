import { useEffect, useRef, useState } from 'react'
import icFacebook  from '@/assets/iconMedia/icfacebook.png'
import icZalo      from '@/assets/iconMedia/iczalo.png'
import icTiktok    from '@/assets/iconMedia/ictiktok.png'
import icInstagram from '@/assets/iconMedia/icinstagram.png'

/* ── Contact links config ───────────────────────────────────── */
const CONTACT_LINKS = [
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/kientruciq?_rdc=1&_rdr#',
    color: '#1877F2',
    labelBg: '#1877F2',
    icon: <img src={icFacebook} alt="Facebook" width="48" height="48" style={{ objectFit: 'contain' }} />,
  },
  {
    id: 'zalo',
    label: 'Zalo',
    href: 'https://zalo.me/0000000000',
    color: '#0068FF',
    labelBg: '#0068FF',
    icon: <img src={icZalo} alt="Zalo" width="48" height="48" style={{ objectFit: 'contain' }} />,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    href: 'https://www.tiktok.com/@kientruciq?is_from_webapp=1&sender_device=pc',
    color: '#010101',
    labelBg: '#010101',
    icon: <img src={icTiktok} alt="TikTok" width="48" height="48" style={{ objectFit: 'contain' }} />,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/yourpage',
    color: '#E1306C',
    labelBg: 'linear-gradient(135deg,#f5426c,#a020f0)',
    icon: <img src={icInstagram} alt="Instagram" width="48" height="48" style={{ objectFit: 'contain' }} />,
  },
]

/* ── Component ──────────────────────────────────────────────── */
export default function FloatingContact() {
  const [open, setOpen] = useState(false)
  const [popup, setPopup] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const wrapRef = useRef(null)

  /* Hiện nút scroll-to-top khi cuộn xuống > 300px */
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  /* Hiện popup sau 10 giây, tự ẩn sau 5 giây */
  useEffect(() => {
    const showTimer = setTimeout(() => setPopup(true), 10000)
    return () => clearTimeout(showTimer)
  }, [])

  useEffect(() => {
    if (!popup) return
    const hideTimer = setTimeout(() => setPopup(false), 5000)
    return () => clearTimeout(hideTimer)
  }, [popup])

  /* Click ngoài widget → đóng */
  useEffect(() => {
    if (!open) return
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('touchstart', onClickOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('touchstart', onClickOutside)
    }
  }, [open])

  return (
    <div ref={wrapRef} className={`float-contact${open ? ' float-contact--open' : ''}`} aria-label="Liên hệ">
      {/* Contact items */}
      <div className="float-contact__items">
        {CONTACT_LINKS.map((item, i) => (
          <a
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="float-contact__item"
            style={{ '--item-index': i, '--item-color': item.color }}
            aria-label={item.label}
          >
            <span className="float-contact__label" style={{ background: item.labelBg }}>{item.label}</span>
            <span className="float-contact__icon" style={{ background: item.color }}>
              {item.icon}
            </span>
          </a>
        ))}
      </div>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          className="float-contact__scroll-top"
          onClick={scrollToTop}
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
        >
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Toggle button */}
      <div className="float-contact__toggle-row">
        {!open && (
          <span className="float-contact__toggle-label">
            Liên Hệ Ngay<br />Với Chúng Tôi
          </span>
        )}
        <button
          className="float-contact__toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Đóng liên hệ' : 'Mở liên hệ'}
        >
          <span className="float-contact__toggle-icon">
            {open ? (
              <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <img src={icFacebook} alt="Liên hệ" width="44" height="44" style={{ objectFit: 'contain' }} />
            )}
          </span>
        </button>
      </div>

    </div>
  )
}
