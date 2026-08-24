import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useProjects } from '../../context/ProjectsContext'
import api, { getApiError } from '../../services/api'

/* ── Icons ───────────────────────────────────────────────────── */
function IconArrowLeft() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function IconSave() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function IconPublish() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function IconImage() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--outline)' }}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

/* ── Tag input ───────────────────────────────────────────────── */
function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  const addTag = (val) => {
    const t = val.trim().replace(/,+$/, '')
    if (t && !tags.includes(t)) onChange([...tags, t])
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === 'Tab' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="tag-input-wrap">
      {tags.map((t) => (
        <span key={t} className="tag-chip">
          {t}
          <button type="button" className="tag-chip__remove" onClick={() => onChange(tags.filter((x) => x !== t))}>
            <IconX />
          </button>
        </span>
      ))}
      <input
        className="tag-input-field"
        placeholder={tags.length === 0 ? 'Vd: nghệ thuật, triển lãm' : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input.trim() && addTag(input)}
      />
      <p className="add-form__hint" style={{ width: '100%', marginTop: '0.25rem' }}>
        Nhấn Enter / Tab, phân cách bằng dấu phẩy
      </p>
    </div>
  )
}

/* ── Image uploader ──────────────────────────────────────────── */
function ImageUploader({ coverImage, onCoverChange }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) { alert('Ảnh tối đa 10MB'); return }
    const body = new FormData()
    body.append('image', file)
    setUploading(true)
    try {
      const { data } = await api.post('/uploads/project-image', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onCoverChange(data.image)
    } catch (error) {
      alert(getApiError(error, 'Không thể tải ảnh lên.'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div
      className={`image-uploader${dragging ? ' image-uploader--drag' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {coverImage?.url ? (
        <>
          <img src={coverImage.url} alt="cover" className="image-uploader__preview" />
          <button
            type="button"
            className="image-uploader__remove"
            onClick={(e) => { e.stopPropagation(); onCoverChange(null) }}
            aria-label="Xoá ảnh"
          >
            <IconX />
          </button>
        </>
      ) : (
        <div className="image-uploader__placeholder">
          <IconImage />
          <p>{uploading ? 'Đang xử lý ảnh...' : 'Kéo thả ảnh vào đây hoặc click để tải lên'}</p>
          <span>PNG, JPG, WebP (Tối đa 10MB)</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  )
}

function ZipUploader({ file, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (selectedFile) => {
    if (!selectedFile) return
    if (!selectedFile.name.toLowerCase().endsWith('.zip')) return alert('Vui lòng chọn file .zip')
    if (selectedFile.size > 100 * 1024 * 1024) return alert('File ZIP tối đa 100MB')

    const body = new FormData()
    body.append('file', selectedFile)
    setUploading(true)
    try {
      const { data } = await api.post('/uploads/project-zip', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onChange(data.file)
    } catch (error) {
      alert(getApiError(error, 'Không thể tải file ZIP lên.'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="zip-uploader">
      {file?.url ? (
        <div className="zip-uploader__file">
          <div><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB</span></div>
          <button type="button" onClick={() => onChange(null)} aria-label="Xóa file ZIP"><IconX /></button>
        </div>
      ) : (
        <button type="button" className="zip-uploader__select" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <strong>{uploading ? 'Đang tải file ZIP...' : 'Chọn file ZIP'}</strong>
          <span>Chỉ định dạng .zip, tối đa 100MB</span>
        </button>
      )}
      <input ref={inputRef} hidden type="file" accept=".zip,application/zip" onChange={(event) => handleFile(event.target.files[0])} />
    </div>
  )
}

function GalleryUploader({ images, onChange }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const uploadFiles = async (files) => {
    const validFiles = [...files].filter((file) => file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024)
    if (!validFiles.length) return
    setUploading(true)
    try {
      const uploaded = []
      for (const file of validFiles.slice(0, 20 - images.length)) {
        const body = new FormData()
        body.append('image', file)
        const { data } = await api.post('/uploads/project-image', body, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        uploaded.push({ ...data.image, alt: '', caption: '', sortOrder: images.length + uploaded.length })
      }
      onChange([...images, ...uploaded])
    } catch (error) {
      alert(getApiError(error, 'Không thể tải thư viện ảnh lên.'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const updateImage = (index, key, value) => {
    onChange(images.map((image, current) => current === index ? { ...image, [key]: value } : image))
  }

  return (
    <div className="gallery-editor">
      <button type="button" className="gallery-add" onClick={() => inputRef.current?.click()} disabled={uploading || images.length >= 20}>
        <IconImage />
        {uploading ? 'Đang tải ảnh...' : `Thêm ảnh vào thư viện (${images.length}/20)`}
      </button>
      <input ref={inputRef} hidden multiple type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadFiles(event.target.files)} />
      <div className="gallery-grid">
        {images.map((image, index) => (
          <article className="gallery-item" key={image.publicId || image.url}>
            <div className="gallery-item__image-wrap">
              <img src={image.thumbnailUrl || image.url} alt={image.alt || ''} className="gallery-item__image" />
              <button type="button" className="image-uploader__remove" onClick={() => onChange(images.filter((_, current) => current !== index))} aria-label="Xóa ảnh">
                <IconX />
              </button>
            </div>
            <input className="add-form-input" value={image.alt || ''} placeholder="Alt text mô tả ảnh" onChange={(event) => updateImage(index, 'alt', event.target.value)} />
            <input className="add-form-input" value={image.caption || ''} placeholder="Chú thích ảnh" onChange={(event) => updateImage(index, 'caption', event.target.value)} />
          </article>
        ))}
      </div>
    </div>
  )
}

function ContentBlockEditor({ blocks, onChange }) {
  const update = (index, patch) => onChange(blocks.map((block, current) => current === index ? { ...block, ...patch } : block))
  const remove = (index) => onChange(blocks.filter((_, current) => current !== index))
  const move = (index, direction) => {
    const target = index + direction
    if (target < 0 || target >= blocks.length) return
    const next = [...blocks]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }
  const add = (type) => onChange([...blocks, {
    clientId: crypto.randomUUID(),
    type,
    text: '',
    level: 2,
    image: null,
    imageSize: 'large',
    imageAlign: 'center',
  }])

  const uploadBlockImage = async (index, file) => {
    if (!file || file.size > 10 * 1024 * 1024) return alert('Ảnh tối đa 10MB')
    const body = new FormData()
    body.append('image', file)
    try {
      const { data } = await api.post('/uploads/project-image', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      update(index, { image: data.image })
    } catch (error) {
      alert(getApiError(error, 'Không thể tải ảnh nội dung lên.'))
    }
  }

  return (
    <div className="block-editor">
      {blocks.map((block, index) => (
        <article className="block-editor__item" key={block._id || block.clientId || index}>
          <div className="block-editor__toolbar">
            <span>{index + 1}. {block.type === 'paragraph' ? 'Đoạn văn' : block.type === 'heading' ? 'Tiêu đề' : block.type === 'quote' ? 'Trích dẫn' : 'Hình ảnh'}</span>
            <div>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Đưa lên">↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label="Đưa xuống">↓</button>
              <button type="button" onClick={() => remove(index)} aria-label="Xóa block"><IconX /></button>
            </div>
          </div>
          {block.type === 'image' ? (
            <div className={`block-editor__image block-editor__image--${block.imageSize || 'large'} block-editor__image--${block.imageAlign || 'center'}`}>
              {block.image?.url ? <img src={block.image.url} alt={block.image.alt || ''} /> : <label className="gallery-add"><IconImage /> Chọn ảnh<input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => uploadBlockImage(index, event.target.files[0])} /></label>}
              {block.image?.url && (
                <>
                  <div className="block-editor__image-config">
                    <label>Kích thước<select value={block.imageSize || 'large'} onChange={(event) => update(index, { imageSize: event.target.value })}><option value="small">Nhỏ</option><option value="medium">Vừa</option><option value="large">Lớn</option><option value="full">Toàn chiều rộng</option></select></label>
                    <label>Căn ảnh<select value={block.imageAlign || 'center'} onChange={(event) => update(index, { imageAlign: event.target.value })}><option value="left">Trái</option><option value="center">Giữa</option><option value="right">Phải</option></select></label>
                  </div>
                  <input className="add-form-input" placeholder="Alt text mô tả ảnh" value={block.image.alt || ''} onChange={(event) => update(index, { image: { ...block.image, alt: event.target.value } })} />
                  <input className="add-form-input" placeholder="Chú thích ảnh" value={block.image.caption || ''} onChange={(event) => update(index, { image: { ...block.image, caption: event.target.value } })} />
                </>
              )}
            </div>
          ) : (
            <>
              {block.type === 'heading' && <select className="add-form-input block-editor__level" value={block.level || 2} onChange={(event) => update(index, { level: Number(event.target.value) })}><option value={2}>Tiêu đề lớn</option><option value={3}>Tiêu đề nhỏ</option></select>}
              <textarea
                className={`add-form-input add-form-input--boxed block-editor__text block-editor__text--${block.type}`}
                rows={block.type === 'paragraph' ? 5 : 2}
                placeholder={block.type === 'heading' ? 'Nhập tiêu đề phần...' : block.type === 'quote' ? 'Nhập câu trích dẫn...' : 'Viết nội dung...' }
                value={block.text || ''}
                onChange={(event) => update(index, { text: event.target.value })}
              />
            </>
          )}
        </article>
      ))}
      <div className="block-editor__add">
        <span>Thêm vào bài viết:</span>
        <button type="button" onClick={() => add('paragraph')}>+ Đoạn văn</button>
        <button type="button" onClick={() => add('heading')}>+ Tiêu đề</button>
        <button type="button" onClick={() => add('image')}>+ Hình ảnh</button>
        <button type="button" onClick={() => add('quote')}>+ Trích dẫn</button>
      </div>
    </div>
  )
}

/* ── Char counter ────────────────────────────────────────────── */
function CharCount({ value, max }) {
  return (
    <span className={`char-count${value.length > max ? ' char-count--over' : ''}`}>
      {value.length}/{max}
    </span>
  )
}

/* ══════════════════════════════════════════════════════════════
   AdminAddProjectPage
   — /admin/ho-so-kien-truc/them   → category = 'kien-truc'
   — /admin/ho-so-noi-that/them    → category = 'noi-that'
   — ?edit=<id>                    → edit mode
   ══════════════════════════════════════════════════════════════ */
const EMPTY_FORM = {
  title: '',
  summary: '',
  description: '',
  content: [],
  coverUrl: '',
  coverImage: null,
  gallery: [],
  zipFile: null,
  tags: [],
  styles: [],
  spaces: [],
  featured: false,
  location: { province: '', district: '', address: '', country: 'Việt Nam' },
  projectYear: '',
  completionYear: '',
  client: '',
  architect: '',
  designTeam: [],
  contractor: '',
  architectureDetails: {
    landArea: '', constructionArea: '', grossFloorArea: '', floors: '', bedrooms: '', bathrooms: '',
    buildingType: '', architecturalStyle: [], structure: '', facadeMaterials: [], sustainabilityFeatures: [],
  },
  interiorDetails: {
    propertyType: '', interiorArea: '', rooms: [], interiorStyle: [], primaryMaterials: [],
    colorPalette: [], furnitureBrands: [], lightingConcept: '', customFurniture: false,
  },
  seoTitle: '',
  seoDesc: '',
  seoKeywords: [],
  canonicalUrl: '',
  noIndex: false,
  sortOrder: 0,
  status: 'draft',
}

export default function AdminAddProjectPage({ category }) {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const editId         = searchParams.get('edit') || null
  const { addProject, updateProject, getById } = useProjects()

  const isEdit = !!editId
  const backTo = category === 'kien-truc' ? '/admin/ho-so-kien-truc' : '/admin/ho-so-noi-that'

  /* Initialise form — edit mode seeds from existing project */
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    if (!editId) return
    const p = getById(editId)
    if (!p) return
    setForm({
      title: p.title || '',
      summary: p.summary || '',
      description: p.description || '',
      content: p.content || [],
      coverUrl: p.coverUrl || '',
      coverImage: p.coverImage || null,
      gallery: p.gallery || [],
      zipFile: p.zipFile || null,
      tags: p.tags || [],
      styles: p.styles || [],
      spaces: p.spaces || [],
      featured: p.featured || false,
      location: { ...EMPTY_FORM.location, ...p.location },
      projectYear: p.projectYear || '',
      completionYear: p.completionYear || '',
      client: p.client || '',
      architect: p.architect || '',
      designTeam: p.designTeam || [],
      contractor: p.contractor || '',
      architectureDetails: { ...EMPTY_FORM.architectureDetails, ...p.architectureDetails },
      interiorDetails: { ...EMPTY_FORM.interiorDetails, ...p.interiorDetails },
      seoTitle: p.seoTitle || '',
      seoDesc: p.seoDesc || '',
      seoKeywords: p.seo?.keywords || [],
      canonicalUrl: p.seo?.canonicalUrl || '',
      noIndex: p.seo?.noIndex || false,
      sortOrder: p.sortOrder || 0,
      status: p.status || 'draft',
    })
  }, [editId, getById])

  const [errors, setErrors]   = useState({})
  const [saving,  setSaving]  = useState(false)

  const set = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  const setNested = (group, key, value) => {
    setForm((prev) => ({ ...prev, [group]: { ...prev[group], [key]: value } }))
  }

  const validate = (nextStatus) => {
    const e = {}
    if (!form.title.trim()) e.title = 'Vui lòng nhập tiêu đề.'
    if (nextStatus === 'published' && !form.summary.trim()) e.summary = 'Cần mô tả ngắn trước khi xuất bản.'
    if (nextStatus === 'published' && !form.coverImage?.url) e.coverImage = 'Cần ảnh đại diện trước khi xuất bản.'
    return e
  }

  const submit = async (publishOverride) => {
    const nextStatus = publishOverride ?? form.status
    const errs = validate(nextStatus)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    const data = {
      ...form,
      category,
      projectYear: form.projectYear ? Number(form.projectYear) : undefined,
      completionYear: form.completionYear ? Number(form.completionYear) : undefined,
      sortOrder: Number(form.sortOrder) || 0,
      content: form.content
        .filter((block) => block.type === 'image' ? block.image?.url : block.text?.trim())
        .map((block) => {
          const cleanBlock = { ...block }
          delete cleanBlock.clientId
          return cleanBlock
        }),
      seo: {
        metaTitle: form.seoTitle,
        metaDescription: form.seoDesc,
        keywords: form.seoKeywords,
        canonicalUrl: form.canonicalUrl,
        noIndex: form.noIndex,
      },
      status: nextStatus,
    }

    try {
      if (isEdit) {
        await updateProject(editId, data)
      } else {
        await addProject(data)
      }
      navigate(backTo)
    } catch (error) {
      setErrors({ form: error.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="add-form-page">
      {/* ── Topbar ── */}
      <div className="add-form-topbar">
        <button
          type="button"
          className="add-form-back"
          onClick={() => navigate(backTo)}
        >
          <IconArrowLeft />
          Quay lại
        </button>

        <div className="add-form-topbar__actions">
          <button
            type="button"
            className="admin-btn add-form-btn--save"
            onClick={() => submit()}
            disabled={saving}
          >
            {saving ? <span className="login-spinner" style={{ width: 14, height: 14 }} /> : <IconSave />}
            Lưu thay đổi
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => submit('published')}
            disabled={saving}
          >
            {saving ? <span className="login-spinner" style={{ width: 14, height: 14 }} /> : <IconPublish />}
            Xuất bản
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="add-form-body">
        {/* ── Left — main content ── */}
        <div className="add-form-main">
          {errors.form && <div className="auth-alert" role="alert">{errors.form}</div>}
          {/* Title */}
          <div className="add-form-title-wrap">
            <textarea
              className={`add-form-title${errors.title ? ' add-form-title--error' : ''}`}
              placeholder="Tiêu đề hồ sơ..."
              value={form.title}
              rows={1}
              onChange={(e) => {
                set('title', e.target.value)
                // auto-resize
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
            />
            {errors.title && (
              <span className="auth-field-error">{errors.title}</span>
            )}
          </div>

          <div className="add-section">
            <label className="add-section__label" htmlFor="project-summary">Mô tả ngắn</label>
            <textarea
              id="project-summary"
              className="add-form-input add-form-input--boxed"
              rows={3}
              maxLength={500}
              placeholder="Tóm tắt nổi bật của công trình, dùng trên thẻ dự án và kết quả tìm kiếm..."
              value={form.summary}
              onChange={(event) => set('summary', event.target.value)}
            />
            <div className="add-field-meta">
              {errors.summary && <span className="auth-field-error">{errors.summary}</span>}
              <CharCount value={form.summary} max={500} />
            </div>
          </div>

          <section className="add-section">
            <h2 className="add-section__title">Giới thiệu chung</h2>
            <textarea
              className="add-form-input add-form-input--boxed"
              placeholder="Viết đoạn giới thiệu tổng quan về hồ sơ..."
              value={form.description}
              rows={6}
              onChange={(e) => set('description', e.target.value)}
            />
          </section>

          <section className="add-section">
            <h2 className="add-section__title">Nội dung bài viết</h2>
            <p className="add-section__description">Chèn và sắp xếp tự do đoạn văn, tiêu đề, hình ảnh và trích dẫn.</p>
            <ContentBlockEditor blocks={form.content} onChange={(value) => set('content', value)} />
          </section>

          <section className="add-section">
            <h2 className="add-section__title">Địa điểm và đơn vị thực hiện</h2>
            <div className="add-fields-grid">
              <label className="add-form-field"><span className="add-form-field__label">Tỉnh / thành phố</span><input className="add-form-input" value={form.location.province} onChange={(e) => setNested('location', 'province', e.target.value)} /></label>
              <label className="add-form-field"><span className="add-form-field__label">Quận / huyện</span><input className="add-form-input" value={form.location.district} onChange={(e) => setNested('location', 'district', e.target.value)} /></label>
              <label className="add-form-field add-fields-grid__full"><span className="add-form-field__label">Địa chỉ công trình</span><input className="add-form-input" value={form.location.address} onChange={(e) => setNested('location', 'address', e.target.value)} /></label>
              <label className="add-form-field"><span className="add-form-field__label">Năm thiết kế</span><input type="number" min="1900" max="2200" className="add-form-input" value={form.projectYear} onChange={(e) => set('projectYear', e.target.value)} /></label>
              <label className="add-form-field"><span className="add-form-field__label">Năm hoàn thành</span><input type="number" min="1900" max="2200" className="add-form-input" value={form.completionYear} onChange={(e) => set('completionYear', e.target.value)} /></label>
              <label className="add-form-field"><span className="add-form-field__label">Chủ đầu tư</span><input className="add-form-input" value={form.client} onChange={(e) => set('client', e.target.value)} /></label>
              <label className="add-form-field"><span className="add-form-field__label">Kiến trúc sư chủ trì</span><input className="add-form-input" value={form.architect} onChange={(e) => set('architect', e.target.value)} /></label>
              <label className="add-form-field"><span className="add-form-field__label">Nhà thầu</span><input className="add-form-input" value={form.contractor} onChange={(e) => set('contractor', e.target.value)} /></label>
              <div className="add-form-field"><span className="add-form-field__label">Nhóm thiết kế</span><TagInput tags={form.designTeam} onChange={(value) => set('designTeam', value)} /></div>
            </div>
          </section>

          {category === 'kien-truc' ? (
            <section className="add-section">
              <h2 className="add-section__title">Thông số kiến trúc</h2>
              <div className="add-fields-grid add-fields-grid--three">
                <label className="add-form-field"><span className="add-form-field__label">Loại công trình</span><select className="add-form-input" value={form.architectureDetails.buildingType} onChange={(e) => setNested('architectureDetails', 'buildingType', e.target.value)}><option value="">Chọn loại</option><option value="villa">Biệt thự</option><option value="townhouse">Nhà phố</option><option value="apartment">Chung cư</option><option value="office">Văn phòng</option><option value="hotel">Khách sạn</option><option value="resort">Resort</option><option value="commercial">Thương mại</option><option value="other">Khác</option></select></label>
                {[['landArea','Diện tích đất (m²)'],['constructionArea','Diện tích xây dựng (m²)'],['grossFloorArea','Tổng diện tích sàn (m²)'],['floors','Số tầng'],['bedrooms','Số phòng ngủ'],['bathrooms','Số phòng tắm']].map(([key,label]) => <label className="add-form-field" key={key}><span className="add-form-field__label">{label}</span><input type="number" min="0" className="add-form-input" value={form.architectureDetails[key]} onChange={(e) => setNested('architectureDetails', key, e.target.value)} /></label>)}
              </div>
              <div className="add-fields-grid">
                <div className="add-form-field"><span className="add-form-field__label">Phong cách kiến trúc</span><TagInput tags={form.architectureDetails.architecturalStyle} onChange={(value) => setNested('architectureDetails', 'architecturalStyle', value)} /></div>
                <div className="add-form-field"><span className="add-form-field__label">Vật liệu mặt tiền</span><TagInput tags={form.architectureDetails.facadeMaterials} onChange={(value) => setNested('architectureDetails', 'facadeMaterials', value)} /></div>
                <label className="add-form-field add-fields-grid__full"><span className="add-form-field__label">Kết cấu</span><textarea className="add-form-input add-form-input--boxed" rows={2} value={form.architectureDetails.structure} onChange={(e) => setNested('architectureDetails', 'structure', e.target.value)} /></label>
                <div className="add-form-field add-fields-grid__full"><span className="add-form-field__label">Giải pháp bền vững</span><TagInput tags={form.architectureDetails.sustainabilityFeatures} onChange={(value) => setNested('architectureDetails', 'sustainabilityFeatures', value)} /></div>
              </div>
            </section>
          ) : (
            <section className="add-section">
              <h2 className="add-section__title">Thông số nội thất</h2>
              <div className="add-fields-grid">
                <label className="add-form-field"><span className="add-form-field__label">Loại bất động sản</span><select className="add-form-input" value={form.interiorDetails.propertyType} onChange={(e) => setNested('interiorDetails', 'propertyType', e.target.value)}><option value="">Chọn loại</option><option value="villa">Biệt thự</option><option value="house">Nhà ở</option><option value="apartment">Chung cư</option><option value="office">Văn phòng</option><option value="restaurant">Nhà hàng</option><option value="hotel">Khách sạn</option><option value="showroom">Showroom</option><option value="other">Khác</option></select></label>
                <label className="add-form-field"><span className="add-form-field__label">Diện tích nội thất (m²)</span><input type="number" min="0" className="add-form-input" value={form.interiorDetails.interiorArea} onChange={(e) => setNested('interiorDetails', 'interiorArea', e.target.value)} /></label>
                <div className="add-form-field"><span className="add-form-field__label">Không gian</span><TagInput tags={form.interiorDetails.rooms} onChange={(value) => setNested('interiorDetails', 'rooms', value)} /></div>
                <div className="add-form-field"><span className="add-form-field__label">Phong cách nội thất</span><TagInput tags={form.interiorDetails.interiorStyle} onChange={(value) => setNested('interiorDetails', 'interiorStyle', value)} /></div>
                <div className="add-form-field"><span className="add-form-field__label">Vật liệu chủ đạo</span><TagInput tags={form.interiorDetails.primaryMaterials} onChange={(value) => setNested('interiorDetails', 'primaryMaterials', value)} /></div>
                <div className="add-form-field"><span className="add-form-field__label">Bảng màu</span><TagInput tags={form.interiorDetails.colorPalette} onChange={(value) => setNested('interiorDetails', 'colorPalette', value)} /></div>
                <div className="add-form-field"><span className="add-form-field__label">Thương hiệu nội thất</span><TagInput tags={form.interiorDetails.furnitureBrands} onChange={(value) => setNested('interiorDetails', 'furnitureBrands', value)} /></div>
                <label className="add-form-field"><span className="add-form-field__label">Ý tưởng chiếu sáng</span><textarea className="add-form-input add-form-input--boxed" rows={2} value={form.interiorDetails.lightingConcept} onChange={(e) => setNested('interiorDetails', 'lightingConcept', e.target.value)} /></label>
                <label className="add-form-checkbox add-fields-grid__full"><input type="checkbox" checked={form.interiorDetails.customFurniture} onChange={(e) => setNested('interiorDetails', 'customFurniture', e.target.checked)} /><span>Có nội thất thiết kế riêng</span></label>
              </div>
            </section>
          )}

          <section className="add-section">
            <h2 className="add-section__title">Thư viện ảnh</h2>
            <p className="add-section__description">Tải tối đa 20 ảnh, bổ sung alt text để hỗ trợ SEO và khả năng truy cập.</p>
            <GalleryUploader images={form.gallery} onChange={(value) => set('gallery', value)} />
          </section>

          <section className="add-section">
            <h2 className="add-section__title">File hồ sơ</h2>
            <p className="add-section__description">Tải lên file ZIP chứa bản vẽ hoặc tài liệu của hồ sơ.</p>
            <ZipUploader file={form.zipFile} onChange={(value) => set('zipFile', value)} />
          </section>
        </div>

        {/* ── Right — sidebar ── */}
        <aside className="add-form-sidebar">
          <div className="add-form-panel">
            <h3 className="add-form-panel__title">Thông tin chung</h3>

            {/* Category (readonly) */}
            <div className="add-form-field">
              <label className="add-form-field__label">Danh mục</label>
              <div className="add-form-field__static">
                {category === 'kien-truc' ? 'Hồ sơ kiến trúc' : 'Hồ sơ nội thất'}
              </div>
            </div>

            <label className="add-form-field">
              <span className="add-form-field__label">Trạng thái</span>
              <select className="add-form-input" value={form.status} onChange={(event) => set('status', event.target.value)}>
                <option value="draft">Bản nháp</option>
                <option value="review">Chờ duyệt</option>
                <option value="published">Đã xuất bản</option>
                <option value="archived">Lưu trữ</option>
              </select>
            </label>

            {/* Tags */}
            <div className="add-form-field">
              <label className="add-form-field__label">Tags</label>
              <TagInput tags={form.tags} onChange={(v) => set('tags', v)} />
            </div>

            <div className="add-form-field">
              <label className="add-form-field__label">Phong cách chung</label>
              <TagInput tags={form.styles} onChange={(value) => set('styles', value)} />
            </div>

            <div className="add-form-field">
              <label className="add-form-field__label">Không gian nổi bật</label>
              <TagInput tags={form.spaces} onChange={(value) => set('spaces', value)} />
            </div>

            <label className="add-form-field">
              <span className="add-form-field__label">Thứ tự hiển thị</span>
              <input type="number" className="add-form-input" value={form.sortOrder} onChange={(event) => set('sortOrder', event.target.value)} />
            </label>

            {/* Featured */}
            <label className="add-form-checkbox">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
              />
              <span>Đánh dấu là hồ sơ nổi bật</span>
            </label>

            {/* Cover image */}
            <div className="add-form-field" style={{ marginTop: '0.5rem' }}>
              <label className="add-form-field__label">Ảnh đại diện</label>
              <ImageUploader
                coverImage={form.coverImage}
                onCoverChange={(value) => set('coverImage', value)}
              />
              {errors.coverImage && <span className="auth-field-error">{errors.coverImage}</span>}
            </div>
          </div>

          {/* SEO panel */}
          <div className="add-form-panel">
            <h3 className="add-form-panel__title">
              Cấu hình SEO
              <span className="add-form-panel__icon"><IconInfo /></span>
            </h3>

            <div className="add-form-field">
              <div className="add-form-field__row">
                <label className="add-form-field__label">SEO Title</label>
                <CharCount value={form.seoTitle} max={60} />
              </div>
              <input
                type="text"
                className="add-form-input"
                placeholder="Nhập tiêu đề SEO..."
                value={form.seoTitle}
                maxLength={80}
                onChange={(e) => set('seoTitle', e.target.value)}
              />
            </div>

            <div className="add-form-field">
              <div className="add-form-field__row">
                <label className="add-form-field__label">Meta Description</label>
                <CharCount value={form.seoDesc} max={160} />
              </div>
              <textarea
                className="add-form-input add-form-input--textarea"
                placeholder="Mô tả nội dung bài viết..."
                value={form.seoDesc}
                rows={3}
                maxLength={200}
                onChange={(e) => set('seoDesc', e.target.value)}
              />
            </div>

            <div className="add-form-field">
              <label className="add-form-field__label">SEO Keywords</label>
              <TagInput tags={form.seoKeywords} onChange={(value) => set('seoKeywords', value)} />
            </div>

            <div className="add-form-field">
              <label className="add-form-field__label">Canonical URL</label>
              <input type="url" className="add-form-input" placeholder="https://..." value={form.canonicalUrl} onChange={(event) => set('canonicalUrl', event.target.value)} />
            </div>

            <label className="add-form-checkbox">
              <input type="checkbox" checked={form.noIndex} onChange={(event) => set('noIndex', event.target.checked)} />
              <span>Không lập chỉ mục trên công cụ tìm kiếm</span>
            </label>
          </div>
        </aside>
      </div>
    </div>
  )
}
