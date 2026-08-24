import { marked } from 'marked'

// Markdown files are the source of truth for the journal. Vite inlines them at
// build time, so the site remains a static deploy with no runtime API needed.
const markdownFiles = import.meta.glob('../blogs/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
})

const FRONT_MATTER_PATTERN = /^---\s*\n([\s\S]*?)\n---\s*\n?/

function parseScalar(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      return JSON.parse(trimmed)
    } catch {
      return trimmed.slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^(['"])(.*)\1$/, '$2'))
        .filter(Boolean)
    }
  }

  if (trimmed === 'true') return true
  if (trimmed === 'false') return false
  return trimmed
}

function parseFrontMatter(source) {
  const match = source.match(FRONT_MATTER_PATTERN)
  if (!match) return { attributes: {}, body: source.trim() }

  const attributes = {}
  match[1].split('\n').forEach((line) => {
    const separator = line.indexOf(':')
    if (separator === -1) return
    const key = line.slice(0, separator).trim()
    if (!key) return
    attributes[key] = parseScalar(line.slice(separator + 1))
  })

  return { attributes, body: source.slice(match[0].length).trim() }
}

function slugFromPath(path) {
  return path.split('/').pop().replace(/\.md$/i, '')
}

function readingTime(body) {
  const words = body.trim().split(/\s+/).filter(Boolean).length
  const cjkCharacters = (body.match(/[\u3040-\u30ff\u3400-\u9fff]/g) || []).length
  const minutes = Math.max(1, Math.ceil((words + cjkCharacters / 2) / 180))
  return `${minutes} MIN READ`
}

function normalizePost(path, source) {
  const { attributes, body } = parseFrontMatter(source)
  const slug = slugFromPath(path)
  const tags = Array.isArray(attributes.tags)
    ? attributes.tags
    : attributes.tags
      ? [attributes.tags]
      : []

  return {
    slug,
    title: attributes.title || slug.replace(/[-_]+/g, ' '),
    date: attributes.date || '',
    excerpt: attributes.excerpt || attributes.description || '',
    tags,
    readingTime: attributes.readingTime || readingTime(body),
    body,
    html: marked.parse(body, { gfm: true }),
  }
}

export const BLOG_POSTS = Object.entries(markdownFiles)
  .map(([path, source]) => normalizePost(path, source))
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))

export function getBlogPost(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug) || null
}

export function formatBlogDate(value) {
  if (!value) return 'UNDATED'
  const normalized = String(value)
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(normalized) ? `${normalized}T00:00:00` : normalized)
  if (Number.isNaN(date.getTime())) return String(value).toUpperCase()
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(date)
    .toUpperCase()
}
