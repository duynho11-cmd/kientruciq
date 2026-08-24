import AdminCategoryPage from './AdminCategoryPage'

export default function AdminKienTrucPage() {
  return (
    <AdminCategoryPage
      category="kien-truc"
      title="Hồ sơ kiến trúc"
      subtitle="Quản lý và xuất bản các hồ sơ kiến trúc."
      addRoute="/admin/ho-so-kien-truc/them"
    />
  )
}
