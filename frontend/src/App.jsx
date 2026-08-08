import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { useEffect, useRef } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProjectDetailPage from './pages/ProjectDetailPage'

/* ── Route direction helper ──────────────────────────────────── */
const ROUTE_ORDER = ['/', '/about']

function getDirection(from, to) {
  const fi = ROUTE_ORDER.indexOf(from)
  const ti = ROUTE_ORDER.indexOf(to)
  // known routes: slide direction by order
  if (fi !== -1 && ti !== -1) return ti > fi ? 1 : -1
  // going into detail: slide left (forward)
  if (to.startsWith('/project')) return 1
  // coming back from detail: slide right (backward)
  if (from.startsWith('/project')) return -1
  return 1
}

/* ══════════════════════════════════════════════════════════════
   Page transition wrapper
   — uses clip-path reveal + opacity + subtle translateY
   ══════════════════════════════════════════════════════════════ */
function AnimatedRoutes() {
  const location   = useLocation()
  const wrapperRef = useRef(null)
  const prevPath   = useRef(location.pathname)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const prev = prevPath.current
    const next = location.pathname
    prevPath.current = next

    const dir  = getDirection(prev, next)   // +1 = forward, -1 = backward
    const fromX = dir > 0 ? '2vw' : '-2vw'

    // 1. Snap to invisible starting position (no transition)
    el.style.transition = 'none'
    el.style.opacity    = '0'
    el.style.transform  = `translateY(8px) translateX(${fromX})`
    el.style.filter     = 'blur(2px)'

    // 2. After two frames (DOM has painted new route), animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = [
          `opacity   0.52s cubic-bezier(0.16,1,0.3,1)`,
          `transform 0.52s cubic-bezier(0.16,1,0.3,1)`,
          `filter    0.38s ease`,
        ].join(', ')
        el.style.opacity   = '1'
        el.style.transform = 'translateY(0) translateX(0)'
        el.style.filter    = 'blur(0)'
      })
    })
  }, [location.pathname])

  return (
    <div
      ref={wrapperRef}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <Routes location={location} key={location.pathname}>
        <Route path="/"              element={<HomePage />} />
        <Route path="/about"         element={<AboutPage />} />
        <Route path="/project/:slug" element={<ProjectDetailPage />} />
        <Route path="*"              element={<HomePage />} />
      </Routes>
    </div>
  )
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </BrowserRouter>
  )
}
