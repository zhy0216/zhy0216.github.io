import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  loadGithubRepositories,
  REPOSITORY_SNAPSHOT,
  REPOSITORY_SNAPSHOT_DATE,
} from './githubRepositories.js'

const FILTERS = [
  { key: 'all', label: 'ALL', match: () => true },
  { key: 'original', label: 'ORIGINAL', match: (repository) => !repository.fork },
  { key: 'forks', label: 'FORKS', match: (repository) => repository.fork },
  { key: 'archived', label: 'ARCHIVED', match: (repository) => repository.archived },
]

const formatDate = (value) => {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(value)).toUpperCase()
}

function RepositoryFieldScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const viewport = mount?.parentElement
    if (!mount || !viewport) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.Camera()
    camera.position.z = 1

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' })
    } catch {
      mount.classList.add('repository-field-scene--fallback')
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const columns = 76
    const rows = 42
    const positions = new Float32Array(columns * rows * 3)
    const phases = new Float32Array(columns * rows)
    let pointer = 0
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        positions[pointer * 3] = (column / (columns - 1)) * 2.12 - 1.06
        positions[pointer * 3 + 1] = (row / (rows - 1)) * 2.12 - 1.06
        positions[pointer * 3 + 2] = 0
        phases[pointer] = ((pointer * 47) % 101) / 101
        pointer += 1
      }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1 },
      uStrength: { value: 0 },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute float aPhase;
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uAspect;
        uniform float uStrength;
        varying float vEnergy;
        varying float vPhase;

        void main() {
          vec2 point = position.xy;
          vec2 delta = point - uPointer;
          vec2 measured = vec2(delta.x * uAspect, delta.y);
          float distanceToPointer = length(measured);
          float envelope = exp(-distanceToPointer * 5.2) * uStrength;
          float wave = sin(distanceToPointer * 39.0 - uTime * 3.0 + aPhase * 2.4) * envelope;
          vec2 direction = normalize(delta + vec2(0.0001));
          point += direction * wave * 0.035;
          vEnergy = envelope * (0.55 + wave * 0.45);
          vPhase = aPhase;
          gl_Position = vec4(point, 0.0, 1.0);
          gl_PointSize = 1.25 + envelope * 3.5 + aPhase * 0.55;
        }
      `,
      fragmentShader: `
        varying float vEnergy;
        varying float vPhase;

        void main() {
          vec2 centered = gl_PointCoord - 0.5;
          if (length(centered) > 0.5) discard;
          vec3 ink = vec3(0.025, 0.025, 0.025);
          vec3 blue = vec3(0.0, 0.067, 0.886);
          vec3 color = mix(ink, blue, clamp(vEnergy * 1.5 + vPhase * 0.08, 0.0, 1.0));
          float alpha = 0.16 + vEnergy * 0.62 + vPhase * 0.035;
          gl_FragColor = vec4(color, alpha);
        }
      `,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    const pointerTarget = new THREE.Vector2(0, 0)
    let strengthTarget = 0
    const onPointerMove = (event) => {
      const rect = viewport.getBoundingClientRect()
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      strengthTarget = 1
    }
    const onPointerEnter = () => { strengthTarget = 1 }
    const onPointerLeave = () => { strengthTarget = 0 }
    viewport.addEventListener('pointermove', onPointerMove, { passive: true })
    viewport.addEventListener('pointerenter', onPointerEnter)
    viewport.addEventListener('pointerleave', onPointerLeave)

    const resize = () => {
      const width = mount.clientWidth || 1
      const height = mount.clientHeight || 1
      renderer.setSize(width, height, false)
      uniforms.uAspect.value = width / height
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const clock = new THREE.Clock()
    let frame = 0
    let visible = true
    const render = () => {
      uniforms.uTime.value = clock.getElapsedTime()
      uniforms.uPointer.value.lerp(pointerTarget, reducedMotion ? 1 : 0.12)
      uniforms.uStrength.value += (strengthTarget - uniforms.uStrength.value) * (reducedMotion ? 1 : 0.08)
      renderer.render(scene, camera)
      if (!reducedMotion && visible) frame = requestAnimationFrame(render)
    }

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      const nextVisible = entry.isIntersecting
      if (nextVisible === visible) return
      visible = nextVisible
      if (visible && !reducedMotion) {
        clock.start()
        frame = requestAnimationFrame(render)
      } else {
        cancelAnimationFrame(frame)
      }
    }, { rootMargin: '180px' })
    visibilityObserver.observe(mount)
    render()

    return () => {
      cancelAnimationFrame(frame)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerenter', onPointerEnter)
      viewport.removeEventListener('pointerleave', onPointerLeave)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="repository-field-scene" aria-hidden="true" />
}

function FilterButton({ filter, active, count, onClick }) {
  return (
    <button className={active ? 'is-active' : ''} onClick={onClick} type="button">
      <span>{filter.label}</span>
      <b>{String(count).padStart(2, '0')}</b>
    </button>
  )
}

export default function RepositoryField() {
  const [repositories, setRepositories] = useState(REPOSITORY_SNAPSHOT)
  const [source, setSource] = useState('snapshot')
  const [filterKey, setFilterKey] = useState('all')
  const [activeName, setActiveName] = useState(null)
  const viewportRef = useRef(null)
  const cloudRef = useRef(null)
  const nodeRefs = useRef(new Map())
  const activeNameRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    loadGithubRepositories(controller.signal)
      .then((result) => {
        setRepositories(result.repositories)
        setSource(result.source)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setSource('snapshot')
      })
    return () => controller.abort()
  }, [])

  const filterCounts = useMemo(() => Object.fromEntries(
    FILTERS.map((filter) => [filter.key, repositories.filter(filter.match).length]),
  ), [repositories])

  const activeFilter = FILTERS.find((filter) => filter.key === filterKey) || FILTERS[0]
  const visibleRepositories = useMemo(
    () => repositories.filter(activeFilter.match),
    [activeFilter, repositories],
  )
  const repositoryIndices = useMemo(
    () => new Map(repositories.map((repository, index) => [repository.name, index + 1])),
    [repositories],
  )
  const activeRepository = repositories.find((repository) => repository.name === activeName) || null

  const years = repositories.map((repository) => Number(repository.createdAt?.slice(0, 4))).filter(Boolean)
  const yearRange = years.length ? `${Math.min(...years)}—${Math.max(...years)}` : '—'
  const languageCount = new Set(repositories.map((repository) => repository.language || 'Other')).size

  useEffect(() => {
    const viewport = viewportRef.current
    const cloud = cloudRef.current
    if (!viewport || !cloud || !window.matchMedia('(pointer: fine)').matches) return undefined

    let nodePositions = []
    let frame = 0
    let latestEvent = null

    const measure = () => {
      const viewportRect = viewport.getBoundingClientRect()
      nodePositions = [...nodeRefs.current.entries()].map(([name, node]) => {
        const rect = node.getBoundingClientRect()
        return {
          name,
          node,
          x: rect.left - viewportRect.left + rect.width / 2,
          y: rect.top - viewportRect.top + rect.height / 2,
        }
      })
    }

    const applyPointer = () => {
      frame = 0
      if (!latestEvent) return
      const rect = viewport.getBoundingClientRect()
      const x = latestEvent.clientX - rect.left
      const y = latestEvent.clientY - rect.top

      let closestName = null
      let closestDistance = 128
      nodePositions.forEach((item) => {
        const dx = item.x - x
        const dy = item.y - y
        const distance = Math.hypot(dx, dy)
        const heat = Math.max(0, 1 - distance / 220)
        item.node.style.setProperty('--heat', heat.toFixed(3))
        if (distance < closestDistance) {
          closestDistance = distance
          closestName = item.name
        }
      })

      if (closestName !== activeNameRef.current) {
        activeNameRef.current = closestName
        setActiveName(closestName)
      }
    }

    const onPointerMove = (event) => {
      latestEvent = event
      if (!frame) frame = requestAnimationFrame(applyPointer)
    }
    const onPointerEnter = () => {
      measure()
    }
    const onPointerLeave = () => {
      nodePositions.forEach((item) => item.node.style.setProperty('--heat', '0'))
      if (!viewport.contains(document.activeElement)) {
        activeNameRef.current = null
        setActiveName(null)
      }
    }

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(cloud)
    window.addEventListener('resize', measure)
    viewport.addEventListener('pointermove', onPointerMove, { passive: true })
    viewport.addEventListener('pointerenter', onPointerEnter)
    viewport.addEventListener('pointerleave', onPointerLeave)
    requestAnimationFrame(measure)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener('resize', measure)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerenter', onPointerEnter)
      viewport.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [visibleRepositories])

  const selectFilter = (key) => {
    setFilterKey(key)
    activeNameRef.current = null
    setActiveName(null)
  }

  const sourceLabel = source === 'live'
    ? 'LIVE / GITHUB API'
    : source === 'cache'
      ? 'SYNCED / LOCAL CACHE'
      : `SNAPSHOT / ${REPOSITORY_SNAPSHOT_DATE.replaceAll('-', '.')}`

  return (
    <div className="repository-shell">
      <div className="repository-toolbar">
        <div className="repository-signal"><i className={source === 'snapshot' ? '' : 'is-live'} /><span>{sourceLabel}</span></div>
        <div className="repository-filters" aria-label="Filter repositories">
          {FILTERS.map((filter) => (
            <FilterButton
              key={filter.key}
              filter={filter}
              active={filterKey === filter.key}
              count={filterCounts[filter.key]}
              onClick={() => selectFilter(filter.key)}
            />
          ))}
        </div>
      </div>

      <div ref={viewportRef} className="repository-viewport">
        <RepositoryFieldScene />
        <div ref={cloudRef} className="repository-cloud">
          {visibleRepositories.map((repository) => {
            const index = repositoryIndices.get(repository.name) || 0
            const lengthClass = repository.name.length > 31
              ? 'repository-node--very-long'
              : repository.name.length > 20
                ? 'repository-node--long'
                : repository.name.length < 7
                  ? 'repository-node--short'
                  : ''
            return (
              <a
                key={repository.name}
                ref={(node) => {
                  if (node) nodeRefs.current.set(repository.name, node)
                  else nodeRefs.current.delete(repository.name)
                }}
                className={`repository-node ${lengthClass} ${activeName === repository.name ? 'is-active' : ''}`}
                href={repository.url}
                target="_blank"
                rel="noreferrer"
                style={{ '--heat': 0 }}
                onPointerEnter={() => {
                  activeNameRef.current = repository.name
                  setActiveName(repository.name)
                }}
                onFocus={() => {
                  activeNameRef.current = repository.name
                  setActiveName(repository.name)
                }}
                onBlur={() => {
                  activeNameRef.current = null
                  setActiveName(null)
                }}
                aria-label={`Open ${repository.name} on GitHub`}
              >
                <span>{String(index).padStart(3, '0')}</span>
                <strong>{repository.name}</strong>
                <i className={repository.fork ? 'is-fork' : ''} aria-hidden="true" />
              </a>
            )
          })}
        </div>
        <span className="repository-axis repository-axis--x" aria-hidden="true" />
        <span className="repository-axis repository-axis--y" aria-hidden="true" />
      </div>

      <div className={`repository-readout ${activeRepository ? 'has-selection' : ''}`}>
        <div className="repository-readout-index">
          <span>{activeRepository ? String(repositoryIndices.get(activeRepository.name)).padStart(3, '0') : '000'}</span>
          <small>{activeRepository ? 'TARGET LOCKED' : 'FIELD READY'}</small>
        </div>
        <div className="repository-readout-main">
          <h3>{activeRepository?.name || 'Move through the field'}</h3>
          <p>{activeRepository?.description || (activeRepository ? 'No repository description — the code can speak for itself.' : 'Hover or focus a name to inspect its public GitHub metadata.')}</p>
        </div>
        <div className="repository-readout-meta">
          <div><span>TYPE</span><strong>{activeRepository ? (activeRepository.fork ? 'FORK' : 'ORIGINAL') : '—'}</strong></div>
          <div><span>LANGUAGE</span><strong>{activeRepository?.language || 'UNSPECIFIED'}</strong></div>
          <div><span>UPDATED</span><strong>{activeRepository ? formatDate(activeRepository.updatedAt) : '—'}</strong></div>
          <div><span>STARS</span><strong>{activeRepository?.stars ?? '—'}</strong></div>
        </div>
        <a
          className="repository-readout-link"
          href={activeRepository?.url || 'https://github.com/zhy0216?tab=repositories'}
          target="_blank"
          rel="noreferrer"
        >
          <span>{activeRepository ? 'OPEN REPOSITORY' : 'OPEN GITHUB INDEX'}</span>
          <b>↗</b>
        </a>
      </div>

      <div className="repository-baseline">
        <span>{String(repositories.length).padStart(3, '0')} PUBLIC REPOSITORIES</span>
        <span>{String(languageCount).padStart(2, '0')} LANGUAGE SIGNALS</span>
        <span>{yearRange} / STILL ACCUMULATING</span>
      </div>
    </div>
  )
}
