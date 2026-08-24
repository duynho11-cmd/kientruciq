import { Router } from 'express'
import multer from 'multer'
import { uploadProjectImage, uploadProjectZip } from '../controllers/upload.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
})
const zipUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024, files: 1 },
})

router.post('/project-image', authenticate, requireAdmin, upload.single('image'), uploadProjectImage)
router.post('/project-zip', authenticate, requireAdmin, zipUpload.single('file'), uploadProjectZip)

export default router
