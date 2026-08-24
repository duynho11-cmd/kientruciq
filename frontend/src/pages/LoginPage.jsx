import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'

/* ── Decorative background circles ─────────────────────────── */
function BgCircles() {
  return (
    <div className="login-bg-circles" aria-hidden="true">
      <div className="login-circle login-circle--1" />
      <div className="login-circle login-circle--2" />
      <div className="login-circle login-circle--3" />
      <div className="login-circle login-circle--4" />
    </div>
  )
}

/* ── Eye icon ────────────────────────────────────────────────── */
function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

/* ── Validation rules ────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateLogin(form) {
  const errors = {}
  if (!form.email.trim()) {
    errors.email = 'Vui lòng nhập email.'
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Email không đúng định dạng.'
  }
  if (!form.password) {
    errors.password = 'Vui lòng nhập mật khẩu.'
  } else if (form.password.length < 6) {
    errors.password = 'Mật khẩu tối thiểu 6 ký tự.'
  }
  return errors
}

/* ══════════════════════════════════════════════════════════════
   LoginPage
   ══════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = location.state?.from?.pathname || '/admin'

  const [form, setForm]       = useState({ email: '', password: '', remember: false })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [errors, setErrors]    = useState({})
  const [touched, setTouched]  = useState({})

  /* Validate a single field or all fields */
  const validateField = (name, value) => {
    const draft = { ...form, [name]: value }
    const all   = validateLogin(draft)
    return all[name] || ''
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const next = type === 'checkbox' ? checked : value
    setForm((prev) => ({ ...prev, [name]: next }))
    // Clear error as user types, only if field was already touched
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, next) }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Touch all fields
    setTouched({ email: true, password: true })
    const errs = validateLogin(form)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      await login(form.email.trim(), form.password, form.remember)
      navigate(from, { replace: true })
    } catch (err) {
      setErrors({ form: err.message || 'Email hoặc mật khẩu không đúng.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <BgCircles />

      <div className="login-card">
        <div className="login-card__header">
          <h1 className="login-card__title">Welcome Back</h1>
          <p className="login-card__subtitle">Đăng nhập để tiếp tục quản lý dự án.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Form-level error (sai credentials) */}
          {errors.form && (
            <div className="auth-alert" role="alert">{errors.form}</div>
          )}

          {/* Email */}
          <div className="login-field">
            <label htmlFor="login-email" className="login-field__label">Email</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'login-email-err' : undefined}
              className={`login-field__input${errors.email ? ' login-field__input--error' : ''}`}
            />
            {errors.email && (
              <span id="login-email-err" className="auth-field-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password" className="login-field__label">Password</label>
            <div className="login-field__wrap">
              <input
                id="login-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'login-pw-err' : undefined}
                className={`login-field__input login-field__input--pw${errors.password ? ' login-field__input--error' : ''}`}
              />
              <button
                type="button"
                className="login-field__eye"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
            {errors.password && (
              <span id="login-pw-err" className="auth-field-error" role="alert">
                {errors.password}
              </span>
            )}
          </div>

          {/* Remember + Forgot */}
          <div className="login-row">
            <label className="login-remember">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="login-forgot">
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? <span className="login-spinner" aria-hidden="true" /> : 'Sign In'}
          </button>

          <div className="login-divider" />

          <p className="login-signup">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="login-signup__link">Request Access</Link>
          </p>
        </form>
      </div>
    </main>
  )
}
