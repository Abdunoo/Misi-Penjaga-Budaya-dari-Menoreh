# Plan: Replace image-based UI with code-built, themeable Vue components

## Context

The home menu buttons, the six on-stage nav controls, and the Petunjuk/Tentang
popups are currently **PNG artwork** loaded by string path. Because they're baked
images, their colors and text can't be adjusted without re-exporting art in an
external tool. The user wants these turned into **code-built components** (SVG +
CSS) so color and styling are easy to change.

Scope is exactly the three image dirs named: `public/assets/img/{ui, petunjuk, tentang}`.
The `mulai/` popup panel, footer, and thumbnail images are **out of scope** and stay
as images (MulaiGrid only borrows the `ui/` arrow + close icons, which we replace).

Decisions (confirmed):
- **Clean re-style** — same elements/layout, tidier coded look; not pixel-identical.
- **Bundle a rounded font** (Fredoka) self-hosted for offline `file://` use.
- **Coded avatar placeholder** in Tentang — the real developer photo is dropped (a
  photo can't be pure code); panel chrome + text become editable code.
- **Central design tokens** (CSS variables) + optional per-instance prop overrides.

## Approach

Introduce two new code-built button primitives + a glyph/badge system + a theme
tokens file, then refactor the four consumers and rebuild the two popups. The
existing `StageButton.vue` (the img-based primitive) becomes unused and is removed.

### New files

1. **`src/assets/theme.css`** — `:root` design tokens + `@font-face` for Fredoka.
   Tokens (names indicative; clean re-style gives latitude on exact hex):
   - `--ui-outline` deep maroon (~`#6e120c`), `--ui-glyph` maroon (~`#5e1109`)
   - `--ui-fill-top` / `--ui-fill-bottom` orange gradient (~`#ffc24d` → `#f0892f`)
   - `--ui-fill-pressed` (darker orange ~`#d9772a`)
   - `--ui-badge-top` / `--ui-badge-bottom` (cream→orange for icon circles)
   - `--ui-panel-petunjuk` (tan ~`#e9c9a8`), `--ui-panel-tentang` (orange ~`#f6912f`)
   - `--ui-text` maroon, `--ui-font: 'Fredoka', 'Baloo 2', system-ui, sans-serif`
   - radii / border-width tokens for consistent rounding.
   Self-host `public/assets/fonts/Fredoka.woff2` (variable wght, OFL); `@font-face`
   `src: url('assets/fonts/Fredoka.woff2')` — **relative path, no leading slash**, per
   the project's asset-path convention so it resolves under `file://`.
   Import via `import './assets/theme.css'` in `src/main.ts` (alongside `main.css`).
   Only the new playful components use `var(--ui-font)`; the global body font and the
   Quiz view are left on Open Sans.

2. **`src/components/icons/UiGlyph.vue`** — pure inline `<svg viewBox="0 0 24 24">`
   selected by a `name` prop; draws with `currentColor` so the parent controls color.
   Names: `home`, `arrow` (points right; `prev` flips via `transform: scaleX(-1)`),
   `speaker` (volume + waves), `speaker-off` (mute = speaker + ✕), `replay`, `close` (✕).

3. **`src/components/CircleBadge.vue`** — presentational round badge: gradient fill +
   maroon ring + centered `<UiGlyph>`. Themeable via tokens, overridable via props.
   Reused by `IconButton` (interactive) and by the Petunjuk legend rows (static).

4. **`src/components/IconButton.vue`** — absolutely-positioned `<button>` (typed
   `x,y,w,h` props like StageButton), wraps `<CircleBadge :name>`; press `scale(0.96)`
   + darken-on-press, `click()` SFX from `@/composables/useSfx`, optional `pulse`,
   `flip` prop (for prev arrow), `aria-label`; emits `activate`. Replaces the PNG
   buttons: home / prev / next / volume / mute / replay / close.

5. **`src/components/PillButton.vue`** — absolutely-positioned `<button>` (`x,y,w,h`),
   themeable lozenge (gradient fill, maroon outline, rounded, subtle top highlight),
   `label` text in `var(--ui-font)`; press → pressed shade + scale; optional `pulse`
   and pass-through `style` (for `animationDelay`); `click()` SFX; emits `activate`.
   Replaces tombol-mulai / tombol-petunjuk / tentang menu buttons.

### Edits to existing consumers (geometry/intents/emits unchanged)

- **`src/components/NavControls.vue`** — swap the 4 `StageButton` for `IconButton`
  (home; prev `flip`; next; audio). Audio glyph from `audioState`: `volume→speaker`,
  `mute→speaker-off`, `replay→replay`. Keep the `nav-layer` fade/visible wrapper and
  all x/y/w/h. Drop StageButton import.
- **`src/components/HomeMenu.vue`** — swap the 3 `StageButton` for `PillButton`
  (labels "Mulai" / "Petunjuk" / "Tentang"); keep x/y/w/h, `pulse`, `animationDelay`,
  and the `open` emits. Drop StageButton import.
- **`src/components/StagePopup.vue`** — swap the close `StageButton` for
  `IconButton glyph="close"` (cream variant); keep `closeX/closeY` + size.
- **`src/components/MulaiGrid.vue`** — swap the prev/next `StageButton` for
  `IconButton glyph="arrow"` (prev flipped); keep geometry + `v-if` paging. The mulai
  panel/footer/thumbnail `<img>`s are untouched (out of scope).

### Rebuilt popups (keep `StagePopup` scrim + close wrapper and the panel's box geometry)

- **`src/components/PetunjukPopup.vue`** — replace the `<img>` panel with a coded
  panel in the same box (~414×656 @ left 437/top 35): tan rounded-rect + maroon
  border, header banner "Petunjuk Penggunaan", then 7 legend rows. Each row =
  `<CircleBadge :name>` + label, driven by a small array in `<script>`:
  `speaker-off`→"Matikan Suara", `speaker`→"Nyalakan Suara", `arrow`(flip)→"Halaman
  Sebelumnya", `arrow`→"Halaman Berikutnya", `home`→"Menu Utama", `close`→"Tutup",
  `replay`→"Ulangi". The faint hand/silhouette watermark is dropped (clean re-style).
- **`src/components/TentangPopup.vue`** — replace the `<img>` panel with a coded
  orange panel in the same box (~1026×612 @ left 130/top 52): maroon border, header
  banner "Tentang Pengembang", a **coded avatar placeholder** (rounded framed silhouette)
  on the left, and 4 info rows on the right. The text is a small editable typed object
  in `<script>` filled from the current artwork: Nama "Dhesta Youlandi Rahayu
  Sulistiyawati", TTL "Kulon Progo, 2 Desember 1999", NIM "20712251064", Prodi "S2
  Pendidikan Dasar". Bottom skyline kept as a light optional SVG or omitted.

### Removals / housekeeping

- Delete **`src/components/StageButton.vue`** (no remaining importers after the edits).
- Update **`CLAUDE.md`** Architecture/component list: StageButton → `IconButton` +
  `PillButton` (+ `UiGlyph`/`CircleBadge`); note UI is now code, not PNG. The
  `public/assets/img/{ui,petunjuk,tentang}` PNGs become unused — leave the files for
  now (removing runtime assets is reversible later) but note they're no longer loaded.

## Files to create / modify

- create: `src/assets/theme.css`, `src/components/icons/UiGlyph.vue`,
  `src/components/CircleBadge.vue`, `src/components/IconButton.vue`,
  `src/components/PillButton.vue`, `public/assets/fonts/Fredoka.woff2`
- modify: `src/main.ts`, `src/components/NavControls.vue`,
  `src/components/HomeMenu.vue`, `src/components/StagePopup.vue`,
  `src/components/MulaiGrid.vue`, `src/components/PetunjukPopup.vue`,
  `src/components/TentangPopup.vue`, `CLAUDE.md`
- delete: `src/components/StageButton.vue`

## Notes / risks

- **Font fetch needs network at build time.** Fredoka woff2 will be downloaded from
  the google/fonts repo (OFL). If the environment is offline, the `@font-face` 404s but
  the `var(--ui-font)` fallback stack still renders a rounded-ish system font — text is
  never broken, just less stylized. I'll confirm the file lands and loads.
- Press/SFX/pulse logic is small and duplicated across IconButton/PillButton (mirrors
  StageButton's). Acceptable; can factor into a `useButtonPress` composable if it grows.

## Verification

1. `npm run type-check` — clean (vue-tsc).
2. `npm run build` — succeeds; no unresolved `assets/...` / no StageButton import errors.
3. `npm run dev` and visually check at `http://localhost:5173`:
   - Home: 3 coded pill buttons, pulsing with staggered delay; press feedback.
   - Mulai popup: coded circular prev/next arrows + close; paging works; thumbnails
     (still images) and panel unchanged.
   - Petunjuk popup: coded tan panel, header, 7 coded icon+label legend rows.
   - Tentang popup: coded orange panel, header, coded avatar, editable info rows.
   - A story page (`/slide/1`): coded home/prev/next + audio control that toggles
     volume → mute → replay glyphs; close on popups.
   - Letterbox scaling/hit-testing still correct at multiple window sizes; pressed
     states + reduced-motion behave.
   - DevTools: no 404 for `Fredoka.woff2`; computed font-family resolves to Fredoka.
4. (Optional) Playwright screenshot before/after for a sanity diff.
