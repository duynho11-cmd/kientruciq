import { useState } from 'react'

/* ── Mock data ───────────────────────────────────────────────── */
const MOCK_CONSULTS = [
  { id: 1, name: 'Nguyễn Văn An',   phone: '0901234567', service: 'Kiến trúc',  message: 'Tôi muốn xây nhà 3 tầng, diện tích 80m².', date: '10/08/2026', status: 'new'     },
  { id: 2, name: 'Trần Thị Bình',   phone: '0912345678', service: 'Nội thất',   message: 'Cần tư vấn nội thất căn hộ 65m².', date: '09/08/2026', status: 'new'     },
  { id: 3, name: 'Lê Hoàng Cường',  phone: '0923456789', service: 'Kiến trúc',  message: 'Muốn thiết kế biệt thự nghỉ dưỡng.', date: '07/08/2026', status: 'contacted' },
  { id: 4, name: 'Phạm Minh Đức',   phone: '0934567890', service: 'Nội thất',   message: 'Tư vấn nội thất phòng khách + phòng ngủ.', date: '05/08/2026', status: 'contacted' },
  { id: 5, name: 'Hoàng Thị Em',    phone: '0945678901', service: 'Kiến trúc',  message: 'Cải tạo nhà cũ 2 tầng.', date: '01/08/2026', status: 'done'    },
  { id: 6, name: 'Vũ Quốc Fong',    phone: '0956789012', service: 'Nội thất',   message: 'Thiết kế nội thất văn phòng 120m².', date: '28/07/2026', status: 'done'    },
]

const STATUS_CONFIG = {
  new:       { label: 'Mới',         cls: 'admin-badge--blue'  },
  contacted: { label: 'Đã liên hệ',  cls: 'admin-badge--gray'  },
  done:      { label: 'Hoàn tất',    cls: 'admin-badge--green' },
}

const FILTERS = [
  { key: 'all',       label: 'Tất cả'      },
  { key: 'new',       label: 'Mới'         },
  { key: 'contacted', label: 'Đã liên hệ'  },
  { key: 'done',      label: 'Hoàn tất'    },
]

/* ── Icons ───────────────────────────────────────────────────── */
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

function IconChevron() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/* ── Status select ───────────────────────────────────────────── */
function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="consult-status-select"
      style={{ '--badge-color': STATUS_CONFIG[value]?.cls }}
    >
      {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  )
}

/* ── Row detail expand ───────────────────────────────────────── */
function ConsultRow({ consult, onDelete, onStatusChange }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <tr
        className="admin-table__row consult-row"
        onClick={() => setOpen((v) => !v)}
        style={{ cursor: 'pointer' }}
      >
        <td className="admin-table__title">{consult.name}</td>
        <td className="admin-table__date">{consult.phone}</td>
        <td>
          <span className="admin-badge admin-badge--gray" style={{ fontSize: '11px' }}>
            {consult.service}
          </span>
        </td>
        <td className="admin-table__date">{consult.date}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <StatusSelect
            value={consult.status}
            onChange={(v) => onStatusChange(consult.id, v)}
          />
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <div className="admin-table__actions">
            <button
              className="admin-table__action-btn admin-table__action-btn--danger"
              title="Xoá"
              onClick={() => onDelete(consult.id)}
            >
              <IconTrash />
            </button>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.2s',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                opacity: 0.45,
              }}
            >
              <IconChevron />
            </span>
          </div>
        </td>
      </tr>

      {/* Expandable message row */}
      {open && (
        <tr className="consult-detail-row">
          <td colSpan={6}>
            <div className="consult-detail">
              <span className="consult-detail__label">Nội dung:</span>
              <p className="consult-detail__message">{consult.message}</p>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

/* ══════════════════════════════════════════════════════════════
   AdminConsultPage
   ══════════════════════════════════════════════════════════════ */
export default function AdminConsultPage() {
  const [consults, setConsults] = useState(MOCK_CONSULTS)
  const [filter, setFilter]    = useState('all')
  const [search, setSearch]    = useState('')

  const filtered = consults.filter((c) => {
    const matchFilter = filter === 'all' || c.status === filter
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.service.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const handleDelete = (id) => {
    if (!confirm('Xoá yêu cầu tư vấn này?')) return
    setConsults((prev) => prev.filter((c) => c.id !== id))
  }

  const handleStatusChange = (id, status) => {
    setConsults((prev) => prev.map((c) => c.id === id ? { ...c, status } : c))
  }

  /* Summary counts */
  const newCount  = consults.filter((c) => c.status === 'new').length

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            Tư vấn
            {newCount > 0 && (
              <span className="consult-new-badge">{newCount} mới</span>
            )}
          </h1>
          <p className="admin-page__sub">Quản lý các yêu cầu tư vấn từ khách hàng.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Tìm theo tên, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="admin-search"
        />
        <div className="admin-filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`admin-filter-tab${filter === f.key ? ' admin-filter-tab--active' : ''}`}
            >
              {f.label}
              <span className="admin-filter-tab__count">
                {f.key === 'all'
                  ? consults.length
                  : consults.filter((c) => c.status === f.key).length}
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
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Dịch vụ</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th style={{ width: '80px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table__empty">
                  Không có yêu cầu tư vấn nào.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <ConsultRow
                  key={c.id}
                  consult={c}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="admin-table__count">
        Hiển thị {filtered.length} / {consults.length} yêu cầu
      </p>
    </div>
  )
}
