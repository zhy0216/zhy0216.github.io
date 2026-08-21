import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

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
    description: 'A Bun-first TypeScript web framework with first-class dependency injection.',
    tags: ['Bun', 'TypeScript', 'Open source'],
    variant: 'zebra',
    href: '/work/zebra/',
  },
  {
    number: '02',
    title: 'FIELD NOTES',
    type: 'EDITORIAL PLATFORM · 2024',
    description: 'An editorial interface for curious people, quiet ideas, and long reads.',
    tags: ['Product', 'Motion', 'Build'],
    variant: 'field',
    href: '#contact',
  },
  {
    number: '03',
    title: 'AFTERIMAGE',
    type: 'INTERACTIVE INSTALLATION · 2024',
    description: 'A browser-native light study that turns a visitor into the material.',
    tags: ['Three.js', 'Experience', 'Sound'],
    variant: 'afterimage',
    href: '#contact',
  },
  {
    number: '04',
    title: 'COMMON GROUND',
    type: 'PRODUCT SYSTEM · 2023',
    description: 'A calmer way for distributed teams to make decisions together.',
    tags: ['Strategy', 'UI system', 'Prototype'],
    variant: 'ground',
    href: '#contact',
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
    camera.position.set(0, 0.15, 8.4)

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

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.5, 2),
      new THREE.MeshBasicMaterial({ color: 0x7778ff, wireframe: true, transparent: true, opacity: 0.27 }),
    )
    root.add(shell)

    const innerShell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.65, 2),
      new THREE.MeshBasicMaterial({ color: 0x4b4dff, wireframe: true, transparent: true, opacity: 0.24 }),
    )
    innerShell.rotation.set(0.4, 0.3, 0.1)
    root.add(innerShell)

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.23, 0.035, 170, 10, 2, 3),
      new THREE.MeshBasicMaterial({ color: 0xb7b8ff, wireframe: true, transparent: true, opacity: 0.76 }),
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

    const ringMaterial = new THREE.LineBasicMaterial({ color: 0x5557ff, transparent: true, opacity: 0.35 })
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
      new THREE.PointsMaterial({ color: 0x6062ff, size: 0.012, transparent: true, opacity: 0.65 }),
    )
    scene.add(stars)

    const pointer = { x: 0, y: 0 }
    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

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
        root.rotation.y += 0.0018
        root.rotation.x = 0.1 + Math.sin(elapsed * 0.22) * 0.05
        shell.rotation.z -= 0.0007
        innerShell.rotation.z += 0.0014
        knot.rotation.z += 0.003
        knot.rotation.y -= 0.0016
        ringA.rotation.z += 0.0014
        ringB.rotation.x -= 0.0008
        particles.rotation.y -= 0.00055
        stars.rotation.y += 0.00015
        camera.position.x += (pointer.x * 0.25 - camera.position.x) * 0.025
        camera.position.y += (-pointer.y * 0.16 + 0.15 - camera.position.y) * 0.025
        camera.lookAt(0, 0, 0)
      }
      renderer.render(scene, camera)
      if (!reducedMotion) frame = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      resizeObserver.disconnect()
      particleGeometry.dispose()
      particleMaterial.dispose()
      starGeometry.dispose()
      stars.material.dispose()
      shell.geometry.dispose()
      shell.material.dispose()
      innerShell.geometry.dispose()
      innerShell.material.dispose()
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
      {variant === 'field' && (
        <>
          <div className="field-scanlines" />
          <div className="field-title">FIELD<br />NOTES</div>
          <div className="field-coordinate">31°14'06" N<br />121°28'14" E</div>
        </>
      )}
      {variant === 'afterimage' && (
        <>
          <div className="afterimage-sun" />
          <div className="afterimage-ring afterimage-ring--one" />
          <div className="afterimage-ring afterimage-ring--two" />
          <div className="afterimage-word">LIGHT<br />/ MEMORY</div>
        </>
      )}
      {variant === 'ground' && (
        <>
          <div className="ground-grid" />
          <div className="ground-block ground-block--one" />
          <div className="ground-block ground-block--two" />
          <div className="ground-block ground-block--three" />
          <div className="ground-label">MAKE<br />ROOM</div>
        </>
      )}
      <span className="art-index">{variant === 'zebra' || variant === 'nova' ? 'A / 01' : variant === 'field' ? 'B / 02' : variant === 'afterimage' ? 'C / 03' : 'D / 04'}</span>
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
          YANG<span>/</span>0216
        </button>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item, index) => (
            <button key={item.id} className={activeSection === item.id ? 'is-active' : ''} onClick={() => jumpTo(item.id)}>
              <span>0{index + 1}</span>{item.label}
            </button>
          ))}
        </nav>
        <a className="nav-contact" href="mailto:zhy0216@gmail.com">LET&apos;S TALK <Arrow /></a>
        <button className={`menu-toggle ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          <span /><span />
        </button>
      </div>
      <div className={`mobile-nav ${menuOpen ? 'is-open' : ''}`}>
        {NAV_ITEMS.map((item, index) => (
          <button key={item.id} onClick={() => jumpTo(item.id)}><span>0{index + 1}</span>{item.label}</button>
        ))}
        <a href="mailto:zhy0216@gmail.com">LET&apos;S TALK <Arrow /></a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="hero section-dark">
      <div className="hero-grid" />
      <div className="frame hero-frame">
        <div className="hero-copy">
          <SectionLabel light>// independent programmer · shanghai / anywhere</SectionLabel>
          <h1>I write software<br /><em>with a pulse.</em></h1>
          <p className="hero-intro">我是 Yang，一名程序员。喜欢把想法变成可运行、可交互、值得记住的东西。<br /><span>Interfaces, experiments, and small pieces of the future.</span></p>
          <div className="hero-actions">
            <SolidButton href="#work">EXPLORE SELECTED WORK</SolidButton>
            <a className="text-link text-link--light" href="#about">SCROLL TO DISCOVER <Arrow diagonal={false} /></a>
          </div>
        </div>
        <div className="hero-meta">
          <div><span>LOCAL TIME</span><strong>21:16 <i>GMT+8</i></strong></div>
          <div><span>AVAILABLE FOR</span><strong>SELECTED PROJECTS</strong></div>
          <div className="hero-meta-mark">↘</div>
        </div>
        <div className="hero-orb-wrap">
          <OrbitalScene />
          <div className="orbital-caption"><span>ORBITAL STUDY / 001</span><span>MOVE YOUR CURSOR</span></div>
        </div>
      </div>
      <div className="hero-bottom frame">
        <span>SCROLL TO EXPLORE</span>
        <span className="hero-line" />
        <span>01 / 05</span>
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
          <p>My name is Yang,<br />I am a programmer.</p>
          <span className="aside-code">YANG—0216<br />EST. 2018—NOW</span>
        </aside>
        <div className="about-main">
          <h2>Good work starts<br />with a <span>strange question.</span></h2>
          <p className="about-lede">我是一名独立程序员，喜欢在产品、交互和实验之间来回穿梭。我的工作不是给答案加上装饰，而是找到那个让人愿意停下来多看一秒的核心。</p>
          <p className="about-copy">From a rough idea to a working interface, I like making things that are clear enough to use and strange enough to remember. The projects below are a mix of shipped work, prototypes, and things I built simply because I had to know if they could exist.</p>
          <div className="stat-row">
            <div><strong>07</strong><span>YEARS MAKING<br />ON THE WEB</span></div>
            <div><strong>26</strong><span>PROJECTS<br />SHIPPED</span></div>
            <div><strong>∞</strong><span>QUESTIONS<br />STILL OPEN</span></div>
          </div>
        </div>
      </div>
      <div className="frame ticker ticker--paper" aria-hidden="true">
        <div className="ticker-track"><span>DESIGN / CODE / MOTION / 3D / SYSTEMS / </span><span>DESIGN / CODE / MOTION / 3D / SYSTEMS / </span></div>
      </div>
    </section>
  )
}

function Work() {
  return (
    <section id="work" className="section-dark work-section">
      <div className="frame work-frame">
        <div className="section-heading-row">
          <div><SectionLabel light>02 / selected work</SectionLabel><h2>Some things I&apos;ve<br /><span>made recently.</span></h2></div>
          <p>Four studies in making<br />the invisible visible.</p>
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
        <div className="work-footer"><span>MORE IN THE ARCHIVE ↗</span><span className="work-footer-line" /><span>04 / 26</span></div>
      </div>
    </section>
  )
}

function Lab() {
  const capabilities = [
    ['01', 'Creative direction', 'A clear point of view, from first thought to final frame.'],
    ['02', 'Interface systems', 'Flexible visual languages that stay coherent at every scale.'],
    ['03', '3D / WebGL', 'Spaces with depth, motion, and a little bit of physics.'],
    ['04', 'Prototypes', 'Fast, tangible experiments to find what words cannot.'],
  ]
  return (
    <section id="lab" className="section-paper lab-section">
      <div className="frame lab-grid">
        <div className="lab-intro"><SectionLabel>03 / the lab</SectionLabel><h2>A small practice<br />with a large appetite<br />for the <span>unknown.</span></h2><p>不是每个想法都要变成产品。有些只需要被认真地做出来。</p><a className="text-link" href="mailto:zhy0216@gmail.com">START A CONVERSATION <Arrow /></a></div>
        <div className="capability-list">{capabilities.map(([number, title, text]) => <div className="capability" key={number}><span className="capability-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div><Arrow diagonal={false} /></div>)}</div>
      </div>
      <div className="frame lab-baseline"><span>TOOLS I LIKE TO THINK WITH</span><span>FIGMA · THREE.JS · REACT · AFTER EFFECTS · A GOOD NOTEBOOK</span></div>
    </section>
  )
}

function Contact() {
  return (
    <footer id="contact" className="section-dark contact-section">
      <div className="frame contact-frame">
        <div className="contact-topline"><SectionLabel light>04 / contact</SectionLabel><span>OPEN TO THE RIGHT KIND OF TROUBLE</span></div>
        <div className="contact-body"><h2>Have a good idea?<br /><em>Let&apos;s give it a body.</em></h2><SolidButton light href="mailto:zhy0216@gmail.com">ZHY0216@GMAIL.COM</SolidButton></div>
        <div className="contact-links"><a href="mailto:zhy0216@gmail.com">zhy0216@gmail.com</a><div><a href="https://github.com/zhy0216" target="_blank" rel="noreferrer">GITHUB <Arrow /></a><a href="https://www.linkedin.com/in/im-yang/" target="_blank" rel="noreferrer">LINKEDIN <Arrow /></a><a href="#top">BACK TO TOP ↑</a></div></div>
        <div className="contact-foot"><span>© {new Date().getFullYear()} YANG / 0216</span><span>MADE WITH CURIOSITY + THREE.JS</span><span>SHANGHAI — CHINA</span></div>
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
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.25, 0.5] })
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
