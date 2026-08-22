import React, { useMemo } from 'react'

// Keep the address out of the initial HTML and out of simple mailto harvesters.
// The browser reconstructs it only when the React bundle runs.
const EMAIL_USER = 'emh5MDIxNg=='
const EMAIL_HOST = 'Z21haWwuY29t'

function decode(value) {
  if (typeof window === 'undefined' || typeof window.atob !== 'function') return ''
  try {
    return window.atob(value)
  } catch {
    return ''
  }
}

export function getProtectedEmail() {
  const user = decode(EMAIL_USER)
  const host = decode(EMAIL_HOST)
  return user && host ? `${user}@${host}` : ''
}

/**
 * An email action whose address is not present in the initial document.
 * Use `showAddress` when the address itself should be visible to visitors.
 */
export default function ProtectedEmail({
  as = 'button',
  className = '',
  children,
  showAddress = false,
  onClick,
  ...rest
}) {
  const email = useMemo(() => getProtectedEmail(), [])
  const Element = as

  const handleClick = (event) => {
    onClick?.(event)
    if (event.defaultPrevented || !email) return
    if (as === 'a') event.preventDefault()
    window.location.assign(`mailto:${email}`)
  }

  return (
    <Element
      {...rest}
      {...(as === 'button' ? { type: 'button' } : { href: '#' })}
      className={className}
      onClick={handleClick}
    >
      {children || (showAddress ? email : 'EMAIL')}
    </Element>
  )
}
