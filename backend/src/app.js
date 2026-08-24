import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import authRoutes from './routes/auth.routes.js'
import projectRoutes from './routes/project.routes.js'
import uploadRoutes from './routes/upload.routes.js'

const app = express()

// Tin tưởng proxy của Vercel để lấy IP thực cho rate-limit
app.set('trust proxy', 1)

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '20kb' }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/uploads', uploadRoutes)

app.use((_req, res) => res.status(404).json({ message: 'Không tìm thấy API.' }))

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error?.code === 'LIMIT_FILE_SIZE') {
    const message = error.field === 'file'
      ? 'File ZIP vượt quá giới hạn 100MB.'
      : 'Ảnh vượt quá giới hạn 10MB.'
    return res.status(413).json({ message })
  }
  res.status(500).json({ message: 'Máy chủ gặp lỗi. Vui lòng thử lại sau.' })
})

export default app
