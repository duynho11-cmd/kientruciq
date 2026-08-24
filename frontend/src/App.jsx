import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { useEffect, useRef } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ProjectsProvider } from './context/ProjectsContext'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminKienTrucPage from './pages/admin/AdminKienTrucPage'
import AdminNoiThatPage from './pages/admin/AdminNoiThatPage'
import AdminConsultPage from './pages/admin/AdminConsultPage'
import AdminAddKienTrucPage from './pages/admin/AdminAddKienTrucPage'
import AdminAddNoiThatPage from './pages/admin/AdminAddNoiThatPage'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import FloatingContact from './components/common/FloatingContact'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import HoSoDetailPage from './pages/HoSoDetailPage'
import HoSoKienTrucPage from './pages/HoSoKienTrucPage'
import HoSoNoiThatPage from './pages/HoSoNoiThatPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import Seo from './components/common/Seo'
import { absoluteUrl } from './lib/seo'

const PUBLIC_SEO = {
  '/': {
    description: 'Kiến Trúc IQ kiến tạo không gian sống hiện đại qua các giải pháp thiết kế kiến trúc, nội thất và sân vườn tinh tế.',
  },
  '/ho-so-kien-truc': {
    title: 'Hồ sơ kiến trúc',
    description: 'Khám phá các hồ sơ, ý tưởng và công trình kiến trúc nổi bật do Kiến Trúc IQ thiết kế.',
  },
  '/ho-so-noi-that': {
    title: 'Hồ sơ nội thất',
    description: 'Khám phá các hồ sơ và giải pháp thiết kế nội thất tiện nghi, thẩm mỹ từ Kiến Trúc IQ.',
  },
  '/about': {
    title: 'Giới thiệu',
    description: 'Tìm hiểu về Kiến Trúc IQ, định hướng thiết kế và đội ngũ kiến tạo những không gian sống thông minh, gần gũi thiên nhiên.',
  },
}

function RouteSeo() {
  const { pathname } = useLocation()
  const config = PUBLIC_SEO[pathname]
  if (config) {
    const jsonLd = pathname === '/' ? {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'Organization', '@id': `${absoluteUrl('/')}#organization`, name: 'Kiến Trúc IQ', url: absoluteUrl('/'), logo: absoluteUrl('/logo.png') },
        { '@type': 'WebSite', '@id': `${absoluteUrl('/')}#website`, name: 'Kiến Trúc IQ', url: absoluteUrl('/'), inLanguage: 'vi-VN' },
      ],
    } : undefined
    return <Seo {...config} path={pathname} jsonLd={jsonLd} />
  }
  if (pathname.startsWith('/project/') || pathname.startsWith('/ho-so/')) return null
  return <Seo title="Khu vực riêng tư" noindex />
}

/* ── Route direction helper ──────────────────────────────────── */
const ROUTE_ORDER = ['/', '/ho-so-kien-truc', '/ho-so-noi-that', '/about']

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
        <Route path="/"                  element={<HomePage />} />
        <Route path="/ho-so-kien-truc"   element={<HoSoKienTrucPage />} />
        <Route path="/ho-so-noi-that"    element={<HoSoNoiThatPage />} />
        <Route path="/about"             element={<AboutPage />} />
        <Route path="/project/:slug"     element={<ProjectDetailPage />} />
        <Route path="/ho-so/:slug"       element={<HoSoDetailPage />} />
        <Route path="*"                  element={<HomePage />} />
      </Routes>
    </div>
  )
}

/* ── Main layout (with Navbar + Footer) ─────────────────────── */
function MainLayout() {
  return (
    <>
      <Navbar />
      <AnimatedRoutes />
      <Footer />
      {/* FloatingContact nằm ngoài AnimatedRoutes để tránh bị ảnh hưởng
          bởi transform/filter của page transition wrapper */}
      <FloatingContact />
    </>
  )
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <RouteSeo />
      <AuthProvider>
        <ProjectsProvider>
          <Routes>
            {/* Auth pages — no Navbar/Footer */}
            <Route path="/login"            element={<LoginPage />} />
            <Route path="/register"         element={<RegisterPage />} />
            <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
            <Route path="/reset-password"   element={<ResetPasswordPage />} />

            {/* Admin pages — protected, own layout */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index                          element={<AdminDashboard />} />
              <Route path="tu-van"                  element={<AdminConsultPage />} />
              <Route path="ho-so-kien-truc"         element={<AdminKienTrucPage />} />
              <Route path="ho-so-kien-truc/them"    element={<AdminAddKienTrucPage />} />
              <Route path="ho-so-noi-that"          element={<AdminNoiThatPage />} />
              <Route path="ho-so-noi-that/them"     element={<AdminAddNoiThatPage />} />
            </Route>

            {/* All other pages — full public layout */}
            <Route path="*" element={<MainLayout />} />
          </Routes>
        </ProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
