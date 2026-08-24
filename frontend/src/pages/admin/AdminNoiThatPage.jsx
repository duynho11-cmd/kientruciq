import AdminCategoryPage from './AdminCategoryPage'

export default function AdminNoiThatPage() {
  return (
    <AdminCategoryPage
      category="noi-that"
      title="Hồ sơ nội thất"
      subtitle="Quản lý và xuất bản các hồ sơ nội thất."
      addRoute="/admin/ho-so-noi-that/them"
    />
  )
}
