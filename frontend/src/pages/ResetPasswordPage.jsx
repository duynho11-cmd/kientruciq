import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import api, { getApiError } from '../services/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!token) return setError('Liên kết đặt lại mật khẩu không hợp lệ.')
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return setError('Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa và chữ số.')
    }
    if (form.password !== form.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp.')
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password: form.password })
      setDone(true)
    } catch (requestError) {
      setError(getApiError(requestError, 'Không thể đặt lại mật khẩu.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="forgot-page">
      <div className="login-bg-circles" aria-hidden="true">
        <div className="login-circle login-circle--1" />
        <div className="login-circle login-circle--2" />
        <div className="login-circle login-circle--3" />
        <div className="login-circle login-circle--4" />
      </div>
      <div className="forgot-card">
        {done ? (
          <div className="forgot-success">
            <h2 className="forgot-success__title">Đổi mật khẩu thành công</h2>
            <p className="forgot-success__body">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
            <Link to="/login" className="forgot-back">Quay lại đăng nhập</Link>
          </div>
        ) : (
          <>
            <div className="forgot-card__header">
              <h1 className="forgot-card__title">Đặt lại mật khẩu</h1>
              <p className="forgot-card__subtitle">Nhập mật khẩu mới cho tài khoản của bạn.</p>
            </div>
            <form className="forgot-form" onSubmit={handleSubmit} noValidate>
              {error && <div className="auth-alert" role="alert">{error}</div>}
              <div className="register-field">
                <label htmlFor="reset-password" className="register-field__label">Mật khẩu mới</label>
                <input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  className="register-field__input"
                  value={form.password}
                  onChange={(e) => setForm((old) => ({ ...old, password: e.target.value }))}
                />
              </div>
              <div className="register-field">
                <label htmlFor="reset-confirm" className="register-field__label">Xác nhận mật khẩu</label>
                <input
                  id="reset-confirm"
                  type="password"
                  autoComplete="new-password"
                  className="register-field__input"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((old) => ({ ...old, confirmPassword: e.target.value }))}
                />
              </div>
              <button type="submit" className="forgot-submit" disabled={loading}>
                {loading ? <span className="login-spinner" aria-hidden="true" /> : 'Đổi mật khẩu'}
              </button>
              <Link to="/login" className="forgot-back">Quay lại đăng nhập</Link>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
