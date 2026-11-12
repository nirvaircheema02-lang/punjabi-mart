import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const assets = JSON.parse(readFileSync('image-generation-results.json', 'utf8'))
for (const asset of assets) {
  const target = resolve(root, asset.save_to)
  if (!target.startsWith(resolve(root, 'public/images') + sep)) throw new Error('Invalid image target')
  mkdirSync(dirname(target), { recursive: true })
  const width = asset.ratio === '16:9' ? 1800 : 1200
  const height = asset.ratio === '4:5' ? 1500 : asset.ratio === '16:9' ? 1013 : 1200
  await sharp(asset.original).rotate()
    .resize({ width, height, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 }).toFile(target)
}
console.log(`Installed ${assets.length} generated images`)
