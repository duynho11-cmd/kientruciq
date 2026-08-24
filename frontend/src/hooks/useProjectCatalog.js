import { useMemo, useState } from 'react'

const normalize = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase()

export default function useProjectCatalog(items) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [year, setYear] = useState('')
  const [sort, setSort] = useState('newest')

  const tags = useMemo(() => [...new Set(items.flatMap((item) => item.tags || []))]
    .sort((a, b) => a.localeCompare(b, 'vi')), [items])
  const years = useMemo(() => [...new Set(items.map((item) => item.projectYear).filter(Boolean))]
    .sort((a, b) => String(b).localeCompare(String(a), 'vi', { numeric: true })), [items])

  const filteredItems = useMemo(() => {
    const needle = normalize(query.trim())
    return items
      .filter((item) => {
        const searchable = [
          item.title, item.summary, item.description, item.location,
          ...(item.tags || []), ...(item.styles || []),
        ].map(normalize).join(' ')
        return (!needle || searchable.includes(needle))
          && (!tag || item.tags?.includes(tag))
          && (!year || String(item.projectYear) === year)
      })
      .sort((a, b) => {
        if (sort === 'title') return (a.title || '').localeCompare(b.title || '', 'vi')
        const aDate = new Date(a.publishedAt || a.createdAt || 0).getTime()
        const bDate = new Date(b.publishedAt || b.createdAt || 0).getTime()
        return sort === 'oldest' ? aDate - bDate : bDate - aDate
      })
  }, [items, query, tag, year, sort])

  const hasFilters = Boolean(query || tag || year || sort !== 'newest')
  const clearFilters = () => {
    setQuery('')
    setTag('')
    setYear('')
    setSort('newest')
  }

  return {
    query, setQuery, tag, setTag, year, setYear, sort, setSort,
    tags, years, filteredItems, hasFilters, clearFilters,
  }
}
