# Plan: Add story pages 16–21 to slides.json

## Context
`slides.json` currently has 15 story slides (pages 1–15). Background images
`page16.png`–`page21.png` already exist in `public/assets/img/`. Task: add pages
16–21 as new slides, chained after page 15, and wire them into the home menu's
"Pilih Halaman" grid.

## Decisions (confirmed with user)
- **Chain**: 15.next → 16 → 17 → 18 → 19 → 20 → 21 → home. 16.prev → 15.
  Page 15's `next` target changes from home (`6Ohlt3RYqre`) to page 16.
  Page 21 is the new end: `next` → home (`6Ohlt3RYqre`).
- **Backgrounds**: `assets/img/page16.png` … `page21.png` (exist on disk).
- **Audio**: reuse `assets/audio/narasi-15.mp3` for all of 16–21
  (narasi-16…21 do NOT exist; reusing avoids broken refs).
- **Menu**: add a 4th grid layer to the Mulai popup with 6 thumbnails for
  pages 16–21. Uses PLACEHOLDER asset refs (not yet on disk, per user):
  - thumbnails `assets/img/mulai/mini-page16.png` … `mini-page21.png`
  - paginator dot `assets/img/mulai/4-per-3.png`
  - layer 3 gains a `next` button → layer 4; layer 4 has `prev` → layer 3.

## New IDs (net-new, not from Storyline)
- Slide IDs: `pg16AAAAAAAA` … `pg21AAAAAAAA` style → use:
  `p16sLIDe0001`-form readable unique ids. Concretely:
  - page16 slideId: `6P16xNewa01`
  - page17 slideId: `6P17xNewa02`
  - page18 slideId: `6P18xNewa03`
  - page19 slideId: `6P19xNewa04`
  - page20 slideId: `6P20xNewa05`
  - page21 slideId: `6P21xNewa06`
- New menu layer id: `6Menu4thGrd`
- Object ids: `o16<n>`-style unique within file.

## Steps
1. Each new slide mirrors the page 1–8 object template exactly:
   background image object (depth1) + home/next/prev/volume/mute/replay buttons
   (depth 2–7), same x/y/w/h as existing slides.
2. Append the 6 slides to the `slides[]` array after page 15.
3. Edit page 15 `next` target → page 16 slideId.
4. Add 4th menu grid layer `6Menu4thGrd`: scrim + popup + 6 thumbnail buttons
   (positions mirror the 3×2 grid: rows y137/y357, cols x178/x510/x841) +
   close + prev(→layer3) + `4-per-3` dot.
5. Add a `next` button to layer 3 (`6Yyxy2355Hs`) → `6Menu4thGrd`.
6. Validate JSON parses; verify all referenced page/audio assets exist
   (placeholders for menu assets are expected-missing, list them).

## Known placeholder/missing assets after this change
- `assets/img/mulai/mini-page16.png` … `mini-page21.png` (6)
- `assets/img/mulai/4-per-3.png` (1)
These are intentional per user; menu thumbnails will be broken until assets added.
