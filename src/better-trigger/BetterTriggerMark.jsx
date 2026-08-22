import React from 'react'

/**
 * Better Trigger mark: a durable step rail, a trigger head, and a replay loop.
 * The SVG stays inline so the mark can inherit the surrounding composition's
 * scale and participate in the small homepage motion system.
 */
export default function BetterTriggerMark({ className = '' }) {
  return (
    <svg
      className={`better-trigger-mark ${className}`.trim()}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Better Trigger logo"
    >
      <rect width="64" height="64" fill="#0011e2" />
      <path d="M16 14v36" fill="none" stroke="#f4f4f0" strokeWidth="2.5" />
      <path d="M16 16h10M16 32h7M16 48h10" fill="none" stroke="#f4f4f0" strokeWidth="2" opacity=".7" />
      <path d="M26 15 48 32 26 49Z" fill="#f4f4f0" />
      <path d="m31 23 11 9-11 9Z" fill="#0011e2" />
      <path d="M48 17c5 4 8 9 8 15s-3 11-8 15" fill="none" stroke="#f4f4f0" strokeWidth="2" opacity=".55" />
      <path d="M48 47v-6h6" fill="none" stroke="#f4f4f0" strokeWidth="2" opacity=".55" />
    </svg>
  )
}
