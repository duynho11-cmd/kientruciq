import { useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useProjects } from '../../context/ProjectsContext'

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`admin-stat-card${accent ? ' admin-stat-card--accent' : ''}`}>
      <span className="admin-stat-card__value">{value}</span>
      <span className="admin-stat-card__label">{label}</span>
      {sub && <span className="admin-stat-card__sub">{sub}</span>}
    </div>
  )
}

const STATUS_LABELS = {
  published: 'Đã xuất bản',
  draft: 'Bản nháp',
  review: 'Chờ duyệt',
  archived: 'Lưu trữ',
}

function formatRelativeTime(value) {
  if (!value) return 'Không rõ thời gian'
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return 'Không rõ thời gian'

  const elapsed = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (elapsed < minute) return 'Vừa xong'
  if (elapsed < hour) return `${Math.floor(elapsed / minute)} phút trước`
  if (elapsed < day) return `${Math.floor(elapsed / hour)} giờ trước`
  if (elapsed < 7 * day) return `${Math.floor(elapsed / day)} ngày trước`
  return new Intl.DateTimeFormat('vi-VN').format(new Date(timestamp))
}

function ActivityRow({ project }) {
  const badge = project.status || 'draft'
  const badgeClass = {
    published: 'admin-badge--green',
    draft: 'admin-badge--gray',
    review: 'admin-badge--blue',
    archived: 'admin-badge--gray',
  }[badge] ?? 'admin-badge--gray'

  return (
    <div className="admin-activity-row">
      <div className="admin-activity-row__info">
        <span className="admin-activity-row__title">{project.title}</span>
        <span className="admin-activity-row__action">
          {project.category === 'kien-truc' ? 'Hồ sơ kiến trúc' : 'Hồ sơ nội thất'}
        </span>
      </div>
      <div className="admin-activity-row__right">
        <span className={`admin-badge ${badgeClass}`}>{STATUS_LABELS[badge] || badge}</span>
        <span className="admin-activity-row__time">{formatRelativeTime(project.updatedAt || project.createdAt)}</span>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { projects, isLoading, error } = useProjects()

  const stats = useMemo(() => {
    const now = new Date()
    const createdThisMonth = projects.filter((project) => {
      const created = new Date(project.createdAt)
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
    }).length
    const published = projects.filter((project) => project.status === 'published').length
    const drafts = projects.filter((project) => project.status === 'draft').length
    const views = projects.reduce((total, project) => total + (Number(project.viewCount) || 0), 0)
    const publishedPercent = projects.length ? Math.round((published / projects.length) * 100) : 0

    return { total: projects.length, createdThisMonth, published, drafts, views, publishedPercent }
  }, [projects])

  const recentProjects = useMemo(() => [...projects]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, 5), [projects])

  const displayNumber = (value) => isLoading ? '—' : new Intl.NumberFormat('vi-VN').format(value)

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Overview</h1>
          <p className="admin-page__sub">Chào mừng trở lại, {user?.name}.</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard label="Tổng hồ sơ" value={displayNumber(stats.total)} sub={`+${stats.createdThisMonth} trong tháng này`} accent />
        <StatCard label="Đã xuất bản" value={displayNumber(stats.published)} sub={`${stats.publishedPercent}% tổng số`} />
        <StatCard label="Bản nháp" value={displayNumber(stats.drafts)} sub="Chưa xuất bản" />
        <StatCard label="Tổng lượt xem" value={displayNumber(stats.views)} sub="Trên tất cả hồ sơ" />
      </div>

      <div className="admin-section">
        <h2 className="admin-section__title">Hoạt động gần đây</h2>
        {error ? (
          <p className="admin-page__sub">{error}</p>
        ) : isLoading ? (
          <p className="admin-page__sub">Đang tải dữ liệu...</p>
        ) : recentProjects.length > 0 ? (
          <div className="admin-activity-list">
            {recentProjects.map((project) => <ActivityRow key={project.id} project={project} />)}
          </div>
        ) : (
          <p className="admin-page__sub">Chưa có hồ sơ nào.</p>
        )}
      </div>
    </div>
  )
}
