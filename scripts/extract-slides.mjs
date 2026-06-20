/**
 * extract-slides.mjs
 *
 * Parses the original Articulate Storyline 3 HTML5 export and produces a single
 * data-driven `src/data/slides.json` consumed by the Vue rebuild, then copies
 * only the referenced raster (mobile/*.png|jpg) and audio (story_content/*.mp3)
 * assets into `public/assets/`.
 *
 * Resolution model (verified):
 *  - Each slide JS file = window.globalProvideData('slide', '<escaped JSON>').
 *  - Slide stage is 1280x720. Objects carry xPos/yPos/width/height/depth.
 *  - An object's image states live in object.imagelib[] (id "01"=up, "02"=down),
 *    each with a `url` like story_content/<hash>_..._DXxx_DYyy.swf — we map the
 *    <hash> prefix to the matching mobile/<hash>_..._CXw_CYh.(png|jpg) raster.
 *  - Audio refs live in layer.audiolib[] (assetId -> data.js assetLib url).
 *  - Navigation: object.events[].actions[] with kind "gotoplay" -> objRef
 *    "_player.<scene>.<slideId>".
 *
 * Display page numbers 1..15 follow the navigation chain order (NOT the internal
 * Storyline titles, which drift, e.g. internal "5b" shows "Halaman 6").
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs'
import { dirname, basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const VUE_APP = join(__dirname, '..')
const SRC_ROOT = join(VUE_APP, '..') // the decompiled APK root
const JS_DIR = join(SRC_ROOT, 'assets/html5/data/js')
const MOBILE_DIR = join(SRC_ROOT, 'assets/mobile')
const AUDIO_DIR = join(SRC_ROOT, 'assets/story_content')
const OUT_DATA = join(VUE_APP, 'src/data')
const OUT_PUBLIC = join(VUE_APP, 'public/assets')

const SCENE = '5WPuxC3oviJ'
const HOME_ID = '6Ohlt3RYqre'

// Navigation chain order -> display page numbers 1..15 (verified against rendered images)
const CHAIN = [
  '6G5a8DEtRoU', '6QCwAJr6K2M', '5bFF75pEUPH', '5xyKuLAphI2', '6LJTtYkwQLX',
  '5upqtBZSZiz', '6ksEZ5R8NAV', '5vS82aZCX3C', '66yni05rmU2', '5dLKJGXipve',
  '5chrZJdVBAp', '5okYciwgX3w', '6bDA1sG8Zig', '6PCO471MeAT', '67bCu6Du3bf',
]

// ---- helpers ----------------------------------------------------------------

function loadProvide(file, kind) {
  const raw = readFileSync(join(JS_DIR, file), 'utf8')
  const head = `globalProvideData('${kind}', '`
  const i = raw.indexOf(head)
  if (i < 0) throw new Error(`no globalProvideData('${kind}') in ${file}`)
  const start = i + head.length
  const end = raw.lastIndexOf("')")
  let s = raw.slice(start, end)
  // The payload is a JS single-quoted string: unescape \' and \\ (JSON handles the rest).
  s = s.replace(/\\'/g, "'").replace(/\\\\/g, '\\')
  return JSON.parse(s)
}

const mobileFiles = readdirSync(MOBILE_DIR)
const audioFiles = new Set(readdirSync(AUDIO_DIR))
// dedupe by "kind:file" string key (Set of arrays would never dedupe)
const usedAssets = new Set()
const useAsset = (kind, file) => usedAssets.add(`${kind}:${file}`)

/** Map a story_content url (or any hash-prefixed url) to the best mobile raster. */
function resolveRaster(url, wantDX) {
  const file = basename(url)
  const hash = file.split('_')[0]
  const cands = mobileFiles.filter((f) => f.startsWith(hash + '_'))
  if (cands.length === 0) return null
  if (cands.length === 1) return cands[0]
  // Prefer the candidate whose DX matches the requested state's DX (e.g. _DX106 vs _DX104).
  if (wantDX != null) {
    const m = cands.find((f) => f.includes(`_DX${wantDX}_`))
    if (m) return m
  }
  // else prefer the larger (up) state
  return cands.sort((a, b) => b.length - a.length)[0]
}

function dxOf(url) {
  const m = basename(url).match(/_DX(\d+)_/)
  return m ? Number(m[1]) : null
}

/** Resolve an object's image states -> { up, down } mobile filenames. */
function resolveObjectImages(obj) {
  const lib = obj.imagelib || []
  const out = { up: null, down: null, altText: null }
  for (const img of lib) {
    out.altText ||= img.altText || null
    const raster = resolveRaster(img.url, dxOf(img.url))
    if (!raster) continue
    useAsset('img', raster)
    if (img.id === '01') out.up = raster
    else if (img.id === '02') out.down = raster
    else out.up ||= raster
  }
  out.down ||= out.up
  return out
}

/** Find the gotoplay slide target inside an object's events/actions. */
function navTarget(obj) {
  const events = obj.events || []
  for (const ev of events) {
    for (const act of ev.actions || []) {
      if (act.kind === 'gotoplay' && act.objRef?.value) {
        const v = act.objRef.value // _player.<scene>.<slideId>
        const parts = v.split('.')
        return parts[parts.length - 1]
      }
    }
  }
  return null
}

/** Find a show_slidelayer target (the popup layer id this object opens). */
function openLayerTarget(obj) {
  for (const ev of obj.events || []) {
    for (const act of ev.actions || []) {
      if (act.kind === 'show_slidelayer' && act.objRef?.value) {
        const v = act.objRef.value // _parent.<layerId>
        const parts = v.split('.')
        return parts[parts.length - 1]
      }
    }
  }
  return null
}

/** Pull the timeline appear time (ms) for an object id, if any. */
function appearMap(layer) {
  const map = {}
  const tl = layer.timeline
  const tweens = tl?.duration != null ? tl : null
  // Storyline timeline keeps per-object start in layer.timeline.events or .objects;
  // be defensive — many exports just use startTime 0. Default 0.
  return map
}

function semanticRole(altText) {
  const a = (altText || '').toLowerCase()
  if (a.startsWith('home')) return 'home'
  if (a.startsWith('kanan')) return 'next'
  if (a.startsWith('kiri')) return 'prev'
  if (a.startsWith('volume')) return 'volume'
  if (a.startsWith('mute')) return 'mute'
  if (a.startsWith('ulangi') || a.startsWith('replay')) return 'replay'
  if (a.startsWith('silang') || a.startsWith('close')) return 'close'
  if (a.startsWith('mulai')) return 'mulai'
  if (a.startsWith('petunjuk')) return 'petunjuk'
  if (a.startsWith('tentang')) return 'tentang'
  return null
}

function audioForLayer(layer, assetLib) {
  return (layer.audiolib || []).map((a) => ({
    id: a.id,
    assetId: a.assetId,
    url: assetLib[a.assetId]?.url || null,
  }))
}

/** The "primary" backsound for a content slide = the longest audio clip. */
function primaryBacksound(audios, assetLib) {
  let best = null
  let bestSize = -1
  for (const a of audios) {
    const meta = assetLib[a.assetId]
    if (!meta || !a.url || !a.url.endsWith('.mp3')) continue
    const size = meta.fileSize || 0
    if (size > bestSize) {
      bestSize = size
      best = a.url
    }
  }
  return best
}

function publicPath(file, kind) {
  return `assets/${kind}/${file}`
}

// Translucent popup scrim fills (vector rectangles, no raster). The original
// Storyline fills are: orange #FEB846@60% for the "Mulai" grid layers, blue
// #88D4EE@64% for the Tentang/Petunjuk layers. Keyed by popup layer id.
const SCRIM_FILL = {
  '6nBQZOH7xsi': 'rgba(254, 184, 70, 0.60)', // Mulai grid page 1
  '6OtttaqqLMQ': 'rgba(254, 184, 70, 0.60)', // Mulai grid page 2
  '6Yyxy2355Hs': 'rgba(254, 184, 70, 0.60)', // Mulai grid page 3
  '6aYqKhAqmMW': 'rgba(136, 212, 238, 0.64)', // Tentang
  '6amtfBfJ7hE': 'rgba(136, 212, 238, 0.64)', // Petunjuk
}

function extractObjects(layer, layerId) {
  const objs = []
  for (const o of layer.objects || []) {
    if (o.kind !== 'vectorshape' && o.kind !== 'vectortext') continue
    const imgs = resolveObjectImages(o)
    const role = semanticRole(imgs.altText)
    const target = navTarget(o)
    const openLayer = openLayerTarget(o)
    const isFullStage = o.xPos === 0 && o.yPos === 0 && o.width === 1280 && o.height === 720
    // a full-stage vectorshape with no raster + no nav = the popup scrim backdrop
    const fill = !imgs.up && isFullStage && layerId && SCRIM_FILL[layerId] ? SCRIM_FILL[layerId] : null
    objs.push({
      id: o.id,
      role: fill ? 'scrim' : role,
      altText: imgs.altText,
      x: o.xPos, y: o.yPos, w: o.width, h: o.height, depth: o.depth,
      accType: o.accType,
      up: imgs.up ? publicPath(imgs.up, 'img') : null,
      down: imgs.down ? publicPath(imgs.down, 'img') : null,
      target,
      openLayer,
      fill,
    })
  }
  objs.sort((a, b) => (a.depth || 0) - (b.depth || 0))
  return objs
}

// ---- main -------------------------------------------------------------------

console.log('Parsing data.js...')
const data = loadProvide('data.js', 'data')
const assetLib = {}
for (const a of data.assetLib) assetLib[a.id] = a

function buildContentSlide(slideId, pageNum) {
  const d = loadProvide(`${slideId}.js`, 'slide')
  const base = d.slideLayers.find((l) => l.isBaseLayer) || d.slideLayers[0]
  const objects = extractObjects(base, base.id)
  const audios = audioForLayer(base, assetLib)
  for (const a of audios) if (a.url?.endsWith('.mp3')) useAsset('audio', basename(a.url))
  const backsound = primaryBacksound(audios, assetLib)
  if (backsound) useAsset('audio', basename(backsound))

  // background image = the full-stage image object (1280x720 at 0,0)
  const bgObj = objects.find((o) => o.x === 0 && o.y === 0 && o.w === 1280 && o.h === 720 && o.up)
  return {
    page: pageNum,
    slideId,
    internalTitle: d.title,
    width: d.width,
    height: d.height,
    background: bgObj?.up || null,
    objects,
    backsound: backsound ? publicPath(basename(backsound), 'audio') : null,
  }
}

console.log('Building 15 content slides...')
const slides = CHAIN.map((id, i) => buildContentSlide(id, i + 1))

console.log('Building Home slide (with popups)...')
const homeRaw = loadProvide(`${HOME_ID}.js`, 'slide')
const homeLayers = homeRaw.slideLayers.map((l, idx) => ({
  id: l.id || (l.isBaseLayer ? 'base' : `layer${idx}`),
  isBase: !!l.isBaseLayer,
  objects: extractObjects(l, l.id),
}))
// Home audio (background music = longest)
const homeAudios = audioForLayer(homeRaw.slideLayers.find((l) => l.isBaseLayer) || homeRaw.slideLayers[0], assetLib)
for (const a of homeAudios) if (a.url?.endsWith('.mp3')) useAsset('audio', basename(a.url))
const homeMusic = primaryBacksound(homeAudios, assetLib)
if (homeMusic) useAsset('audio', basename(homeMusic))

const home = {
  slideId: HOME_ID,
  width: homeRaw.width,
  height: homeRaw.height,
  layers: homeLayers,
  music: homeMusic ? publicPath(basename(homeMusic), 'audio') : null,
}

// page -> background thumbnail-able image (reuse content background) for grid fallback
const out = {
  scene: SCENE,
  stage: { width: 1280, height: 720 },
  home,
  slides,
}

// ---- write outputs ----------------------------------------------------------
mkdirSync(OUT_DATA, { recursive: true })
writeFileSync(join(OUT_DATA, 'slides.json'), JSON.stringify(out, null, 2))
console.log(`Wrote src/data/slides.json (${slides.length} content slides + home)`)

// copy assets
mkdirSync(join(OUT_PUBLIC, 'img'), { recursive: true })
mkdirSync(join(OUT_PUBLIC, 'audio'), { recursive: true })
let imgN = 0, audN = 0, miss = 0
for (const key of usedAssets) {
  const sep = key.indexOf(':')
  const kind = key.slice(0, sep)
  const file = key.slice(sep + 1)
  if (kind === 'img') {
    const src = join(MOBILE_DIR, file)
    if (existsSync(src)) { copyFileSync(src, join(OUT_PUBLIC, 'img', file)); imgN++ }
    else { console.warn('  MISSING img', file); miss++ }
  } else {
    const src = join(AUDIO_DIR, file)
    if (existsSync(src)) { copyFileSync(src, join(OUT_PUBLIC, 'audio', file)); audN++ }
    else { console.warn('  MISSING audio', file); miss++ }
  }
}
console.log(`Copied ${imgN} images, ${audN} audio files${miss ? `, ${miss} MISSING` : ''}`)
