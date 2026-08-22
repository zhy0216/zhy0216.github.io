import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const GITHUB_URL = 'https://github.com/zhy0216/better-trigger'
const DOCS_URL = 'https://zhy0216.github.io/better-trigger/'

const PRINCIPLES = [
  {
    number: '01',
    title: 'Replay, not snapshots',
    text: 'Completed steps are memoized in Postgres After a crash or a long wait, the task function re-runs from the top and cached steps return instantly — your code stays a straight-line async function',
    detail: 'STEP MEMORY / POS SEQ',
  },
  {
    number: '02',
    title: 'Postgres is the whole stack',
    text: 'Queue, orchestrator loops and the replay executor live in the runtime and coordinate with FOR UPDATE SKIP LOCKED Run N daemons against one database — no leader election',
    detail: 'ONE DATABASE / NO REDIS',
  },
  {
    number: '03',
    title: 'The SDK cannot reach Postgres',
    text: 'The app-facing package speaks HTTP and depends only on the zero-dependency core package CI fails if pg — or any extra runtime dependency — crosses that boundary',
    detail: 'HTTP CLIENT / NO PG',
  },
  {
    number: '04',
    title: 'One process, or many',
    text: 'Run the worker as a standalone daemon, or embed the same runtime in a long-lived Node/Bun app with createEmbeddedRuntime No second port, no second execution model',
    detail: 'DAEMON + EMBEDDED',
  },
  {
    number: '05',
    title: 'Crash-safe by construction',
    text: 'Persistent leases plus a monotonic fencing token reject late writes from a dead worker Step history stays exactly-once even across SIGKILL',
    detail: 'LEASE + FENCING TOKEN',
  },
]

const REPLAY_PASSES = [
  {
    id: 'first',
    number: 'PASS 01',
    title: 'Execute until the durable boundary',
    token: 'FENCING TOKEN / 18',
    cells: [
      { seq: '00', kind: 'STEP', label: 'create-user', state: 'done', note: 'COMMIT OUTPUT' },
      { seq: '01', kind: 'WAIT', label: '24 hours', state: 'wait', note: 'SUSPEND RUN' },
      { seq: '02', kind: 'STEP', label: 'send-tips', state: 'future', note: 'NOT REACHED' },
      { seq: 'OUT', kind: 'RUN', label: 'completed', state: 'future', note: 'PENDING' },
    ],
  },
  {
    id: 'replay',
    number: 'PASS 02',
    title: 'Replay from the top; continue from memory',
    token: 'FENCING TOKEN / 19',
    cells: [
      { seq: '00', kind: 'STEP', label: 'create-user', state: 'cached', note: 'CACHE HIT' },
      { seq: '01', kind: 'WAIT', label: '24 hours', state: 'cached', note: 'CACHE HIT' },
      { seq: '02', kind: 'STEP', label: 'send-tips', state: 'active', note: 'EXECUTE ONCE' },
      { seq: 'OUT', kind: 'RUN', label: 'completed', state: 'terminal', note: 'PERSIST RESULT' },
    ],
  },
]

const STATS = [
  ['2,584', 'ASSERTIONS IN THE<br />UNIT SUITE*'],
  ['1,114', 'TEST CASES ACROSS<br />104 FILES*'],
  ['20', 'ACCEPTANCE HARNESSES,<br />EACH ON A REAL POSTGRES'],
  ['0', 'THIRD-PARTY RUNTIME DEPS<br />ON THE CLIENT PATH'],
]

const DECISIONS = [
  {
    number: 'A',
    title: 'History exactly-once, side effects at-least-once',
    text: 'The ledger never records a step twice, but an external call may run more than once after a crash Idempotency keys are the caller\u2019s lever — LLM calls cost money, so bring a key',
  },
  {
    number: 'B',
    title: 'Notify for speed, poll for correctness',
    text: 'pg_notify wakes idle claim loops and terminal result waiters Every consumer still keeps a bounded polling fallback, so a dropped notification changes latency — never the outcome',
  },
  {
    number: 'C',
    title: 'Determinism is the contract',
    text: 'Code between steps re-runs on every replay, so it must be deterministic ctx.now / ctx.random / ctx.uuid are memoized; fingerprint drift fails loud as NonDeterminismError',
  },
  {
    number: 'D',
    title: 'State is durable, compute needs a host',
    text: 'With no daemon online, nothing executes — timers and cron included, and missed cron windows are not backfilled The shutdown semantics are a documented promise, not an accident',
  },
  {
    number: 'E',
    title: 'One binary, every shape',
    text: '--tasks and --no-serve are independent: all-in-one, API-only, or executor-only from the same build Embedded shares the host\u2019s failure domain by explicit choice',
  },
]

const NOW_ITEMS = [
  'Kernel complete: claim / lease / fencing, replay executor, retries, cron, waits, concurrency limits',
  'Daemon + embedded runtime; dashboard served by the daemon itself — same origin, no CORS',
  'LISTEN / NOTIFY fast path with polling fallback; health + Prometheus metrics, retention / prune',
  '20 acceptance harnesses over real Postgres run on every PR',
]

const NEXT_ITEMS = [
  'Events: event() / wait.forEvent, cancel cascading, virtual time',
  'batchTriggerAndWait and richer fan-out / fan-in primitives',
  'Agent primitives: ctx.handoff / ctx.gather / ctx.requestApproval / ctx.llm',
  'Plugin interceptors, determinism linting, CLI and auth polish',
]

function Arrow({ direction = 'ne' }) {
  return (
    <svg className="bt-arrow" viewBox="0 0 16 16" aria-hidden="true">
      {direction === 'left' ? <path d="M14 8H3m4-4L3 8l4 4" /> : <path d="M3 13 13 3M5 3h8v8" />}
    </svg>
  )
}

function BtMark({ className = '' }) {
  return (
    <svg className={`bt-mark ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" fill="#0011e2" />
      <path d="M26 17 48 32 26 47Z" fill="#f4f4f0" />
      <rect x="17" y="20" width="4" height="24" fill="#f4f4f0" opacity=".55" />
      <path d="M17 20h8M17 44h8" stroke="#f4f4f0" strokeWidth="2" opacity=".55" />
    </svg>
  )
}

function CaseLabel({ children, light = false }) {
  return <span className={`bt-label ${light ? 'bt-label--light' : ''}`}>{children}</span>
}

function CaseButton({ children, href, light = false }) {
  return (
    <a className={`bt-button ${light ? 'bt-button--light' : ''}`} href={href} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <Arrow />
    </a>
  )
}

function TextLink({ children, href, light = false }) {
  return (
    <a className={`bt-textlink ${light ? 'bt-textlink--light' : ''}`} href={href}>
      {children} <Arrow />
    </a>
  )
}

const CELLS = [
  { i: 0, state: 1, h: 0.62 },
  { i: 1, state: 1, h: 0.5 },
  { i: 2, state: 1, h: 0.8 },
  { i: 3, state: 1, h: 0.58 },
  { i: 4, state: 1, h: 0.72 },
  { i: 5, state: 1, h: 0.46 },
  { i: 6, state: 2, h: 0 },
  { i: 7, state: 2, h: 0 },
  { i: 8, state: 1, h: 0.55 },
  { i: 9, state: 1, h: 0.85 },
  { i: 10, state: 1, h: 0.6 },
  { i: 11, state: 1, h: 0.75 },
  { i: 12, state: 1, h: 0.5 },
  { i: 13, state: 1, h: 0.9 },
  { i: 14, state: 1, h: 0.62 },
  { i: 15, state: 2, h: 0 },
  { i: 16, state: 0, h: 0.55 },
  { i: 17, state: 0, h: 0.7 },
  { i: 18, state: 1, h: 0.5 },
  { i: 19, state: 1, h: 0.78 },
  { i: 20, state: 1, h: 0.6 },
  { i: 21, state: 0, h: 0.66 },
]

function buildRail() {
  const X0 = -5.25
  const STEP = 0.5
  const HALF = 0.17
  const positions = []
  const centers = []
  const halves = []
  const states = []
  const heights = []
  const phases = []
  const indices = []
  let seed = 6216
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  CELLS.forEach((cell) => {
    if (cell.state === 2) return
    const x = X0 + cell.i * STEP
    const base = positions.length / 3
    positions.push(-1, 0, 0, 1, 0, 0, 1, 1, 0, -1, 1, 0)
    for (let v = 0; v < 4; v += 1) {
      centers.push(x)
      halves.push(HALF)
      states.push(cell.state)
      heights.push(cell.h)
      phases.push(random())
    }
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('aCenter', new THREE.Float32BufferAttribute(centers, 1))
  geometry.setAttribute('aHalf', new THREE.Float32BufferAttribute(halves, 1))
  geometry.setAttribute('aState', new THREE.Float32BufferAttribute(states, 1))
  geometry.setAttribute('aHeight', new THREE.Float32BufferAttribute(heights, 1))
  geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1))
  geometry.setIndex(indices)
  return geometry
}

function buildBrackets() {
  const points = []
  const pushBracket = (cx, y) => {
    const w = 0.34
    points.push(cx - w, y, 0, cx - w, y + 0.22, 0)
    points.push(cx + w, y, 0, cx + w, y + 0.22, 0)
    points.push(cx - w, y + 0.22, 0, cx + w, y + 0.22, 0)
  }
  pushBracket(-2.0, 1.02)
  pushBracket(2.5, 1.02)
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return g
}

function buildTicks() {
  const points = []
  CELLS.forEach((cell) => {
    if (cell.state === 2) return
    const x = -5.25 + cell.i * 0.5
    points.push(x, -0.07, 0, x, 0, 0)
  })
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3))
  return g
}

function BetterTriggerScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 1.75, 7.6)
    camera.lookAt(0, 0.12, 0)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      mount.classList.add('bt-scene--fallback')
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    group.rotation.set(-0.1, 0.14, 0.02)
    scene.add(group)

    const uniforms = { uTime: { value: 0 }, uCursor: { value: 0 } }

    const bars = new THREE.Mesh(
      buildRail(),
      new THREE.ShaderMaterial({
        uniforms,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        vertexShader: `
          uniform float uCursor;
          attribute float aCenter;
          attribute float aHalf;
          attribute float aState;
          attribute float aHeight;
          attribute float aPhase;
          varying float vState;
          varying float vCenter;
          varying float vReading;
          void main() {
            vState = aState;
            vCenter = aCenter;
            float rise = aState >= 1.0 ? 1.0 : smoothstep(aCenter, aCenter + 1.2, uCursor);
            float h = aHeight * rise;
            vec3 p = position;
            p.x = aCenter + position.x * aHalf;
            p.y = position.y * h;
            p.z += sin(aCenter * 1.4 + aPhase * 9.0) * 0.05;
            vReading = 1.0 - clamp(abs(aCenter - uCursor) / 0.95, 0.0, 1.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uCursor;
          varying float vState;
          varying float vCenter;
          varying float vReading;
          void main() {
            vec3 accent = vec3(0.0, 0.067, 0.886);
            vec3 accentLight = vec3(0.32, 0.41, 1.0);
            vec3 paper = vec3(0.93, 0.93, 0.88);
            vec3 col;
            if (vState >= 1.0) {
              col = mix(vec3(0.1, 0.11, 0.28), accent, 0.42);
              col = mix(col, accentLight, vReading * 0.55);
              col = mix(col, paper, pow(vReading, 3.0) * 0.4);
            } else {
              col = mix(vec3(0.05, 0.06, 0.12), vec3(0.11, 0.15, 0.36), vReading * 0.65);
            }
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    )
    group.add(bars)

    const railMaterial = new THREE.LineBasicMaterial({ color: 0x2638ff, transparent: true, opacity: 0.75 })
    const railGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-5.55, 0, 0),
      new THREE.Vector3(5.55, 0, 0),
    ])
    const rail = new THREE.Line(railGeometry, railMaterial)
    group.add(rail)

    const tickGeometry = buildTicks()
    const tickMaterial = new THREE.LineBasicMaterial({ color: 0x5268ff, transparent: true, opacity: 0.22 })
    const ticks = new THREE.LineSegments(tickGeometry, tickMaterial)
    group.add(ticks)

    const bracketGeometry = buildBrackets()
    const bracketMaterial = new THREE.LineBasicMaterial({ color: 0x9da8ff, transparent: true, opacity: 0.4 })
    const brackets = new THREE.LineSegments(bracketGeometry, bracketMaterial)
    group.add(brackets)

    const headMaterial = new THREE.LineBasicMaterial({ color: 0xf4f4f0, transparent: true, opacity: 0.9 })
    const headGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.12, 0),
      new THREE.Vector3(0, 1.35, 0),
    ])
    const head = new THREE.Line(headGeometry, headMaterial)
    group.add(head)

    const grid = new THREE.GridHelper(11, 11, 0x2638ff, 0x1a2aff)
    grid.material.transparent = true
    grid.material.opacity = 0.13
    grid.position.y = -1.75
    group.add(grid)

    const dotGeometry = new THREE.BufferGeometry()
    const dotPositions = new Float32Array(130 * 3)
    let dseed = 9621
    const drandom = () => {
      dseed = (dseed * 1664525 + 1013904223) % 4294967296
      return dseed / 4294967296
    }
    for (let i = 0; i < 130; i += 1) {
      const i3 = i * 3
      dotPositions[i3] = (drandom() - 0.5) * 16
      dotPositions[i3 + 1] = (drandom() - 0.5) * 4.6 - 0.4
      dotPositions[i3 + 2] = -1.6 - drandom() * 3.2
    }
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3))
    const dots = new THREE.Points(
      dotGeometry,
      new THREE.PointsMaterial({ color: 0x5268ff, size: 0.02, transparent: true, opacity: 0.5 }),
    )
    group.add(dots)

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
    let visible = true
    const render = () => {
      const elapsed = clock.getElapsedTime()
      if (reducedMotion) {
        uniforms.uCursor.value = 2.1
        head.position.x = uniforms.uCursor.value
      } else {
        const t = (Math.sin(elapsed * 0.34) + 1) / 2
        const eased = t * t * (3 - 2 * t)
        uniforms.uCursor.value = -4.4 + eased * 8.8
        uniforms.uTime.value = elapsed
        head.position.x = uniforms.uCursor.value
        group.rotation.y += ((0.14 + pointer.x * 0.12) - group.rotation.y) * 0.028
        group.rotation.x += ((-0.1 - pointer.y * 0.09) - group.rotation.x) * 0.028
        dots.rotation.z = elapsed * 0.006
      }
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
    }, { rootMargin: '160px' })
    visibilityObserver.observe(mount)
    render()

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      bars.geometry.dispose()
      bars.material.dispose()
      railGeometry.dispose()
      railMaterial.dispose()
      tickGeometry.dispose()
      tickMaterial.dispose()
      bracketGeometry.dispose()
      bracketMaterial.dispose()
      headGeometry.dispose()
      headMaterial.dispose()
      grid.geometry.dispose()
      grid.material.dispose()
      dotGeometry.dispose()
      dots.material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="bt-scene" aria-hidden="true" />
}

function CodePanel({ number, label, children }) {
  return (
    <article className="bt-code-panel">
      <div className="bt-code-head"><span>{number}</span><span>{label}</span><span>TYPESCRIPT / STRAIGHT-LINE ASYNC</span></div>
      <pre><code>{children}</code></pre>
    </article>
  )
}

function ReplayPass({ pass }) {
  return (
    <article className={`bt-replay-pass bt-replay-pass--${pass.id}`}>
      <div className="bt-replay-passhead">
        <span>{pass.number}</span>
        <h3>{pass.title}</h3>
        <small>{pass.token}</small>
      </div>
      <div className="bt-replay-track" role="list">
        <span className="bt-replay-cursor" aria-hidden="true" />
        {pass.cells.map((cell) => (
          <div className={`bt-replay-cell bt-replay-cell--${cell.state}`} role="listitem" key={`${pass.id}-${cell.seq}`}>
            <div className="bt-replay-celltop"><span>{cell.seq}</span><span>{cell.kind}</span></div>
            <strong>{cell.label}</strong>
            <small>{cell.note}</small>
          </div>
        ))}
      </div>
    </article>
  )
}

function RuntimePath({ mode, source, transport, runtime }) {
  return (
    <div className="bt-runtime-row">
      <span className="bt-runtime-mode">{mode}</span>
      <strong>{source}</strong>
      <i>{transport}</i>
      <strong>{runtime}</strong>
      <i>SQL</i>
      <strong>POSTGRES</strong>
    </div>
  )
}

function BetterTriggerPage() {
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
    <div className="better-trigger-page">
      <header className="bt-nav">
        <div className="bt-nav-inner">
          <a className="bt-wordmark" href="/">YANG</a>
          <span className="bt-nav-case">CASE STUDY <i>/</i> 03</span>
          <a className="bt-nav-back" href="/#work"><Arrow direction="left" /> BACK TO INDEX</a>
        </div>
        <span className="bt-progress" style={{ width: `${progress}%` }} />
      </header>

      <main>
        <section className="bt-hero">
          <div className="bt-hero-grid" />
          <div className="bt-frame bt-hero-inner">
            <div className="bt-hero-copy">
              <CaseLabel light>Selected work / open source · durable execution / 2026</CaseLabel>
              <div className="bt-title-lockup"><BtMark /><h1>BETTER-<br /><span>TRIGGER</span></h1></div>
              <p className="bt-hero-lede">Straight-line TypeScript<br /><span>Durable memory in Postgres</span></p>
              <div className="bt-hero-actions">
                <CaseButton href={GITHUB_URL}>VIEW ON GITHUB</CaseButton>
                <CaseButton href={DOCS_URL} light>READ THE DOCS</CaseButton>
              </div>
            </div>
            <div className="bt-hero-scene"><BetterTriggerScene /><div className="bt-scene-caption"><span>PASS 01 → SUSPEND → PASS 02</span><span>POSITIONAL STEP MEMORY</span></div></div>
            <div className="bt-hero-meta">
              <div><span>ROLE</span><strong>CREATOR<br />ENGINEERING<br />API DESIGN</strong></div>
              <div><span>STACK</span><strong>TYPESCRIPT<br />POSTGRES · BUN<br />HONO · DRIZZLE</strong></div>
              <div><span>STATUS</span><strong>0.1.0<br />P2 HARDENING</strong></div>
              <div><span>LICENSE</span><strong>MIT</strong></div>
            </div>
          </div>
          <div className="bt-frame bt-hero-foot"><span>PROJECT / 03</span><span className="bt-rule" /><span>SCROLL TO UNPACK ↓</span></div>
        </section>

        <section className="bt-premise">
          <div className="bt-frame bt-premise-grid">
            <aside className="bt-aside"><CaseLabel>01 / the premise</CaseLabel><p>Durable execution usually means adding infrastructure What if the database you already run were enough?</p><span>REPLAY MODEL<br />POSTGRES-ONLY V1</span></aside>
            <div className="bt-premise-main">
              <h2>Why does a queue <em>stop being enough</em><br />the moment a job waits?</h2>
              <div className="bt-premise-copy">
                <p>Background jobs start simple — enqueue, run, done Then one job needs to wait a day, another needs three retries, a third must fan out and rejoin Keep that state in the queue and you are building a job scheduler by hand better-trigger starts from a different premise: the task function is durable, so the whole execution model can live in one Postgres and nothing else</p>
                <p>The runtime never serializes a call stack It stores payload, position and completed results; after a wait or crash, the function starts again and moves through its old steps as cache hits The code stays readable because Postgres remembers what already happened</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bt-principles">
          <div className="bt-frame">
            <div className="bt-section-head"><div><CaseLabel light>02 / design principles</CaseLabel><h2>Five constraints<br />make the whole runtime</h2></div><p>EVERY FEATURE IS TESTED<br />AGAINST THESE, IN ORDER</p></div>
            <div className="bt-principle-grid">
              {PRINCIPLES.map((item) => (
                <article className="bt-principle" key={item.number}>
                  <div className="bt-principle-top"><span>{item.number}</span><span>{item.detail}</span></div>
                  <h3>{item.title}</h3>
                  <p className="bt-principle-text">{item.text}</p>
                  <span className="bt-principle-arrow">↘</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bt-system">
          <div className="bt-frame">
            <div className="bt-system-intro"><CaseLabel>03 / replay anatomy</CaseLabel><h2>One function<br /><span>Two passes</span></h2><p>The first pass commits durable boundaries The second pass re-enters the same code, reads completed positions from memory, and continues</p></div>
            <div className="bt-replay-stage" aria-label="A task suspends during its first execution, then replays completed steps and continues during its second execution">
              <div className="bt-replay-grid" aria-hidden="true" />
              <ReplayPass pass={REPLAY_PASSES[0]} />
              <div className="bt-replay-bridge">
                <span>EXECUTION SLOT RELEASED</span>
                <i>↓</i>
                <strong>TIMER DUE / NEW CLAIM / TOKEN +1</strong>
                <i>↓</i>
                <span>FUNCTION STARTS FROM THE TOP</span>
              </div>
              <ReplayPass pass={REPLAY_PASSES[1]} />
            </div>
            <div className="bt-runtime-map">
              <div className="bt-runtime-head"><span>ONE EXECUTION MODEL / TWO DEPLOYMENT SHAPES</span><span>THE SDK SURFACE DOES NOT CHANGE</span></div>
              <RuntimePath mode="DAEMON" source="APP / SDK" transport="HTTP" runtime="HONO API + EXECUTOR + LOOPS" />
              <RuntimePath mode="EMBEDDED" source="HOST APP" transport="IN-PROCESS FETCH" runtime="SAME API + EXECUTOR + LOOPS" />
            </div>
          </div>
        </section>

        <section className="bt-code-section bt-dark-section">
          <div className="bt-frame">
            <div className="bt-code-intro"><div><CaseLabel light>04 / the interface</CaseLabel><h2>Write a straight line<br /><span>The runtime keeps the ledger</span></h2></div><p>ctx.step memoizes, ctx.wait suspends, retries and cron are declared The code you read is the shape of the run</p></div>
            <div className="bt-code-grid">
              <CodePanel number="01" label="DEFINE + TRIGGER">{`import { task } from "better-trigger";

export const onboarding = task({
  id: "user-onboarding",
  retry: { maxAttempts: 5 },
  run: async (payload: { userId: string }, ctx) => {
    const user = await ctx.step("create-user", () => createUser(payload));
    await ctx.wait.for("24h");          // slot released · replay on resume
    await ctx.step("send-tips", () => sendTips(user));
  },
});

// any app process — no database, no execution loop
const handle = await onboarding.trigger({ userId: "u1" });
console.log((await handle.result()).output);`}</CodePanel>
              <CodePanel number="02" label="EMBEDDED RUNTIME">{`import { createEmbeddedRuntime }
  from "@better-trigger/worker/embedded";
import { hello } from "./tasks";

const runtime = await createEmbeddedRuntime({
  databaseUrl: process.env.DATABASE_URL,
  tasks: [hello],
  concurrency: 5,
});

// the runtime becomes the default client — same TaskHandle
const handle = await hello.trigger({ name: "ada" });
console.log((await handle.result()).output);

// wire this into the host's graceful-shutdown hook
await runtime.stop();`}</CodePanel>
            </div>
            <div className="bt-code-foot"><span>NO REDIS · NO CLICKHOUSE</span><span>SDK ZERO-DEP</span><span>REPLAY = MEMOIZED STEPS</span><span>POSTGRES IS THE LEDGER</span></div>
          </div>
        </section>

        <section className="bt-numbers">
          <div className="bt-frame">
            <div className="bt-numbers-head"><CaseLabel light>05 / repository snapshot</CaseLabel><p>AUGUST 2026 / VERIFIED FROM SOURCE</p></div>
            <div className="bt-stat-grid">
              {STATS.map(([value, label]) => (
                <div key={label}><strong>{value}</strong><span dangerouslySetInnerHTML={{ __html: label }} /></div>
              ))}
            </div>
            <div className="bt-numbers-foot"><span>* MEASURED IN THE SOURCE WORKTREE · UNIT SUITE, EXCLUDING ACCEPTANCE HARNESSES</span><span>CHECK:DEPS ALLOWS ONLY @BETTER-TRIGGER/CORE ON THE CLIENT PATH</span></div>
          </div>
        </section>

        <section className="bt-decisions">
          <div className="bt-frame bt-decisions-grid">
            <div className="bt-decisions-title"><CaseLabel>06 / engineering decisions</CaseLabel><h2>The honest limits<br />are the <span>design</span></h2></div>
            <div className="bt-decision-list">
              {DECISIONS.map((item) => <article key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}
            </div>
          </div>
          <div className="bt-frame bt-security-band"><span>SECURITY EDGE / WHEN EXPOSED</span><div>MULTI-KEY ROTATION + EXPIRY &nbsp;·&nbsp; TOKEN-BUCKET RATE LIMITS &nbsp;·&nbsp; AUDIT LOG &nbsp;·&nbsp; LOOPBACK-BY-DEFAULT</div></div>
        </section>

        <section className="bt-state">
          <div className="bt-frame bt-state-grid">
            <div className="bt-state-title"><CaseLabel light>07 / current state</CaseLabel><h2>Kernel hardened<br /><span>Agents next</span></h2></div>
            <div className="bt-state-col"><div className="bt-state-colhead"><span>NOW / SHIPPED</span><span className="bt-state-line" /></div><ul>{NOW_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="bt-state-col"><div className="bt-state-colhead"><span>NEXT / P3 → P6</span><span className="bt-state-line" /></div><ul>{NEXT_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
        </section>

        <section className="bt-outro bt-dark-section">
          <div className="bt-outro-grid" />
          <div className="bt-frame bt-outro-inner">
            <CaseLabel light>08 / run it</CaseLabel>
            <h2>Keep the code linear<br /><span>Let Postgres remember</span></h2>
            <p>Use the daemon when execution should scale independently Embed the same runtime when one long-lived process is the product</p>
            <div className="bt-outro-actions"><CaseButton href={GITHUB_URL}>VIEW ON GITHUB</CaseButton><CaseButton href={DOCS_URL} light>READ THE DOCUMENTATION</CaseButton></div>
            <span className="bt-outro-note">TYPESCRIPT-FIRST · POSTGRES-BACKED · MIT · ENGLISH DOCS + SIMPLIFIED CHINESE DOCS</span>
          </div>
        </section>
      </main>

      <footer className="bt-footer bt-dark-section">
        <div className="bt-frame bt-footer-top"><a href="/#work"><Arrow direction="left" /> ALL PROJECTS</a><span>NEXT CASE / FIELD NOTES</span><a href="/#contact">START A CONVERSATION <Arrow /></a></div>
        <div className="bt-frame bt-footer-bottom"><span>© {new Date().getFullYear()} YANG</span><span>BETTER-TRIGGER / CASE STUDY 03</span><span>BUILT WITH REACT + THREE.JS</span></div>
      </footer>
    </div>
  )
}

export default BetterTriggerPage
