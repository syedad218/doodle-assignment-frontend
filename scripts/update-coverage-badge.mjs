// Rewrites the coverage badge in README.md from coverage/coverage-summary.json.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const readmePath = `${root}README.md`

const { total } = JSON.parse(
  readFileSync(`${root}coverage/coverage-summary.json`, 'utf8'),
)
const pct = total.lines.pct

const color =
  pct >= 90 ? 'brightgreen' : pct >= 80 ? 'yellowgreen' : pct >= 70 ? 'yellow' : 'red'
const badge = `![coverage](https://img.shields.io/badge/coverage-${pct}%25-${color})`

const readme = readFileSync(readmePath, 'utf8')
const updated = readme.replace(
  /!\[coverage\]\(https:\/\/img\.shields\.io\/badge\/coverage-[^)]+\)/,
  badge,
)

if (!readme.includes('![coverage]')) {
  console.error('README.md has no coverage badge to update')
  process.exit(1)
}

if (updated !== readme) {
  writeFileSync(readmePath, updated)
  console.log(`README coverage badge updated to ${pct}%`)
} else {
  console.log(`README coverage badge already at ${pct}%`)
}
