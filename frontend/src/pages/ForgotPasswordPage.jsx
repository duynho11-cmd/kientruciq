import { useState } from 'react'
import { Link } from 'react-router'
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

/* ── Icons ───────────────────────────────────────────────────── */
function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function ArrowLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function CheckCircle() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--accent)' }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l3 3 5-5" />
    </svg>
  )
}

/* ── Validation ──────────────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateEmail(value) {
  if (!value.trim())           return 'Vui lòng nhập địa chỉ email.'
  if (!EMAIL_RE.test(value.trim())) return 'Email không đúng định dạng.'
  return ''
}

/* ══════════════════════════════════════════════════════════════
   ForgotPasswordPage
   ══════════════════════════════════════════════════════════════ */
export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [error, setError]     = useState('')
  const [touched, setTouched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)

  const handleChange = (e) => {
    const val = e.target.value
    setEmail(val)
    if (touched) setError(validateEmail(val))
  }

  const handleBlur = () => {
    setTouched(true)
    setError(validateEmail(email))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched(true)
    const err = validateEmail(email)
    if (err) { setError(err); return }
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setSent(true)
    } catch (requestError) {
      setError(getApiError(requestError, 'Không thể gửi yêu cầu khôi phục.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="forgot-page">
      <BgCircles />
      <div className="forgot-card">

        {/* ── Success state ── */}
        {sent ? (
          <div className="forgot-success">
            <CheckCircle />
            <h2 className="forgot-success__title">Đã gửi email!</h2>
            <p className="forgot-success__body">
              Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu tới{' '}
              <strong>{email.trim()}</strong>. Hãy kiểm tra hộp thư đến (hoặc thư rác).
            </p>
            <Link to="/login" className="forgot-back">
              <ArrowLeft />
              Quay lại đăng nhập
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div className="forgot-card__header">
              <h1 className="forgot-card__title">Quên mật khẩu?</h1>
              <p className="forgot-card__subtitle">
                Đừng lo lắng, hãy nhập email bạn đã đăng ký và chúng tôi sẽ
                gửi hướng dẫn khôi phục mật khẩu cho bạn.
              </p>
            </div>

            <form className="forgot-form" onSubmit={handleSubmit} noValidate>
              <div className="register-field">
                <label htmlFor="forgot-email" className="register-field__label">
                  Địa chỉ email
                </label>
                <input
                  id="forgot-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Địa chỉ email của bạn"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'forgot-email-err' : undefined}
                  className={`register-field__input${error ? ' register-field__input--error' : ''}`}
                />
                {error && (
                  <span id="forgot-email-err" className="auth-field-error" role="alert">
                    {error}
                  </span>
                )}
              </div>

              <button type="submit" className="forgot-submit" disabled={loading}>
                {loading ? (
                  <span className="login-spinner" aria-hidden="true" />
                ) : (
                  <>
                    <span>Gửi yêu cầu khôi phục</span>
                    <ArrowRight />
                  </>
                )}
              </button>

              <Link to="/login" className="forgot-back">
                <ArrowLeft />
                Quay lại đăng nhập
              </Link>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
