import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import RepositoryField from './RepositoryField.jsx'
import BetterTriggerMark from './better-trigger/BetterTriggerMark.jsx'

const NAV_ITEMS = [
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'lab', label: 'Lab' },
]

const PROJECTS = [
  {
    number: '01',
    title: 'ZEBRA',
    type: 'OPEN SOURCE FRAMEWORK · 2026',
    description: 'A Bun-first TypeScript web framework with first-class dependency injection',
    tags: ['Bun', 'TypeScript', 'Open source'],
    variant: 'zebra',
    href: '/work/zebra/',
  },
  {
    number: '02',
    title: 'STARWRECK',
    type: 'SPACE-SURVIVAL ROGUELITE · 2026',
    description: 'Weld a warship tile by tile, turn into the swarm, and bring a custom broadside to bear',
    tags: ['TypeScript', 'PixiJS', 'Electron'],
    variant: 'starwreck',
    href: '/work/starwreck/',
  },
  {
    number: '03',
    title: 'BETTER-TRIGGER',
    type: 'OPEN SOURCE · DURABLE EXECUTION · 2026',
    description: 'A TypeScript runtime that replays memoized steps across waits and crashes, backed by Postgres',
    tags: ['TypeScript', 'PostgreSQL', 'Replay runtime'],
    variant: 'trigger',
    href: '/work/better-trigger/',
  },
]

const Arrow = ({ diagonal = true }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="arrow-icon">
    {diagonal ? <path d="M3 13 13 3M5 3h8v8" /> : <path d="M2 8h11M9 4l4 4-4 4" />}
  </svg>
)

function SectionLabel({ children, light = false }) {
  return <span className={`section-label ${light ? 'section-label--light' : ''}`}>{children}</span>
}

function OutlineButton({ children, href = '#', light = false }) {
  return (
    <a className={`outline-button ${light ? 'outline-button--light' : ''}`} href={href}>
      <span>{children}</span>
      <Arrow />
    </a>
  )
}

function SolidButton({ children, href = '#', light = false }) {
  return (
    <a className={`solid-button ${light ? 'solid-button--light' : ''}`} href={href}>
      <span>{children}</span>
      <Arrow />
    </a>
  )
}

function OrbitalScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 0.15, 9.2)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      mount.classList.add('orbital-scene--fallback')
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const root = new THREE.Group()
    root.rotation.set(0.1, -0.25, -0.08)
    scene.add(root)

    const ambient = new THREE.AmbientLight(0x3a4cff, 2.2)
    scene.add(ambient)
    const sunLight = new THREE.PointLight(0x9fb0ff, 108, 0, 2)
    sunLight.position.set(0, 2.3, -0.7)
    scene.add(sunLight)
    const lightB = new THREE.PointLight(0xe6ebff, 32, 0, 2)
    lightB.position.set(-2.2, -0.9, -1.6)
    root.add(lightB)

    const sunGroup = new THREE.Group()
    sunGroup.position.set(0, 2.3, 0.9)
    scene.add(sunGroup)

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.5, 2),
      new THREE.MeshStandardMaterial({
        color: 0x0a1ee8, emissive: 0x0011e2, emissiveIntensity: 0.9,
        wireframe: true, transparent: true, opacity: 0.42, roughness: 0.5, metalness: 0.35,
      }),
    )
    root.add(shell)

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.23, 0.035, 170, 10, 2, 3),
      new THREE.MeshStandardMaterial({
        color: 0xbfc9ff, emissive: 0x9da8ff, emissiveIntensity: 0.55,
        wireframe: true, transparent: true, opacity: 0.85, roughness: 0.3, metalness: 0.5,
      }),
    )
    knot.rotation.set(0.4, -0.55, 0.25)
    root.add(knot)

    const particleCount = 1180
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    let seed = 8216
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    for (let i = 0; i < particleCount; i += 1) {
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const radius = 2.62 + (random() - 0.5) * 0.45
      const i3 = i * 3
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.cos(phi)
      positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
      const tint = 0.66 + random() * 0.34
      colors[i3] = 0.39 * tint
      colors[i3 + 1] = 0.4 * tint
      colors[i3 + 2] = 1 * tint
      sizes[i] = 0.5 + random() * 1.7
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.028,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })
    const particles = new THREE.Points(particleGeometry, particleMaterial)
    root.add(particles)

    const ringMaterial = new THREE.LineBasicMaterial({ color: 0x1e32ed, transparent: true, opacity: 0.35 })
    const ringA = new THREE.LineLoop(new THREE.TorusGeometry(3.2, 0.008, 8, 96), ringMaterial)
    ringA.rotation.set(1.15, 0.16, 0.18)
    root.add(ringA)
    const ringB = new THREE.LineLoop(new THREE.TorusGeometry(3.45, 0.006, 8, 96), ringMaterial.clone())
    ringB.material.opacity = 0.2
    ringB.rotation.set(0.25, 1.05, 0.48)
    root.add(ringB)

    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(230 * 3)
    for (let i = 0; i < 230; i += 1) {
      const radius = 4.1 + random() * 3.6
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      const i3 = i * 3
      starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      starPositions[i3 + 1] = radius * Math.cos(phi)
      starPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0x5268ff, size: 0.012, transparent: true, opacity: 0.65 }),
    )
    scene.add(stars)

    const pointer = { x: 0, y: 0 }
    let dragging = false
    const dragTarget = new THREE.Vector3(0, 2.3, 0.9)
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.9)
    const dragRaycaster = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const updateDragTarget = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      dragRaycaster.setFromCamera(ndc, camera)
      const hit = new THREE.Vector3()
      if (dragRaycaster.ray.intersectPlane(dragPlane, hit)) {
        dragTarget.set(
          THREE.MathUtils.clamp(hit.x, -3, 3),
          THREE.MathUtils.clamp(hit.y, 0.4, 3.1),
          dragTarget.z,
        )
      }
    }
    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      const projected = sunGroup.position.clone().project(camera)
      const sx = rect.left + (projected.x * 0.5 + 0.5) * rect.width
      const sy = rect.top + (-projected.y * 0.5 + 0.5) * rect.height
      if ((event.clientX - sx) ** 2 + (event.clientY - sy) ** 2 < 8100) {
        dragging = true
        mount.style.cursor = 'grabbing'
        updateDragTarget(event)
      }
    }
    const onPointerUp = () => {
      dragging = false
      mount.style.cursor = 'grab'
    }
    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2
      if (dragging) updateDragTarget(event)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerUp)
    renderer.domElement.addEventListener('pointerdown', onPointerDown)
    mount.style.cursor = 'grab'

    const resize = () => {
      const width = mount.clientWidth || 1
      const height = mount.clientHeight || 1
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    resize()

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const clock = new THREE.Clock()
    const render = () => {
      const elapsed = clock.getElapsedTime()
      if (!reducedMotion) {
        root.rotation.y += 0.0018 + pointer.x * 0.0011
        const targetRootX = 0.1 + Math.sin(elapsed * 0.22) * 0.05 - pointer.y * 0.34
        const targetRootZ = -0.08 + pointer.x * 0.42
        root.rotation.x += (targetRootX - root.rotation.x) * 0.11
        root.rotation.z += (targetRootZ - root.rotation.z) * 0.11
        shell.rotation.z -= 0.0007
        knot.rotation.z += 0.003
        knot.rotation.y -= 0.0016
        ringA.rotation.z += 0.0014
        ringB.rotation.x -= 0.0008
        particles.rotation.y -= 0.00055
        stars.rotation.y += 0.00015
        const cameraTargetX = THREE.MathUtils.clamp(pointer.x * 0.82, -0.72, 0.72)
        const cameraTargetY = THREE.MathUtils.clamp(-pointer.y * 0.68 + 0.15, -0.5, 0.75)
        camera.position.x += (cameraTargetX - camera.position.x) * 0.12
        camera.position.y += (cameraTargetY - camera.position.y) * 0.12
        const idleX = Math.sin(elapsed * 0.34) * 0.24 + Math.sin(elapsed * 0.73 + 1.9) * 0.06
        const idleY = 2.3 + Math.sin(elapsed * 0.52 + 0.7) * 0.11 + Math.sin(elapsed * 0.91) * 0.035
        const mouseLightX = THREE.MathUtils.clamp(pointer.x * 2.65 + idleX * 0.35, -2.9, 2.9)
        const mouseLightY = THREE.MathUtils.clamp(2.3 - pointer.y * 1.4 + (idleY - 2.3) * 0.35, 0.45, 3.4)
        const lightTargetX = dragging ? dragTarget.x : mouseLightX
        const lightTargetY = dragging ? dragTarget.y : mouseLightY
        const k = dragging ? 0.28 : 0.22
        sunGroup.position.x += (lightTargetX - sunGroup.position.x) * k
        sunGroup.position.y += (lightTargetY - sunGroup.position.y) * k
        sunGroup.position.z = 0.9
        sunLight.position.set(sunGroup.position.x, sunGroup.position.y, sunGroup.position.z - 1.6)
        sunLight.intensity = 108 + Math.sin(elapsed * 0.72) * 6
        camera.lookAt(0, 0, 0)
      }
      renderer.render(scene, camera)
      if (!reducedMotion) frame = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      resizeObserver.disconnect()
      particleGeometry.dispose()
      particleMaterial.dispose()
      starGeometry.dispose()
      stars.material.dispose()
      shell.geometry.dispose()
      shell.material.dispose()
      knot.geometry.dispose()
      knot.material.dispose()
      ringA.geometry.dispose()
      ringA.material.dispose()
      ringB.geometry.dispose()
      ringB.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="orbital-scene" aria-hidden="true" />
}

function ProjectArt({ variant }) {
  return (
    <div className={`project-art project-art--${variant}`} aria-hidden="true">
      {variant === 'zebra' && (
        <>
          <div className="zebra-card-stripes" />
          <div className="zebra-card-mark">
            <span>Z</span>
          </div>
          <div className="zebra-card-code">BUN.SERVE / DI / CONTRACTS</div>
          <div className="art-cross art-cross--a" />
          <div className="art-cross art-cross--b" />
        </>
      )}
      {variant === 'nova' && (
        <>
          <div className="nova-orbit nova-orbit--one" />
          <div className="nova-orbit nova-orbit--two" />
          <div className="nova-core">N</div>
          <div className="art-cross art-cross--a" />
          <div className="art-cross art-cross--b" />
        </>
      )}
      {variant === 'starwreck' && (
        <>
          <img className="starwreck-card-boss" src="/starwreck/brood-carrier.webp" alt="" />
          <img className="starwreck-card-ship" src="/starwreck/scrapper-hull.webp" alt="" />
          <span className="starwreck-card-beam starwreck-card-beam--one" />
          <span className="starwreck-card-beam starwreck-card-beam--two" />
          <span className="starwreck-card-signal starwreck-card-signal--one" />
          <span className="starwreck-card-signal starwreck-card-signal--two" />
          <span className="starwreck-card-mark"><img src="/starwreck/mark.webp" alt="" /></span>
          <span className="starwreck-card-code">TURN THE HULL / TURN THE FIGHT</span>
          <div className="art-cross art-cross--a" />
          <div className="art-cross art-cross--b" />
        </>
      )}
      {variant === 'trigger' && (
        <>
          <div className="trigger-card-ledger">
            <div className="trigger-card-kicker"><span>EXECUTION LEDGER</span><span className="trigger-card-live"><i /> LIVE REPLAY</span></div>
            <div className="trigger-card-pass trigger-card-pass--first">
              <span>PASS 01<small>WAIT / CRASH</small></span>
              <div className="trigger-card-track">
                <i className="trigger-card-cell trigger-card-cell--done">00</i>
                <i className="trigger-card-cell trigger-card-cell--wait">01</i>
                <i className="trigger-card-cell trigger-card-cell--future">02</i>
                <i className="trigger-card-cell trigger-card-cell--future">OUT</i>
              </div>
            </div>
            <div className="trigger-card-bridge"><span>SUSPEND</span><b>↓</b><span>REPLAY</span></div>
            <div className="trigger-card-pass trigger-card-pass--replay">
              <span>PASS 02<small>CACHE / RESUME</small></span>
              <div className="trigger-card-track">
                <i className="trigger-card-cell trigger-card-cell--cached">00</i>
                <i className="trigger-card-cell trigger-card-cell--cached">01</i>
                <i className="trigger-card-cell trigger-card-cell--active">02</i>
                <i className="trigger-card-cell trigger-card-cell--terminal">OUT</i>
                <b className="trigger-card-scan" />
              </div>
            </div>
          </div>
          <div className="trigger-card-mark"><BetterTriggerMark className="trigger-card-logo" /></div>
          <span className="trigger-card-code">STEP MEMORY / FENCE +1 / POSTGRES</span>
          <div className="art-cross art-cross--a" />
          <div className="art-cross art-cross--b" />
        </>
      )}
      <span className="art-index">{variant === 'zebra' || variant === 'nova' ? 'A / 01' : variant === 'starwreck' ? 'B / 02' : 'C / 03'}</span>
    </div>
  )
}

function Nav({ activeSection }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const jumpTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className="site-nav">
      <div className="frame nav-inner">
        <button className="wordmark" onClick={() => jumpTo('top')} aria-label="Back to top">
          YANG
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item, index) => (
            <button key={item.id} className={activeSection === item.id ? 'is-active' : ''} onClick={() => jumpTo(item.id)}>
              <span>0{index + 1}</span>{item.label}
            </button>
          ))}
        </nav>
        <a className="nav-contact" href="#contact">LET&apos;S TALK <Arrow /></a>
        <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          <span /><span />
        </button>
      </div>
      <div className={`mobile-nav ${menuOpen ? 'is-open' : ''}`}>
        {NAV_ITEMS.map((item, index) => (
          <button key={item.id} onClick={() => jumpTo(item.id)}><span>0{index + 1}</span>{item.label}</button>
        ))}
        <a href="#contact">LET&apos;S TALK <Arrow /></a>
      </div>
    </header>
  )
}

function Hero() {
  const heroRef = useRef(null)

  const scrollOneScreen = () => {
    const hero = heroRef.current
    if (!hero) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: hero.offsetHeight, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <section ref={heroRef} id="top" className="hero section-dark">
      <div className="hero-grid" />
      <div className="frame hero-frame">
        <div className="hero-copy">
          <SectionLabel light>// independent programmer · shanghai / anywhere</SectionLabel>
          <h1>I write software<br /><em>with a pulse</em></h1>
          <p className="hero-intro"><span>Interfaces, experiments, and small pieces of the future</span></p>
          <div className="hero-actions">
            <SolidButton href="#work">EXPLORE SELECTED WORK</SolidButton>
            <button className="text-link text-link--light" onClick={scrollOneScreen}>SCROLL TO DISCOVER <Arrow diagonal={false} /></button>
          </div>
        </div>
        <div className="hero-meta">
          <div><span>AVAILABLE FOR</span><strong>SELECTED PROJECTS</strong></div>
        </div>
        <div className="hero-orb-wrap">
          <OrbitalScene />
          <div className="orbital-caption"><span>ORBITAL STUDY / 001</span></div>
        </div>
      </div>
      <div className="hero-bottom frame">
        <span>SCROLL TO EXPLORE</span>
        <span className="hero-line" />
        <span>01 / 03</span>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="about" className="section-paper about-section">
      <div className="frame about-grid">
        <aside className="section-aside">
          <SectionLabel>01 / about</SectionLabel>
          <p className="aside-about">A full-stack engineer with ten-plus years on the web, lately building AI-powered products — subscription billing, real-time analytics, and low-code platforms shipped with React, TypeScript, and Bun.</p>
          <p>My name is Yang,<br />I am a programmer.</p>
        </aside>
        <div className="about-main">
          <div className="about-intro">
            <h2>Good work starts<br />with a <span>strange question</span></h2>
            <p className="about-copy">From a rough idea to a working interface, I like making things that are clear enough to use and strange enough to remember. The projects below are a mix of shipped work, prototypes, and things I built simply because I had to know if they could exist.</p>
          </div>
          <div className="stat-row">
            <div><strong>10+</strong><span>YEARS MAKING<br />ON THE WEB</span></div>
            <div><strong>20+</strong><span>PROJECTS<br />SHIPPED</span></div>
            <div><strong>∞</strong><span>QUESTIONS<br />STILL OPEN</span></div>
          </div>
        </div>
      </div>
      <div className="frame ticker ticker--paper" aria-hidden="true">
        <div className="ticker-track"><span>REACT / TYPESCRIPT / BUN / SCALA / GOLANG / POSTGRES / DOCKER / LLM / </span><span>REACT / TYPESCRIPT / BUN / SCALA / GOLANG / POSTGRES / DOCKER / LLM / </span></div>
      </div>
    </section>
  )
}

function Work() {
  return (
    <section id="work" className="section-dark work-section">
      <div className="frame work-frame">
        <div className="section-heading-row">
          <div><SectionLabel light>02 / selected work</SectionLabel><h2>Some things I&apos;ve<br /><span>made recently</span></h2></div>
          <p>Three studies in making<br />the invisible visible</p>
        </div>
        <div className="project-grid">
          {PROJECTS.map((project, index) => (
            <article key={project.number} className={`project-card project-card--${index === 0 ? 'featured' : 'standard'}`}>
              <a href={project.href} aria-label={`View ${project.title} case study`}><ProjectArt variant={project.variant} /></a>
              <div className="project-info">
                <div className="project-topline"><span>{project.number}</span><span>{project.type}</span></div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-bottom"><div>{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><a href={project.href} aria-label={`View ${project.title}`}>VIEW PROJECT <Arrow /></a></div>
              </div>
            </article>
          ))}
        </div>
        <div className="work-footer"><span>MORE IN THE ARCHIVE ↗</span><span className="work-footer-line" /><span>03 / 26</span></div>
      </div>
    </section>
  )
}

function Lab() {
  return (
    <section id="lab" className="section-paper lab-section">
      <div className="frame lab-heading">
        <div>
          <SectionLabel>03 / the open lab</SectionLabel>
          <h2>Every rabbit hole<br />in <span>one field</span></h2>
        </div>
        <div className="lab-heading-copy">
          <p>Not a shortlist. Every public repository: shipped tools, unfinished questions, old experiments, and useful detours — compressed into one living index.</p>
          <a className="text-link" href="https://github.com/zhy0216?tab=repositories" target="_blank" rel="noreferrer">VIEW THE SOURCE <Arrow /></a>
        </div>
      </div>
      <div className="frame"><RepositoryField /></div>
    </section>
  )
}

function Contact() {
  return (
    <footer id="contact" className="section-dark contact-section">
      <div className="frame contact-frame">
        <div className="contact-topline"><SectionLabel light>04 / contact</SectionLabel><span>OPEN TO THE RIGHT KIND OF TROUBLE</span></div>
        <div className="contact-body"><h2>Have a good idea?<br /><em>Let&apos;s give it a body</em></h2><SolidButton light href="https://github.com/zhy0216">LET&apos;S TALK</SolidButton></div>
        <div className="contact-links"><div><a href="https://github.com/zhy0216" target="_blank" rel="noreferrer">GITHUB <Arrow /></a><a href="https://www.linkedin.com/in/im-yang/" target="_blank" rel="noreferrer">LINKEDIN <Arrow /></a><a href="#top">BACK TO TOP ↑</a></div></div>
        <div className="contact-foot"><span>© {new Date().getFullYear()} YANG</span><span>MADE WITH CURIOSITY + THREE.JS</span><span>SHANGHAI — CHINA</span></div>
      </div>
    </footer>
  )
}

export default function App() {
  const [activeSection, setActiveSection] = useState('about')

  useEffect(() => {
    const sections = ['about', 'work', 'lab', 'contact'].map((id) => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
      if (visible[0]) setActiveSection(visible[0].target.id)
    }, { rootMargin: '-25% 0px -60% 0px', threshold: 0 })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const restore = () => {
      const id = window.location.hash.slice(1)
      if (!id) return
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
    }
    restore()
    window.addEventListener('hashchange', restore)
    return () => window.removeEventListener('hashchange', restore)
  }, [])

  return <><Nav activeSection={activeSection} /><main><Hero /><About /><Work /><Lab /></main><Contact /></>
}
