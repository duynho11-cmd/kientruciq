import { NavLink } from 'react-router'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">

        {/* Copy */}
        <p className="footer-copy">
          © {year} Kiến Trúc IQ. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
