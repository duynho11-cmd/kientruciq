import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { getApiError } from '../services/api'
import { useAuth } from './AuthContext'

const ProjectsContext = createContext(null)

function normalizeProject(project) {
  const dateValue = project.publishedAt || project.createdAt
  return {
    ...project,
    id: project._id,
    coverUrl: project.coverImage?.url || '',
    images: project.gallery || [],
    seoTitle: project.seo?.metaTitle || '',
    seoDesc: project.seo?.metaDescription || '',
    date: dateValue ? new Intl.DateTimeFormat('vi-VN').format(new Date(dateValue)) : '—',
  }
}

function apiPayload(data) {
  return {
    ...data,
    coverImage: data.coverImage?.url
      ? { ...data.coverImage, alt: data.coverImage.alt || data.title }
      : data.coverUrl ? { url: data.coverUrl, alt: data.title } : null,
    seo: {
      ...(data.seo || {}),
      metaTitle: data.seoTitle || '',
      metaDescription: data.seoDesc || '',
    },
  }
}

export function ProjectsProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth()
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProjects = useCallback(async () => {
    if (authLoading) return
    setIsLoading(true)
    setError('')
    try {
      const endpoint = user?.role === 'admin' ? '/projects/admin' : '/projects'
      const { data } = await api.get(endpoint)
      setProjects(data.projects.map(normalizeProject))
    } catch (requestError) {
      setError(getApiError(requestError, 'Không thể tải danh sách hồ sơ.'))
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [authLoading, user?.role])

  useEffect(() => { loadProjects() }, [loadProjects])

  const addProject = useCallback(async (data) => {
    try {
      const response = await api.post('/projects/admin', apiPayload(data))
      const project = normalizeProject(response.data.project)
      setProjects((old) => [project, ...old])
      return project
    } catch (requestError) {
      throw new Error(getApiError(requestError, 'Không thể tạo hồ sơ.'))
    }
  }, [])

  const updateProject = useCallback(async (id, data) => {
    try {
      const response = await api.patch(`/projects/admin/${id}`, apiPayload(data))
      const project = normalizeProject(response.data.project)
      setProjects((old) => old.map((item) => item.id === id ? project : item))
      return project
    } catch (requestError) {
      throw new Error(getApiError(requestError, 'Không thể cập nhật hồ sơ.'))
    }
  }, [])

  const deleteProject = useCallback(async (id) => {
    try {
      await api.delete(`/projects/admin/${id}`)
      setProjects((old) => old.filter((item) => item.id !== id))
    } catch (requestError) {
      throw new Error(getApiError(requestError, 'Không thể xóa hồ sơ.'))
    }
  }, [])

  const toggleStatus = useCallback(async (id) => {
    const project = projects.find((item) => item.id === id)
    if (!project) return
    return updateProject(id, {
      ...project,
      status: project.status === 'published' ? 'draft' : 'published',
    })
  }, [projects, updateProject])

  const byCategory = useCallback(
    (category) => projects.filter((project) => project.category === category),
    [projects]
  )
  const published = useCallback(
    (category) => projects.filter((project) => project.category === category && project.status === 'published'),
    [projects]
  )
  const getById = useCallback(
    (id) => projects.find((project) => project.id === id),
    [projects]
  )

  return (
    <ProjectsContext.Provider value={{
      projects, isLoading, error, loadProjects,
      addProject, updateProject, deleteProject, toggleStatus,
      byCategory, published, getById,
    }}>
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (!context) throw new Error('useProjects must be used inside ProjectsProvider')
  return context
}
