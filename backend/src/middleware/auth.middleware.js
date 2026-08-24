import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

export async function authenticate(req, res, next) {
  try {
    const token = req.cookies.admin_access_token
    if (!token) return res.status(401).json({ message: 'Bạn chưa đăng nhập.' })

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'kientruc-iq-api',
      audience: 'kientruc-iq-admin',
    })

    const user = await User.findById(payload.sub).select(
      '_id username email fullName avatar role status'
    )
    if (!user || user.status !== 'active') {
      return res.status(401).json({ message: 'Phiên đăng nhập không còn hợp lệ.' })
    }

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập trang quản trị.' })
  }
  next()
}
