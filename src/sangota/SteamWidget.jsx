import React, { useLayoutEffect, useRef, useState } from 'react'
import { STEAM_WIDGET_URL } from './links.js'
import './steam-widget.css'

const MIN_WIDGET_WIDTH = 360

export default function SteamWidget() {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const container = containerRef.current
    const updateScale = () => {
      setScale(Math.min(1, container.getBoundingClientRect().width / MIN_WIDGET_WIDTH))
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="steam-widget"
      ref={containerRef}
      style={{ '--steam-widget-scale': scale, '--steam-widget-min-width': `${MIN_WIDGET_WIDTH}px` }}
    >
      <iframe
        src={STEAM_WIDGET_URL}
        title="Three Kingdoms: Spire of War on Steam"
        width="646"
        height="190"
        loading="lazy"
      />
    </div>
  )
}
