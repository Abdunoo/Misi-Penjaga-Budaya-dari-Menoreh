# Rencana: Auto-Hide Tombol Navigasi di Halaman Cerita

## Context

Di halaman cerita (`/slide/:n`), keempat tombol kontrol — **Home** (kiri-atas),
**Volume/audio** (kanan-atas), **Prev** (kiri-bawah), **Next** (kanan-bawah) — menutupi
sebagian artwork dan mengganggu saat anak membaca/melihat gambar.

Permintaan user: pada halaman cerita, tombol-tombol itu **menghilang otomatis bila layar
tidak disentuh selama beberapa detik**, dan **muncul kembali saat disentuh**.

Keputusan user (terkonfirmasi):
- **Idle 3 detik** → tombol memudar hilang.
- **Sentuhan pertama (saat tersembunyi) HANYA memunculkan** tombol — tidak ikut menekan
  tombol di baliknya. Sentuhan berikutnya baru bisa menekan tombol.
- **Fade halus ~300ms**, hormati `prefers-reduced-motion` (instan).
- Hanya berlaku di **halaman cerita** (`NavControls` di `SlideView`). Halaman Utama (Home)
  **tidak terpengaruh**.

> Hook yang sudah ada & dipakai ulang: `SlideStage` me-emit `hostgesture` pada
> `@pointerdown` di `.stage-host` (`position:fixed; inset:0`, menutupi seluruh layar dan
> jadi ancestor dari semua tombol). Ini sudah dipakai untuk unlock audio; cukup ditambah
> `poke()` untuk reset timer & memunculkan kembali.

---

## Pendekatan

### 1. `src/composables/useIdleHide.ts` (BARU)

Composable kecil pemegang state visibilitas + timer (sesuai konvensi repo: setiap state
pakai composable — `useStageScale`, `useSlideAudio`, `useSfx`).

- `visible` (ref, mulai `true`), `poke()` (munculkan + restart hitung mundur), `stop()`
  (opsional, tak dipakai sekarang).
- `setTimeout` di-arm saat setup; hide setelah `delayMs`. `clearTimeout` di `poke`/`arm`
  dan `onUnmounted`. Tipe timer pakai `ReturnType<typeof setTimeout>`.
- **Tanpa throttle** — `poke()` hanya dipanggil sekali per tap (lihat pemicu di bawah).

```ts
import { onUnmounted, ref } from 'vue'

export function useIdleHide(delayMs = 3000) {
  const visible = ref(true)
  let timer: ReturnType<typeof setTimeout> | null = null

  function clear() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }
  function arm() {
    clear()
    timer = setTimeout(() => (visible.value = false), delayMs)
  }
  function poke() {
    visible.value = true
    arm()
  }
  function stop() {
    clear()
    visible.value = true
  }

  arm()
  onUnmounted(clear)
  return { visible, poke, stop }
}
```

### 2. `src/components/NavControls.vue` — bungkus 1 root + prop `visible`

**Struktur wajib**: NavControls sekarang multi-root (4 `StageButton`, tanpa wrapper).
Untuk men-toggle `pointer-events`/opacity & fade sebagai satu unit, **tambah satu
`<div class="nav-layer">`** membungkus keempat tombol.

- Tambah prop **`visible: boolean`** (required, selalu di-pass dari SlideView).
- Bind `:class="{ 'nav-hidden': !props.visible }"`.
- **JANGAN beri `position` pada wrapper** — agar tombol `position:absolute` tetap
  ber-anchor ke `.stage` (bukan ke wrapper). `opacity` pada wrapper aman untuk layout.

CSS (scoped):
```css
.nav-layer {
  opacity: 1;
  transition: opacity 300ms ease;
}
.nav-hidden {
  opacity: 0;
  pointer-events: none; /* langsung non-aktif begitu mulai hilang */
}
@media (prefers-reduced-motion: reduce) {
  .nav-layer {
    transition-duration: 1ms;
  }
}
```

> **Mengapa ini memenuhi "tap pertama hanya memunculkan":** saat `nav-hidden`,
> `pointer-events:none` di wrapper menonaktifkan semua tombol turunannya (tak ada yang
> men-set `auto`). Tap menembus ke `.stage-host` → `pointerdown` host memicu `poke()`
> (muncul). Karena `pointerdown` mendarat di host (bukan tombol), **tidak ada `click`
> tombol** yang ter-sintesis (click butuh down+up di target/ancestor yang sama). Tap
> berikutnya (saat sudah `auto`) baru menekan tombol normal. `pointer-events:none` aktif
> seketika saat kelas ditambah, jadi **selama fade-out pun tombol tak bisa diklik**.

### 3. `src/views/SlideView.vue` — sambungkan

- `const { visible, poke } = useIdleHide(3000)`
- Tambah `poke()` di `onHostGesture()` (di samping `unlock()` + `resumeAfterGesture()`
  yang sudah ada).
- Pass `:visible="visible"` ke `<NavControls>`.

```ts
function onHostGesture() {
  unlock()
  resumeAfterGesture()
  poke()
}
```
```vue
<NavControls :audio-state="state" :visible="visible" @activate="onControl" />
```

### Yang TIDAK diubah
- `SlideStage.vue` & `HomeView.vue` **tidak disentuh** — host tetap pointerdown-only,
  jadi Home tak terpengaruh (sesuai permintaan). Tidak menambah `@pointermove` (boros
  baterai/jank di Android murah & SlideStage dipakai bersama Home).

---

## Catatan perilaku (disepakati)
- **Pemicu = pointerdown saja** (tap untuk memunculkan) — norma aplikasi mobile.
- **First load tanpa interaksi**: tombol terlihat 3 detik lalu memudar sendiri — diterima
  (sekaligus "mengajari" perilaku auto-hide).
- **Pindah halaman**: SlideView di-key per `route.path` → remount → tombol mulai terlihat
  + timer fresh tiap halaman. Tak ada kebocoran timer (onUnmounted clear).
- Tidak konflik dengan transisi geser (pointer-events leave-active ada di elemen berbeda,
  yaitu root halaman, bukan `.nav-layer`).
- A11y: opacity:0 + pointer-events:none membiarkan node di a11y tree — diterima untuk app
  ini (tidak menambah inert/aria-hidden demi menjaga perubahan minimal).

---

## Verifikasi (end-to-end)

Tidak ada test runner — verifikasi statis + manual.

1. `npm run type-check` → 0 error. `npm run lint` → 0 error (selain warning bawaan
   `native-bridge.js`). `npm run format` → rapi.
2. `npm run dev` → buka `http://localhost:5173`, masuk ke halaman cerita:
   - **Diam 3 detik** → keempat tombol **memudar hilang**.
   - **Tap di mana saja** saat tersembunyi → tombol **muncul kembali**, dan tombol di
     bawah jari **TIDAK** ikut tertekan (verifikasi inti: tap pertama hanya memunculkan).
   - **Tap kedua** pada tombol (mis. Next) → berfungsi normal + ada transisi geser.
   - Saat tombol terlihat lalu ditekan → idle timer ter-reset (3 detik dihitung ulang).
   - **Pindah halaman** (Next/Prev) → di halaman baru tombol mulai terlihat lalu hilang
     lagi setelah 3 detik.
   - **Halaman Utama (Home)**: tombol menu TIDAK auto-hide (tidak berubah).
3. **Reduce motion** (setelan OS): tombol hilang/muncul instan, app tetap berfungsi.
4. (Opsional) `./build-apk.sh debug` → cek di WebView Android landscape: fade mulus,
   tap-to-reveal responsif, tak ada salah-pencet.

## Berkas
**Baru:** `src/composables/useIdleHide.ts`.
**Diubah:** `src/components/NavControls.vue` (wrapper + prop `visible` + CSS),
`src/views/SlideView.vue` (pakai composable + `poke()` + pass prop).
**Tidak diubah:** `SlideStage.vue`, `HomeView.vue`.
