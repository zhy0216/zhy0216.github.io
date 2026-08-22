import React from 'react'

/**
 * Better Trigger mark: a single lightning bolt, no tile or frame, so it can
 * sit directly on the page or card surface. The SVG stays inline so the mark
 * can inherit the surrounding composition's scale and participate in the
 * small homepage motion system.
 * Gradient IDs are prefixed to avoid colliding with other inline SVG defs.
 */
export default function BetterTriggerMark({ className = '' }) {
  return (
    <svg
      className={`better-trigger-mark ${className}`.trim()}
      viewBox="0 0 96 96"
      role="img"
      aria-label="Better Trigger logo"
    >
      <defs>
        <linearGradient id="bt-bolt" x1="39" y1="14" x2="58" y2="83" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EAEAFF" />
        </linearGradient>
        <filter id="bt-bolt-shadow" x="-25%" y="-20%" width="150%" height="155%" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#171735" floodOpacity="0.3" />
        </filter>
      </defs>

      <path d="M55 12L25 49H45L40 84L72 39H52L55 12Z" fill="url(#bt-bolt)" filter="url(#bt-bolt-shadow)" />
    </svg>
  )
}
