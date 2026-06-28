// The only data the app needs: the fixed stage size and the 24 navigable pages.
// Everything else (nav controls, home menu, popups) is expressed directly in Vue
// components — see src/components. Pages are addressed by their 1-based number, which
// is also the route param (/slide/:n) and the prev/next chain (page ± 1).
//
// Page order: page 1 is the character-intro ("Tokoh") page, pages 2–23 are the 22
// comic story pages ("Halaman 1"–"Halaman 22"), and page 24 is the Glosarium.
// Each page carries a looping background-music track (`backsound`) chosen to match the
// scene's mood; see public/assets/audio/BACKSOUND-CREDITS.md for the source/license of
// every bs-*.mp3 and which pages reuse the same track.

export const STAGE = { width: 1280, height: 720 } as const

export interface StorySlide {
  /** 1-based page number — route param and navigation order. */
  page: number
  /** Internal title from the original course (kept for reference). */
  title: string
  /** Full-stage background artwork. */
  background: string
  /** Accessibility label for the background image. */
  backgroundAlt: string
  /** Background music looped (softly) on slide enter (null = silent). */
  backsound: string | null
}

export const SLIDES: StorySlide[] = [
  {
    page: 1,
    title: 'Halaman Tokoh',
    background: 'assets/img/page1.png',
    backgroundAlt: 'Halaman Tokoh',
    backsound: 'assets/audio/bs-intro-kids.mp3',
  },
  {
    page: 2,
    title: 'Halaman 1',
    background: 'assets/img/page2.png',
    backgroundAlt: 'Cerita Halaman 1',
    backsound: 'assets/audio/bs-morning.mp3',
  },
  {
    page: 3,
    title: 'Halaman 2',
    background: 'assets/img/page3.png',
    backgroundAlt: 'Cerita Halaman 2',
    backsound: 'assets/audio/bs-curious.mp3',
  },
  {
    page: 4,
    title: 'Halaman 3',
    background: 'assets/img/page4.png',
    backgroundAlt: 'Cerita Halaman 3',
    backsound: 'assets/audio/bs-reflective.mp3',
  },
  {
    page: 5,
    title: 'Halaman 4',
    background: 'assets/img/page5.png',
    backgroundAlt: 'Cerita Halaman 4',
    backsound: 'assets/audio/bs-reflective.mp3',
  },
  {
    page: 6,
    title: 'Halaman 5',
    background: 'assets/img/page6.png',
    backgroundAlt: 'Cerita Halaman 5',
    backsound: 'assets/audio/bs-hopeful.mp3',
  },
  {
    page: 7,
    title: 'Halaman 6',
    background: 'assets/img/page7.png',
    backgroundAlt: 'Cerita Halaman 6',
    backsound: 'assets/audio/bs-gamelan-ambient.mp3',
  },
  {
    page: 8,
    title: 'Halaman 7',
    background: 'assets/img/page8.png',
    backgroundAlt: 'Cerita Halaman 7',
    backsound: 'assets/audio/bs-gamelan-ambient.mp3',
  },
  {
    page: 9,
    title: 'Halaman 8',
    background: 'assets/img/page9.png',
    backgroundAlt: 'Cerita Halaman 8',
    backsound: 'assets/audio/bs-hopeful.mp3',
  },
  {
    page: 10,
    title: 'Halaman 9',
    background: 'assets/img/page10.png',
    backgroundAlt: 'Cerita Halaman 9',
    backsound: 'assets/audio/bs-morning.mp3',
  },
  {
    page: 11,
    title: 'Halaman 10',
    background: 'assets/img/page11.png',
    backgroundAlt: 'Cerita Halaman 10',
    backsound: 'assets/audio/bs-gamelan-ambient.mp3',
  },
  {
    page: 12,
    title: 'Halaman 11',
    background: 'assets/img/page12.png',
    backgroundAlt: 'Cerita Halaman 11',
    backsound: 'assets/audio/bs-morning.mp3',
  },
  {
    page: 13,
    title: 'Halaman 12',
    background: 'assets/img/page13.png',
    backgroundAlt: 'Cerita Halaman 12',
    backsound: 'assets/audio/bs-gotongroyong.mp3',
  },
  {
    page: 14,
    title: 'Halaman 13',
    background: 'assets/img/page14.png',
    backgroundAlt: 'Cerita Halaman 13',
    backsound: 'assets/audio/bs-gotongroyong.mp3',
  },
  {
    page: 15,
    title: 'Halaman 14',
    background: 'assets/img/page15.png',
    backgroundAlt: 'Cerita Halaman 14',
    backsound: 'assets/audio/bs-suling.mp3',
  },
  {
    page: 16,
    title: 'Halaman 15',
    background: 'assets/img/page16.png',
    backgroundAlt: 'Cerita Halaman 15',
    backsound: 'assets/audio/bs-sacred-gamelan.mp3',
  },
  {
    page: 17,
    title: 'Halaman 16',
    background: 'assets/img/page17.png',
    backgroundAlt: 'Cerita Halaman 16',
    backsound: 'assets/audio/bs-festival-jathilan.mp3',
  },
  {
    page: 18,
    title: 'Halaman 17',
    background: 'assets/img/page18.png',
    backgroundAlt: 'Cerita Halaman 17',
    backsound: 'assets/audio/bs-mystical.mp3',
  },
  {
    page: 19,
    title: 'Halaman 18',
    background: 'assets/img/page19.png',
    backgroundAlt: 'Cerita Halaman 18',
    backsound: 'assets/audio/bs-reflective.mp3',
  },
  {
    page: 20,
    title: 'Halaman 19',
    background: 'assets/img/page20.png',
    backgroundAlt: 'Cerita Halaman 19',
    backsound: 'assets/audio/bs-somber.mp3',
  },
  {
    page: 21,
    title: 'Halaman 20',
    background: 'assets/img/page21.png',
    backgroundAlt: 'Cerita Halaman 20',
    backsound: 'assets/audio/bs-inspiring.mp3',
  },
  {
    page: 22,
    title: 'Halaman 21',
    background: 'assets/img/page22.png',
    backgroundAlt: 'Cerita Halaman 21',
    backsound: 'assets/audio/bs-festival-grand.mp3',
  },
  {
    page: 23,
    title: 'Halaman 22',
    background: 'assets/img/page23.png',
    backgroundAlt: 'Cerita Halaman 22',
    backsound: 'assets/audio/bs-inspiring.mp3',
  },
  {
    page: 24,
    title: 'Glosarium',
    background: 'assets/img/page24.png',
    backgroundAlt: 'Glosarium - Istilah Budaya Menoreh',
    backsound: 'assets/audio/bs-morning.mp3',
  },
]

export const PAGE_COUNT = SLIDES.length

export const slideByPage = (n: number): StorySlide | undefined => SLIDES.find((s) => s.page === n)
