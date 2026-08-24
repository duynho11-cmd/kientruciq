import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams } from 'react-router'
import api, { getApiError } from '../services/api'
import Seo from '../components/common/Seo'

function Fact({ label, value, suffix = '' }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="profile-detail__fact">
      <dt>{label}</dt>
      <dd>{value}{suffix}</dd>
    </div>
  )
}

function Tags({ items }) {
  if (!items?.length) return null
  return <div className="profile-detail__tags">{items.map((item) => <span key={item}>{item}</span>)}</div>
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return ''
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
    : `${Math.ceil(bytes / 1024)} KB`
}

function ContentBlocks({ blocks, title }) {
  if (!blocks?.length) return null
  return (
    <div className="profile-detail__content-blocks">
      {blocks.map((block, index) => {
        const key = block._id || `${block.type}-${index}`
        if (block.type === 'image' && block.image?.url) return (
          <figure key={key} className={`profile-detail__content-image profile-detail__content-image--${block.imageSize || 'large'} profile-detail__content-image--${block.imageAlign || 'center'}`}>
            <img src={block.image.url} alt={block.image.alt || `${title} - ${index + 1}`} loading="lazy" />
            {block.image.caption && <figcaption>{block.image.caption}</figcaption>}
          </figure>
        )
        if (block.type === 'heading') return block.level === 3
          ? <h3 key={key}>{block.text}</h3>
          : <h2 key={key}>{block.text}</h2>
        if (block.type === 'quote') return <blockquote key={key}>{block.text}</blockquote>
        return <p key={key}>{block.text}</p>
      })}
    </div>
  )
}

export default function HoSoDetailPage() {
  const { slug } = useParams()
  const [project, setProject] = useState(null)
  const [related, setRelated] = useState([])
  const [fileGateOpen, setFileGateOpen] = useState(false)
  const [facebookOpened, setFacebookOpened] = useState(false)
  const [fileToken, setFileToken] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [gateError, setGateError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get(`/projects/slug/${encodeURIComponent(slug)}`)
      .then(({ data }) => {
        if (!active) return
        setProject(data.project)
        api.get('/projects', { params: { category: data.project.category } })
          .then((response) => {
            if (!active) return
            setRelated(response.data.projects
              .filter((item) => item.slug !== data.project.slug)
              .slice(0, 3))
          })
          .catch(() => { if (active) setRelated([]) })
      })
      .catch((requestError) => active && setError(getApiError(requestError, 'Không tìm thấy hồ sơ.')))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [slug])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft])

  const confirmFacebookLike = async () => {
    setGateError('')
    try {
      const { data } = await api.post(`/projects/slug/${slug}/file-access`)
      setFileToken(data.token)
      setSecondsLeft(data.waitSeconds)
    } catch (error) {
      setGateError(getApiError(error, 'Không thể tạo yêu cầu tải file.'))
    }
  }

  const downloadFile = () => {
    const baseUrl = api.defaults.baseURL || '/api'
    const downloadUrl = `${baseUrl}/projects/slug/${encodeURIComponent(slug)}/file-download?token=${encodeURIComponent(fileToken)}`
    setFileGateOpen(false)
    setFacebookOpened(false)
    setFileToken('')
    setSecondsLeft(0)
    setGateError('')
    window.location.href = downloadUrl
  }

  if (loading) return <main className="profile-detail profile-detail--state">Đang tải hồ sơ...</main>
  if (error || !project) return (
    <main className="profile-detail profile-detail--state">
      <p>{error || 'Không tìm thấy hồ sơ.'}</p>
      <Link to="/">Quay lại trang chủ</Link>
    </main>
  )

  const isArchitecture = project.category === 'kien-truc'
  const details = isArchitecture ? project.architectureDetails : project.interiorDetails
  const backUrl = isArchitecture ? '/ho-so-kien-truc' : '/ho-so-noi-that'
  const categoryLabel = isArchitecture ? 'Hồ sơ kiến trúc' : 'Hồ sơ nội thất'
  const gallery = project.gallery || []
  const hasZipFile = project.zipFile?.available || project.zipFile?.url

  return (
    <main className="profile-detail">
      <Seo
        title={project.seo?.metaTitle || project.title}
        description={project.seo?.metaDescription || project.description}
        canonical={project.seo?.canonicalUrl}
        path={`/ho-so/${encodeURIComponent(project.slug)}`}
        image={project.coverImage?.url}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: project.title,
          description: project.seo?.metaDescription || project.description,
          image: project.coverImage?.url,
          inLanguage: 'vi-VN',
        }}
      />
      <header className="profile-detail__hero">
        <div className="profile-detail__hero-content">
          <h1>{project.title}</h1>
        </div>
        {project.coverImage?.url && (
          <div className="profile-detail__hero-image">
            <img src={project.coverImage.url} alt={project.coverImage.alt || project.title} />
          </div>
        )}
      </header>

      <div className={`profile-detail__body${hasZipFile ? ' profile-detail__body--with-file' : ''}`}>
        <section className="profile-detail__story">
          <p className="profile-detail__section-label">Câu chuyện công trình</p>
          {project.summary && <p className="profile-detail__lead">{project.summary}</p>}
          {project.description && <div className="profile-detail__description">{project.description}</div>}
          <ContentBlocks blocks={project.content} title={project.title} />
          <Tags items={project.tags} />
        </section>

        <aside className="profile-detail__facts">
          <h2>Thông tin dự án</h2>
          <dl>
            <Fact label="Địa điểm" value={[project.location?.district, project.location?.province].filter(Boolean).join(', ')} />
            <Fact label="Năm thiết kế" value={project.projectYear} />
            <Fact label="Năm hoàn thành" value={project.completionYear} />
            <Fact label="Chủ đầu tư" value={project.client} />
            <Fact label="Kiến trúc sư" value={project.architect} />
            <Fact label="Nhà thầu" value={project.contractor} />
            {isArchitecture ? (
              <>
                <Fact label="Loại công trình" value={details?.buildingType} />
                <Fact label="Diện tích đất" value={details?.landArea} suffix=" m²" />
                <Fact label="Diện tích xây dựng" value={details?.constructionArea} suffix=" m²" />
                <Fact label="Tổng diện tích sàn" value={details?.grossFloorArea} suffix=" m²" />
                <Fact label="Quy mô" value={details?.floors} suffix=" tầng" />
                <Fact label="Phòng ngủ" value={details?.bedrooms} />
              </>
            ) : (
              <>
                <Fact label="Loại hình" value={details?.propertyType} />
                <Fact label="Diện tích nội thất" value={details?.interiorArea} suffix=" m²" />
                <Fact label="Chiếu sáng" value={details?.lightingConcept} />
                <Fact label="Nội thất đặt riêng" value={details?.customFurniture ? 'Có' : ''} />
              </>
            )}
          </dl>
          <Tags items={project.styles} />
        </aside>

        {hasZipFile && (
          <aside className="profile-detail__files">
            <h2>File hồ sơ</h2>
            <div className="profile-detail__file-meta">
              <span className="profile-detail__download-icon" aria-hidden="true">ZIP</span>
              <span className="profile-detail__download-info">
                <strong>{project.zipFile.name || 'File hồ sơ'}</strong>
                {formatFileSize(project.zipFile.size) && <small>{formatFileSize(project.zipFile.size)}</small>}
              </span>
            </div>
            <p className="profile-detail__file-note">Vui lòng bấm mở khóa để tải file về! </p>
            <button
              type="button"
              className="profile-detail__download"
              onClick={() => setFileGateOpen(true)}
            >
              <span>Mở khóa file</span>
              <span className="profile-detail__download-arrow" aria-hidden="true">→</span>
            </button>
          </aside>
        )}
      </div>

      {fileGateOpen && createPortal(
        <div className="file-gate" role="dialog" aria-modal="true" aria-labelledby="file-gate-title" onMouseDown={(event) => event.target === event.currentTarget && setFileGateOpen(false)}>
          <div className="file-gate__dialog">
            <button type="button" className="file-gate__close" onClick={() => setFileGateOpen(false)} aria-label="Đóng"><span>×</span></button>
            <span className="profile-detail__download-icon">ZIP</span>
            <h2 id="file-gate-title">Nhận file hồ sơ</h2>
            <p>Like Facebook Page của Kiến Trúc IQ, sau đó chờ 30 giây để mở khóa tải file.</p>
            {!facebookOpened && (
              <a className="file-gate__facebook" href="https://www.facebook.com/kientruciq" target="_blank" rel="noopener noreferrer" onClick={() => setFacebookOpened(true)}>
                Mở Facebook Page
              </a>
            )}
            {facebookOpened && !fileToken && (
              <button type="button" className="file-gate__confirm" onClick={confirmFacebookLike}>Tôi đã Like Page</button>
            )}
            {fileToken && secondsLeft > 0 && <div className="file-gate__countdown">Vui lòng đợi <strong>{secondsLeft}s</strong></div>}
            {fileToken && secondsLeft === 0 && <button type="button" className="file-gate__confirm" onClick={downloadFile}>Tải file ZIP</button>}
            {gateError && <p className="file-gate__error">{gateError}</p>}
            <small>Cảm ơn Quý Khách đã ghé thăm! Chúc Quý Khách một ngày mới vui vẻ! 🌸</small>
          </div>
        </div>,
        document.body
      )}

      {gallery.length > 0 && (
        <section className="profile-detail__gallery">
          <div className="profile-detail__gallery-heading">
            <p className="profile-detail__section-label">Thư viện</p>
            <h2>Không gian dự án</h2>
          </div>
          <div className="profile-detail__gallery-grid">
            {gallery.map((image, index) => (
              <figure key={image._id || image.publicId || image.url} className={index % 5 === 0 ? 'profile-detail__gallery-wide' : ''}>
                <img src={image.url} alt={image.alt || `${project.title} - ${index + 1}`} loading="lazy" />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="profile-detail__related">
          <div className="profile-detail__related-inner">
            <div className="profile-detail__related-heading">
              <p className="profile-detail__section-label">Khám phá thêm</p>
              <h2>Dự án liên quan</h2>
            </div>
            <div className="profile-detail__related-grid">
              {related.map((item) => (
                <Link key={item._id} to={`/ho-so/${item.slug}`} className="profile-detail__related-card">
                  <div className="profile-detail__related-image">
                    {item.coverImage?.url && <img src={item.coverImage.url} alt={item.coverImage.alt || item.title} loading="lazy" />}
                  </div>
                  <p>{item.category === 'kien-truc' ? 'Kiến trúc' : 'Nội thất'}</p>
                  <h3>{item.title}</h3>
                  <span>{item.completionYear || item.projectYear || 'Xem chi tiết'} →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="profile-detail__footer">
        <Link to={backUrl}>← Xem tất cả {categoryLabel.toLowerCase()}</Link>
      </footer>
    </main>
  )
}
