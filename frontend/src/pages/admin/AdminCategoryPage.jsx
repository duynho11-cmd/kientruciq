import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useProjects } from '../../context/ProjectsContext'

/* ── Icons ───────────────────────────────────────────────────── */
function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`admin-badge ${status === 'published' ? 'admin-badge--green' : 'admin-badge--gray'}`}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   AdminCategoryPage
   Props:
     category  — 'kien-truc' | 'noi-that'
     title     — tiêu đề hiển thị
     subtitle  — mô tả nhỏ
     addRoute  — path của trang Thêm hồ sơ
   ══════════════════════════════════════════════════════════════ */
export default function AdminCategoryPage({ category, title, subtitle, addRoute }) {
  const navigate = useNavigate()
  const { byCategory, deleteProject, toggleStatus } = useProjects()

  const projects = byCategory(category)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = projects.filter((p) => {
    const matchFilter = filter === 'all' || p.status === filter
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const handleDelete = async (id) => {
    if (!confirm('Xoá dự án này?')) return
    try {
      await deleteProject(id)
    } catch (error) {
      alert(error.message)
    }
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{title}</h1>
          <p className="admin-page__sub">{subtitle}</p>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => navigate(addRoute)}
        >
          <IconPlus />
          Thêm hồ sơ
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <div className="admin-filter-tabs">
          {['all', 'published', 'draft'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`admin-filter-tab${filter === f ? ' admin-filter-tab--active' : ''}`}
            >
              {f === 'all' ? 'Tất cả' : f === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
              <span className="admin-filter-tab__count">
                {f === 'all'
                  ? projects.length
                  : projects.filter((p) => p.status === f).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tên hồ sơ</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th style={{ width: '100px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin-table__empty">
                  Không tìm thấy hồ sơ nào.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="admin-table__row">
                  <td className="admin-table__title">{p.title}</td>
                  <td className="admin-table__date">{p.date}</td>
                  <td>
                    <button
                      className="admin-table__status-btn"
                      onClick={() => toggleStatus(p.id)}
                      title="Nhấn để đổi trạng thái"
                    >
                      <StatusBadge status={p.status} />
                    </button>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        className="admin-table__action-btn"
                        title="Chỉnh sửa"
                        onClick={() => navigate(`${addRoute}?edit=${p.id}`)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        className="admin-table__action-btn admin-table__action-btn--danger"
                        title="Xoá"
                        onClick={() => handleDelete(p.id)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="admin-table__count">
        Hiển thị {filtered.length} / {projects.length} hồ sơ
      </p>
    </div>
  )
}
