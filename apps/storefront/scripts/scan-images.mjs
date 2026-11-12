/**
 * Scans public/images and writes the list of assets that actually exist.
 * Runs before build and dev so dropping an image in requires no code change,
 * and so availability can be checked in both server and client components
 * without pulling `fs` into the browser bundle.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, relative } from 'node:path'

const root = process.cwd()
const base = join(root, 'public', 'images')
const out = join(root, 'src', 'lib', 'available-images.json')

const found = []
const versions = {}
function walk(dir) {
  if (!existsSync(dir)) return
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full)
    else if (/\.(webp|avif|jpg|jpeg|png)$/i.test(entry)) {
      const src = '/' + relative(join(root, 'public'), full).split(/[\\/]/).join('/')
      found.push(src)
      versions[src] = createHash('sha256').update(readFileSync(full)).digest('hex').slice(0, 12)
    }
  }
}
walk(base)
mkdirSync(join(root, 'src', 'lib'), { recursive: true })
writeFileSync(out, JSON.stringify(found.sort(), null, 2) + '\n')
writeFileSync(join(root, 'src', 'lib', 'image-versions.json'), JSON.stringify(versions, null, 2) + '\n')
console.log(`[images] ${found.length} asset(s) available`)
