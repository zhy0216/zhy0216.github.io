---
title: "CSS z-index Is a Tree, Not a Number"
date: "2026-08-25"
excerpt: "Why an enormous z-index can still lose, and how stacking contexts actually decide what appears on top."
tags: ["CSS", "LAYOUT", "BROWSER RENDERING"]
---

Sooner or later, every frontend developer writes something like this:

```css
.tooltip {
    position: absolute;
    z-index: 999999;
}
```

And somehow the tooltip is still behind a header, a modal, or an unrelated card.

The usual reaction is to add another nine. That occasionally changes the result, but it does not fix the mental model. The browser does not collect every element on the page, sort them by `z-index`, and paint the largest number last.

`z-index` is local. It is interpreted inside a hierarchy of **stacking contexts**, and each stacking context is treated as one atomic unit by its parent.

The useful sentence to remember is:

> `z-index` is a stack level inside a stacking context, not a global priority score.

Once that is clear, most “z-index is broken” bugs become tree problems rather than number problems.

## What `z-index` actually controls

For a positioned box, `z-index` answers two related questions:

1. At what stack level does this box participate in its current stacking context?
2. Does this box create a new stacking context for its descendants?

An integer such as `z-index: 3` assigns stack level `3` in the current context and creates a new context. Descendants are then arranged inside that new context.

The keyword `auto` is subtler. For a relatively or absolutely positioned box, it behaves at stack level `0` but normally does **not** create a new stacking context. Its positioned descendants can continue participating in the current context.

There are important exceptions:

- `position: fixed` and `position: sticky` create stacking contexts even when `z-index` is `auto`.
- [Flex items](https://www.w3.org/TR/css-flexbox-1/#painting) and [grid items](https://www.w3.org/TR/css-grid-2/#z-order) with a non-`auto` `z-index` create stacking contexts even when their `position` is `static`.
- Other CSS properties can create stacking contexts without using `z-index` at all.

This is why “just set `position: relative`” is incomplete advice. Positioning may make `z-index` applicable, but the result still depends on the surrounding context tree.

## Why `999999` can lose to `2`

Consider a page with a header and a content area:

```html
<header class="site-header">
    Header
</header>

<main class="content">
    <article class="card">
        Card
        <div class="tooltip">Tooltip</div>
    </article>
</main>
```

```css
.site-header {
    position: relative;
    z-index: 2;
}

.content {
    position: relative;
    z-index: 1;
}

.tooltip {
    position: absolute;
    z-index: 999999;
}
```

The stacking-context tree looks like this:

```text
root stacking context
├── .content       z-index: 1
│   └── .tooltip   z-index: 999999
└── .site-header   z-index: 2
```

The root context compares `.content` with `.site-header`. The header wins because `2` is above `1`.

Only after the browser paints the `.content` context does `999999` matter, and it matters only among things inside that context. The tooltip cannot escape its parent and compete directly with the header.

The specification describes a stacking context as **atomic** from its parent's point of view. Content from another stacking context cannot be inserted between its descendants. You can rearrange every room inside a building, but that does not move the building to another street.

The correct fix therefore lives at the context boundary. Depending on the design, that might mean:

- removing an unnecessary stacking context from `.content`;
- changing the relative order of `.content` and `.site-header`;
- rendering the tooltip in a shared overlay container closer to the root; or
- using a browser top-layer feature such as a popover when its semantics fit.

Increasing the tooltip's number cannot solve an ordering decision already made one level above it.

## Stacking is also a paint-order problem

Even inside one stacking context, the browser does more than sort integers. CSS defines a painting order with several phases.

A simplified back-to-front version is:

1. the background and border of the element that created the context;
2. child stacking contexts with negative stack levels;
3. in-flow, non-positioned block content;
4. non-positioned floats;
5. in-flow inline content;
6. positioned descendants at `auto` or `0`;
7. child stacking contexts with positive stack levels.

The full algorithm has more detail, especially for inline boxes, tables, outlines, and newer layout models. The important point is that `z-index` participates in a painting system; it is not an instruction that means “paint this above everything.”

When two comparable boxes have the same stack level, tree order usually breaks the tie: the later box is painted later. Flexbox and Grid use their `order`-modified order in the places defined by those layout specifications.

This also explains why the following rule normally does nothing:

```css
.ordinary-card {
    z-index: 10;
}
```

An ordinary `position: static` block is not made stackable merely by receiving a number. It needs to be a positioned box, or one of the flex/grid item exceptions.

## The properties that silently create new worlds

Many difficult bugs are caused not by the element being overlaid, but by an ancestor that unexpectedly created a stacking context.

Common triggers include:

- the root element;
- `position: relative` or `absolute` with a non-`auto` `z-index`;
- `position: fixed` or `sticky`;
- a flex or grid item with a non-`auto` `z-index`;
- `opacity` below `1`;
- a `transform` other than `none`;
- a `filter` other than `none`;
- `mix-blend-mode` other than `normal`;
- `isolation: isolate`;
- layout or paint containment, such as `contain: layout` or `contain: paint`;
- `will-change` naming a property that would create a stacking context.

This is not an exhaustive list. Features involving masking, `clip-path`, perspective, and other compositing effects can also affect stacking.

The surprising cases are often declarations added for another reason:

```css
.card {
    transform: translateZ(0);
}

.faded-panel {
    opacity: 0.999;
}

.animated-shell {
    will-change: transform;
}
```

Each can change how descendants compete with the rest of the page. The visual effect may be tiny or currently invisible, but the structural effect on painting is real.

This grouping is necessary. For example, an element with `opacity: 0.5` is composited as a group with its children. Allowing an outside element to appear halfway between the parent's background and one of its descendants would make that group opacity incoherent.

## `auto` and `0` are not interchangeable

This distinction is small in syntax and large in consequences.

Assuming no other property creates a stacking context:

```css
.wrapper {
    position: relative;
    z-index: auto;
}
```

The wrapper participates at stack level `0`, but it does not establish a new context. Its positioned descendants and descendant stacking contexts can participate in the wrapper's parent context.

Change one token:

```css
.wrapper {
    position: relative;
    z-index: 0;
}
```

Now the wrapper creates a stacking context. Its descendants are trapped inside that atomic unit.

Both versions may look identical until a descendant overlaps something outside the wrapper. That makes `z-index: 0` a useful tool when you deliberately want isolation, and a subtle bug when it was added casually.

## Negative `z-index` does not mean “behind the page”

A negative value moves a positioned stacking context into the negative phase of its **current** context. It does not escape that context in the opposite direction.

The background and border of the element forming a stacking context are painted before its negative child contexts. Therefore, a negative child still cannot tunnel behind that context's own background.

It may appear behind ordinary content within the context, which is useful for decorative layers:

```css
.hero {
    position: relative;
    z-index: 0;
}

.hero::before {
    content: "";
    position: absolute;
    inset: -2rem;
    z-index: -1;
    background: radial-gradient(circle, royalblue, transparent 70%);
}
```

Here `z-index: 0` on `.hero` is intentional. It creates a local context so the decorative pseudo-element sits behind the hero's content without disappearing behind unrelated parts of the page.

## Stacking cannot defeat clipping

Stacking order and clipping are separate questions.

An element may have the winning stack level and still be cut off by an ancestor's `overflow`, clip path, or mask. Raising `z-index` does not let a normal descendant ignore its ancestor's clipping region.

Conversely, `overflow: hidden` does not by itself create a stacking context. It can produce a bug that looks like a stacking failure while the actual problem is clipping.

When an overlay is missing, ask two questions:

1. Is it painted behind something?
2. Is it painted, but clipped before I can see it?

Those failures need different fixes.

## The top layer is outside the normal contest

Some interface elements must reliably appear above the document, regardless of transforms, clipping, or nested stacking contexts. Browsers provide a separate structure for this: the **top layer**.

Modal dialogs opened with `showModal()`, popovers, and fullscreen elements can be placed in the top layer. A top-layer element is rendered as if it were a sibling of the root, creates its own stacking context, and is not clipped or obscured by ordinary document ancestors. Top-layer entries are painted in their top-layer order, with the last one on top.

Its `::backdrop` is also placed in the top layer, directly below the element it belongs to.

This leads to another important rule:

> No ordinary document `z-index` can rise above a top-layer element.

If a custom tooltip must appear over a modal dialog, `z-index: 2147483647` is not a reliable architecture. The tooltip must participate in the appropriate top-layer UI, or be rendered within the relevant top-layer element.

The top layer is managed through browser APIs rather than by setting a special CSS number. That is a feature: it gives components such as dialogs and popovers an escape hatch from accidental ancestor behavior.

## A stacking context is not a GPU layer

The terms are often mixed together because properties such as `transform` and `will-change` can influence both.

A stacking context is part of CSS's specified painting behavior. It determines which content may interleave on the z-axis.

A compositor or GPU layer is a browser implementation choice used to render and animate efficiently. Browsers may promote or merge content as their strategies change. There is no dependable one-to-one mapping between compositor layers and stacking contexts.

Treat stacking contexts as page semantics and compositor layers as an optimization detail.

## How to debug a z-index problem

When a large number fails, stop editing the number and trace the tree.

### 1. Verify that `z-index` applies

Check the computed `position`. For an ordinary element, it generally needs to be positioned. If it is a flex or grid item, remember the explicit exception.

### 2. Find every stacking-context ancestor

Walk upward from each overlapping element. Look for computed `z-index`, `position`, `opacity`, `transform`, `filter`, `isolation`, containment, blending, and `will-change`.

Do this for both elements. The relevant cause is frequently several ancestors away.

### 3. Find the first shared context

Write the two ancestor paths as small trees. At their nearest shared stacking context, identify the first child context on each path.

Those are the boxes that actually compete. Compare their paint phase, stack level, and tie-breaking order—not the numbers on deeply nested descendants.

### 4. Check for clipping and the top layer

If the stack comparison says the element should win, inspect `overflow`, masks, and clip paths. Also check whether the other element is a modal dialog, popover, fullscreen element, or another top-layer entry.

### 5. Fix the boundary that made the decision

Remove an accidental context, reorder sibling contexts, choose a deliberate overlay root, or use a top-layer primitive. Keep local `z-index` values small enough that their relationships remain readable.

A design-system scale such as `dropdown: 20`, `toast: 30`, and `modal: 40` can still be useful, but only when those elements participate in the same intended context. Tokens organize numbers; they do not flatten the tree.

## The mental model to keep

When two elements overlap, do not begin with:

> Which element has the larger `z-index`?

Begin with:

> Which stacking contexts contain them, and where do those contexts first compete?

Then remember:

- stack levels are local;
- stacking contexts are atomic;
- paint phases matter;
- `auto` and `0` can build different trees;
- transforms, opacity, containment, and other properties can create contexts unexpectedly;
- clipping is not stacking;
- the top layer is outside ordinary document stacking.

`z-index` is not broken when `999999` loses to `2`. The browser is comparing a different pair of boxes than the developer is.

Once you draw the stacking-context tree, the numbers usually become the least interesting part of the bug.

## Further reading

- [CSS 2.2: Layered presentation](https://www.w3.org/TR/CSS22/visuren.html#layers)
- [CSS 2.2 Appendix E: Elaborate description of stacking contexts](https://www.w3.org/TR/CSS22/zindex.html)
- [CSS Positioned Layout Level 3: Painting order and stacking contexts](https://drafts.csswg.org/css-position-3/#stacking)
- [CSS Color Level 4: Transparency and `opacity`](https://www.w3.org/TR/css-color-4/#transparency)
- [CSS Transforms Level 1: Transform rendering model](https://www.w3.org/TR/css-transforms-1/#transform-rendering)
- [CSS Positioned Layout Level 4: The top layer](https://drafts.csswg.org/css-position-4/#top-layer)
