import './config/env.js'
import app from './app.js'
import connectDB from './config/db.js'

const port = Number(process.env.PORT) || 5001

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Thiếu biến môi trường MONGODB_URI hoặc JWT_SECRET.')
  process.exit(1)
}

try {
  await connectDB()
  app.listen(port, () => console.log(`API đang chạy tại http://localhost:${port}`))
} catch (error) {
  console.error('Không thể khởi động server:', error.message)
  process.exit(1)
}
