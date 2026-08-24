import crypto from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'
import cloudinary from '../config/cloudinary.js'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const uploadRoot = path.resolve('uploads')

export async function uploadProjectImage(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh.' })

  const detected = await fileTypeFromBuffer(req.file.buffer)
  if (!detected || !allowedTypes.has(detected.mime)) {
    return res.status(415).json({ message: 'Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP hợp lệ.' })
  }

  await mkdir(path.join(uploadRoot, 'projects', 'thumbs'), { recursive: true })
  const id = crypto.randomBytes(16).toString('hex')
  const filename = `${id}.webp`
  const imagePath = path.join(uploadRoot, 'projects', filename)
  const thumbPath = path.join(uploadRoot, 'projects', 'thumbs', filename)

  const image = sharp(req.file.buffer, { failOn: 'error', limitInputPixels: 40_000_000 }).rotate()
  const metadata = await image.metadata()

  await image.clone()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(imagePath)

  await image.clone()
    .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(thumbPath)

  res.status(201).json({
    image: {
      url: `/uploads/projects/${filename}`,
      thumbnailUrl: `/uploads/projects/thumbs/${filename}`,
      publicId: id,
      width: metadata.width,
      height: metadata.height,
      alt: '',
    },
  })
}

export async function uploadProjectZip(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn file ZIP.' })

  const detected = await fileTypeFromBuffer(req.file.buffer)
  if (!detected || detected.mime !== 'application/zip') {
    return res.status(415).json({ message: 'Chỉ chấp nhận file ZIP hợp lệ.' })
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(503).json({ message: 'Cloudinary chưa được cấu hình trên máy chủ.' })
  }

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      resource_type: 'raw',
      folder: 'projects/files',
      public_id: `${crypto.randomBytes(16).toString('hex')}.zip`,
      use_filename: false,
    }, (error, uploadResult) => error ? reject(error) : resolve(uploadResult))
    stream.end(req.file.buffer)
  })

  res.status(201).json({
    file: {
      url: result.secure_url,
      publicId: result.public_id,
      name: path.basename(req.file.originalname),
      size: req.file.size,
    },
  })
}
