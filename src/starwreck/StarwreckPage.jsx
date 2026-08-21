import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const PLAY_URL = 'https://starwreck.zhy0216-66c.workers.dev/'

const ROWS = [1, 3, 5, 7, 9, 9, 9, 9, 9, 7, 5, 3, 1]

const PILLARS = [
  {
    number: '01',
    title: 'Positioning is fire control.',
    cn: '走位即火控',
    text: 'A turret fires where its side faces. Turning is not dodging — it is choosing which hull to present to the swarm. Movement is aim.',
    detail: 'P1 / MOVEMENT = AIM',
  },
  {
    number: '02',
    title: 'The deck is the build.',
    cn: '甲板即 Build',
    text: 'Edge cells mount guns, interior cells feed them. Where a plate sits, what touches it, and what shape it forms replace the stat panel.',
    detail: 'P2 / LAYOUT = LOADOUT',
  },
  {
    number: '03',
    title: 'The shape is the progress.',
    cn: '船形即成长',
    text: 'Every expansion changes the silhouette. The ship you end a run with is a photograph of every choice you made.',
    detail: 'P3 / SILHOUETTE = PROGRESS',
  },
]

const LAWS = [
  {
    number: '01',
    title: 'SIM IS PURE',
    text: 'src/sim never imports pixi or the DOM. The world is plain data on a fixed 60 Hz step — Node can run it, and the render layer stays swappable.',
  },
  {
    number: '02',
    title: 'SEEDED TO THE TICK',
    text: '?seed=123 reproduces a run, checksum and all. The save carries the full true state — the rng cursor and every entity — and the acceptance test pins that the checksum is unchanged after load, every frame.',
  },
  {
    number: '03',
    title: 'RENDER IS A VIEW',
    text: 'Pixi draws the in-world scene, DOM draws the menus, entities come from an object pool. Two layers, one source of truth.',
  },
]

const DECISIONS = [
  {
    number: 'A',
    title: 'Pure sim, at a cost',
    text: 'Determinism and Node tests buy a truthful engine; the price is that rendering can never sneak logic into the world. Rules live in exactly one place.',
  },
  {
    number: 'B',
    title: 'Electron before Tauri',
    text: 'Tauri would shrink the runtime, but it adds a Rust/WebView toolchain before the first Steam build proves package size is actually a constraint.',
  },
  {
    number: 'C',
    title: 'No Steam Cloud at 0.1.0',
    text: 'v0.1.0 ships local offline saves only. The store page must not advertise cloud sync, cross-device, or reinstall recovery.',
  },
  {
    number: 'D',
    title: 'Run logs are write-only',
    text: 'A session log is never read back and never part of a save; uploading is opt-in per run, capped by hard quotas, and R2 logs expire after 30 days. No automatic telemetry.',
  },
  {
    number: 'E',
    title: 'Battle and dock are fenced',
    text: 'Mid-battle you may only place into empty cells. The dry-dock is free, unlimited reshuffle plus paid repair — two flow states never cannibalize each other.',
  },
]

const LOOP = [
  ['01', 'COLLECT', '残骸磁吸拾取'],
  ['02', 'LEVEL', '攒满触发升级'],
  ['03', 'CHOOSE', '塔 / 设施 / 拼块 / 法令'],
  ['04', 'WELD', '时停焊入空格'],
  ['05', 'BROADSIDE', '转舵 · 整舷齐射'],
]

const NOW_ITEMS = [
  'Playable MVP on the web (Cloudflare Workers) and a Windows x64 desktop ZIP',
  'Seeded starts, four combat legs + elite + boss, three-choice upgrades + dry-dock refit every two minutes',
  'Codex + conditional meta unlocks; run saves carry the full world state with a checksum',
  '简体中文 + English, offline-first desktop saves',
]

const NEXT_ITEMS = [
  'Steamworks onboarding, SteamPipe depot, store page, and AI-generated-content disclosure',
  'Real gameplay trailer + store capsule art — the current teaser is an AI concept reel',
  'QA pass against the release build and system-requirements measurement',
]

function Arrow({ direction = 'ne' }) {
  return (
    <svg className="sw-arrow" viewBox="0 0 16 16" aria-hidden="true">
      {direction === 'left' ? <path d="M14 8H3m4-4L3 8l4 4" /> : <path d="M3 13 13 3M5 3h8v8" />}
    </svg>
  )
}

function SwMark({ className = '' }) {
  return (
    <svg className={`sw-mark ${className}`} viewBox="0 0 720 720" aria-hidden="true">
      <defs>
        <linearGradient id="sw-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9f5ff" />
          <stop offset="0.32" stopColor="#5aaec7" />
          <stop offset="1" stopColor="#21384b" />
        </linearGradient>
        <linearGradient id="sw-core" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#d9fbff" />
          <stop offset="0.55" stopColor="#58d8f5" />
          <stop offset="1" stopColor="#197c9d" />
        </linearGradient>
        <filter id="sw-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform="translate(110 110)">
        <path d="M250 0 420 74 500 250 420 426 250 500 80 426 0 250 80 74Z" fill="#081521" stroke="#61e5fb" strokeWidth="17" strokeLinejoin="round" filter="url(#sw-glow)" />
        <path d="M250 43 384 101 449 250 384 399 250 457 116 399 51 250 116 101Z" fill="url(#sw-steel)" stroke="#172b3b" strokeWidth="16" strokeLinejoin="round" />
        <path d="M250 82 354 139 397 250 354 361 250 418 146 361 103 250 146 139Z" fill="#182b3c" stroke="#8ceeff" strokeOpacity=".65" strokeWidth="8" strokeLinejoin="round" />
        <path d="M250 108 319 179 343 250 319 321 250 392 181 321 157 250 181 179Z" fill="url(#sw-core)" stroke="#d7fbff" strokeWidth="8" strokeLinejoin="round" />
        <path d="M250 143 286 220 277 278 250 330 223 278 214 220Z" fill="#eefeff" opacity=".92" />
        <path d="M250 154 264 230 250 267 236 230Z" fill="#78efff" />
        <path d="M102 163 159 187M398 187 455 163M102 337 159 313M398 313 455 337" stroke="#ffb34c" strokeWidth="14" strokeLinecap="round" />
        <path d="M47 250H112M388 250H453" stroke="#8ceeff" strokeWidth="13" strokeLinecap="round" />
        <path d="M174 83 202 52M326 83 298 52M174 417 202 448M326 417 298 448" stroke="#496b7d" strokeWidth="11" strokeLinecap="round" />
        <circle cx="250" cy="250" r="13" fill="#fff" />
      </g>
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

function buildDeck() {
  const present = {}
  ROWS.forEach((w, r) => {
    for (let o = 0; o < w; o += 1) present[`${r},${o - Math.floor(w / 2)}`] = true
  })
  const has = (r, c) => Boolean(present[`${r},${c}`])
  const cells = []
  ROWS.forEach((w, r) => {
    for (let o = 0; o < w; o += 1) {
      const c = o - Math.floor(w / 2)
      const missing = 4 - [has(r - 1, c), has(r + 1, c), has(r, c - 1), has(r, c + 1)].filter(Boolean).length
      cells.push({ r, c, type: missing === 0 ? 0 : missing === 1 ? 1 : 2 })
    }
  })
  return cells
}

function StarwreckScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(0, 2.1, 10.6)
    camera.lookAt(0, 0, 0)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      mount.classList.add('sw-scene--fallback')
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    group.rotation.set(-0.42, 0.5, -0.1)
    scene.add(group)

    const uniforms = { uTime: { value: 0 } }

    const cells = buildDeck()
    const center = (ROWS.length - 1) / 2
    const present = new Set(cells.map((cell) => `${cell.r},${cell.c}`))
    const hasCell = (r, c) => present.has(`${r},${c}`)
    const quad = [-0.46, -0.46, 0.46, -0.46, 0.46, 0.46, -0.46, 0.46]
    const positions = []
    const types = []
    const phases = []
    const indices = []
    let seed = 216
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    cells.forEach((cell) => {
      const x = cell.c
      const y = cell.r - center
      const base = positions.length / 3
      for (let i = 0; i < 4; i += 1) {
        positions.push(x + quad[i * 2], y + quad[i * 2 + 1], 0)
        types.push(cell.type)
        phases.push(random())
      }
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('aType', new THREE.Float32BufferAttribute(types, 1))
    geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1))
    geometry.setIndex(indices)

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        uniform float uTime;
        attribute float aType;
        attribute float aPhase;
        varying float vType;
        varying float vPhase;
        varying vec3 vPos;
        void main() {
          vType = aType;
          vPhase = aPhase;
          vec3 p = position;
          vPos = p;
          p.z += sin(p.x * 0.85 + uTime * 0.55) * 0.045;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying float vType;
        varying float vPhase;
        varying vec3 vPos;
        void main() {
          vec3 accent = vec3(0.003, 0.067, 0.886);
          vec3 accentLight = vec3(0.32, 0.41, 1.0);
          vec3 core = vec3(0.012, 0.012, 0.03);
          vec3 hull = vec3(0.028, 0.05, 0.10);
          vec3 muzzle = vec3(1.0, 0.70, 0.30);
          float ang = atan(vPos.x, vPos.y);
          vec3 col = core;
          if (vType >= 1.0) {
            float cycle = 0.5 + 0.5 * sin(uTime * 0.85 + ang * 1.1 + vPhase * 6.283);
            float band = pow(cycle, 3.0);
            col = mix(accent, accentLight, 0.2 + 0.5 * band);
            float sweep = 0.5 + 0.5 * sin(uTime * 1.2 - ang * 1.0);
            float flash = smoothstep(0.985, 1.0, sweep);
            col += muzzle * flash * 0.8;
            if (vType >= 2.0) col = mix(accentLight, accent, 0.5);
          } else {
            col = mix(core, hull, 0.5 + 0.25 * sin(uTime * 0.5 + vPhase * 6.283));
          }
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    })

    const deck = new THREE.Mesh(geometry, material)
    group.add(deck)

    const seams = []
    cells.forEach((cell) => {
      const x = cell.c
      const y = cell.r - center
      if (hasCell(cell.r, cell.c + 1)) seams.push(x + 0.5, y, 0.02)
      if (hasCell(cell.r + 1, cell.c)) seams.push(x, y + 0.5, 0.02)
    })
    const seamGeometry = new THREE.BufferGeometry()
    seamGeometry.setAttribute('position', new THREE.Float32BufferAttribute(seams, 3))
    const seamMaterial = new THREE.LineBasicMaterial({ color: 0x2638ff, transparent: true, opacity: 0.28 })
    const seamLines = new THREE.LineSegments(seamGeometry, seamMaterial)
    seamLines.position.z = 0.03
    group.add(seamLines)

    const starGeometry = new THREE.BufferGeometry()
    const starPositions = new Float32Array(240 * 3)
    for (let i = 0; i < 240; i += 1) {
      const radius = 5.4 + random() * 5.6
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
      new THREE.PointsMaterial({ color: 0x5268ff, size: 0.014, transparent: true, opacity: 0.5 }),
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
    const clock = new THREE.Clock()
    let frame = 0
    const render = () => {
      const elapsed = clock.getElapsedTime()
      uniforms.uTime.value = reducedMotion ? 0.55 : elapsed
      if (!reducedMotion) {
        group.rotation.y += ((0.5 + pointer.x * 0.14) - group.rotation.y) * 0.028
        group.rotation.x += ((-0.42 - pointer.y * 0.1) - group.rotation.x) * 0.028
        group.rotation.z = -0.1 + Math.sin(elapsed * 0.14) * 0.02
        stars.rotation.z = elapsed * 0.008
      }
      renderer.render(scene, camera)
      if (!reducedMotion) frame = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      resizeObserver.disconnect()
      geometry.dispose()
      material.dispose()
      seamGeometry.dispose()
      seamMaterial.dispose()
      starGeometry.dispose()
      stars.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="sw-scene" aria-hidden="true" />
}

function DeckDiagram({ compact = false }) {
  const cells = buildDeck()
  return (
    <div className={`sw-deck ${compact ? 'sw-deck--compact' : ''}`} aria-hidden="true">
      {ROWS.map((w, r) => (
        <div className="sw-deck-row" key={r}>
          {cells.filter((cell) => cell.r === r).map((cell) => (
            <span key={`${cell.r}-${cell.c}`} className={`sw-deck-cell sw-deck-cell--${cell.type === 0 ? 'core' : cell.type === 1 ? 'edge' : 'corner'}`} />
          ))}
        </div>
      ))}
    </div>
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
              <div className="sw-title-lockup"><SwMark /><h1>STARWRECK<span>.</span></h1></div>
              <p className="sw-hero-cn-name">《星骸》</p>
              <p className="sw-hero-lede">A warship you weld together tile by tile, turning in an endless swarm to bring your <span>broadside</span> to bear.</p>
              <p className="sw-hero-cn">你是一艘船的全部:船长、舵手、总工程师。边缘格开火,内部格供能——转舵,就是火控。</p>
              <div className="sw-hero-actions">
                <CaseButton href={PLAY_URL}>PLAY THE BUILD</CaseButton>
                <TextLink light href="#premise">WHY I BUILT IT</TextLink>
              </div>
            </div>
            <div className="sw-hero-scene"><StarwreckScene /></div>
            <div className="sw-scene-caption"><span>PROCEDURAL DECK STUDY / 001</span><span>MOVE YOUR CURSOR</span></div>
            <div className="sw-hero-meta">
              <div><span>ROLE</span><strong>GAME DESIGN<br />ENGINEERING<br />BUILD</strong></div>
              <div><span>STACK</span><strong>TYPESCRIPT<br />PIXIJS · VITE<br />ELECTRON</strong></div>
              <div><span>STATUS</span><strong>PLAYABLE MVP<br />→ STEAM 0.1.0</strong></div>
              <div><span>PLATFORM</span><strong>WEB<br />WINDOWS X64</strong></div>
            </div>
          </div>
          <div className="sw-frame sw-hero-foot"><span>PROJECT / 02</span><span className="sw-rule" /><span>SCROLL TO UNPACK ↓</span></div>
        </section>

        <section className="sw-premise" id="premise">
          <div className="sw-frame sw-premise-grid">
            <aside className="sw-aside"><CaseLabel>01 / the premise</CaseLabel><p>Survivors-likes grow through invisible stat panels. What if the build were a hull you could see?</p><span>VS-LIKE × BACKPACK-LIKE<br />SPACE · SINGLE-PLAYER</span></aside>
            <div className="sw-premise-main">
              <h2>What if the build<br />was a hull you <span>could see?</span></h2>
              <div className="sw-premise-copy">
                <p>Plenty of games let you mow down hundreds of enemies. Almost none make your build a firing, directional space puzzle. STARWRECK starts from one constraint: the deck is a grid, edge cells fire outward, interior cells feed the guns — so every choice stays visible on the ship&apos;s silhouette.</p>
                <p>市面上的割草生存把成长藏在数值面板里。《星骸》把 build 长在船的轮廓上:每一块甲板都朝向、都会开火、都改变剪影。一局打完,船的轮廓就是这 25 分钟所有选择的合影。</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sw-pillars">
          <div className="sw-frame">
            <div className="sw-section-head"><div><CaseLabel light>02 / design pillars</CaseLabel><h2>Three decisions<br />carry the whole game.</h2></div><p>EVERY FEATURE IS TESTED<br />AGAINST THESE THREE, IN ORDER.</p></div>
            <div className="sw-pillar-grid">
              {PILLARS.map((item) => (
                <article className="sw-pillar" key={item.number}>
                  <div className="sw-pillar-top"><span>{item.number}</span><span>{item.detail}</span></div>
                  <h3>{item.title}</h3>
                  <p className="sw-pillar-cn">{item.cn}</p>
                  <p className="sw-pillar-text">{item.text}</p>
                  <span className="sw-pillar-arrow">↘</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sw-system">
          <div className="sw-frame sw-system-grid">
            <div className="sw-system-intro"><CaseLabel>03 / the deck rule</CaseLabel><h2>One rule.<br /><span>Two kinds of tile.</span></h2><p>边缘格开火,内部格供能。整场游戏只需要记住这一条。</p><DeckDiagram /><div className="sw-deck-legend"><span><i className="sw-legend-edge" />EDGE CELLS FIRE</span><span><i className="sw-legend-corner" />CORNER = TWO ARCS</span><span><i className="sw-legend-core" />CORE CELLS POWER</span></div></div>
            <div className="sw-system-body">
              <div className="sw-weld-note">
                <p>Welding a new plate internalizes an old edge — an ex-emplacement becomes guts and its gun goes dark until you reshuffle at the dry-dock. <strong>Expansion is always a paid choice, never free size.</strong></p>
                <span>焊板会内化旧边缘格 / 炮位变内脏位</span>
              </div>
              <div className="sw-loop" aria-label="Starwreck minute loop">
                {LOOP.map(([number, title, text], index) => (
                  <div className="sw-loop-node" key={number}>
                    <span>{number}</span><strong>{title}</strong><p>{text}</p>{index < LOOP.length - 1 && <i>→</i>}
                  </div>
                ))}
              </div>
              <div className="sw-loop-foot"><span>THE MINUTE LOOP</span><span>COLLECT → LEVEL → CHOOSE → WELD → BROADSIDE</span></div>
            </div>
          </div>
        </section>

        <section className="sw-engine">
          <div className="sw-frame">
            <div className="sw-engine-intro"><div><CaseLabel light>04 / the engine</CaseLabel><h2>Deterministic at<br />the <span>math level.</span></h2></div><p>The world runs on fixed 60 Hz logic with an explicit rng cursor — so a run can be reproduced, saved as truth, and verified by machine.</p></div>
            <div className="sw-law-list">
              {LAWS.map((law) => <article className="sw-law" key={law.number}><span>{law.number}</span><div><h3>{law.title}</h3><p>{law.text}</p></div></article>)}
            </div>
            <div className="sw-cli-band"><span>AUTO-BALANCE CLI</span><div><code>npm run balance</code><span>solves the numeric tables — seven judge tests are the acceptance gate.</span></div></div>
          </div>
        </section>

        <section className="sw-numbers">
          <div className="sw-frame">
            <div className="sw-numbers-head"><CaseLabel light>05 / repository snapshot</CaseLabel><p>AUGUST 2026 / MEASURED · LOCAL WORKTREE</p></div>
            <div className="sw-stat-grid">
              <div><strong>1057</strong><span>TESTS PASSING<br />ACROSS 85 FILES</span></div>
              <div><strong>31K</strong><span>TYPESCRIPT<br />SOURCE LINES*</span></div>
              <div><strong>1000</strong><span>ENEMIES @ 60FPS<br />DESIGN BUDGET**</span></div>
              <div><strong>2</strong><span>LOCALIZED<br />ZH-CN + EN***</span></div>
            </div>
            <div className="sw-numbers-foot"><span>* EXCLUDING TESTS · ** INCLUDES A DEV-ONLY 1000-ENEMY STRESS PANEL · *** HARD-CODED TEXT BLOCKED BY AN AST GATE</span></div>
          </div>
        </section>

        <section className="sw-decisions">
          <div className="sw-frame sw-decisions-grid">
            <div className="sw-decisions-title"><CaseLabel>06 / engineering decisions</CaseLabel><h2>The invisible work<br />is the <span>fleet.</span></h2><p>框架的取舍决定了船能开多快、多稳。</p></div>
            <div className="sw-decision-list">
              {DECISIONS.map((item) => <article key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="sw-state">
          <div className="sw-frame sw-state-grid">
            <div className="sw-state-title"><CaseLabel light>07 / current state</CaseLabel><h2>Playable now.<br /><span>Shipping next.</span></h2></div>
            <div className="sw-state-col"><div className="sw-state-colhead"><span>NOW / PLAYABLE MVP</span><span className="sw-state-line" /></div><ul>{NOW_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="sw-state-col"><div className="sw-state-colhead"><span>NEXT / STEAM-05 → 10</span><span className="sw-state-line" /></div><ul>{NEXT_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
        </section>

        <section className="sw-outro">
          <div className="sw-outro-grid" />
          <div className="sw-frame sw-outro-inner">
            <CaseLabel light>08 / play it</CaseLabel>
            <h2>Turn the hull.<br /><span>Bring the broadside</span> to bear.</h2>
            <p>转舵,就是火控。试着在浏览器里打一局:开局两座塔来自同一颗种子,每一块甲板都是你自己的焊接方案。</p>
            <div className="sw-outro-actions"><CaseButton href={PLAY_URL}>PLAY THE BUILD</CaseButton><CaseButton href="mailto:zhy0216@gmail.com" light>START A CONVERSATION</CaseButton></div>
            <span className="sw-outro-note">WEB PROTOTYPE ON CLOUDFLARE WORKERS · STEAM BUILD WINDOWS X64 · 简体中文 + ENGLISH</span>
          </div>
        </section>
      </main>

      <footer className="sw-footer">
        <div className="sw-frame sw-footer-top"><a href="/#work"><Arrow direction="left" /> ALL PROJECTS</a><span>NEXT CASE / BETTER-TRIGGER</span><a href="mailto:zhy0216@gmail.com">START A CONVERSATION <Arrow /></a></div>
        <div className="sw-frame sw-footer-bottom"><span>© {new Date().getFullYear()} YANG / 0216</span><span>STARWRECK / CASE STUDY 02</span><span>BUILT WITH REACT + THREE.JS</span></div>
      </footer>
    </div>
  )
}

export default StarwreckPage
