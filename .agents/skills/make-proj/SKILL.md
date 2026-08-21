---
name: make-proj
description: "Create or revise a project detail/case-study page in this portfolio from a local source repository. Use when the user asks to turn one of their projects into a page under /work/, add it to the homepage, or give an existing project page the site's editorial and Three.js visual treatment. Do not use for unrelated pages or generic project documentation."
---

# Make Project Page

Turn a real local project into a polished, evidence-based case-study page that is fully integrated with this portfolio.

## Inputs

Obtain or infer:

- the source project's local path;
- an optional slug, title, preferred visual idea, and links;
- whether the user wants a new page or a revision.

Derive the slug from the source directory when it is unambiguous. Ask only when a missing choice would materially change the result. Never modify the source project.

## Workflow

1. Establish the portfolio baseline.
   - Run `git status --short` and preserve all unrelated or pre-existing changes.
   - Inspect `package.json`, `vite.config.js`, `src/App.jsx`, `src/index.css`, and existing `src/<slug>/` plus `work/<slug>/` pages.
   - Treat the Zebra page as a structural reference, not a template to copy blindly.

2. Mine verifiable project facts.
   - Inspect the source repository's README, manifests, docs, examples, tests, changelog, public assets, git remote, and recent history.
   - Use `rg --files` and targeted `rg`; skip dependencies and generated output.
   - Record the project's purpose, audience, stack, differentiators, architecture, status, license, URLs, and any defensible metrics.
   - Never invent adoption, performance, responsibilities, or outcomes. Omit unsupported claims or label them clearly as placeholders.

3. Build a project-specific story.
   - Choose only sections supported by the project: premise/problem, principles, flow/architecture, product or code details, evidence, tradeoffs, current state, and next steps.
   - Use a visual metaphor tied to how the project works. Do not reuse a generic orb, stripe field, or layout merely because another page has one.
   - Keep Chinese and English copy concise, intentional, and easy to scan.

4. Implement the multi-page route.
   - Add `work/<slug>/index.html`.
   - Add `src/<slug>/main.jsx`, `src/<slug>/<ProjectName>Page.jsx`, and `src/<slug>/<slug>.css`.
   - Register the HTML entry in `vite.config.js` under `build.rollupOptions.input`.
   - Add or update the project in `PROJECTS` in `src/App.jsx`, including a real `href: '/work/<slug>/'`.
   - Add a distinct `ProjectArt` variant and its CSS when the homepage card needs new artwork.
   - Reuse the site's base styles and fonts where practical instead of duplicating them.

5. Apply the visual contract.
   - Use `#0011e2` as the primary accent with black/near-black and paper-white surfaces.
   - Preserve the editorial grid, thin rules, restrained monospace labels, sharp geometry, and generous whitespace.
   - Avoid gratuitous rounded cards, glossy gradients, and generic dashboard layouts.
   - Organize copy into a deliberate grid with controlled line lengths and clear hierarchy.
   - Whenever text overlaps a moving canvas or animated background, place a black translucent or gradient overlay between the motion and text. Use a horizontal fade on desktop and a vertical fade on narrow screens, then verify contrast while the animation is moving.

6. Make motion robust.
   - Use Three.js only when it materially supports the project's concept.
   - Cap pixel ratio, handle resize, support `prefers-reduced-motion`, and provide a static CSS fallback.
   - Cancel animation frames and remove listeners on unmount.
   - Dispose renderer, geometries, materials, textures, and other GPU resources.
   - Keep decorative canvases non-interactive unless interaction is intentional and accessible.

7. Make the page responsive and accessible.
   - Check wide desktop, tablet, and narrow mobile layouts.
   - Ensure titles do not clip, body copy remains readable, CTAs are reachable, and no horizontal overflow appears.
   - Preserve semantic headings, visible focus states, useful link labels, and appropriate `aria-hidden` treatment for decoration.
   - Give external links `target="_blank"` and `rel="noreferrer"` when opening a new tab.

8. Verify before handoff.
   - Run `npm run build` and confirm `dist/work/<slug>/index.html` exists.
   - Run `git diff --check`.
   - Preview locally and inspect the homepage plus project page at desktop and mobile sizes.
   - Check browser console errors, link targets, canvas count, layout overflow, text contrast, reduced motion, and page cleanup.
   - Source-project tests are optional and read-only. If an unrelated existing failure appears, report it precisely and do not repair the source repository without permission.

Read [references/project-page-playbook.md](references/project-page-playbook.md) before creating or substantially restructuring a page. It contains the evidence sheet, page anatomy, implementation map, and acceptance checklist for this repository.

## Handoff

Report:

- the finished route and major files;
- which source facts and assets shaped the page;
- build and visual verification results;
- any omitted claims, placeholders, or decisions that still need the user's input.
