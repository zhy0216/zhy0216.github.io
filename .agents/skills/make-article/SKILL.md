---
name: make-article
description: "Create or revise researched English articles for this portfolio's Markdown blog. Use when the user asks to turn a topic, research, notes, or the current conversation into a post under blogs/, or to refine an existing blog article. Do not use for project case-study pages under work/ or generic documentation outside the blog."
---

# Make Article

Turn research, notes, or conversation context into a clear, technically credible English article that fits this portfolio's existing blog.

## Establish the blog contract

- Run `git status --short` first and preserve unrelated or pre-existing changes.
- Inspect `blogs/`, `src/blogs.js`, `src/blog/BlogPage.jsx`, `src/index.css`, and `package.json` when the current repository state is not already known.
- Treat Markdown files in `blogs/*.md` as the source of truth. The existing Vite glob discovers new posts automatically; do not add an article registry unless the implementation has changed.
- Use a lowercase kebab-case filename derived from the subject, for example `blogs/postgresql-speculative-insertion.md`.
- Follow the existing front matter shape:

```yaml
---
title: "Article title"
date: "YYYY-MM-DD"
excerpt: "A concise one-sentence description."
tags: ["TAG ONE", "TAG TWO"]
---
```

Use the current local date unless the user supplies a publication date. Keep the excerpt compact enough for the blog card and use a small set of uppercase tags.

When a post has title artwork, extend the front matter with the existing optional fields:

```yaml
background: "/blog/<slug>-bg.webp"
backgroundPosition: "center center"
```

Keep the asset under `public/blog/` so the built site owns the file rather than depending on a generated-media URL.

## Research before writing

- If the user asks to search, the subject can have changed, or precise technical accuracy matters, research before drafting.
- Prefer primary sources: official documentation, specifications, release notes, source code, commit history, or research papers. For technical questions, do not base important claims on secondary summaries when a primary source is available.
- Separate documented behavior from interpretation. Do not invent implementation details, guarantees, performance results, or operational advice.
- When the article explains internals, inspect enough source to understand the end-to-end control flow rather than extrapolating from a single function or comment.

## Shape the article

- Write in English unless the user asks for another language.
- Sound knowledgeable, patient, and modest. Explain difficult details confidently without presenting uncertain inferences as facts.
- Lead with the misconception, problem, or useful mental model that makes the topic worth understanding.
- Build a coherent progression suited to the subject. A technical article often benefits from: motivation, mental model, mechanism, concrete example, boundaries, and a concise takeaway. Do not force these headings when a different structure reads better.
- Use examples, SQL, code, or compact text diagrams only when they clarify the mechanism.
- Define specialized terms on first use. Preserve exact product and API names in code formatting.
- Favor readable prose over a source-code walkthrough. Mention relevant internals such as execution stages, tuple state, locks, indexes, or function roles when they materially explain behavior, but do not annotate every source-level statement with an inline citation.

## Handle citations and acknowledgements

- Use inline links sparingly for public behavior, version history, or claims where a reader benefits from immediate verification.
- Do not attach source links to every low-level implementation detail. Keep those explanations natural and collect useful primary references in a final `## Further reading` section instead.
- A typical Further reading list contains three to six authoritative links. Source-code links are welcome there when the article discusses internals.
- Respect the user's requested acknowledgement wording and placement. When asked to disclose Codex assistance, end the article with:

```markdown
This article was completed with the help of Codex.
```

Place the acknowledgement after `Further reading` so it remains the final sentence.

## Add title artwork when requested

- Treat article artwork as an optional editorial hero, not as decoration that must accompany every post. Generate it when the user asks for artwork or the agreed deliverable includes it; do not let image generation block an otherwise complete article.
- Stabilize the article's title, excerpt, central mechanism, and visual metaphor before prompting. Derive the scene from what the article actually explains rather than using a generic technology image.
- Prefer a wide `16:9` composition. Because article copy sits on the left, ask for dark negative space there and concentrate visual energy toward the right side and edges. Keep the scene restrained enough to work under a readability overlay.
- Ask for no words, letters, numbers, logos, watermarks, readable UI, or literal product branding unless the user explicitly needs them. Abstract technical forms, materials, paths, nodes, layers, or physical metaphors usually age better than a screenshot-like composition.
- Match the site's graphite, cobalt, periwinkle, and paper palette unless the article calls for a different established visual language. The artwork should support the title, not compete with it.
- When the user requests `genmedia` with Nano Banana Pro and the CLI is available, a suitable project-bound invocation is:

```bash
genmedia run fal-ai/nano-banana-pro \
  --prompt "<production prompt>" \
  --aspect_ratio 16:9 \
  --resolution 2K \
  --output_format webp \
  --num_images 1 \
  --limit_generations true \
  --download "public/blog/<slug>-bg.{ext}"
```

- Inspect the generated file before wiring it in. Reject or revise images with accidental text, weak title-space contrast, an important subject under the copy, excessive clutter, or a crop that fails at narrower widths.
- Use the front matter fields above to connect the selected asset. Tune `backgroundPosition` for the subject and responsive crop instead of modifying the image path or creating one-off markup.
- Keep the image confined to `.blog-article-hero` by default. Do not let it bleed into `.blog-article-body`, change the paper background, or appear on index cards unless the user explicitly requests those treatments. Preserve a dark gradient behind the title and excerpt so text remains legible.
- Prefer WebP and check the final dimensions and file size. Optimize unusually heavy assets without visibly degrading the hero.

## Edit carefully

- When revising an existing article, preserve approved content and change only what the user requested. For example, removing inline source annotations does not imply deleting a useful Further reading section.
- Keep Markdown compatible with `marked` and the styles already provided by `.markdown-body`.
- Check balanced backticks, links, fenced code blocks, heading hierarchy, and front matter quoting.
- Reuse the existing front-matter hero-image contract for artwork. Avoid custom components, blog-loader changes, or body-level image styling unless the article genuinely requires them or the user asks for them.

## Verify and hand off

- Run `npm run build` and confirm the article is present in the generated blog bundle or preview.
- Run `git diff --check` and review the article diff for accidental edits.
- If visual inspection is warranted, preview `/blog/?post=<slug>` at desktop and mobile widths and check long titles, hero-image cropping and readability, an unaffected paper-backed body, code overflow, lists, links, and the final acknowledgement.
- Report the article path, route, major editorial choices, and verification result. For generated artwork, also report the saved asset path, generator/model, and final prompt. Mention unresolved factual uncertainty or omitted claims rather than filling gaps with guesses.
