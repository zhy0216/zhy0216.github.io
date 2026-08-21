# Project Page Playbook

Use this playbook for new project pages and substantial redesigns in this repository.

## 1. Evidence sheet

Before writing page copy, collect a compact fact sheet from the source repository.

| Field | Preferred evidence |
| --- | --- |
| Name and one-line purpose | README and package metadata |
| Audience or use case | README, docs, examples |
| Language and stack | manifests, lockfiles, source tree |
| Core differentiators | implementation, docs, tests |
| Architecture or request flow | source modules, diagrams, examples |
| Status and license | README, manifest, LICENSE |
| GitHub and docs URLs | git remote and verified project links |
| Metrics | committed benchmark output, test inventory, or reproducible counts |
| Visual assets | repository-owned screenshots, logos, diagrams, demos |

Rules:

- Prefer primary repository evidence over memory or marketing language.
- Distinguish a measured benchmark from an estimate or design target.
- Do not turn file counts, commit counts, or dependency counts into significance claims.
- If the source repository and its README disagree, describe the discrepancy or use the implementation as the current state.
- Do not edit the source repository while researching it.

Useful read-only checks include:

```sh
git -C <source-path> status --short
git -C <source-path> remote -v
git -C <source-path> log -5 --oneline
rg --files <source-path> -g '!node_modules' -g '!dist' -g '!build'
```

## 2. Narrative design

Start from the clearest story the evidence supports. A technical framework may need a system flow; a visual product may need interaction states; a small experiment may only need premise, process, result, and reflection.

A useful page anatomy is:

1. Hero: project name, sharp one-liner, role/stack/status, and verified links.
2. Premise: the problem or constraint that made the project worth building.
3. Principles: three to five decisions that reveal the project's character.
4. System: architecture, request flow, workflow, or interaction model when relevant.
5. Artifact: real screenshots, code, diagrams, demos, or a code-native visualization.
6. Evidence: tests, benchmarks, shipped capabilities, or other defensible proof.
7. Tradeoffs: engineering or product choices and what they cost.
8. Current state: what exists now and what remains.
9. Outro: repository/docs CTA and a route back to the portfolio.

Do not force every section onto every project. Give each section one job and avoid repeating the hero copy lower on the page.

## 3. Visual direction

The current portfolio language is editorial and technical:

- accent: `#0011e2`;
- surfaces: near-black and warm paper white;
- typography: Manrope for display/body and DM Mono for labels/data;
- structure: hairline rules, visible grid logic, asymmetry, and large type;
- shape: mostly square edges with very restrained shadows;
- motion: purposeful, atmospheric, and tied to the project concept.

For copy placed beside or above motion:

```css
.hero-copy {
  position: relative;
  z-index: 3;
  isolation: isolate;
}

.hero-copy::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: -2rem -5rem -3rem -2rem;
  background: linear-gradient(90deg, rgba(7, 7, 7, .96), rgba(7, 7, 7, .72) 60%, transparent);
  pointer-events: none;
}
```

On mobile, change the fade direction to vertical so the copy remains readable above the repositioned animation. Also consider a second overlay on the canvas wrapper; opacity must be judged while the scene moves, not from a still frame.

Avoid fabricated product screenshots. Prefer repository-owned assets, a faithful code/architecture diagram, or an abstract Three.js treatment derived from the project's actual behavior.

## 4. Repository integration map

For a slug named `example`:

```text
work/example/index.html          Vite HTML entry and metadata
src/example/main.jsx             React mount point
src/example/ExamplePage.jsx      Page content and behavior
src/example/example.css          Page-specific styling
src/App.jsx                      Homepage project data and artwork
vite.config.js                   Multi-page build input
```

Use `/work/example/` for the homepage link. This repository is a user GitHub Pages site with Vite `base: '/'`; if deployment changes to a project subpath, revisit all root-relative URLs and the Vite base together.

The existing Zebra implementation is useful for locating responsibilities:

- `work/zebra/index.html` shows the HTML entry pattern.
- `src/zebra/main.jsx` shows the mount pattern.
- `src/zebra/ZebraPage.jsx` shows component ownership and Three.js lifecycle.
- `src/zebra/zebra.css` shows the page-level responsive structure.
- `vite.config.js` shows multi-page registration.
- `src/App.jsx` shows homepage project data and `ProjectArt` variants.

Reuse conventions, not Zebra-specific wording, stripes, section order, or visual geometry.

## 5. Three.js implementation checklist

- Keep the canvas inside a bounded wrapper and size from that wrapper.
- Use `Math.min(window.devicePixelRatio, 1.5-2)` rather than uncapped DPR.
- Pause or simplify animation for reduced-motion users and when practical while offscreen.
- Use pointer movement only as progressive enhancement.
- Store the animation frame ID and cancel it during cleanup.
- Remove window, pointer, and observer listeners during cleanup.
- Dispose geometries, materials, textures, render targets, and the renderer.
- Avoid allocating new vectors, materials, or geometries inside every frame.
- Ensure the page remains understandable if WebGL fails or JavaScript is delayed.

## 6. Copy and layout checks

- The hero title should have intentional line breaks at desktop and mobile widths.
- Keep primary descriptive copy around 40-65 characters per line where possible.
- Put metadata in a consistent grid instead of scattering small labels across the scene.
- Use bilingual copy only when each language adds value; avoid literal duplication.
- Use numerals only when their source is defensible and their meaning is clear.
- Keep buttons and inline links visually distinct from decorative labels.
- Check that animated backgrounds never reduce text contrast below a comfortable reading level.

## 7. Acceptance checklist

### Content

- All factual claims can be traced to the source repository or user input.
- The page communicates why the project exists before explaining implementation detail.
- Links are real, current, and labeled clearly.
- No placeholder copy remains unless explicitly called out.

### Integration

- Homepage card opens `/work/<slug>/`.
- Vite has a named multi-page input.
- The production build contains `dist/work/<slug>/index.html`.
- Page metadata has an accurate title and description.

### Visual quality

- `#0011e2` is the accent rather than purple.
- Text over motion has a black translucent/gradient buffer.
- Desktop and mobile compositions both feel intentional.
- There is no unexpected horizontal scrolling, title clipping, or collision with navigation.
- Motion has a project-specific idea and a static/reduced-motion state.

### Engineering

- `npm run build` succeeds.
- `git diff --check` succeeds.
- No new console errors appear on the homepage or detail page.
- Three.js resources and event listeners are cleaned up.
- Existing user changes and source-project files remain untouched.

