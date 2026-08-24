import React from 'react'
import { BLOG_POSTS, formatBlogDate, getBlogPost } from '../blogs.js'

function Arrow({ diagonal = true }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="blog-arrow">
      {diagonal ? <path d="M3 13 13 3M5 3h8v8" /> : <path d="M2 8h11M9 4l4 4-4 4" />}
    </svg>
  )
}

function Label({ children, light = false }) {
  return <span className={`blog-label ${light ? 'blog-label--light' : ''}`}>{children}</span>
}

function postHref(slug) {
  return `/blog/?post=${encodeURIComponent(slug)}`
}

function BlogNav() {
  return (
    <header className="blog-nav">
      <div className="blog-nav-inner">
        <a className="blog-wordmark" href="/" aria-label="Back to Yang homepage">YANG<span>/</span>NOTES</a>
        <nav aria-label="Blog navigation">
          <a href="/">HOME <Arrow /></a>
          <a className="is-active" href="/blog/">BLOG <Arrow diagonal={false} /></a>
        </nav>
      </div>
    </header>
  )
}

function BlogCard({ post, index }) {
  return (
    <article className="blog-card">
      <a className="blog-card-link" href={postHref(post.slug)}>
        <div className="blog-card-topline">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{formatBlogDate(post.date)}</span>
        </div>
        <h3>{post.title}</h3>
        <p>{post.excerpt}</p>
        <div className="blog-card-bottomline">
          <div className="blog-tags">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <span className="blog-read-link">READ <Arrow /></span>
        </div>
      </a>
    </article>
  )
}

function BlogIndex() {
  return (
    <main className="blog-page blog-page--index">
      <section className="blog-hero section-dark">
        <div className="blog-page-frame">
          <div className="blog-hero-grid" aria-hidden="true" />
          <div className="blog-hero-copy">
            <Label light>03 / field notes</Label>
            <h1>Notes from the<br /><em>unfinished edge</em></h1>
            <p>Short dispatches about making software, following questions, and keeping the useful parts visible.</p>
          </div>
          <div className="blog-hero-meta"><span>ARTICLES</span><strong>{String(BLOG_POSTS.length).padStart(2, '0')}</strong></div>
        </div>
      </section>

      <section className="blog-index-list section-paper">
        <div className="blog-page-frame">
          <div className="blog-index-heading">
            <Label>RECENT WRITING</Label>
            <span>MARKDOWN / BUILT AT DEPLOY TIME</span>
          </div>
          <div className="blog-page-grid">
            {BLOG_POSTS.map((post, index) => <BlogCard key={post.slug} post={post} index={index} />)}
          </div>
        </div>
      </section>
    </main>
  )
}

function BlogArticle({ post }) {
  const otherPosts = BLOG_POSTS.filter((candidate) => candidate.slug !== post.slug).slice(0, 3)
  const articleRef = React.useRef(null)

  React.useEffect(() => {
    const article = articleRef.current
    if (!article) return undefined

    const handleCopy = async (event) => {
      const button = event.target.closest('[data-copy-code]')
      if (!button || !article.contains(button)) return

      const code = button.closest('.markdown-code-block')?.querySelector('code')
      if (!code) return

      const originalLabel = button.dataset.originalLabel || button.textContent
      button.dataset.originalLabel = originalLabel

      try {
        if (!globalThis.navigator?.clipboard?.writeText) throw new Error('Clipboard API unavailable')
        await globalThis.navigator.clipboard.writeText(code.dataset.code ?? code.textContent.replace(/\n$/, ''))
        button.textContent = 'COPIED'
      } catch {
        const selection = globalThis.getSelection?.()
        if (selection && globalThis.document?.createRange) {
          const range = globalThis.document.createRange()
          range.selectNodeContents(code)
          selection.removeAllRanges()
          selection.addRange(range)
          button.textContent = 'SELECTED'
        } else {
          button.textContent = 'COPY FAILED'
        }
      }

      globalThis.setTimeout(() => {
        button.textContent = originalLabel
      }, 1600)
    }

    article.addEventListener('click', handleCopy)
    return () => article.removeEventListener('click', handleCopy)
  }, [post])

  return (
    <main className="blog-page blog-page--article">
      <section className="blog-article-hero section-dark">
        <div className="blog-page-frame">
          <a className="blog-back-link" href="/blog/"><Arrow diagonal={false} /> ALL NOTES</a>
          <div className="blog-article-meta">
            <Label light>{formatBlogDate(post.date)}</Label>
            <span>{post.readingTime}</span>
          </div>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div className="blog-tags blog-tags--hero">{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        </div>
      </section>

      <section className="blog-article-body section-paper">
        <div className="blog-page-frame blog-article-layout">
          <article ref={articleRef} className="markdown-body" dangerouslySetInnerHTML={{ __html: post.html }} />
          <aside className="blog-article-aside">
            <Label>KEEP READING</Label>
            {otherPosts.length ? <div>
              {otherPosts.map((candidate) => (
                <a key={candidate.slug} href={postHref(candidate.slug)}>
                  <span>{formatBlogDate(candidate.date)}</span>
                  <strong>{candidate.title}</strong>
                  <Arrow />
                </a>
              ))}
            </div> : <p className="blog-article-aside-empty">MORE NOTES SOON</p>}
          </aside>
        </div>
      </section>
    </main>
  )
}

export default function BlogPage() {
  const params = new URLSearchParams(window.location.search)
  const pathSlug = window.location.pathname.split('/').filter(Boolean)[1]
  const post = getBlogPost(params.get('post') || pathSlug)

  React.useEffect(() => {
    document.title = post ? `${post.title} — Yang / Notes` : 'Yang / Notes'
  }, [post])

  return (
    <>
      <BlogNav />
      {post ? <BlogArticle post={post} /> : <BlogIndex />}
      <footer className="blog-page-footer section-dark">
        <div className="blog-page-frame">
          <span>YANG / NOTES</span>
          <a href="/">BACK TO THE MAIN FIELD <Arrow /></a>
        </div>
      </footer>
    </>
  )
}
