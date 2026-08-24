import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import api, { getApiError } from '../services/api'

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

/* ── Arrow icon ──────────────────────────────────────────────── */
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

/* ── Validation ──────────────────────────────────────────────── */
const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NAME_RE     = /^[\p{L}\s'-]{2,}$/u   // Unicode letters, spaces, apostrophe, hyphen

function validateRegister(form) {
  const errors = {}

  if (!form.fullName.trim()) {
    errors.fullName = 'Vui lòng nhập họ tên.'
  } else if (!NAME_RE.test(form.fullName.trim())) {
    errors.fullName = 'Họ tên chỉ chứa chữ cái và khoảng trắng (tối thiểu 2 ký tự).'
  }

  if (!form.email.trim()) {
    errors.email = 'Vui lòng nhập email.'
  } else if (!EMAIL_RE.test(form.email.trim())) {
    errors.email = 'Email không đúng định dạng.'
  }

  if (!form.password) {
    errors.password = 'Vui lòng nhập mật khẩu.'
  } else if (form.password.length < 8) {
    errors.password = 'Mật khẩu tối thiểu 8 ký tự.'
  } else if (!/[A-Z]/.test(form.password)) {
    errors.password = 'Mật khẩu phải có ít nhất 1 chữ hoa.'
  } else if (!/[0-9]/.test(form.password)) {
    errors.password = 'Mật khẩu phải có ít nhất 1 chữ số.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
  }

  return errors
}

/* ── Password strength ───────────────────────────────────────── */
function getStrength(pw) {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8)          score++
  if (pw.length >= 12)         score++
  if (/[A-Z]/.test(pw))        score++
  if (/[0-9]/.test(pw))        score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score  // 0–5
}

const STRENGTH_LABEL = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh']
const STRENGTH_COLOR = ['', '#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#2b6cb0']

function PasswordStrength({ password }) {
  const score = getStrength(password)
  if (!password) return null
  return (
    <div className="pw-strength">
      <div className="pw-strength__bars">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="pw-strength__bar"
            style={{ background: i <= score ? STRENGTH_COLOR[score] : 'var(--outline-variant)' }}
          />
        ))}
      </div>
      <span className="pw-strength__label" style={{ color: STRENGTH_COLOR[score] }}>
        {STRENGTH_LABEL[score]}
      </span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   RegisterPage
   ══════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [errors, setErrors]           = useState({})
  const [touched, setTouched]         = useState({})

  const validateField = (name, value) => {
    const draft = { ...form, [name]: value }
    const all   = validateRegister(draft)
    return all[name] || ''
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
    }
    // Also re-validate confirmPassword when password changes
    if (name === 'password' && touched.confirmPassword) {
      const match = value === form.confirmPassword ? '' : 'Mật khẩu xác nhận không khớp.'
      setErrors((prev) => ({ ...prev, confirmPassword: match }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true })
    const errs = validateRegister(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await api.post('/auth/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/login', { replace: true })
    } catch (error) {
      setErrors({ form: getApiError(error, 'Không thể tạo tài khoản.') })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <BgCircles />

      <p className="register-brand">Kiến Trúc IQ</p>

      <div className="register-card">
        <div className="register-card__header">
          <h1 className="register-card__title">Create your account</h1>
          <p className="register-card__subtitle">Tham gia để khám phá các dự án thiết kế.</p>
        </div>

        <form className="register-form" onSubmit={handleSubmit} noValidate>

          {errors.form && (
            <div className="auth-alert" role="alert">{errors.form}</div>
          )}

          {/* Full Name */}
          <div className="register-field">
            <label htmlFor="reg-name" className="register-field__label">Full Name</label>
            <input
              id="reg-name"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'reg-name-err' : undefined}
              className={`register-field__input${errors.fullName ? ' register-field__input--error' : ''}`}
            />
            {errors.fullName && (
              <span id="reg-name-err" className="auth-field-error" role="alert">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="register-field">
            <label htmlFor="reg-email" className="register-field__label">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'reg-email-err' : undefined}
              className={`register-field__input${errors.email ? ' register-field__input--error' : ''}`}
            />
            {errors.email && (
              <span id="reg-email-err" className="auth-field-error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="register-field">
            <label htmlFor="reg-password" className="register-field__label">Password</label>
            <div className="register-field__wrap">
              <input
                id="reg-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.password}
                aria-describedby="reg-pw-hint"
                className={`register-field__input register-field__input--pw${errors.password ? ' register-field__input--error' : ''}`}
              />
              <button
                type="button"
                className="register-field__eye"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
            <PasswordStrength password={form.password} />
            {errors.password ? (
              <span id="reg-pw-hint" className="auth-field-error" role="alert">
                {errors.password}
              </span>
            ) : (
              <span id="reg-pw-hint" className="auth-field-hint">
                Tối thiểu 8 ký tự, gồm chữ hoa và chữ số.
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="register-field">
            <label htmlFor="reg-confirm" className="register-field__label">Confirm Password</label>
            <div className="register-field__wrap">
              <input
                id="reg-confirm"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'reg-confirm-err' : undefined}
                className={`register-field__input register-field__input--pw${errors.confirmPassword ? ' register-field__input--error' : ''}`}
              />
              <button
                type="button"
                className="register-field__eye"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {errors.confirmPassword && (
              <span id="reg-confirm-err" className="auth-field-error" role="alert">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Submit */}
          <button type="submit" className="register-submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" aria-hidden="true" />
            ) : (
              <>
                <span>SIGN UP</span>
                <ArrowRight />
              </>
            )}
          </button>

          <p className="register-signin">
            Already have an account?{' '}
            <Link to="/login" className="register-signin__link">Sign In</Link>
          </p>
        </form>
      </div>
    </main>
  )
}
