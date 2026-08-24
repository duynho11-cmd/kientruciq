export const SITE_NAME = 'Kiến Trúc IQ'

export const DEFAULT_DESCRIPTION = 'Kiến Trúc IQ cung cấp giải pháp thiết kế kiến trúc, nội thất và sân vườn hiện đại, tinh tế, phù hợp với nhu cầu của từng gia đình.'

export const absoluteUrl = (value = '/') => {
  if (/^https?:\/\//i.test(value)) return value
  const base = (import.meta.env.VITE_SITE_URL || window.location.origin).replace(/\/$/, '')
  return `${base}${value.startsWith('/') ? value : `/${value}`}`
}
