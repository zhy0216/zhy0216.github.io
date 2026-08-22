const SNAPSHOT_DATE = '2026-08-22'

const SNAPSHOT = `better-trigger|TypeScript|2026|2026|0|0|0
zebra|TypeScript|2018|2026|0|2|0
spacecraft-survivor|TypeScript|2026|2026|0|1|0
prismfront|TypeScript|2026|2026|0|0|0
sangota|TypeScript|2026|2026|0|7|0
nng4-game|TypeScript|2026|2026|0|0|0
gots|JavaScript|2026|2026|0|0|0
rts|TypeScript|2023|2026|0|0|0
foil|TypeScript|2026|2026|0|0|0
browser-run|TypeScript|2026|2026|0|0|0
player|JavaScript|2026|2026|0|0|0
xiaozhi-esp32|C++|2026|2026|1|0|0
xiaozhi-esp32-server||2026|2026|1|0|0
better-mem|Python|2026|2026|0|0|0
hypell|Haskell|2026|2026|0|1|0
polyquant|Python|2026|2026|0|0|0
hyperquant|Python|2026|2026|0|0|0
happyclaw||2026|2026|1|0|0
hype-trader|Rust|2026|2026|0|0|0
gtop|Rust|2026|2026|0|0|0
claudecodeui||2026|2026|1|0|0
open-cowork||2026|2026|1|0|0
train-railway-game|JavaScript|2026|2026|0|0|0
opendev|TypeScript|2026|2026|0|0|0
pigo|Go|2026|2026|0|0|0
roguelette|TypeScript|2026|2026|0|0|0
picoclaw|Go|2026|2026|1|0|0
memaudit|TypeScript|2026|2026|0|0|0
engram||2026|2026|0|0|0
nanocode-ts|TypeScript|2026|2026|0|0|0
metabot|TypeScript|2026|2026|0|0|0
dd-jsx|TypeScript|2026|2026|0|0|0
litebrowser||2026|2026|0|0|0
litemem|Python|2026|2026|0|0|0
claude-mem||2026|2026|1|0|0
vibe-kanban|Rust|2025|2026|1|0|0
docs|MDX|2025|2025|0|0|0
opencode|TypeScript|2025|2025|1|0|0
dokploy||2025|2025|1|0|0
vane|TypeScript|2025|2025|0|0|0
code-agent|TypeScript|2025|2025|0|0|0
merge-agent|TypeScript|2025|2025|0|0|0
dip39|TypeScript|2025|2025|0|0|0
bip39-dotmap|HTML|2025|2025|1|0|0
vault|TypeScript|2025|2025|0|1|0
linguaql|TypeScript|2025|2025|0|1|0
OhMyPocket|JavaScript|2014|2025|0|226|0
extract-html|Python|2025|2025|0|0|0
serendipity|TypeScript|2025|2025|0|0|0
color-game|TypeScript|2025|2025|0|0|0
bun|Zig|2024|2025|1|0|0
term-chess|TypeScript|2025|2025|0|0|0
agent-loop|TypeScript|2025|2025|0|0|0
teable||2025|2025|1|0|0
openalternative||2025|2025|1|0|0
funsig|TypeScript|2025|2025|0|0|0
bun-template|TypeScript|2024|2025|0|0|0
lettura|TypeScript|2024|2025|1|0|0
cryptbak|Zig|2025|2025|0|0|0
card-designer|JavaScript|2025|2025|0|0|0
luci-app-easytier|Shell|2025|2025|1|0|0
godot-card-game-framework||2025|2025|1|0|0
gateway||2025|2025|1|0|0
dify-sandbox-py||2025|2025|1|0|0
dify-sandbox||2025|2025|1|0|0
nsjail-python|Python|2025|2025|1|0|0
gantt-task-react||2025|2025|1|0|0
reqmock|TypeScript|2024|2024|0|0|0
FastGPT||2024|2024|1|0|0
ueli||2024|2024|1|0|0
zustand-slices|TypeScript|2024|2024|1|0|0
next-auth|TypeScript|2024|2024|1|0|0
kysely-codegen|TypeScript|2024|2024|1|0|0
typebox-workbench|TypeScript|2024|2024|1|0|0
tsrouter|TypeScript|2024|2024|0|0|0
hono||2024|2024|1|0|0
omi|TypeScript|2024|2024|1|0|0
mplus|TypeScript|2024|2024|0|0|0
jttd|TypeScript|2023|2023|0|0|0
thinscript||2023|2023|1|0|0
ts2c||2023|2023|1|0|0
tianrang-demo|TypeScript|2023|2023|0|0|0
json-t|TypeScript|2023|2023|0|0|0
wave-demo|TypeScript|2023|2023|0|0|0
mapbox-practice|TypeScript|2023|2023|0|0|0
graphql-codegen-typescript-validation-schema||2023|2023|1|0|0
Conuread|Python|2013|2023|0|9|1
underscore.collections|JavaScript|2013|2022|0|1|0
jsrouter|JavaScript|2013|2022|0|1|0
schemejs|JavaScript|2016|2022|0|1|0
letter-rdp-source|JavaScript|2022|2022|1|0|0
learn-by-cloning|TypeScript|2022|2022|0|0|0
ttplayer|TypeScript|2022|2022|1|0|0
broccoli|TypeScript|2022|2022|0|0|0
hire||2020|2020|1|0|0
kindle-note-manager|TypeScript|2019|2019|0|0|0
marktext-e2ee|JavaScript|2019|2019|1|0|0
lessenger|Python|2018|2018|0|0|0
zhy0216.github.io|CSS|2015|2018|0|0|0
EZGen|JavaScript|2018|2018|0|0|0
playground|Python|2017|2017|0|0|0
zsh-tools|Python|2017|2017|0|0|0
iterject|JavaScript|2016|2016|0|0|0
ezlog3|JavaScript|2016|2016|0|0|0
underscore|JavaScript|2016|2016|1|0|0
hexo-theme-zeta|CSS|2016|2016|0|1|0
spinmaker|JavaScript|2015|2015|0|1|0
lianliankan|Python|2013|2013|0|0|0`

const toRepository = (line) => {
  const [name, language, createdYear, updatedYear, fork, stars, archived] = line.split('|')
  return {
    name,
    language: language || null,
    createdAt: `${createdYear}-01-01T00:00:00Z`,
    updatedAt: `${updatedYear}-01-01T00:00:00Z`,
    fork: fork === '1',
    stars: Number(stars),
    archived: archived === '1',
    description: null,
    url: `https://github.com/zhy0216/${name}`,
  }
}

export const REPOSITORY_SNAPSHOT = SNAPSHOT.split('\n').map(toRepository)
export const REPOSITORY_SNAPSHOT_DATE = SNAPSHOT_DATE

const normalizeRepository = (repository) => ({
  name: repository.name,
  language: repository.language,
  createdAt: repository.created_at,
  updatedAt: repository.updated_at,
  fork: repository.fork,
  stars: repository.stargazers_count,
  archived: repository.archived,
  description: repository.description,
  url: repository.html_url,
})

const CACHE_KEY = 'yang-github-repositories-v2'
const CACHE_LIFETIME = 6 * 60 * 60 * 1000

export async function loadGithubRepositories(signal) {
  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || 'null')
    if (cached?.savedAt && Date.now() - cached.savedAt < CACHE_LIFETIME && Array.isArray(cached.repositories)) {
      return { repositories: cached.repositories, source: 'cache' }
    }
  } catch {
    // A blocked or malformed local cache should never hide the static index.
  }

  const repositories = []
  for (let page = 1; page <= 4; page += 1) {
    const response = await fetch(`https://api.github.com/users/zhy0216/repos?per_page=100&page=${page}&sort=updated`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal,
    })
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`)
    const batch = await response.json()
    repositories.push(...batch.map(normalizeRepository))
    if (batch.length < 100) break
  }

  if (!repositories.length) throw new Error('GitHub returned an empty repository index')

  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repositories }))
  } catch {
    // The live result is still usable when storage is unavailable.
  }

  return { repositories, source: 'live' }
}
