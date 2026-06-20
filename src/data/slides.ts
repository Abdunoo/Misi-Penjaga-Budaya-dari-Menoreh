// The only data the app needs: the fixed stage size and the 21 story pages.
// Everything else (nav controls, home menu, popups) is expressed directly in Vue
// components — see src/components. Pages are addressed by their 1-based number, which
// is also the route param (/slide/:n) and the prev/next chain (page ± 1).

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
  /** Narration track played on slide enter (null = silent). */
  backsound: string | null
}

export const SLIDES: StorySlide[] = [
  {
    page: 1,
    title: 'Halaman 1',
    background: 'assets/img/page1.png',
    backgroundAlt: 'Cerita 1.jpg',
    backsound: 'assets/audio/narasi-1.mp3',
  },
  {
    page: 2,
    title: 'Halaman 2',
    background: 'assets/img/page2.png',
    backgroundAlt: 'Cerita 2.jpg',
    backsound: 'assets/audio/narasi-2.mp3',
  },
  {
    page: 3,
    title: 'Halaman 3',
    background: 'assets/img/page3.png',
    backgroundAlt: 'Cerita 3.jpg',
    backsound: 'assets/audio/narasi-2.mp3',
  },
  {
    page: 4,
    title: 'Halaman 4',
    background: 'assets/img/page4.png',
    backgroundAlt: 'Cerita 4.jpg',
    backsound: 'assets/audio/narasi-4.mp3',
  },
  {
    page: 5,
    title: 'Halaman 5',
    background: 'assets/img/page5.png',
    backgroundAlt: 'Cerita 5a.jpg',
    backsound: 'assets/audio/narasi-5.mp3',
  },
  {
    page: 6,
    title: 'Halaman 6',
    background: 'assets/img/page6.png',
    backgroundAlt: 'Halaman 6.jpg',
    backsound: 'assets/audio/narasi-5.mp3',
  },
  {
    page: 7,
    title: 'Halaman 7',
    background: 'assets/img/page7.png',
    backgroundAlt: 'Halaman 7.jpg',
    backsound: 'assets/audio/narasi-5.mp3',
  },
  {
    page: 8,
    title: 'Halaman 8',
    background: 'assets/img/page8.png',
    backgroundAlt: 'Halaman 8.jpg',
    backsound: 'assets/audio/narasi-5.mp3',
  },
  {
    page: 9,
    title: 'Halaman 8',
    background: 'assets/img/page9.png',
    backgroundAlt: 'Cerita 8.jpg',
    backsound: 'assets/audio/narasi-5.mp3',
  },
  {
    page: 10,
    title: 'Halaman 9',
    background: 'assets/img/page10.png',
    backgroundAlt: 'Cerita 9.jpg',
    backsound: 'assets/audio/narasi-10.mp3',
  },
  {
    page: 11,
    title: 'Halaman 10',
    background: 'assets/img/page11.png',
    backgroundAlt: 'Cerita 10.jpg',
    backsound: 'assets/audio/narasi-11.mp3',
  },
  {
    page: 12,
    title: 'Halaman 11a',
    background: 'assets/img/page12.png',
    backgroundAlt: 'Cerita 11a.jpg',
    backsound: 'assets/audio/narasi-12.mp3',
  },
  {
    page: 13,
    title: 'Halaman 11b',
    background: 'assets/img/page13.png',
    backgroundAlt: 'Cerita 11b.jpg',
    backsound: 'assets/audio/narasi-13.mp3',
  },
  {
    page: 14,
    title: 'Halaman 12',
    background: 'assets/img/page14.png',
    backgroundAlt: 'Cerita 12.jpg',
    backsound: 'assets/audio/narasi-14.mp3',
  },
  {
    page: 15,
    title: 'Halaman 13',
    background: 'assets/img/page15.png',
    backgroundAlt: 'Cerita 13.jpg',
    backsound: 'assets/audio/narasi-15.mp3',
  },
  {
    page: 16,
    title: 'Halaman 16',
    background: 'assets/img/page16.png',
    backgroundAlt: 'Cerita 16.jpg',
    backsound: 'assets/audio/narasi-15.mp3',
  },
  {
    page: 17,
    title: 'Halaman 17',
    background: 'assets/img/page17.png',
    backgroundAlt: 'Cerita 17.jpg',
    backsound: 'assets/audio/narasi-15.mp3',
  },
  {
    page: 18,
    title: 'Halaman 18',
    background: 'assets/img/page18.png',
    backgroundAlt: 'Cerita 18.jpg',
    backsound: 'assets/audio/narasi-15.mp3',
  },
  {
    page: 19,
    title: 'Halaman 19',
    background: 'assets/img/page19.png',
    backgroundAlt: 'Cerita 19.jpg',
    backsound: 'assets/audio/narasi-15.mp3',
  },
  {
    page: 20,
    title: 'Halaman 20',
    background: 'assets/img/page20.png',
    backgroundAlt: 'Cerita 20.jpg',
    backsound: 'assets/audio/narasi-15.mp3',
  },
  {
    page: 21,
    title: 'Halaman 21',
    background: 'assets/img/page21.png',
    backgroundAlt: 'Cerita 21.jpg',
    backsound: 'assets/audio/narasi-15.mp3',
  },
]

export const PAGE_COUNT = SLIDES.length

export const slideByPage = (n: number): StorySlide | undefined => SLIDES.find((s) => s.page === n)
