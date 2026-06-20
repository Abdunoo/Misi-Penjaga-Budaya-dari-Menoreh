/**
 * rename-assets.mjs  (one-off, idempotent)
 *
 * Renames the opaque Storyline-hash asset files under public/assets/ into
 * meaningful, grouped names and rewrites every path in src/data/slides.json to
 * match, so assets can be swapped by hand. Also writes public/assets/MANIFEST.md
 * as a "which file is what" guide.
 *
 * It does NOT touch extract-slides.mjs. If extraction is re-run later (which
 * restores hash names), just run this script again.
 *
 * Naming rules:
 *  - Content slide backgrounds  -> img/cerita-<page>.jpg     (by DISPLAY page 1..15)
 *  - Home background            -> img/background.jpg
 *  - UI controls                -> img/ui/<slug>.png         (home/next/prev/close/…)
 *  - "Pilih Halaman" popup      -> img/mulai/<slug>.png
 *  - Tentang / Petunjuk popups  -> img/tentang|petunjuk/<slug>.png
 *  - Backsound                  -> audio/narasi-<page>.mp3   (by first page using it)
 *  - Home music                 -> audio/musik-home.mp3
 *  - A `down` state that is a different file than its `up` gets a `-pressed` suffix.
 */
import { readFileSync, writeFileSync, renameSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, basename, join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VUE_APP = join(__dirname, '..')
const ASSETS = join(VUE_APP, 'public/assets')
const JSON_PATH = join(VUE_APP, 'src/data/slides.json')

const data = JSON.parse(readFileSync(JSON_PATH, 'utf8'))

// ---- helpers ----------------------------------------------------------------

/** lowercase a label, drop old extension, collapse non-alnum -> '-'. */
function slug(label) {
  return String(label)
    .replace(/\.(png|jpe?g|mp3)$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const ext = (p) => extname(p).toLowerCase() // ".png" / ".jpg" / ".mp3"
const fileOf = (p) => (p ? basename(p) : null)

// Map every UI control altText -> its target file name (no extension/dir).
const UI_NAMES = {
  'home.png': 'home',
  'kanan.png': 'next',
  'kiri.png': 'prev',
  'silang.png': 'close',
  'volume.png': 'volume',
  'mute.png': 'mute',
  'ulangi.png': 'replay',
  'tentang.png': 'tentang',
  'tombol mulai.png': 'tombol-mulai',
  'tombol petunjuk.png': 'tombol-petunjuk',
}

// Which popup layer ids belong to which popup group.
const MULAI_LAYERS = new Set(['6nBQZOH7xsi', '6OtttaqqLMQ', '6Yyxy2355Hs'])
const TENTANG_LAYERS = new Set(['6aYqKhAqmMW'])
const PETUNJUK_LAYERS = new Set(['6amtfBfJ7hE'])

// oldFileName -> { newRel, why } ; built deterministically, validated for collisions.
const map = new Map()
const manifest = [] // {newRel, why, pages:Set}

function assign(oldFile, newRel, why, page) {
  if (!oldFile) return
  if (map.has(oldFile)) {
    // already mapped (shared asset) — sanity check target agrees, record page
    const prev = map.get(oldFile)
    if (prev.newRel !== newRel) {
      throw new Error(`conflict: ${oldFile} -> "${prev.newRel}" and "${newRel}"`)
    }
    if (page != null) prev.pages.add(page)
    return
  }
  const entry = { newRel, why, pages: new Set() }
  if (page != null) entry.pages.add(page)
  map.set(oldFile, entry)
}

/** Decide the new relative path (under assets/) for one object's image state. */
function imageTarget(obj, group, isDown) {
  const a = (obj.altText || '').toLowerCase()
  const e = ext(obj.up || obj.down || '.png')
  const pressed = isDown ? '-pressed' : ''

  // Shared UI controls always live in img/ui/, regardless of which layer they
  // appear in (e.g. Silang/close is reused by every popup; next/prev too).
  if (UI_NAMES[a]) {
    return { rel: `img/ui/${UI_NAMES[a]}${pressed}${e}`, why: `Kontrol UI: ${obj.altText}` }
  }

  if (group === 'mulai') {
    if (a.startsWith('pop up mulai')) return { rel: `img/mulai/popup${pressed}${e}`, why: 'Panel popup "Pilih Halaman"' }
    return { rel: `img/mulai/${slug(obj.altText)}${pressed}${e}`, why: `Popup Pilih Halaman: ${obj.altText}` }
  }
  if (group === 'tentang') {
    if (a.startsWith('pop up tentang')) return { rel: `img/tentang/popup${pressed}${e}`, why: 'Panel popup Tentang' }
    return { rel: `img/tentang/${slug(obj.altText)}${pressed}${e}`, why: `Popup Tentang: ${obj.altText}` }
  }
  if (group === 'petunjuk') {
    if (a.startsWith('petunjuk')) return { rel: `img/petunjuk/popup${pressed}${e}`, why: 'Panel popup Petunjuk' }
    return { rel: `img/petunjuk/${slug(obj.altText)}${pressed}${e}`, why: `Popup Petunjuk: ${obj.altText}` }
  }
  // default (ui group, non-standard label) and final fallback
  return { rel: `img/ui/${slug(obj.altText || obj.id)}${pressed}${e}`, why: `Kontrol UI: ${obj.altText || obj.id}` }
}

// ---- 1) content slides ------------------------------------------------------

for (const s of data.slides) {
  const page = s.page
  const e = ext(s.background || '.jpg')
  // backgrounds: name by display page number (artwork shows 1..15)
  const bgFile = fileOf(s.background)
  if (bgFile) assign(bgFile, `img/cerita-${page}${e}`, `Gambar background halaman ${page}`, page)

  for (const o of s.objects) {
    const up = fileOf(o.up)
    const down = fileOf(o.down)
    // the full-stage background object is the same file as s.background -> already handled
    if (up && up === bgFile) {
      // skip: handled as cerita-N
    } else if (up) {
      const t = imageTarget(o, 'ui', false)
      assign(up, t.rel, t.why, page)
    }
    if (down && down !== up) {
      const t = imageTarget(o, 'ui', true)
      assign(down, t.rel, t.why, page)
    }
  }
  // backsound: name by FIRST page that uses it
  const narr = fileOf(s.backsound)
  if (narr) {
    const e2 = ext(s.backsound)
    if (!map.has(narr)) assign(narr, `audio/narasi-${page}${e2}`, `Narasi suara halaman ${page}`, page)
    else map.get(narr).pages.add(page)
  }
}

// ---- 2) home (base + popup layers) -----------------------------------------

for (const L of data.home.layers) {
  let group = 'ui'
  if (MULAI_LAYERS.has(L.id)) group = 'mulai'
  else if (TENTANG_LAYERS.has(L.id)) group = 'tentang'
  else if (PETUNJUK_LAYERS.has(L.id)) group = 'petunjuk'

  for (const o of L.objects) {
    const a = (o.altText || '').toLowerCase()
    const up = fileOf(o.up)
    const down = fileOf(o.down)

    // home base background
    if (L.isBase && a === 'background.jpg') {
      if (up) assign(up, `img/background${ext(o.up)}`, 'Gambar background Halaman Utama', 0)
      continue
    }
    if (up) {
      const t = imageTarget(o, group, false)
      assign(up, t.rel, t.why, 0)
    }
    if (down && down !== up) {
      const t = imageTarget(o, group, true)
      assign(down, t.rel, t.why, 0)
    }
  }
}

// home music
const music = fileOf(data.home.music)
if (music) assign(music, `audio/musik-home${ext(data.home.music)}`, 'Musik latar Halaman Utama', 0)

// ---- 3) validate (no two old files -> same new path) ------------------------

const seen = new Map() // newRel -> oldFile
for (const [oldFile, { newRel }] of map) {
  if (seen.has(newRel) && seen.get(newRel) !== oldFile) {
    throw new Error(`collision: "${newRel}" claimed by ${seen.get(newRel)} and ${oldFile}`)
  }
  seen.set(newRel, oldFile)
}

// ---- 4) move/rename the physical files (idempotent) ------------------------

let moved = 0,
  skipped = 0,
  missing = 0
for (const [oldFile, { newRel }] of map) {
  const newAbs = join(ASSETS, newRel)
  // current location: try the flat old path first, then the new path (already moved)
  const oldKind = ext(oldFile) === '.mp3' ? 'audio' : 'img'
  const oldAbs = join(ASSETS, oldKind, oldFile)

  if (existsSync(newAbs)) {
    skipped++
    continue // already renamed
  }
  if (!existsSync(oldAbs)) {
    console.warn('  MISSING source:', oldKind + '/' + oldFile)
    missing++
    continue
  }
  mkdirSync(dirname(newAbs), { recursive: true })
  renameSync(oldAbs, newAbs)
  moved++
}

// ---- 5) rewrite slides.json paths ------------------------------------------

const remap = (p) => {
  if (!p) return p
  const f = basename(p)
  const m = map.get(f)
  return m ? `assets/${m.newRel}` : p
}

for (const s of data.slides) {
  s.background = remap(s.background)
  s.backsound = remap(s.backsound)
  for (const o of s.objects) {
    o.up = remap(o.up)
    o.down = remap(o.down)
  }
}
for (const L of data.home.layers) {
  for (const o of L.objects) {
    o.up = remap(o.up)
    o.down = remap(o.down)
  }
}
data.home.music = remap(data.home.music)

writeFileSync(JSON_PATH, JSON.stringify(data, null, 2))

// ---- 6) MANIFEST.md ---------------------------------------------------------

for (const [, entry] of map) manifest.push(entry)
manifest.sort((a, b) => a.newRel.localeCompare(b.newRel))

const pagesLabel = (pages) => {
  const nums = [...pages].filter((p) => p > 0).sort((a, b) => a - b)
  if (pages.has(0) && nums.length === 0) return 'Halaman Utama'
  if (pages.has(0)) return 'Halaman Utama, ' + nums.join(', ')
  return nums.length ? nums.join(', ') : '-'
}

const rows = manifest
  .map((m) => `| \`assets/${m.newRel}\` | ${m.why} | ${pagesLabel(m.pages)} |`)
  .join('\n')

const md = `# Daftar Aset — "Lucu yang Menyeramkan"

Panduan ini menjelaskan **file aset mana untuk apa**, supaya gambar/audio bisa
diganti manual. Untuk mengganti sebuah aset: timpa file di \`public/assets/...\`
dengan file baru **memakai nama yang sama** (idealnya ukuran/format sama), lalu
\`npm run build\` (atau reload saat \`npm run dev\`). Tidak perlu mengedit JSON.

> Jika ingin menambah/menghapus aset atau mengubah penempatannya, edit path di
> \`src/data/slides.json\`.

| File | Untuk apa | Halaman |
|---|---|---|
${rows}

---
_Dihasilkan oleh \`scripts/rename-assets.mjs\` — jalankan ulang jika \`extract-slides.mjs\`
dijalankan lagi (yang mengembalikan nama hash)._
`
writeFileSync(join(ASSETS, 'MANIFEST.md'), md)

// ---- summary ----------------------------------------------------------------

const imgCount = [...map].filter(([f]) => ext(f) !== '.mp3').length
const audCount = [...map].filter(([f]) => ext(f) === '.mp3').length
console.log(`Mapped ${map.size} assets (${imgCount} img + ${audCount} audio).`)
console.log(`Renamed: ${moved}, already-renamed: ${skipped}${missing ? `, MISSING: ${missing}` : ''}.`)
console.log('Rewrote src/data/slides.json and wrote public/assets/MANIFEST.md.')
