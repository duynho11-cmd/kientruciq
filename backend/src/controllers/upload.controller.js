import crypto from 'node:crypto'
import path from 'node:path'
import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'
import cloudinary from '../config/cloudinary.js'

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

/**
 * Upload một buffer lên Cloudinary và trả về kết quả.
 * @param {Buffer} buffer
 * @param {object} options - options truyền vào cloudinary upload_stream
 */
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) =>
      error ? reject(error) : resolve(result),
    )
    stream.end(buffer)
  })
}

export async function uploadProjectImage(req, res) {
  if (!req.file) return res.status(400).json({ message: 'Vui lòng chọn ảnh.' })

  const detected = await fileTypeFromBuffer(req.file.buffer)
  if (!detected || !allowedTypes.has(detected.mime)) {
    return res.status(415).json({ message: 'Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP hợp lệ.' })
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return res.status(503).json({ message: 'Cloudinary chưa được cấu hình trên máy chủ.' })
  }

  const id = crypto.randomBytes(16).toString('hex')
  const image = sharp(req.file.buffer, { failOn: 'error', limitInputPixels: 40_000_000 }).rotate()
  const metadata = await image.metadata()

  // Xử lý ảnh full và thumbnail song song bằng sharp rồi upload lên Cloudinary
  const [fullBuffer, thumbBuffer] = await Promise.all([
    image.clone()
      .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer(),
    image.clone()
      .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 78 })
      .toBuffer(),
  ])

  const [fullResult, thumbResult] = await Promise.all([
    uploadBufferToCloudinary(fullBuffer, {
      resource_type: 'image',
      folder: 'projects/images',
      public_id: id,
      format: 'webp',
      use_filename: false,
      overwrite: false,
    }),
    uploadBufferToCloudinary(thumbBuffer, {
      resource_type: 'image',
      folder: 'projects/images/thumbs',
      public_id: id,
      format: 'webp',
      use_filename: false,
      overwrite: false,
    }),
  ])

  res.status(201).json({
    image: {
      url: fullResult.secure_url,
      thumbnailUrl: thumbResult.secure_url,
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
