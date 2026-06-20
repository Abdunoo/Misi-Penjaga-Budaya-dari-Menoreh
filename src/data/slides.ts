// Typed access layer over the generated slides.json (produced by scripts/extract-slides.mjs).
import raw from './slides.json'

export interface SlideObject {
  id: string
  role: string | null // home | next | prev | volume | mute | replay | close | tentang | petunjuk | null
  altText: string | null
  x: number
  y: number
  w: number
  h: number
  depth: number
  accType: string
  up: string | null
  down: string | null
  target: string | null // gotoplay slideId
  openLayer: string | null // show_slidelayer layer id
  fill: string | null // CSS color for popup scrim rectangles (no raster)
}

export interface ContentSlide {
  page: number
  slideId: string
  internalTitle: string
  width: number
  height: number
  background: string | null
  objects: SlideObject[]
  backsound: string | null
}

export interface HomeLayer {
  id: string
  isBase: boolean
  objects: SlideObject[]
}

export interface HomeSlide {
  slideId: string
  width: number
  height: number
  layers: HomeLayer[]
  music: string | null
}

export interface SlidesData {
  scene: string
  stage: { width: number; height: number }
  home: HomeSlide
  slides: ContentSlide[]
}

const data = raw as SlidesData

export const STAGE = data.stage
export const HOME = data.home
export const SLIDES = data.slides

/** slideId -> display page number (1..21) */
const idToPage = new Map<string, number>()
for (const s of SLIDES) idToPage.set(s.slideId, s.page)

export const HOME_ID = data.home.slideId

/** Resolve a gotoplay target slideId to a router destination. */
export function targetToRoute(slideId: string | null): string {
  if (!slideId || slideId === HOME_ID) return '/'
  const page = idToPage.get(slideId)
  return page ? `/slide/${page}` : '/'
}

export function slideByPage(page: number): ContentSlide | undefined {
  return SLIDES.find((s) => s.page === page)
}

export const PAGE_COUNT = SLIDES.length
