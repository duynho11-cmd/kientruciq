import nodemailer from 'nodemailer'

function getTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

export async function sendPasswordResetEmail({ email, fullName, resetUrl }) {
  const transporter = getTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP chưa được cấu hình.')
    }
    console.warn(`[DEV] Link đặt lại mật khẩu cho ${email}: ${resetUrl}`)
    return
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to: email,
    subject: 'Đặt lại mật khẩu - Kiến Trúc IQ',
    text: `Xin chào ${fullName},\n\nMở liên kết sau để đặt lại mật khẩu: ${resetUrl}\n\nLiên kết hết hạn sau 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.`,
  })
}
