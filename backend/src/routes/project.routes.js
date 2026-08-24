import { Router } from 'express'
import {
  createProject,
  deleteProject,
  downloadProjectFile,
  getAdminById,
  getPublishedBySlug,
  listAdmin,
  listPublished,
  requestProjectFileAccess,
  updateProject,
} from '../controllers/project.controller.js'
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', listPublished)
router.get('/slug/:slug', getPublishedBySlug)
router.post('/slug/:slug/file-access', requestProjectFileAccess)
router.get('/slug/:slug/file-download', downloadProjectFile)
router.get('/admin', authenticate, requireAdmin, listAdmin)
router.get('/admin/:id', authenticate, requireAdmin, getAdminById)
router.post('/admin', authenticate, requireAdmin, createProject)
router.patch('/admin/:id', authenticate, requireAdmin, updateProject)
router.delete('/admin/:id', authenticate, requireAdmin, deleteProject)

export default router
