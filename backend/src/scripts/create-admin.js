import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import User from '../models/user.model.js'

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_USERNAME, ADMIN_FULL_NAME } = process.env

if (!process.env.MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Cần MONGODB_URI, ADMIN_EMAIL và ADMIN_PASSWORD trong biến môi trường.')
  process.exit(1)
}

if (ADMIN_PASSWORD.length < 12) {
  console.error('ADMIN_PASSWORD phải có ít nhất 12 ký tự.')
  process.exit(1)
}

try {
  await connectDB()
  const email = ADMIN_EMAIL.trim().toLowerCase()
  const existing = await User.findOne({ email })

  if (existing) {
    console.error('Email này đã tồn tại; lệnh không ghi đè tài khoản hiện có.')
    process.exitCode = 1
  } else {
    await User.create({
      username: ADMIN_USERNAME?.trim() || email.split('@')[0],
      email,
      password: ADMIN_PASSWORD,
      fullName: ADMIN_FULL_NAME?.trim() || 'Administrator',
      role: 'admin',
      status: 'active',
      isEmailVerified: true,
    })
    console.log(`Đã tạo admin: ${email}`)
  }
} catch (error) {
  console.error('Không thể tạo admin:', error.message)
  process.exitCode = 1
} finally {
  await mongoose.disconnect()
}
