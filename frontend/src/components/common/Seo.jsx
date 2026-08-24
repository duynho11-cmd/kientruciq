import { useEffect } from 'react'
import { absoluteUrl, DEFAULT_DESCRIPTION, SITE_NAME } from '../../lib/seo'

const setMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = window.location.pathname,
  image = '/og-image.jpg',
  type = 'website',
  noindex = false,
  canonical,
  jsonLd,
}) {
  useEffect(() => {
    const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Thiết kế kiến trúc & nội thất`
    const canonicalUrl = absoluteUrl(canonical || path)
    const imageUrl = absoluteUrl(image)
    const robots = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

    document.title = pageTitle
    document.documentElement.lang = 'vi'
    setMeta('meta[name="description"]', { name: 'description', content: description })
    setMeta('meta[name="robots"]', { name: 'robots', content: robots })
    setMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'vi_VN' })
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type })
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME })
    setMeta('meta[property="og:title"]', { property: 'og:title', content: pageTitle })
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
    setMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
    setMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: title || SITE_NAME })
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: pageTitle })
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })

    let canonicalLink = document.head.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
      canonicalLink = document.createElement('link')
      canonicalLink.rel = 'canonical'
      document.head.appendChild(canonicalLink)
    }
    canonicalLink.href = canonicalUrl

    const scriptId = 'page-structured-data'
    document.getElementById(scriptId)?.remove()
    if (jsonLd) {
      const script = document.createElement('script')
      script.id = scriptId
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify(jsonLd)
      document.head.appendChild(script)
    }
  }, [canonical, description, image, jsonLd, noindex, path, title, type])

  return null
}
