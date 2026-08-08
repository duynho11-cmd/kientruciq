import { useEffect, useState } from 'react'
import { NavLink } from 'react-router'
import logoSrc from '../../assets/logo/logo.png'

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
          to="/"
          end
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Hồ sơ
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          Giới thiệu
        </NavLink>
      </nav>
    </header>
  )
}

export default Navbar
