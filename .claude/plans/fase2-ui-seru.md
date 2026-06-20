# Rencana FASE 2 — UI Seru untuk Anak SD (SFX + Animasi)

## Context

Fase 1 (transisi geser halaman + muncul popup) **sudah selesai & terverifikasi**
(type-check ✓, lint 0 error ✓, build ✓). Fase 2 menambah "rasa seru" untuk siswa SD
kelas 5–6 **tanpa menambah file aset** dan tanpa dependensi baru, dengan tingkat
**"ceria & seimbang"** (hidup tapi tidak mengganggu fokus baca).

Keputusan user (terkonfirmasi):
- **SFX = sintesis Web Audio API** (tanpa file .mp3) — klik, wush (ganti halaman), pop (popup).
- **Tanpa tombol mute baru** — cukup hormati setelan OS `prefers-reduced-motion`.
- **Animasi tombol menu Home = pulse/breathing lembut** (skala 1.0↔1.04, berirama beda).
- Plus **animasi dekoratif latar Home** (overlay CSS melayang — cover adalah PNG datar).

Semua animasi/SFX **wajib mati** saat OS `prefers-reduced-motion: reduce`.

---

## 2.1 `src/composables/useSfx.ts` (BARU) — SFX sintesis, singleton modul

Plain module (BUKAN composable berbasis lifecycle) supaya bisa di-import dari router.
Satu `AudioContext` di module-scope, dibuat lazy. Ekspor: `click()`, `pop()`,
`whoosh()`, `unlock()`.

Poin kritis (dari validasi):
- **Baca `prefers-reduced-motion` saat dipanggil** (live), bukan di-cache saat load —
  setelan bisa berubah saat app jalan. No-op bila reduce aktif.
- **`exponentialRampToValueAtTime` CRASH jika nilai 0** → envelope mulai/akhir di
  `0.0001`, jangan `0`.
- **Resume defensif**: setiap fungsi bunyi cek `if (ctx.state === 'suspended') ctx.resume()`.
- `webkitAudioContext` tidak ada di tipe DOM → pakai cast
  `window as unknown as { AudioContext?; webkitAudioContext? }` (bukan `@ts-ignore`).
- Aman bila AudioContext tak tersedia (return null, no-op). `catch {}` diberi komentar
  agar konsisten gaya `useSlideAudio.playSfx`.

Parameter bunyi (lembut, peak gain 0.05–0.12):
- **click**: triangle 880 Hz, 50 ms, peak 0.06.
- **pop**: sine 420→760 Hz (naik), 120 ms, peak 0.08.
- **whoosh**: sawtooth 520→140 Hz lewat lowpass 1200→300 Hz, ~260 ms, peak 0.05.
  (Pakai oscillator sweep, BUKAN noise-buffer per-navigasi → hemat GC di Android murah.)

## 2.2 `src/router/index.ts` — wush saat ganti halaman

Tambah `router.afterEach((to) => { ... })` (afterEach, bukan beforeEach — bunyi saat
transisi benar-benar mulai). Panggil `whoosh()` **hanya** bila
`to.meta.transition === 'slide-forward' || 'slide-back'` (skip `'none'` = first load
senyap). Import `whoosh` dari `@/composables/useSfx` (bisa karena modul plain).

## 2.3 `src/components/StageButton.vue` — bunyi klik + prop `pulse`

- **Bunyi klik**: panggil `click()` pada jalur **`activate`/`@click`** (BUKAN
  `pointerdown` → hindari bunyi saat tekan-lalu-geser-batal & hindari double-fire).
  Mis. handler kecil `function onClick() { click(); emit('activate') }`.
  Ini otomatis memberi bunyi ke semua tombol (nav, close, menu) — diinginkan.
- **Prop `pulse?: boolean`** → toggle class `.pulse`. Hanya tombol menu Home yang set true.
- **KONFLIK PENTING**: `.pulse` menganimasi `transform`, sedangkan
  `:active { transform: scale(0.96) }` juga. Animation menang atas transition →
  feedback tekan hilang. **Fix**: saat ditekan, jeda animasi & serahkan transform ke :active:
  ```css
  .pulse { animation: pulse 2.6s ease-in-out infinite; }
  .pulse:active { animation-play-state: paused; transform: scale(0.96); }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.04); } }
  ```
  (Drop-shadow filter ikut "bernapas" — tidak ada flicker; transform compositor-only,
  tanpa reflow.)

> Catatan: thumbnail di `MulaiGrid.vue` adalah `<button>` biasa (bukan StageButton).
> Agar konsisten, tambahkan `click()` juga pada `@click` thumbnail. (Opsional kecil.)

## 2.4 `src/components/HomeMenu.vue` — pulse 3 tombol + overlay dekoratif

- Tambah `pulse` (true) pada 3 `<StageButton>` (Mulai/Petunjuk/Tentang), beri
  **stagger** delay berbeda. Cara paling robust: `:style="{ animationDelay: '0s'|'0.4s'|'0.8s' }"`
  per tombol (tak bergantung urutan sibling). (Alternatif `:deep(.pulse):nth-of-type` juga
  bekerja karena `<img>` cover beda tag dari `<button>`.)
- **Overlay dekoratif** diletakkan **di dalam HomeMenu, SETELAH `<img class="cover">`
  dan SEBELUM tombol** → urutan DOM memberi stacking benar (di atas cover, di bawah
  tombol & popup) tanpa `z-index`. Root `.decor { position:absolute; inset:0;
  pointer-events:none }`.
- Isi: ~5 lingkaran lembut (CSS `border-radius` + radial-gradient, opacity 0.12–0.22)
  diposisikan di area **kiri/bawah** (jauh dari kolom menu di x≈888), melayang pelan
  (`@keyframes float` translateY, 8–14s, delay bertahap). Ringan untuk Android murah.

> **Ken-burns pada cover: DILEWATI** (default). Cover 1280×720 `object-fit:fill` pinned
> di 0,0 → scale>1 origin center memunculkan seam tepi. Jika nanti diinginkan, hanya
> scale ≥1.0 (mis. 1.015↔1.03) dengan `transform-origin:center`. Demi performa tablet
> murah, andalkan dot melayang + pulse tombol saja.

## 2.5 `src/views/HomeView.vue` — unlock SFX + pop saat popup buka

- `resumeMusic()` (handler `@hostgesture`) tambahkan `unlock()` agar tap pertama juga
  me-resume AudioContext SFX. (`pointerdown` = user-activation sah di WebView Android,
  jalur yang sama sudah dipakai audio backsound.)
- `watch(popup, (now, prev) => { if (now !== null && prev === null) pop() })` — bunyi
  pop hanya pada transisi null→popup.

## 2.6 `src/views/SlideView.vue` — unlock SFX di slide

Wrap handler `@hostgesture`: `function onHostGesture(){ unlock(); resumeAfterGesture() }`
dan wire `@hostgesture="onHostGesture"`. (Menjaga `useSlideAudio` tak tahu soal SFX.)

## 2.7 `src/assets/main.css` — saklar reduced-motion

Tambah ke blok `@media (prefers-reduced-motion: reduce)` yang sudah ada:
```css
.stage-button.pulse { animation: none !important; }
.decor .dot { animation: none !important; }
```
(SFX sudah no-op via cek `matchMedia` di useSfx.)

---

## Verifikasi (end-to-end)

Tidak ada test runner — verifikasi manual + cek statis.

1. `npm run type-check` → 0 error (cek tipe AudioContext/webkit cast, prop `pulse`).
2. `npm run lint` → 0 error. `npm run format` → no-op (sesuai .oxfmtrc: no-semi, single-quote).
3. `npm run dev` → buka `http://localhost:5173`:
   - **Tap pertama** memicu unlock; tombol berbunyi **klik**; menu Home **pulse** halus &
     berirama beda; latar punya **dot melayang** pelan; tekan tombol → tetap mengecil
     (feedback :active TIDAK hilang — verifikasi fix konflik pulse).
   - Buka Mulai/Petunjuk/Tentang → bunyi **pop** + animasi muncul (Fase 1).
   - Pilih halaman / Next / Prev / Home → bunyi **wush** + geser (Fase 1). First load
     (reload di `#/slide/5`) → **senyap & tanpa geser**.
   - SFX terdengar **lembut**, tidak buzzy, tidak dobel mengganggu.
4. **Reduce motion**: aktifkan di OS → pulse/dot/transisi berhenti, SFX senyap, app tetap
   berfungsi.
5. (Opsional) `./build-apk.sh debug` → cek di WebView Android landscape: SFX bunyi
   setelah tap pertama, animasi mulus tanpa jank.

## Berkas

**Baru:** `src/composables/useSfx.ts`.
**Diubah:** `src/router/index.ts`, `src/components/StageButton.vue`,
`src/components/HomeMenu.vue`, `src/views/HomeView.vue`, `src/views/SlideView.vue`,
`src/assets/main.css`, (opsional) `src/components/MulaiGrid.vue`.

## Risiko yang sudah diantisipasi
1. Pulse vs `:active` → `animation-play-state: paused` (jika tidak, feedback tekan rusak).
2. `exponentialRampToValueAtTime` ke/dari 0 → CRASH → pakai 0.0001.
3. whoosh noise-buffer GC → pakai oscillator sweep.
4. Ken-burns seam pada cover datar → dilewati (default).
5. First-load senyap (context belum unlock) → wajar; tap pertama = unlock + klik.
6. Dobel bunyi klik+pop pada tombol menu → disengaja; setel telinga, bisa dimatikan
   klik di 3 tombol itu bila terasa ramai.
