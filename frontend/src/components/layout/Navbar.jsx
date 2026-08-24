import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import logoSrc from '../../assets/logo/logo.png'

/* ── Dropdown menu ──────────────────────────────────────────── */
const DANH_MUC = [
  { to: '/ho-so-kien-truc', label: 'Hồ Sơ Kiến Trúc' },
  { to: '/ho-so-noi-that',  label: 'Hồ Sơ Nội Thất'  },
]

function DanhMucDropdown() {
  const [open, setOpen]   = useState(false)
  const wrapRef           = useRef(null)
  const location          = useLocation()

  // close on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  // close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const isChildActive = DANH_MUC.some((m) => location.pathname === m.to)

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        className={`nav-link dropdown-trigger${isChildActive ? ' active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          font: 'inherit',
        }}
      >
        Danh mục
        <svg
          width="11" height="11"
          viewBox="0 0 10 10" fill="none"
          stroke="currentColor" strokeWidth="1.6"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            transition: 'transform 0.25s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            marginTop: '1px',
          }}
        >
          <path d="M2 3.5 5 6.5 8 3.5" />
        </svg>
      </button>

      {/* Invisible bridge — fills the gap between trigger and panel so
          mouseLeave doesn't fire while moving the cursor into the menu */}
      <div style={{
        position: 'absolute',
        top: '100%',
        left: '-20px',
        right: '-20px',
        height: '16px',
        // only present when open so it doesn't block other clicks
        display: open ? 'block' : 'none',
      }} />

      {/* Panel */}
      <div
        role="menu"
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          minWidth: '190px',
          background: 'var(--surface)',
          border: '1px solid var(--outline-variant)',
          borderRadius: '6px',
          boxShadow: 'var(--shadow-lg)',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          // animate
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateY(0)' : 'translateY(-6px)',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {DANH_MUC.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            role="menuitem"
            className={({ isActive }) =>
              `dropdown-item${isActive ? ' active' : ''}`
            }
            style={({ isActive }) => ({
              display: 'block',
              padding: '9px 14px',
              borderRadius: '4px',
              fontSize: '13.5px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--on-surface)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              background: isActive ? 'var(--surface-container)' : 'transparent',
              transition: 'background 0.18s, color 0.18s',
            })}
            onMouseEnter={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'var(--surface-container)'
              }
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

/* ── Navbar ─────────────────────────────────────────────────── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`site-header${scrolled ? ' scrolled' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand */}
      <NavLink
        to="/"
        className="nav-brand"
        style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}
      >
        <img
          src={logoSrc}
          alt="Kiến Trúc IQ logo"
          style={{ height: '28px', width: 'auto', display: 'block' }}
        />
        Kiến Trúc IQ
      </NavLink>

      {/* Nav links */}
      <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Mẫu thiết kế
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Giới thiệu
        </NavLink>

        <DanhMucDropdown />
      </nav>
    </header>
  )
}

export default Navbar
