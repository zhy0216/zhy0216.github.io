import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const GITHUB_URL = 'https://github.com/zhy0216/zebra'
const DOCS_URL = 'https://zhy0216.github.io/zebra/'

const PRINCIPLES = [
  {
    number: '01',
    title: 'Bun, without apology',
    text: 'Built directly on Bun.serve, Bun.file, and Web Standard Request / Response No Node compatibility layer hiding underneath',
    detail: 'RUNTIME / NATIVE',
  },
  {
    number: '02',
    title: 'DI is the architecture',
    text: 'Every application owns a Container Route dependencies are explicit, scopes are real, and the entire graph is checked before traffic arrives',
    detail: 'GRAPH / VALIDATED',
  },
  {
    number: '03',
    title: 'One contract, three surfaces',
    text: 'A single immutable contract drives server implementation, runtime validation, and a type-safe client without repeating the schema',
    detail: 'SERVER / CLIENT / TEST',
  },
  {
    number: '04',
    title: 'Failure has a shape',
    text: 'Errors are part of the protocol Zebra defaults to RFC 9457 Problem+Json instead of turning every failure into an improvised response',
    detail: 'RFC 9457 / ERRORS',
  },
]

const FLOW = [
  ['01', 'REQUEST', 'Web Standard Request'],
  ['02', 'RADIX ROUTER', 'Static · params · wildcard'],
  ['03', 'PIPELINE', 'Middleware · timeout'],
  ['04', 'DI SCOPE', 'Session · request · transient'],
  ['05', 'HANDLER', 'Named-object dependencies'],
  ['06', 'RESPONSE', 'Typed output · Problem+Json'],
]

const PERFORMANCE = [
  ['STATIC', 95.7],
  ['PARAM', 93.3],
  ['MIDDLEWARE', 90.7],
  ['DI', 84.6],
  ['POST JSON', 34.5],
]

const DECISIONS = [
  {
    number: 'A',
    title: 'Validate before listen()',
    text: 'Missing bindings, circular dependencies, and illegal scope relationships surface at boot—not halfway through a production request',
  },
  {
    number: 'B',
    title: 'Keep the common path empty',
    text: 'Routes without DI or sessions skip child-container creation Dependency scanning and middleware wrapping move to boot-time compilation',
  },
  {
    number: 'C',
    title: 'Publish source, verify the package',
    text: 'Bun runs the TypeScript source directly Every publishable package is packed, installed into a clean project, imported, and typechecked',
  },
  {
    number: 'D',
    title: 'Test without the socket',
    text: 'The testing package connects a contract-aware client directly to an in-process app, keeping integration tests fast and fully typed',
  },
]

function Arrow({ direction = 'ne' }) {
  return (
    <svg className="zc-arrow" viewBox="0 0 16 16" aria-hidden="true">
      {direction === 'left' ? <path d="M14 8H3m4-4L3 8l4 4" /> : <path d="M3 13 13 3M5 3h8v8" />}
    </svg>
  )
}

function ZebraMark({ className = '' }) {
  return (
    <svg className={`zc-mark ${className}`} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" fill="#0011e2" />
      <path d="M64 0v22L20 64H0z" fill="#f4f4f0" />
      <path d="M64 0v8L46 64h-8z" fill="#f4f4f0" opacity=".52" />
      <path d="M64 40v24H24z" fill="#f4f4f0" opacity=".2" />
    </svg>
  )
}

function CaseLabel({ children, light = false }) {
  return <span className={`zc-label ${light ? 'zc-label--light' : ''}`}>{children}</span>
}

function CaseButton({ children, href, light = false }) {
  return (
    <a className={`zc-button ${light ? 'zc-button--light' : ''}`} href={href} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <Arrow />
    </a>
  )
}

function ZebraScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 7.6)

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      mount.classList.add('zc-scene--fallback')
      return undefined
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const group = new THREE.Group()
    group.rotation.set(-0.17, 0.42, -0.14)
    scene.add(group)

    const uniforms = { uTime: { value: 0 } }
    const geometry = new THREE.PlaneGeometry(6.6, 5.1, 96, 72)
    const material = new THREE.ShaderMaterial({
      uniforms,
      side: THREE.DoubleSide,
      transparent: true,
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vWave;

        void main() {
          vUv = uv;
          vec3 p = position;
          float wave = sin(p.x * 1.45 + uTime * 0.72) * 0.32;
          wave += cos(p.y * 1.9 - uTime * 0.48) * 0.21;
          wave += sin((p.x + p.y) * 2.15 + uTime * 0.3) * 0.1;
          p.z += wave;
          p.x += sin(p.y * 1.15 + uTime * 0.25) * 0.11;
          vWave = wave;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vWave;

        void main() {
          float bend = sin(vUv.x * 13.0 + vUv.y * 4.0) * 0.055;
          float stripeValue = (vUv.y + bend + vUv.x * 0.1) * 13.0;
          float stripe = step(0.5, fract(stripeValue));
          vec3 dark = vec3(0.018, 0.018, 0.02);
          vec3 paper = vec3(0.92, 0.92, 0.89);
          vec3 accent = vec3(0.38, 0.39, 1.0);
          vec3 color = mix(dark, paper, stripe);
          float seam = 1.0 - smoothstep(0.025, 0.08, abs(fract(stripeValue) - 0.5));
          color = mix(color, accent, seam * 0.7);
          color += vWave * vec3(0.04, 0.04, 0.08);
          gl_FragColor = vec4(color, 0.97);
        }
      `,
    })
    const cloth = new THREE.Mesh(geometry, material)
    group.add(cloth)

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x0011e2,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    })
    const wire = new THREE.Mesh(geometry.clone(), wireMaterial)
    wire.position.z = 0.018
    group.add(wire)

    let seed = 216
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }
    const dotGeometry = new THREE.BufferGeometry()
    const dotPositions = new Float32Array(300 * 3)
    for (let i = 0; i < 300; i += 1) {
      const index = i * 3
      dotPositions[index] = (random() - 0.5) * 9.5
      dotPositions[index + 1] = (random() - 0.5) * 7.5
      dotPositions[index + 2] = (random() - 0.5) * 3 - 1.2
    }
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3))
    const dots = new THREE.Points(
      dotGeometry,
      new THREE.PointsMaterial({ color: 0x5268ff, size: 0.018, transparent: true, opacity: 0.65 }),
    )
    scene.add(dots)

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
      uniforms.uTime.value = reducedMotion ? 0.6 : elapsed
      if (!reducedMotion) {
        group.rotation.y += ((0.42 + pointer.x * 0.13) - group.rotation.y) * 0.025
        group.rotation.x += ((-0.17 - pointer.y * 0.09) - group.rotation.x) * 0.025
        group.rotation.z = -0.14 + Math.sin(elapsed * 0.16) * 0.025
        dots.rotation.z = elapsed * 0.012
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
      wire.geometry.dispose()
      material.dispose()
      wireMaterial.dispose()
      dotGeometry.dispose()
      dots.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="zc-scene" aria-hidden="true" />
}

function CodePanel({ number, label, children }) {
  return (
    <article className="zc-code-panel">
      <div className="zc-code-head"><span>{number}</span><span>{label}</span><span>TYPE-SAFE / RUNTIME-SAFE</span></div>
      <pre><code>{children}</code></pre>
    </article>
  )
}

function ZebraPage() {
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
    <div className="zebra-page">
      <header className="zc-nav">
        <div className="zc-nav-inner">
          <a className="zc-wordmark" href="/">YANG</a>
          <span className="zc-nav-case">CASE STUDY <i>/</i> 01</span>
          <a className="zc-nav-back" href="/#work"><Arrow direction="left" /> BACK TO INDEX</a>
        </div>
        <span className="zc-progress" style={{ width: `${progress}%` }} />
      </header>

      <main>
        <section className="zc-hero">
          <div className="zc-hero-grid" />
          <div className="zc-frame zc-hero-inner">
            <div className="zc-hero-copy">
              <CaseLabel light>Selected work / open source / 2026</CaseLabel>
              <div className="zc-title-lockup"><ZebraMark /><h1>Zebra</h1></div>
              <p className="zc-hero-lede">A Bun-first TypeScript web framework with <span>first-class DI</span></p>
              <div className="zc-hero-actions">
                <CaseButton href={GITHUB_URL}>VIEW ON GITHUB</CaseButton>
                <CaseButton href={DOCS_URL} light>READ THE DOCS</CaseButton>
              </div>
            </div>
            <div className="zc-hero-scene"><ZebraScene /><div className="zc-scene-caption"><span>GENERATIVE STRIPE FIELD / 001</span><span>MOVE YOUR CURSOR</span></div></div>
            <div className="zc-hero-meta">
              <div><span>ROLE</span><strong>CREATOR<br />API DESIGN<br />ENGINEERING</strong></div>
              <div><span>STACK</span><strong>BUN<br />TYPESCRIPT<br />WEB STANDARDS</strong></div>
              <div><span>STATUS</span><strong>V1.0 API<br />FROZEN</strong></div>
              <div><span>LICENSE</span><strong>MIT</strong></div>
            </div>
          </div>
          <div className="zc-frame zc-hero-foot"><span>PROJECT / 01</span><span className="zc-rule" /><span>SCROLL TO UNPACK ↓</span></div>
        </section>

        <section className="zc-premise">
          <div className="zc-frame zc-premise-grid">
            <aside className="zc-aside"><CaseLabel>01 / the premise</CaseLabel><p>Frameworks usually add dependency injection later Zebra starts there</p><span>REWRITE / V2<br />API FREEZE / V1.0</span></aside>
            <div className="zc-premise-main">
              <h2>What if dependency injection <em>wasn&apos;t bolted on?</em></h2>
              <div className="zc-premise-copy">
                <p>The answer is a small but opinionated framework where routes declare what they need, the container proves that graph before boot, and the same contract can drive the server, client, validation, and tests</p>
              </div>
            </div>
          </div>
        </section>

        <section className="zc-principles">
          <div className="zc-frame">
            <div className="zc-section-head"><div><CaseLabel light>02 / design principles</CaseLabel><h2>Four decisions<br />shape the whole system</h2></div><p>NOT A COLLECTION OF FEATURES<br />A COHERENT SET OF CONSTRAINTS</p></div>
            <div className="zc-principle-grid">
              {PRINCIPLES.map((item) => (
                <article className="zc-principle" key={item.number}>
                  <div className="zc-principle-top"><span>{item.number}</span><span>{item.detail}</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className="zc-principle-arrow">↘</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="zc-system">
          <div className="zc-frame">
            <div className="zc-system-intro"><CaseLabel>03 / request anatomy</CaseLabel><h2>One request<br /><span>One legible path</span></h2><p>Every layer has a job, an explicit boundary, and a predictable failure mode</p></div>
            <div className="zc-flow" aria-label="Zebra request flow">
              {FLOW.map(([number, title, text], index) => (
                <div className="zc-flow-node" key={number}>
                  <span>{number}</span><strong>{title}</strong><p>{text}</p>{index < FLOW.length - 1 && <i>→</i>}
                </div>
              ))}
            </div>
            <div className="zc-scope-band">
              <span>CONTAINER LIFETIMES</span>
              <div><b>SINGLETON</b><i>APPLICATION</i></div><div><b>SESSION</b><i>SESSION ID</i></div><div><b>REQUEST</b><i>ONE REQUEST</i></div><div><b>TRANSIENT</b><i>ONE RESOLUTION</i></div>
            </div>
          </div>
        </section>

        <section className="zc-code-section zc-dark-section">
          <div className="zc-frame">
            <div className="zc-code-intro"><div><CaseLabel light>04 / the interface</CaseLabel><h2>Explicit enough to read<br /><span>Typed enough to trust</span></h2></div><p>The public API keeps dependencies visible and lets TypeScript carry information across boundaries</p></div>
            <div className="zc-code-grid">
              <CodePanel number="01" label="NAMED-OBJECT ROUTE DI">{`import "reflect-metadata";
import { Zebra, injectable } from "zebra";

@injectable()
class Greeter {
  greet(name: string) {
    return \`hello, \${name}\`;
  }
}

const app = new Zebra();
app.injectSingleton(Greeter);

app.get("/hi/:name", { g: Greeter },
  (req, { g }) => g.greet(req.params.name)
);

await app.listen({ port: 3000 });`}</CodePanel>
              <CodePanel number="02" label="CONTRACT → SERVER → CLIENT">{`const getPost = zc
  .get("/posts/:id")
  .params(z.object({ id: z.coerce.number() }))
  .output(Post)
  .errors({ post_not_found: { status: 404 } });

app.implement(getPost, { posts: PostService },
  async (req, { posts }) =>
    posts.find(req.params.id)
);

const client = createClient({ getPost }, { baseUrl });

// Post — inferred from the output schema
const post = await client.getPost({
  params: { id: 42 }
});`}</CodePanel>
            </div>
            <div className="zc-code-foot"><span>NO STRING-PARSING TRICKS</span><span>STANDARD SCHEMA V1</span><span>INPUT + OUTPUT VALIDATION</span><span>IN-PROCESS TEST CLIENT</span></div>
          </div>
        </section>

        <section className="zc-numbers">
          <div className="zc-frame">
            <div className="zc-numbers-head"><CaseLabel light>05 / repository snapshot</CaseLabel><p>AUGUST 2026 / CURRENT WORKTREE</p></div>
            <div className="zc-stat-grid">
              <div><strong>12</strong><span>PUBLISHABLE<br />PACKAGES</span></div>
              <div><strong>6,999</strong><span>TYPESCRIPT<br />SOURCE LINES</span></div>
              <div><strong>92</strong><span>TEST FILES ACROSS<br />PACKAGES + EXAMPLES</span></div>
              <div><strong>95.7K</strong><span>STATIC REQ/S<br />LOCAL BASELINE*</span></div>
            </div>
            <div className="zc-performance">
              <div className="zc-performance-copy"><h3>Fast enough to keep the architecture honest</h3><p>The benchmark suite runs real Bun HTTP servers and checks response bodies The goal is not a trophy; it is a regression gate that makes abstractions pay their way</p><span>* SINGLE-PROCESS LOOPBACK MACHINE-SPECIFIC, NOT A CROSS-SYSTEM CLAIM</span></div>
              <div className="zc-bars">
                {PERFORMANCE.map(([label, value]) => <div className="zc-bar" key={label}><span>{label}</span><div><i style={{ width: `${value}%` }} /></div><strong>{value.toFixed(1)}K</strong></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="zc-decisions">
          <div className="zc-frame zc-decisions-grid">
            <div className="zc-decisions-title"><CaseLabel>06 / engineering decisions</CaseLabel><h2>The invisible work<br />is the <span>product</span></h2></div>
            <div className="zc-decision-list">
              {DECISIONS.map((item) => <article key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}
            </div>
          </div>
          <div className="zc-frame zc-package-band"><span>PACKAGE CONSTELLATION</span><div>ZEBRA · CORE · CONTRACT · CLIENT · TESTING · SESSION · CORS · RATE-LIMIT · OBSERVABILITY · REDIS · MCP · SCHEMA-ZOD</div></div>
        </section>

        <section className="zc-outro zc-dark-section">
          <div className="zc-outro-stripes" />
          <div className="zc-frame zc-outro-inner">
            <CaseLabel light>07 / current state</CaseLabel>
            <h2>Not a wrapper around Node<br /><span>An opinion about Bun</span></h2>
            <div className="zc-outro-actions"><CaseButton href={GITHUB_URL}>EXPLORE THE SOURCE</CaseButton><CaseButton href={DOCS_URL} light>OPEN DOCUMENTATION</CaseButton></div>
          </div>
        </section>
      </main>

      <footer className="zc-footer zc-dark-section">
        <div className="zc-frame zc-footer-top"><a href="/#work"><Arrow direction="left" /> ALL PROJECTS</a><span>NEXT CASE / STARWRECK</span><a href="/#contact">START A CONVERSATION <Arrow /></a></div>
        <div className="zc-frame zc-footer-bottom"><span>© {new Date().getFullYear()} YANG</span><span>ZEBRA / CASE STUDY 01</span><span>BUILT WITH REACT + THREE.JS</span></div>
      </footer>
    </div>
  )
}

export default ZebraPage
