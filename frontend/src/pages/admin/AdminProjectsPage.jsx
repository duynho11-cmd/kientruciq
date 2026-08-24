import { useState } from 'react'

/* ── Mock data ───────────────────────────────────────────────── */
const MOCK_PROJECTS = [
  { id: 1, title: 'Villa Hòa Bình',       category: 'Kiến trúc',  date: '12/10/2023', status: 'published' },
  { id: 2, title: 'Biệt thự Mê Linh',     category: 'Kiến trúc',  date: '04/09/2023', status: 'published' },
  { id: 3, title: 'Villa BG2',            category: 'Nội thất',   date: '20/08/2023', status: 'published' },
  { id: 4, title: 'Mẫu nội thất 04',      category: 'Nội thất',   date: '15/07/2023', status: 'published' },
  { id: 5, title: 'Mẫu nội thất 05',      category: 'Nội thất',   date: '02/06/2023', status: 'published' },
  { id: 6, title: 'Mẫu nội thất 06',      category: 'Nội thất',   date: '10/05/2023', status: 'published' },
  { id: 7, title: 'Nhà phố hiện đại',     category: 'Kiến trúc',  date: '—',          status: 'draft'     },
  { id: 8, title: 'Căn hộ studio',        category: 'Nội thất',   date: '—',          status: 'draft'     },
]

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

/* ── Status badge ────────────────────────────────────────────── */
function StatusBadge({ status }) {
  return (
    <span className={`admin-badge ${status === 'published' ? 'admin-badge--green' : 'admin-badge--gray'}`}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   AdminProjectsPage
   ══════════════════════════════════════════════════════════════ */
export default function AdminProjectsPage() {
  const [projects, setProjects] = useState(MOCK_PROJECTS)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  const filtered = projects.filter((p) => {
    const matchFilter = filter === 'all' || p.status === filter
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.category.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const handleDelete = (id) => {
    if (!confirm('Xoá dự án này?')) return
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const toggleStatus = (id) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'published' ? 'draft' : 'published' }
          : p
      )
    )
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Projects</h1>
          <p className="admin-page__sub">Quản lý và xuất bản các dự án thiết kế.</p>
        </div>
        <button className="admin-btn admin-btn--primary">
          <IconPlus />
          Add New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        {/* Search */}
        <input
          type="search"
          placeholder="Tìm kiếm dự án..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />

        {/* Filter tabs */}
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
              <th>Tên dự án</th>
              <th>Danh mục</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th style={{ width: '100px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-table__empty">
                  Không tìm thấy dự án nào.
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="admin-table__row">
                  <td className="admin-table__title">{p.title}</td>
                  <td className="admin-table__category">{p.category}</td>
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
                      <button className="admin-table__action-btn" title="Chỉnh sửa">
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

      {/* Count */}
      <p className="admin-table__count">
        Hiển thị {filtered.length} / {projects.length} dự án
      </p>
    </div>
  )
}
