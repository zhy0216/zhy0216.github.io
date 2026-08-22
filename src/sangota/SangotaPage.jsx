import React, { useEffect, useState } from 'react'
import ProtectedEmail from '../ProtectedEmail.jsx'

const GITHUB_URL = 'https://github.com/zhy0216/sangota'

const PRINCIPLES = [
  {
    number: '01',
    title: 'Choose your general',
    text: '关羽, 赵云, and the unfinished 诸葛亮 do not just change the portrait. Each one asks for a different hand, rhythm, and way through the war.',
    detail: 'GUAN YU / ZHAO YUN / ZHUGE LIANG',
  },
  {
    number: '02',
    title: 'Read the road',
    text: 'A branch can lead to a campfire, an event, an elite, or a boss. The map gives you enough warning to choose the danger you can afford.',
    detail: 'MAP / RISK / REWARD',
  },
  {
    number: '03',
    title: 'Build a hand with a point',
    text: 'Cards, relics, and potions are not a pile of bonuses. They pull a run toward heavy strikes, chain attacks, defense, or one risky idea that might finally click.',
    detail: 'CARDS / RELICS / POTIONS',
  },
  {
    number: '04',
    title: 'Survive the next act',
    text: 'Beat the boss, take the spoils, and decide whether the road continues. The higher the 天命, the less forgiving every detour becomes.',
    detail: 'BOSS / ASCENSION / VICTORY',
  },
]

const FLOW = [
  ['01', 'CHOOSE', 'pick a general'],
  ['02', 'BLESS', 'take one opening gift'],
  ['03', 'WALK', 'read the route ahead'],
  ['04', 'FIGHT', 'play cards, read intent'],
  ['05', 'CLAIM', 'cards · relics · potions'],
  ['06', 'REST', 'heal, shop, or gamble'],
  ['07', 'RISE', 'four acts, one run'],
]

const DECISIONS = [
  {
    number: 'A',
    title: 'Every route has a price',
    text: 'The safest room is rarely the most useful one. A shop can save a run, an elite can unlock its shape, and a greedy turn can leave the next floor out of reach.',
  },
  {
    number: 'B',
    title: 'The hero changes the hand',
    text: '关羽 wants weight behind one decisive blow. 赵云 wants a chain that keeps moving. 诸葛亮 is still being tuned, waiting behind a visible 制作中 mark.',
  },
  {
    number: 'C',
    title: 'Enemies tell you what they want',
    text: 'Intent, armor, status, and sudden phase changes turn each fight into a read. The best turn is the one that answers the threat you can see coming.',
  },
  {
    number: 'D',
    title: 'The war is still opening',
    text: 'This is an active personal game build: a playable core, a growing roster, and a road that is intentionally not finished yet.',
  },
]

const INVENTORY = [
  ['152', 'CARD ILLUSTRATIONS'],
  ['71', 'RELICS'],
  ['34', 'ENEMY PORTRAITS'],
  ['16', 'POTIONS'],
]

function Arrow({ direction = 'ne' }) {
  return (
    <svg className="sg-arrow" viewBox="0 0 16 16" aria-hidden="true">
      {direction === 'left' ? <path d="M14 8H3m4-4L3 8l4 4" /> : direction === 'down' ? <path d="M8 2v11m-4-4 4 4 4-4" /> : <path d="M3 13 13 3M5 3h8v8" />}
    </svg>
  )
}

function CaseLabel({ children, light = false }) {
  return <span className={`sg-label ${light ? 'sg-label--light' : ''}`}>{children}</span>
}

function CaseButton({ children, href, light = false, external = true }) {
  return (
    <a
      className={`sg-button ${light ? 'sg-button--light' : ''}`}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <span>{children}</span>
      <Arrow />
    </a>
  )
}

function TextLink({ children, href, light = false, external = false }) {
  return (
    <a
      className={`sg-textlink ${light ? 'sg-textlink--light' : ''}`}
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children} <Arrow />
    </a>
  )
}

function ArtifactCard({ src, alt, label, title, className = '' }) {
  return (
    <figure className={`sg-artifact-card ${className}`}>
      <div className="sg-artifact-image"><img src={src} alt={alt} /></div>
      <figcaption><span>{label}</span><strong>{title}</strong></figcaption>
    </figure>
  )
}

function SangotaPage() {
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
    <div className="sangota-page">
      <header className="sg-nav">
        <div className="sg-nav-inner">
          <a className="sg-wordmark" href="/">YANG</a>
          <span className="sg-nav-case">CASE STUDY <i>/</i> 04</span>
          <a className="sg-nav-back" href="/#work"><Arrow direction="left" /> BACK TO INDEX</a>
        </div>
        <span className="sg-progress" style={{ width: `${progress}%` }} />
      </header>

      <main>
        <section className="sg-hero">
          <div className="sg-hero-backdrop" />
          <div className="sg-hero-grid" />
          <div className="sg-frame sg-hero-inner">
            <div className="sg-hero-copy">
              <CaseLabel light>Selected work / personal game / 2026</CaseLabel>
              <div className="sg-title-lockup"><h1>SANGOTA</h1></div>
              <p className="sg-hero-lede">三国题材的 roguelike 卡牌构筑。<span>每一次选路，都会重写下一场战斗。</span></p>
              <div className="sg-hero-actions">
                <CaseButton href={GITHUB_URL}>VIEW THE SOURCE</CaseButton>
                <TextLink href="#premise" light>UNPACK THE RUN</TextLink>
              </div>
            </div>
            <div className="sg-hero-art" aria-hidden="true" />
            <div className="sg-hero-meta">
              <div><span>PROJECT</span><strong>PERSONAL GAME<br />THREE KINGDOMS</strong></div>
              <div><span>STACK</span><strong>PHASER 3<br />TYPESCRIPT<br />VITE</strong></div>
              <div><span>STATE</span><strong>IN ACTIVE<br />DEVELOPMENT</strong></div>
              <div><span>ROSTER</span><strong>2 PLAYABLE<br />1 IN PROGRESS</strong></div>
            </div>
          </div>
          <div className="sg-frame sg-hero-foot"><span>PROJECT / 04</span><span className="sg-rule" /><span>SCROLL TO UNPACK ↓</span></div>
        </section>

        <section id="premise" className="sg-premise">
          <div className="sg-frame sg-premise-grid">
            <aside className="sg-aside"><CaseLabel>01 / the premise</CaseLabel><p>Build a deck. Read the road. Make the next fight yours.</p><span>THREE KINGDOMS<br />ROGUELIKE / DECKBUILDING</span></aside>
            <div className="sg-premise-main">
              <h2>A card game that <em>thinks in routes</em></h2>
              <div className="sg-premise-copy">
                <p>Sangota turns the Three Kingdoms into a run of deliberate risks: choose a hero, accept an opening blessing, then walk a seeded map where every room changes the shape of the deck.</p>
                <p>It is a game about reading pressure: what to fight, what to keep, and how much of the road you can afford to reveal before the next boss.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="sg-principles">
          <div className="sg-frame">
            <div className="sg-section-head"><div><CaseLabel light>02 / the feeling</CaseLabel><h2>Four choices<br />shape a run</h2></div><p>READ THE ROAD<br />KEEP YOUR EDGE</p></div>
            <div className="sg-principle-grid">
              {PRINCIPLES.map((item) => (
                <article className="sg-principle" key={item.number}>
                  <div className="sg-principle-top"><span>{item.number}</span><span>{item.detail}</span></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className="sg-principle-arrow">↘</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sg-system">
          <div className="sg-frame">
            <div className="sg-system-intro"><CaseLabel>03 / the run loop</CaseLabel><h2>One run<br /><span>seven moves</span></h2><p>Start with a hero. End at a boss. Everything between those points is a choice you have to live with.</p></div>
            <div className="sg-flow" aria-label="Sangota run flow">
              {FLOW.map(([number, title, text], index) => (
                <div className="sg-flow-node" key={number}>
                  <span>{number}</span><strong>{title}</strong><p>{text}</p>{index < FLOW.length - 1 && <i>→</i>}
                </div>
              ))}
            </div>
            <div className="sg-map-band">
              <span>ROOM VOCABULARY</span>
              <div><img src="/sangota/boss.png" alt="" /><b>BOSS</b></div>
              <div><img src="/sangota/elite.png" alt="" /><b>ELITE</b></div>
              <div><img src="/sangota/event.png" alt="" /><b>EVENT</b></div>
              <div><img src="/sangota/treasure.png" alt="" /><b>TREASURE</b></div>
            </div>
          </div>
        </section>

        <section className="sg-artifact">
          <div className="sg-frame">
            <div className="sg-section-head"><div><CaseLabel light>04 / field notes</CaseLabel><h2>Ink, fire,<br />and <span>steel</span></h2></div><p>CHARACTERS · CARDS · BATTLEFIELDS<br />CURRENT BUILD / AUGUST 2026</p></div>
            <div className="sg-artifact-grid">
              <figure className="sg-artifact-wide">
                <div className="sg-artifact-wide-image"><img src="/sangota/combat-bg.jpg" alt="Ink-wash battlefield with torn banners and a distant fortress" /><span className="sg-artifact-stamp">COMBAT / 05</span></div>
                <figcaption><span>BATTLEFIELD PLATE</span><strong>Every card resolves against a place with weather, distance, and pressure.</strong></figcaption>
              </figure>
              <ArtifactCard className="sg-artifact-character" src="/sangota/guanyu-full.png" alt="Illustrated portrait of Guan Yu in green armor" label="HERO / 01" title="关羽 · 神力" />
              <ArtifactCard src="/sangota/changbanpo.jpg" alt="Card illustration of Zhao Yun charging through a burning battlefield" label="CARD / 24" title="长坂坡" />
              <ArtifactCard src="/sangota/longdan.jpg" alt="Ink illustration of a dragon-etched sword" label="CARD / 25" title="龙胆" />
              <ArtifactCard src="/sangota/qinglongdao.png" alt="Illustrated green-bladed guandao relic on paper" label="RELIC / STARTER" title="青龙偃月刀" />
            </div>
            <div className="sg-artifact-note"><span>THE WORLD OF SANGOTA</span><p>Paper, ink, cinnabar, jade, and gold carry the same feeling from the title screen to the last card in a fight. The images are the world: weathered, theatrical, and always one turn from catching fire.</p></div>
            <div className="sg-cast-strip">
              <figure><div><img src="/sangota/zhaoyun-portrait.png" alt="Illustrated portrait of Zhao Yun in silver armor" /></div><figcaption><span>HERO / 02</span><strong>赵云 · 连击</strong></figcaption></figure>
              <figure><div><img src="/sangota/lubu-cutout.png" alt="Illustrated portrait of Lü Bu in red armor" /></div><figcaption><span>BOSS / 01</span><strong>吕布 · 人中吕布</strong></figcaption></figure>
              <div className="sg-cast-copy"><CaseLabel light>THE CAST</CaseLabel><p>Generals, rivals, and the next impossible fight. A run is a small stage: every portrait arrives with a different answer to the same question — how far can you go?</p></div>
            </div>
          </div>
        </section>

        <section className="sg-numbers">
          <div className="sg-frame">
            <div className="sg-numbers-head"><CaseLabel light>05 / the world at a glance</CaseLabel><p>AUGUST 2026 / CURRENT BUILD</p></div>
            <div className="sg-stat-grid">
              <div><strong>4</strong><span>ACTS IN<br />THE RUN</span></div>
              <div><strong>3</strong><span>HEROES<br />IN THE ROSTER</span></div>
              <div><strong>20</strong><span>ASCENSION<br />TIERS</span></div>
              <div><strong>152</strong><span>CARD<br />ILLUSTRATIONS</span></div>
            </div>
            <div className="sg-inventory">
              <div className="sg-inventory-copy"><h3>There is always another card</h3><p>Every run grows through small discoveries: a new weapon, a relic with a catch, a potion saved for the wrong-looking fight, an enemy that changes the plan.</p><span>THE CURRENT CONTENT PASS / STILL GROWING</span></div>
              <div className="sg-inventory-list">
                {INVENTORY.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span><i style={{ '--bar': `${Math.min(100, Number(value) / 1.52)}%` }} /></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="sg-decisions">
          <div className="sg-frame sg-decisions-grid">
            <div className="sg-decisions-title"><CaseLabel>06 / why it stays interesting</CaseLabel><h2>The road is<br />the <span>story</span></h2><p>A good run is not a perfect run. It is the one where the next difficult choice still feels like yours.</p></div>
            <div className="sg-decision-list">
              {DECISIONS.map((item) => <article key={item.number}><span>{item.number}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}
            </div>
          </div>
        </section>

        <section className="sg-outro">
          <div className="sg-outro-map" />
          <div className="sg-frame sg-outro-inner">
            <CaseLabel light>07 / current state</CaseLabel>
            <h2>A living prototype<br /><span>with a road ahead</span></h2>
            <p>Sangota is an active personal game build. The core journey is playable, two heroes are ready to take into the fog, and 诸葛亮 remains visibly 制作中 while his deck finds its shape.</p>
            <div className="sg-outro-actions"><CaseButton href={GITHUB_URL}>FOLLOW THE BUILD</CaseButton><CaseButton href="/#work" light external={false}>BACK TO ALL WORK</CaseButton></div>
          </div>
        </section>
      </main>

      <footer className="sg-footer">
        <div className="sg-frame sg-footer-top"><a href="/#work"><Arrow direction="left" /> ALL PROJECTS</a><span>SANGOTA / CASE STUDY 04</span><ProtectedEmail as="a" className="sg-footer-contact" aria-label="Start a conversation by email">START A CONVERSATION <Arrow /></ProtectedEmail></div>
        <div className="sg-frame sg-footer-bottom"><span>© {new Date().getFullYear()} YANG</span><span>三国 · 烽火尖塔</span><span>BUILT WITH CURIOSITY</span></div>
      </footer>
    </div>
  )
}

export default SangotaPage
