import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không hợp lệ'],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, default: null, trim: true },
    avatar: { type: String, default: null },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    dateOfBirth: { type: Date, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active',
    },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null, select: false },
    emailVerificationExpires: { type: Date, default: null, select: false },
    resetPasswordToken: { type: String, default: null, select: false },
    resetPasswordExpires: { type: Date, default: null, select: false },
    refreshToken: { type: String, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },
    provider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local',
    },
    providerId: { type: String, default: null },
  },
  { timestamps: true }
)

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

export default mongoose.model('users', userSchema)
