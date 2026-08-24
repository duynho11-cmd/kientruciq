import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import { sendPasswordResetEmail } from '../services/email.service.js'

const COOKIE_NAME = 'admin_access_token'

function publicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    name: user.fullName,
    avatar: user.avatar,
    role: user.role,
  }
}

function cookieOptions(remember = false) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(remember ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : {}),
  }
}

export async function login(req, res) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = typeof req.body.password === 'string' ? req.body.password : ''
  const remember = req.body.remember === true

  if (!email || !password || password.length > 128) {
    return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu hợp lệ.' })
  }

  const user = await User.findOne({ email }).select('+password')
  const validPassword = user ? await bcrypt.compare(password, user.password) : false

  if (!user || !validPassword || user.role !== 'admin' || user.status !== 'active') {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' })
  }

  const expiresIn = remember ? '7d' : '8h'
  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: user.id,
    expiresIn,
    algorithm: 'HS256',
    issuer: 'kientruc-iq-api',
    audience: 'kientruc-iq-admin',
  })

  user.lastLoginAt = new Date()
  user.lastLoginIp = req.ip
  await user.save({ validateBeforeSave: false })

  res.cookie(COOKIE_NAME, token, cookieOptions(remember))
  return res.json({ user: publicUser(user) })
}

function validPassword(password) {
  return typeof password === 'string' &&
    password.length >= 8 &&
    password.length <= 128 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
}

export async function register(req, res) {
  const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const password = req.body.password

  if (fullName.length < 2 || fullName.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !validPassword(password)) {
    return res.status(400).json({ message: 'Thông tin đăng ký không hợp lệ.' })
  }

  if (await User.exists({ email })) {
    return res.status(409).json({ message: 'Email này đã được sử dụng.' })
  }

  const baseUsername = email.split('@')[0].replace(/[^a-z0-9_.-]/g, '').slice(0, 35) || 'user'
  const username = `${baseUsername}_${crypto.randomBytes(4).toString('hex')}`

  try {
    await User.create({ username, email, password, fullName, role: 'user' })
    return res.status(201).json({ message: 'Tạo tài khoản thành công.' })
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Email này đã được sử dụng.' })
    }
    throw error
  }
}

export async function forgotPassword(req, res) {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''
  const genericMessage = 'Nếu email tồn tại, hướng dẫn khôi phục mật khẩu đã được gửi.'

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Email không hợp lệ.' })
  }

  const user = await User.findOne({ email, status: 'active', provider: 'local' })
  if (!user) return res.json({ message: genericMessage })

  const rawToken = crypto.randomBytes(32).toString('hex')
  user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex')
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000)
  await user.save({ validateBeforeSave: false })

  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  const resetUrl = `${clientOrigin}/reset-password?token=${rawToken}`

  try {
    await sendPasswordResetEmail({ email: user.email, fullName: user.fullName, resetUrl })
  } catch (error) {
    user.resetPasswordToken = null
    user.resetPasswordExpires = null
    await user.save({ validateBeforeSave: false })
    throw error
  }

  return res.json({ message: genericMessage })
}

export async function resetPassword(req, res) {
  const token = typeof req.body.token === 'string' ? req.body.token : ''
  const password = req.body.password

  if (!/^[a-f0-9]{64}$/.test(token) || !validPassword(password)) {
    return res.status(400).json({ message: 'Token hoặc mật khẩu không hợp lệ.' })
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
    status: 'active',
  }).select('+resetPasswordToken +resetPasswordExpires')

  if (!user) {
    return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.' })
  }

  user.password = password
  user.resetPasswordToken = null
  user.resetPasswordExpires = null
  user.refreshToken = null
  await user.save()

  res.clearCookie(COOKIE_NAME, cookieOptions())
  return res.json({ message: 'Đổi mật khẩu thành công. Bạn có thể đăng nhập ngay.' })
}

export function me(req, res) {
  return res.json({ user: publicUser(req.user) })
}

export function logout(req, res) {
  res.clearCookie(COOKIE_NAME, cookieOptions())
  return res.status(204).send()
}
