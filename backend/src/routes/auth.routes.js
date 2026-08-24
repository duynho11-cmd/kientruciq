import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword,
} from '../controllers/auth.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Bạn thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
})

router.post('/login', loginLimiter, login)
router.post('/register', loginLimiter, register)
router.post('/forgot-password', loginLimiter, forgotPassword)
router.post('/reset-password', loginLimiter, resetPassword)
router.get('/me', authenticate, requireAdmin, me)
router.post('/logout', authenticate, logout)

export default router
