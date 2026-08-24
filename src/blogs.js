import { marked, Renderer } from 'marked'

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

// Keep code blocks self-contained so the article can stay a static page while
// still getting the small affordances people expect from a polished reader:
// a language label, line numbers, subtle SQL accents, and a copy action. The
// content is escaped before it is split into lines because it comes from
// markdown source.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

const SQL_KEYWORDS = new Set([
  'ADD', 'ALL', 'ALTER', 'AND', 'AS', 'BY', 'CASE', 'CONFLICT', 'CREATE', 'DELETE',
  'DISTINCT', 'DO', 'DROP', 'ELSE', 'END', 'EXISTS', 'FROM', 'GROUP', 'IN', 'INNER',
  'INSERT', 'INTO', 'IS', 'JOIN', 'KEY', 'LEFT', 'LIMIT', 'NOT', 'NULL', 'OFFSET',
  'ON', 'OR', 'ORDER', 'OUTER', 'PRIMARY', 'RETURNING', 'RIGHT', 'SELECT', 'SET',
  'TABLE', 'THEN', 'UNION', 'UPDATE', 'VALUES', 'WHEN', 'WHERE', 'WITH',
])

const SQL_TYPES = new Set(['BIGINT', 'BOOLEAN', 'DATE', 'INTEGER', 'JSONB', 'SERIAL', 'TEXT', 'TIME', 'TIMESTAMPTZ', 'UUID'])
const SQL_FUNCTIONS = new Set(['COALESCE', 'COUNT', 'DATE_TRUNC', 'LOWER', 'MAX', 'MIN', 'NOW', 'NULLIF', 'SUM', 'UPPER'])
const SQL_TOKEN_PATTERN = /(--.*$|'(?:''|[^'])*'|"(?:""|[^"])*"|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_$]*\b)/g

function highlightSqlLine(line) {
  let output = ''
  let cursor = 0

  for (const match of line.matchAll(SQL_TOKEN_PATTERN)) {
    const token = match[0]
    const index = match.index ?? cursor
    output += escapeHtml(line.slice(cursor, index))

    let tokenType = ''
    const upperToken = token.toUpperCase()
    if (token.startsWith('--')) tokenType = 'comment'
    else if (token.startsWith("'") || token.startsWith('"')) tokenType = 'string'
    else if (/^\d/.test(token)) tokenType = 'number'
    else if (SQL_KEYWORDS.has(upperToken)) tokenType = 'keyword'
    else if (SQL_TYPES.has(upperToken)) tokenType = 'type'
    else if (SQL_FUNCTIONS.has(upperToken)) tokenType = 'function'
    else if (upperToken === 'EXCLUDED') tokenType = 'variable'

    output += tokenType
      ? `<span class="code-token code-token--${tokenType}">${escapeHtml(token)}</span>`
      : escapeHtml(token)
    cursor = index + token.length
  }

  return output + escapeHtml(line.slice(cursor))
}

function highlightCodeLine(line, language) {
  return language === 'sql' ? highlightSqlLine(line) : escapeHtml(line)
}

function renderCodeBlock({ text, lang }) {
  const language = (lang || 'text')
    .trim()
    .split(/\s+/)[0]
    .toLowerCase()
    .replace(/[^a-z0-9+#-]/g, '') || 'text'
  const label = language === 'text' ? 'PLAIN TEXT' : language.toUpperCase()
  const source = text.endsWith('\n') ? text.slice(0, -1) : text
  const lines = source.split('\n')
    .map((line) => `<span class="code-line">${highlightCodeLine(line, language) || ' '}</span>`)
    .join('')
  const codeClass = language === 'text' ? '' : ` class="language-${escapeHtml(language)}"`

  return `<div class="markdown-code-block" data-language="${escapeHtml(language)}" role="group" aria-label="${escapeHtml(label)} code example">
    <div class="markdown-code-toolbar">
      <span class="markdown-code-window" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="markdown-code-label">${escapeHtml(label)}</span>
      <button class="markdown-code-copy" type="button" data-copy-code aria-live="polite" aria-label="Copy ${escapeHtml(label)} code">COPY</button>
    </div>
    <pre><code${codeClass} data-code="${escapeHtml(source)}">${lines}</code></pre>
  </div>`
}

const markdownRenderer = new Renderer()
markdownRenderer.code = renderCodeBlock

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
    html: marked.parse(body, { gfm: true, renderer: markdownRenderer }),
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
