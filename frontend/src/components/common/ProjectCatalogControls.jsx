import { Search, SlidersHorizontal, X } from 'lucide-react'
import '../../Styles/project-catalog.css'

export default function ProjectCatalogControls({ catalog, total }) {
  return (
    <div className="project-catalog" aria-label="Tìm kiếm và lọc hồ sơ">
      <div className="project-catalog__search">
        <Search size={19} aria-hidden="true" />
        <input
          type="search"
          value={catalog.query}
          onChange={(event) => catalog.setQuery(event.target.value)}
          placeholder="Tìm kiếm hồ sơ..."
          aria-label="Tìm kiếm hồ sơ"
        />
        {catalog.query && (
          <button type="button" onClick={() => catalog.setQuery('')} aria-label="Xoá từ khoá tìm kiếm">
            <X size={17} />
          </button>
        )}
      </div>

      <div className="project-catalog__filters">
        <span className="project-catalog__filter-label"><SlidersHorizontal size={16} /> Bộ lọc</span>
        <select value={catalog.tag} onChange={(event) => catalog.setTag(event.target.value)} aria-label="Lọc theo thẻ">
          <option value="">Tất cả thẻ</option>
          {catalog.tags.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        {catalog.years.length > 0 && (
          <select value={catalog.year} onChange={(event) => catalog.setYear(event.target.value)} aria-label="Lọc theo năm">
            <option value="">Tất cả năm</option>
            {catalog.years.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        )}
        <select value={catalog.sort} onChange={(event) => catalog.setSort(event.target.value)} aria-label="Sắp xếp hồ sơ">
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="title">Tên A–Z</option>
        </select>
      </div>

      <div className="project-catalog__meta" aria-live="polite">
        <span>Hiển thị <strong>{catalog.filteredItems.length}</strong> / {total} hồ sơ</span>
        {catalog.hasFilters && (
          <button type="button" onClick={catalog.clearFilters}><X size={14} /> Xoá bộ lọc</button>
        )}
      </div>
    </div>
  )
}
