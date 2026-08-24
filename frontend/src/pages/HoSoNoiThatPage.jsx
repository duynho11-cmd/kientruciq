import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useProjects } from '../context/ProjectsContext'
import ProjectCatalogControls from '../components/common/ProjectCatalogControls'
import useProjectCatalog from '../hooks/useProjectCatalog'

const fadeUp = (visible, delay = 0) => ({
  opacity:    visible ? 1 : 0,
  transform:  visible ? 'translateY(0)' : 'translateY(28px)',
  transition: `opacity 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.75s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
})

/* ── Project card ────────────────────────────────────────────── */
function ProjectCard({ project, index }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 + index * 60)
    return () => clearTimeout(t)
  }, [index])

  return (
    <Link
      to={`/ho-so/${project.slug}`}
      aria-label={`Xem chi tiết ${project.title}`}
      style={{ ...fadeUp(visible, 0), display: 'block', color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
    >
      {/* Cover */}
      <div style={{
        width: '100%', aspectRatio: '4/3',
        background: 'var(--surface-container-high)',
        borderRadius: '4px', overflow: 'hidden',
        marginBottom: '0.85rem',
      }}>
        {project.coverUrl ? (
          <img src={project.coverUrl} alt={project.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--outline)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.3rem' }}>
        Hồ Sơ Nội Thất
      </p>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 'clamp(18px, 2vw, 22px)', fontWeight: 400, color: 'var(--on-surface)', marginBottom: '0.4rem' }}>
        {project.title}
      </h3>
      {project.description && (
        <p style={{ fontSize: '13.5px', color: 'var(--on-surface-variant)', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {project.description}
        </p>
      )}
      {project.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.6rem' }}>
          {project.tags.map((t) => (
            <span key={t} style={{ fontSize: '10.5px', padding: '0.15rem 0.55rem', border: '1px solid var(--outline-variant)', borderRadius: '999px', color: 'var(--on-surface-variant)' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--outline)' }}>
      <p style={{ fontSize: '15px' }}>Chưa có hồ sơ nội thất nào được xuất bản.</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   HoSoNoiThatPage
   ══════════════════════════════════════════════════════════════ */
export default function HoSoNoiThatPage() {
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60)
    return () => clearTimeout(t)
  }, [])

  const { published } = useProjects()
  const items = published('noi-that')
  const catalog = useProjectCatalog(items)

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <section style={{
        paddingTop: 'calc(var(--navbar-h) + 4rem)',
        paddingBottom: '6rem',
        paddingLeft: 'var(--margin-edge)',
        paddingRight: 'var(--margin-edge)',
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
      }}>
        {/* Eyebrow */}
        <p style={{
          fontSize: '10.5px', fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--accent)', marginBottom: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          ...fadeUp(entered, 0),
        }}>
          <span style={{ display: 'inline-block', width: '24px', height: '1.5px', background: 'var(--accent)', borderRadius: '2px' }} />
          Danh mục
        </p>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 'clamp(34px, 4.5vw, 58px)',
          fontWeight: 400, lineHeight: 1.1,
          color: 'var(--on-surface)', letterSpacing: '-0.01em',
          marginBottom: '1.5rem',
          ...fadeUp(entered, 80),
        }}>
          Hồ Sơ Nội Thất
        </h1>

        {/* Divider */}
        <div style={{ width: '48px', height: '1px', background: 'var(--outline-variant)', marginBottom: '2rem', ...fadeUp(entered, 130) }} />

        {/* Description */}
        <p style={{
          fontSize: '15px', lineHeight: 1.8,
          color: 'var(--on-surface-variant)', maxWidth: '560px',
          marginBottom: '2.5rem',
          ...fadeUp(entered, 170),
        }}>
          Tổng hợp các hồ sơ thiết kế nội thất — bản vẽ bố trí đồ nội thất, vật liệu hoàn thiện và phối cảnh không gian sống.
        </p>

        <ProjectCatalogControls catalog={catalog} total={items.length} />

        {/* Grid */}
        {catalog.filteredItems.length === 0 ? (
          catalog.hasFilters
            ? <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--outline)' }}><p style={{ fontSize: '15px' }}>Không tìm thấy hồ sơ phù hợp với bộ lọc.</p></div>
            : <EmptyState />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2.5rem',
          }}>
            {catalog.filteredItems.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
