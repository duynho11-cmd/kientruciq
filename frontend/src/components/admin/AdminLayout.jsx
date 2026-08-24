import { NavLink, Outlet, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import logoSrc from '../../assets/logo/logo.png'

/* ── Icons ───────────────────────────────────────────────────── */
function IconOverview() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconProjects() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6h20M2 12h20M2 18h20" />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="6" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconConsult() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconFolder() {  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconAnalytics() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

/* ── Nav items ───────────────────────────────────────────────── */
const TOP_NAV = [
  { to: '/admin',       label: 'Overview', icon: <IconOverview />, end: true },
  { to: '/admin/tu-van', label: 'Tư vấn',  icon: <IconConsult />  },
]

const CATEGORY_NAV = [
  { to: '/admin/ho-so-kien-truc', label: 'Hồ sơ kiến trúc' },
  { to: '/admin/ho-so-noi-that',  label: 'Hồ sơ nội thất'  },
]

const BOTTOM_NAV = []

/* ══════════════════════════════════════════════════════════════
   AdminLayout
   ══════════════════════════════════════════════════════════════ */
export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  // Tự động mở accordion nếu đang ở một trong các trang con
  const isCategoryActive = CATEGORY_NAV.some((item) =>
    location.pathname.startsWith(item.to)
  )
  const [categoryOpen, setCategoryOpen] = useState(isCategoryActive)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  /* Avatar initials */
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'A'

  return (
    <div className="admin-shell">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="admin-sidebar">
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <img src={logoSrc} alt="logo" className="admin-sidebar__logo" />
          <div>
            <div className="admin-sidebar__brand-name">Kiến Trúc IQ</div>
            <div className="admin-sidebar__brand-sub">Admin Console</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-nav">
          {/* Top items */}
          {TOP_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav__item${isActive ? ' admin-nav__item--active' : ''}`
              }
            >
              <span className="admin-nav__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {/* Danh mục group — accordion */}
          <div className="admin-nav__group">
            <button
              className={`admin-nav__item admin-nav__group-trigger${isCategoryActive ? ' admin-nav__item--active' : ''}`}
              onClick={() => setCategoryOpen((v) => !v)}
              aria-expanded={categoryOpen}
            >
              <span className="admin-nav__icon"><IconFolder /></span>
              <span style={{ flex: 1 }}>Danh mục</span>
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
                style={{
                  transition: 'transform 0.22s ease',
                  transform: categoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.6,
                  flexShrink: 0,
                }}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            <div className={`admin-nav__children${categoryOpen ? ' admin-nav__children--open' : ''}`}>
              {CATEGORY_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `admin-nav__item admin-nav__item--child${isActive ? ' admin-nav__item--active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Bottom items */}
          {BOTTOM_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-nav__item${isActive ? ' admin-nav__item--active' : ''}`
              }
            >
              <span className="admin-nav__icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__avatar">{initials}</div>
          <div className="admin-sidebar__user-info">
            <span className="admin-sidebar__user-name">{user?.name || 'Admin'}</span>
            <span className="admin-sidebar__user-email">{user?.email}</span>
          </div>
          <button
            className="admin-sidebar__logout"
            onClick={handleLogout}
            title="Đăng xuất"
            aria-label="Đăng xuất"
          >
            <IconLogout />
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────── */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar__spacer" />
          <div className="admin-topbar__actions">
            <button className="admin-topbar__btn" aria-label="Thông báo">
              <IconBell />
            </button>
            <button className="admin-topbar__btn" aria-label="Tài khoản">
              <IconUser />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="admin-footer">
          © 2026 Kiến Trúc IQ. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
