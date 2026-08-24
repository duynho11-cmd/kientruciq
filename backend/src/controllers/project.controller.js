import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import Project from '../models/project.model.js'

const FILE_WAIT_SECONDS = 30
const usedFileTokens = new Set()

function slugify(value) {
  return value.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

async function uniqueSlug(title, excludeId) {
  const base = slugify(title) || `ho-so-${Date.now()}`
  let slug = base
  let suffix = 2
  while (await Project.exists({ slug, _id: { $ne: excludeId }, deletedAt: null })) {
    slug = `${base}-${suffix++}`
  }
  return slug
}

function cleanStrings(values, limit = 30) {
  if (!Array.isArray(values)) return []
  return [...new Set(values.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean))].slice(0, limit)
}

function projectInput(body) {
  const input = {}
  const copy = (key, transform = (value) => value) => {
    if (Object.hasOwn(body, key)) input[key] = transform(body[key])
  }

  for (const key of [
    'title', 'category', 'summary', 'description', 'location', 'projectYear',
    'completionYear', 'client', 'architect', 'contractor',
    'architectureDetails', 'interiorDetails', 'status', 'seo',
  ]) copy(key)
  copy('content', (value) => Array.isArray(value) ? value.slice(0, 100) : [])
  for (const key of ['designTeam', 'tags', 'styles', 'spaces']) copy(key, cleanStrings)
  copy('coverImage', (value) => value?.url ? value : null)
  copy('gallery', (value) => Array.isArray(value) ? value.slice(0, 100) : [])
  copy('zipFile', (value) => value?.url && value?.name && value?.size ? value : null)
  copy('featured', (value) => value === true)
  copy('sortOrder', (value) => Number.isFinite(value) ? value : 0)

  return input
}

function publicProject(project) {
  if (!project.zipFile?.url) return project
  return {
    ...project,
    zipFile: {
      available: true,
      name: project.zipFile.name,
      size: project.zipFile.size,
    },
  }
}

export async function listPublished(req, res) {
  const filter = { status: 'published', deletedAt: null }
  if (['kien-truc', 'noi-that'].includes(req.query.category)) filter.category = req.query.category
  const projects = await Project.find(filter).sort({ featured: -1, sortOrder: 1, publishedAt: -1 }).lean()
  res.json({ projects: projects.map(publicProject) })
}

export async function getPublishedBySlug(req, res) {
  const project = await Project.findOne({ slug: req.params.slug, status: 'published', deletedAt: null }).lean()
  if (!project) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' })
  res.json({ project: publicProject(project) })
}

export async function requestProjectFileAccess(req, res) {
  const project = await Project.findOne({ slug: req.params.slug, status: 'published', deletedAt: null }).select('_id slug zipFile').lean()
  if (!project?.zipFile?.url) return res.status(404).json({ message: 'Hồ sơ này không có file để tải.' })

  const readyAt = Math.floor(Date.now() / 1000) + FILE_WAIT_SECONDS
  const tokenId = crypto.randomUUID()
  const token = jwt.sign(
    { purpose: 'project-file', projectId: String(project._id), readyAt, jti: tokenId },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  )
  res.json({ token, waitSeconds: FILE_WAIT_SECONDS })
}

export async function downloadProjectFile(req, res) {
  let access
  try {
    access = jwt.verify(req.query.token, process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ message: 'Liên kết tải không hợp lệ hoặc đã hết hạn.' })
  }
  if (access.purpose !== 'project-file' || !access.jti) {
    return res.status(401).json({ message: 'Liên kết tải không hợp lệ.' })
  }
  if (usedFileTokens.has(access.jti)) {
    return res.status(410).json({ message: 'Liên kết tải đã được sử dụng. Vui lòng mở khóa lại.' })
  }
  if (access.readyAt > Math.floor(Date.now() / 1000)) {
    const remaining = Math.max(1, access.readyAt - Math.floor(Date.now() / 1000))
    return res.status(425).json({ message: `Vui lòng đợi thêm ${remaining} giây.` })
  }

  usedFileTokens.add(access.jti)
  const cleanup = setTimeout(() => usedFileTokens.delete(access.jti), 10 * 60 * 1000)
  cleanup.unref?.()

  const project = await Project.findOne({ _id: access.projectId, slug: req.params.slug, status: 'published', deletedAt: null }).select('zipFile').lean()
  if (!project?.zipFile?.url) return res.status(404).json({ message: 'File hồ sơ không còn tồn tại.' })
  res.redirect(project.zipFile.url)
}

export async function listAdmin(req, res) {
  const filter = { deletedAt: null }
  if (['kien-truc', 'noi-that'].includes(req.query.category)) filter.category = req.query.category
  const projects = await Project.find(filter).sort({ createdAt: -1 }).lean()
  res.json({ projects })
}

export async function getAdminById(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ.' })
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null }).lean()
  if (!project) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' })
  res.json({ project })
}

export async function createProject(req, res) {
  const input = projectInput(req.body)
  if (!input.title?.trim() || !['kien-truc', 'noi-that'].includes(input.category)) {
    return res.status(400).json({ message: 'Tên và danh mục hồ sơ là bắt buộc.' })
  }
  input.slug = await uniqueSlug(input.title)
  input.createdBy = req.user._id
  input.updatedBy = req.user._id
  if (input.status === 'published') input.publishedAt = new Date()
  const project = await Project.create(input)
  res.status(201).json({ project })
}

export async function updateProject(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ.' })
  const project = await Project.findOne({ _id: req.params.id, deletedAt: null })
  if (!project) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' })
  const input = projectInput(req.body)
  if (input.title?.trim() && input.title.trim() !== project.title) input.slug = await uniqueSlug(input.title, project._id)
  if (input.status === 'published' && project.status !== 'published') input.publishedAt = new Date()
  if (input.status && input.status !== 'published') input.publishedAt = null
  Object.assign(project, input, { updatedBy: req.user._id })
  await project.save()
  res.json({ project })
}

export async function deleteProject(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'ID không hợp lệ.' })
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, deletedAt: null },
    { deletedAt: new Date(), updatedBy: req.user._id },
    { new: true }
  )
  if (!project) return res.status(404).json({ message: 'Không tìm thấy hồ sơ.' })
  res.status(204).send()
}
