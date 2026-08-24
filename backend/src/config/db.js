import mongoose from 'mongoose'

mongoose.set('strictQuery', false)

export default async function connectDB() {
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  })

  console.log('MongoDB connected')
}
