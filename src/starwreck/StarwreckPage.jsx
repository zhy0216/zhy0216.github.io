import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const PLAY_URL = 'https://starwreck.zhy0216-66c.workers.dev/'

const HULL_LAYOUT = [
  [-3, 0],
  [-2, -1], [-2, 0], [-2, 1],
  [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2],
  [0, -2], [0, -1], [0, 0], [0, 1], [0, 2],
  [1, -2], [1, -1], [1, 0], [1, 1], [1, 2],
  [2, -1], [2, 0], [2, 1],
  [3, 0],
]

const PILLARS = [
  {
    number: '01',
    title: 'Turning is aiming',
    text: 'A weapon fires through the edge it faces Steering is a continuous decision about which broadside meets the swarm',
  },
  {
    number: '02',
    title: 'The deck is the build',
    text: 'Weapons occupy exposed cells; support modules work from the interior Layout replaces an invisible stack of bonuses',
  },
  {
    number: '03',
    title: 'Growth leaves a silhouette',
    text: 'Every welded plate changes the firing plan and the outline The final hull is a record of the run that made it',
  },
]

const RUN_LOOP = [
  ['01', 'COLLECT', 'Pull wreckage out of the swarm'],
  ['02', 'CHOOSE', 'Take one of three upgrades'],
  ['03', 'WELD', 'Add weapons, support, edicts, or deck'],
  ['04', 'TURN', 'Present the right side to the pressure'],
  ['05', 'REFIT', 'Reshape the deck at the dry-dock'],
]

const ENGINE_LAWS = [
  {
    number: '01',
    title: 'The simulation stays pure',
    text: 'The sim layer imports neither Pixi nor the DOM Rules can run under Node while rendering remains a replaceable view',
    tag: 'SIM / DATA ONLY',
  },
  {
    number: '02',
    title: 'Time advances at 60 Hz',
    text: 'A fixed timestep owns combat truth; the renderer interpolates between previous and current positions for a smooth frame',
    tag: 'FIXED STEP / INTERPOLATED VIEW',
  },
  {
    number: '03',
    title: 'A save carries the whole run',
    text: 'The RNG cursor and every checksum-relevant entity are captured Restore is accepted only when the world stays identical frame after frame',
    tag: 'CAPTURE / RESTORE / CHECKSUM',
  },
]

const NOW_ITEMS = [
  'Complete playable MVP: title, seeded start, four combat legs, elite, boss, results, and codex',
  'Three-choice upgrades, a free refit stop every two minutes, paid repair, and meta unlocks',
  'Web build on Cloudflare Workers plus an Electron Windows x64 desktop package',
  'Local offline saves on desktop',
]

const NEXT_ITEMS = [
  'Finish Steamworks onboarding and create the unpublished store page',
  'Upload and validate the Windows depot through SteamPipe',
  'Capture release-grade gameplay footage and complete build QA',
  'Keep Steam Cloud disabled until the documented file migration and conflict tests exist',
]

const DIRECTIONS = [
  [0, -1, 'n'],
  [1, 0, 'e'],
  [0, 1, 's'],
  [-1, 0, 'w'],
]

function getHullCells() {
  const present = new Set(HULL_LAYOUT.map(([x, y]) => `${x},${y}`))
  return HULL_LAYOUT.map(([x, y]) => {
    const exposed = DIRECTIONS.filter(([dx, dy]) => !present.has(`${x + dx},${y + dy}`))
    return {
      x,
      y,
      type: exposed.length > 1 ? 'corner' : exposed.length === 1 ? 'edge' : 'core',
      direction: exposed[0]?.[2] ?? 'n',
      exposed,
    }
  })
}

function Arrow({ direction = 'ne' }) {
  return (
    <svg className="sw-arrow" viewBox="0 0 16 16" aria-hidden="true">
      {direction === 'left' ? <path d="M14 8H3m4-4L3 8l4 4" /> : <path d="M3 13 13 3M5 3h8v8" />}
    </svg>
  )
}

function CaseLabel({ children, light = false }) {
  return <span className={`sw-label ${light ? 'sw-label--light' : ''}`}>{children}</span>
}

function CaseButton({ children, href, light = false }) {
  return (
    <a className={`sw-button ${light ? 'sw-button--light' : ''}`} href={href} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <Arrow />
    </a>
  )
}

function TextLink({ children, href, light = false }) {
  return (
    <a className={`sw-textlink ${light ? 'sw-textlink--light' : ''}`} href={href}>
      {children} <Arrow />
    </a>
  )
}

function HullDiagram({ compact = false }) {
  const cells = useMemo(getHullCells, [])

  return (
    <div className={`sw-hull-diagram ${compact ? 'sw-hull-diagram--compact' : ''}`} aria-hidden="true">
      <span className="sw-hull-axis sw-hull-axis--horizontal" />
      <span className="sw-hull-axis sw-hull-axis--vertical" />
      {cells.map((cell) => (
        <span
          className={`sw-hull-cell sw-hull-cell--${cell.type}`}
          data-direction={cell.direction}
          key={`${cell.x}-${cell.y}`}
          style={{ '--cell-x': cell.x + 4, '--cell-y': cell.y + 3 }}
        />
      ))}
      <span className="sw-hull-heading">HEADING →</span>
    </div>
  )
}

function StarwreckScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x05060b, 0.075)

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(0, -8.4, 8.8)
    camera.lookAt(0, 0, 0)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      mount.classList.add('sw-scene--fallback')
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setClearColor(0x05060b, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0x7188ff, 1.7)
    const keyLight = new THREE.DirectionalLight(0xdde6ff, 3.1)
    keyLight.position.set(-2, -5, 8)
    const redLight = new THREE.PointLight(0xff3158, 32, 14)
    redLight.position.set(4, 3, 3)
    scene.add(ambient, keyLight, redLight)

    const grid = new THREE.GridHelper(18, 18, 0x0011e2, 0x17203e)
    grid.rotation.x = Math.PI / 2
    grid.position.z = -0.52
    grid.material.transparent = true
    grid.material.opacity = 0.28
    scene.add(grid)

    const hull = new THREE.Group()
    hull.rotation.set(-0.02, 0.02, -0.16)
    hull.position.set(0.25, 0, 0)
    scene.add(hull)

    const cellGeometry = new THREE.BoxGeometry(0.86, 0.86, 0.22)
    const cellEdgeGeometry = new THREE.EdgesGeometry(cellGeometry)
    const coreMaterial = new THREE.MeshStandardMaterial({ color: 0x111a31, metalness: 0.76, roughness: 0.42 })
    const edgeMaterial = new THREE.MeshStandardMaterial({ color: 0x0011e2, emissive: 0x000a88, emissiveIntensity: 0.7, metalness: 0.62, roughness: 0.3 })
    const cornerMaterial = new THREE.MeshStandardMaterial({ color: 0x5268ff, emissive: 0x1325b8, emissiveIntensity: 0.9, metalness: 0.52, roughness: 0.27 })
    const seamMaterial = new THREE.LineBasicMaterial({ color: 0x9da8ff, transparent: true, opacity: 0.55 })
    const turretGeometry = new THREE.CylinderGeometry(0.12, 0.18, 0.15, 6)
    turretGeometry.rotateX(Math.PI / 2)
    const barrelGeometry = new THREE.BoxGeometry(0.075, 0.44, 0.075)
    const turretMaterial = new THREE.MeshStandardMaterial({ color: 0xdce7ff, emissive: 0x5268ff, emissiveIntensity: 0.65, metalness: 0.72, roughness: 0.24 })
    const hullCells = getHullCells()

    hullCells.forEach((cell) => {
      const material = cell.type === 'core' ? coreMaterial : cell.type === 'edge' ? edgeMaterial : cornerMaterial
      const plate = new THREE.Mesh(cellGeometry, material)
      plate.position.set(cell.x * 0.73, cell.y * 0.73, 0)
      hull.add(plate)

      const outline = new THREE.LineSegments(cellEdgeGeometry, seamMaterial)
      outline.position.copy(plate.position)
      hull.add(outline)

      if (cell.type !== 'core') {
        const turret = new THREE.Mesh(turretGeometry, turretMaterial)
        turret.position.set(cell.x * 0.73, cell.y * 0.73, 0.24)
        hull.add(turret)

        const [dx, dy] = cell.exposed[0]
        const barrel = new THREE.Mesh(barrelGeometry, turretMaterial)
        barrel.position.set(cell.x * 0.73 + dx * 0.22, cell.y * 0.73 + dy * 0.22, 0.28)
        barrel.rotation.z = Math.atan2(-dx, dy)
        hull.add(barrel)
      }
    })

    const beamMaterial = new THREE.LineBasicMaterial({ color: 0x8be8ff, transparent: true, opacity: 0.68, blending: THREE.AdditiveBlending })
    const hotBeamMaterial = new THREE.LineBasicMaterial({ color: 0xffb34c, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending })
    const beamGeometries = []
    const broadsideCells = hullCells.filter((cell) => cell.exposed.some(([, dy]) => Math.abs(dy) === 1)).filter((_, index) => index % 2 === 0)
    broadsideCells.forEach((cell, index) => {
      const [, dy] = cell.exposed.find(([, exposedY]) => Math.abs(exposedY) === 1) ?? cell.exposed[0]
      const start = new THREE.Vector3(cell.x * 0.73, cell.y * 0.73 + dy * 0.28, 0.26)
      const end = new THREE.Vector3(start.x + (index % 2 ? 0.55 : -0.35), start.y + dy * (3.2 + index * 0.22), 0.18)
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
      beamGeometries.push(geometry)
      hull.add(new THREE.Line(geometry, index % 3 === 0 ? hotBeamMaterial : beamMaterial))
    })

    let seed = 216
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    const swarmCount = 360
    const swarmPositions = new Float32Array(swarmCount * 3)
    const swarmData = Array.from({ length: swarmCount }, (_, index) => ({
      side: index % 2 === 0 ? 1 : -1,
      x: (random() - 0.5) * 13,
      phase: random(),
      depth: (random() - 0.5) * 4,
      speed: 0.026 + random() * 0.024,
    }))
    const swarmGeometry = new THREE.BufferGeometry()
    swarmGeometry.setAttribute('position', new THREE.BufferAttribute(swarmPositions, 3))
    const swarmMaterial = new THREE.PointsMaterial({
      color: 0xff3158,
      size: 0.065,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    const swarm = new THREE.Points(swarmGeometry, swarmMaterial)
    scene.add(swarm)

    const enemyGeometry = new THREE.IcosahedronGeometry(0.31, 1)
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0x5d071d, emissive: 0xff163f, emissiveIntensity: 1.25, wireframe: true })
    const enemies = Array.from({ length: 8 }, (_, index) => {
      const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial)
      const side = index % 2 === 0 ? 1 : -1
      enemy.position.set((index - 3.5) * 1.35, side * (3.1 + (index % 3) * 0.75), (index % 4) * 0.45 - 0.7)
      enemy.scale.setScalar(0.72 + (index % 3) * 0.18)
      scene.add(enemy)
      return enemy
    })

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
    const clock = new THREE.Clock()
    let frame = 0
    let running = true

    const render = () => {
      const elapsed = reducedMotion ? 2.8 : clock.getElapsedTime()

      for (let index = 0; index < swarmCount; index += 1) {
        const item = swarmData[index]
        const cycle = (item.phase + elapsed * item.speed) % 1
        const i3 = index * 3
        swarmPositions[i3] = item.x + Math.sin(elapsed * 0.54 + item.phase * Math.PI * 2) * 0.45
        swarmPositions[i3 + 1] = item.side * (7.4 - cycle * 5.25)
        swarmPositions[i3 + 2] = item.depth + Math.cos(elapsed * 0.38 + item.phase * 8) * 0.3
      }
      swarmGeometry.attributes.position.needsUpdate = true

      hull.rotation.z = -0.16 + Math.sin(elapsed * 0.18) * 0.04 + pointer.x * 0.035
      hull.rotation.x += ((-0.02 - pointer.y * 0.035) - hull.rotation.x) * 0.03
      hull.position.y = Math.sin(elapsed * 0.3) * 0.08
      beamMaterial.opacity = 0.42 + Math.pow(Math.max(0, Math.sin(elapsed * 2.1)), 5) * 0.48
      hotBeamMaterial.opacity = 0.5 + Math.pow(Math.max(0, Math.sin(elapsed * 2.1 + 0.7)), 6) * 0.5
      enemies.forEach((enemy, index) => {
        enemy.rotation.x = elapsed * (0.14 + index * 0.007)
        enemy.rotation.y = elapsed * (0.19 + index * 0.006)
        enemy.position.x += Math.sin(elapsed * 0.22 + index) * 0.0018
      })
      redLight.intensity = 27 + Math.sin(elapsed * 1.15) * 7

      renderer.render(scene, camera)
      if (!reducedMotion && running) frame = requestAnimationFrame(render)
    }

    render()

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      if (reducedMotion) return
      if (entry.isIntersecting && !running) {
        running = true
        frame = requestAnimationFrame(render)
      } else if (!entry.isIntersecting && running) {
        running = false
        cancelAnimationFrame(frame)
      }
    }, { threshold: 0.02 })
    intersectionObserver.observe(mount)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      cellGeometry.dispose()
      cellEdgeGeometry.dispose()
      coreMaterial.dispose()
      edgeMaterial.dispose()
      cornerMaterial.dispose()
      seamMaterial.dispose()
      turretGeometry.dispose()
      barrelGeometry.dispose()
      turretMaterial.dispose()
      beamGeometries.forEach((geometry) => geometry.dispose())
      beamMaterial.dispose()
      hotBeamMaterial.dispose()
      swarmGeometry.dispose()
      swarmMaterial.dispose()
      enemyGeometry.dispose()
      enemyMaterial.dispose()
      grid.geometry.dispose()
      if (Array.isArray(grid.material)) grid.material.forEach((material) => material.dispose())
      else grid.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="sw-scene" aria-hidden="true" />
}

function ArtifactFigure({ src, alt, index, title, detail, className = '' }) {
  return (
    <figure className={`sw-artifact ${className}`}>
      <div className="sw-artifact-image"><img src={src} alt={alt} /></div>
      <figcaption><span>{index}</span><strong>{title}</strong><p>{detail}</p></figcaption>
    </figure>
  )
}

function StarwreckPage() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight
      setProgress(distance > 0 ? Math.min(100, (window.scrollY / distance) * 100) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="starwreck-page">
      <header className="sw-nav">
        <div className="sw-nav-inner">
          <a className="sw-wordmark" href="/">YANG<span>/</span>0216</a>
          <span className="sw-nav-case">CASE STUDY <i>/</i> 02</span>
          <a className="sw-nav-back" href="/#work"><Arrow direction="left" /> BACK TO INDEX</a>
        </div>
        <span className="sw-progress" style={{ width: `${progress}%` }} />
      </header>

      <main>
        <section className="sw-hero">
          <div className="sw-hero-grid" />
          <div className="sw-frame sw-hero-inner">
            <div className="sw-hero-copy">
              <CaseLabel light>Selected work / game · roguelite / 2026</CaseLabel>
              <div className="sw-title-lockup">
                <img src="/starwreck/mark.webp" alt="" />
                <h1>STAR<br /><span>WRECK</span></h1>
              </div>
              <div className="sw-hero-name-row"><span>V0.1.0 / PLAYABLE MVP</span></div>
              <p className="sw-hero-lede">Weld a warship tile by tile Turn into the swarm Bring your <em>broadside</em> to bear</p>
              <div className="sw-hero-actions">
                <CaseButton href={PLAY_URL}>PLAY THE WEB BUILD</CaseButton>
                <TextLink light href="#artifact">SEE THE REAL BUILD</TextLink>
              </div>
            </div>

            <div className="sw-hero-scene">
              <StarwreckScene />
              <div className="sw-scene-shade" />
            </div>

            <div className="sw-hero-meta">
              <div><span>ROLE</span><strong>GAME DESIGN<br />ENGINEERING<br />VISUAL SYSTEM</strong></div>
              <div><span>STACK</span><strong>TYPESCRIPT<br />PIXIJS · VITE<br />ELECTRON</strong></div>
              <div><span>PLATFORM</span><strong>WEB<br />WINDOWS X64</strong></div>
            </div>
          </div>
          <div className="sw-frame sw-hero-foot"><span>PROJECT / 02</span><span className="sw-rule" /><span>DECK ONLINE · SCROLL TO UNPACK ↓</span></div>
        </section>

        <section className="sw-premise" id="premise">
          <div className="sw-frame sw-premise-grid">
            <aside className="sw-premise-aside">
              <CaseLabel>01 / the strange question</CaseLabel>
              <p>SURVIVORS-LIKE<br />× DECK-SPACE PUZZLE</p>
              <span>SINGLE PLAYER<br />SPACE / ROGUELITE</span>
            </aside>
            <div className="sw-premise-main">
              <h2>What if your build<br />cast a <span>silhouette?</span></h2>
              <div className="sw-premise-copy">
                <p>Most survivors-likes hide growth in a stat stack STARWRECK makes every choice physical: weapons need exposed edges, support belongs inside, and a new plate can turn yesterday&apos;s gun position into dead interior</p>
              </div>
              <div className="sw-fact-strip" aria-label="Project facts">
                <div><strong>04</strong><span>COMBAT LEGS<br />+ ELITE + BOSS</span></div>
                <div><strong>02</strong><span>MINUTES BETWEEN<br />REFIT WINDOWS</span></div>
                <div><strong>01</strong><span>SEED REPRODUCES<br />THE SAME RUN</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="sw-mechanic">
          <div className="sw-frame">
            <div className="sw-section-head sw-section-head--dark">
              <div><CaseLabel light>02 / the playable rule</CaseLabel><h2>Edge fires<br /><span>Core feeds</span></h2></div>
              <p>ONE RULE TURNS A GRID<br />INTO FIRE CONTROL</p>
            </div>

            <div className="sw-rule-board">
              <div className="sw-rule-copy">
                <span className="sw-rule-index">DECK / LIVE SCHEMATIC</span>
                <h3>The hull is a weapon<br />with a direction</h3>
                <p>Exposed cells mount guns Interior cells carry support Weld outward and old edges become core, so expansion always changes the firing plan</p>
                <div className="sw-rule-legend">
                  <span><i className="is-edge" /> EDGE / FIRE</span>
                  <span><i className="is-corner" /> CORNER / WIDE ARC</span>
                  <span><i className="is-core" /> CORE / SUPPORT</span>
                </div>
              </div>
              <div className="sw-rule-visual">
                <span className="sw-pressure sw-pressure--top">SWARM PRESSURE ↓</span>
                <span className="sw-pressure sw-pressure--bottom">↑ BROADSIDE</span>
                <HullDiagram />
              </div>
            </div>

            <div className="sw-pillar-grid">
              {PILLARS.map((pillar) => (
                <article className="sw-pillar" key={pillar.number}>
                  <div><span>{pillar.number}</span><i>P{pillar.number}</i></div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sw-loop-section">
          <div className="sw-frame sw-loop-layout">
            <div className="sw-loop-intro">
              <CaseLabel>03 / the run</CaseLabel>
              <h2>Fight<br />Weld<br /><span>Turn again</span></h2>
              <p>The action loop stays simple; the spatial consequences accumulate Every two minutes, the dry-dock gives the puzzle room to breathe</p>
            </div>
            <div className="sw-loop-list" aria-label="STARWRECK run loop">
              {RUN_LOOP.map(([number, title, text], index) => (
                <article key={number}>
                  <span>{number}</span>
                  <div><strong>{title}</strong><p>{text}</p></div>
                  <i>{index < RUN_LOOP.length - 1 ? '↓' : '↻'}</i>
                </article>
              ))}
            </div>
            <figure className="sw-dock-figure">
              <img src="/starwreck/dry-dock.webp" alt="STARWRECK dry-dock environment art" />
              <figcaption><span>DRY-DOCK / PRODUCTION ASSET</span><p>Battle only accepts new pieces in empty cells Re-arrangement belongs here: free, deliberate, and separate from the swarm</p></figcaption>
            </figure>
          </div>
        </section>

        <section className="sw-artifacts" id="artifact">
          <div className="sw-frame">
            <div className="sw-section-head">
              <div><CaseLabel>04 / evidence from the build</CaseLabel><h2>The game,<br /><span>not a mockup</span></h2></div>
              <p>CAPTURED FROM THE LOCAL<br />PLAYABLE DEVELOPMENT BUILD</p>
            </div>
            <div className="sw-artifact-grid">
              <ArtifactFigure
                src="/starwreck/combat-capture.webp"
                alt="STARWRECK combat build with player ship, enemies, and HUD"
                index="A / 01"
                title="A live combat leg"
                detail="The ship, threat direction, run timer, hull state, and enemy pressure share one field The original tuning panel is cropped out"
              />
              <ArtifactFigure
                src="/starwreck/upgrade-capture.webp"
                alt="STARWRECK three-choice upgrade screen over the deck"
                index="A / 02"
                title="The build becomes spatial"
                detail="Three choices pause the world and land back on the deck: weapon arcs, support adjacency, or a rule that changes the whole hull"
              />
            </div>

            <div className="sw-asset-stage">
              <div className="sw-asset-copy">
                <CaseLabel light>Repository-owned production assets</CaseLabel>
                <h3>Cold scrap<br />Warm swarm</h3>
                <p>The ship stays in steel, cyan, and electric blue; the enemy field lives in red and organic magenta Readability comes from opposing material families before it comes from outlines</p>
                <span>SHIP / SCRAPPER HULL<br />BOSS / BROOD CARRIER<br />WEAPONS / AUTO · ARC · RAIL</span>
              </div>
              <img className="sw-asset-ship" src="/starwreck/scrapper-hull.webp" alt="" />
              <img className="sw-asset-boss" src="/starwreck/brood-carrier.webp" alt="" />
              <div className="sw-weapon-rack" aria-hidden="true">
                <img src="/starwreck/autocannon.webp" alt="" />
                <img src="/starwreck/arc-coil.webp" alt="" />
                <img src="/starwreck/railgun.webp" alt="" />
              </div>
              <span className="sw-asset-beam sw-asset-beam--one" />
              <span className="sw-asset-beam sw-asset-beam--two" />
            </div>
          </div>
        </section>

        <section className="sw-engine">
          <div className="sw-frame">
            <div className="sw-engine-head">
              <div><CaseLabel light>05 / making the run trustworthy</CaseLabel><h2>Save the truth,<br />not a <span>picture of it</span></h2></div>
              <p>A seeded game is only useful if pause, restore, language, and rendering cannot quietly fork it into another run</p>
            </div>

            <div className="sw-checksum-flow" aria-label="Deterministic run architecture">
              <div><span>01</span><strong>INPUT</strong><p>heading · choice</p></div>
              <i>→</i>
              <div><span>02</span><strong>FIXED STEP</strong><p>60 Hz · seeded RNG</p></div>
              <i>→</i>
              <div className="is-active"><span>03</span><strong>WORLD</strong><p>plain state · checksum</p></div>
              <i>→</i>
              <div><span>04</span><strong>VIEW</strong><p>Pixi world · DOM UI</p></div>
              <b>↓ CAPTURE / RESTORE<br />RNG CURSOR + ENTITIES + ECONOMY</b>
            </div>

            <div className="sw-law-grid">
              {ENGINE_LAWS.map((law) => (
                <article key={law.number}>
                  <div><span>{law.number}</span><i>{law.tag}</i></div>
                  <h3>{law.title}</h3>
                  <p>{law.text}</p>
                </article>
              ))}
            </div>

            <div className="sw-proof-band">
              <div><strong>60</strong><span>LOGIC TICKS<br />PER SECOND</span></div>
              <div><strong>03</strong><span>INDEPENDENT KEYS<br />RUN · META · SETTINGS</span></div>
              <div><strong>00</strong><span>AUTOMATIC LOG<br />UPLOADS ON WEB</span></div>
              <p>On desktop, run logs only export to a local JSON file On web, a log is sent only after an explicit player action</p>
            </div>
          </div>
        </section>

        <section className="sw-state">
          <div className="sw-frame sw-state-grid">
            <div className="sw-state-title">
              <CaseLabel>06 / current state</CaseLabel>
              <h2>Playable now<br /><span>Steam next</span></h2>
              <p>The repository describes a complete playable MVP and a Windows desktop path The store page and Steam release are not published yet</p>
            </div>
            <div className="sw-state-column">
              <div><span>NOW / VERIFIED IN REPOSITORY</span><i /></div>
              <ul>{NOW_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="sw-state-column">
              <div><span>NEXT / STEAM-05 → 10</span><i /></div>
              <ul>{NEXT_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
        </section>

        <section className="sw-outro">
          <img src="/starwreck/epilogue.webp" alt="" />
          <div className="sw-outro-shade" />
          <div className="sw-frame sw-outro-inner">
            <CaseLabel light>07 / take the helm</CaseLabel>
            <h2>Turn the hull<br /><span>Turn the fight</span></h2>
            <div className="sw-outro-actions">
              <CaseButton href={PLAY_URL}>PLAY THE WEB BUILD</CaseButton>
              <CaseButton light href="mailto:zhy0216@gmail.com">START A CONVERSATION</CaseButton>
            </div>
            <span className="sw-outro-note">WEB / CLOUDFLARE WORKERS · DESKTOP / WINDOWS X64</span>
          </div>
        </section>
      </main>

      <footer className="sw-footer">
        <div className="sw-frame sw-footer-top"><a href="/#work"><Arrow direction="left" /> ALL PROJECTS</a><span>NEXT CASE / BETTER-TRIGGER</span><a href="/work/better-trigger/">NEXT PROJECT <Arrow /></a></div>
        <div className="sw-frame sw-footer-bottom"><span>© {new Date().getFullYear()} YANG / 0216</span><span>STARWRECK / CASE STUDY 02</span><span>REACT · THREE.JS · SOURCE-VERIFIED COPY</span></div>
      </footer>
    </div>
  )
}

export default StarwreckPage
