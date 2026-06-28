<script setup lang="ts">
// "Pilih Halaman" (Mulai) popup: a paged thumbnail grid built by iterating SLIDES.
// Six thumbnails per page laid out with CSS grid (3 x 2), paged with prev/next arrows.
// No hand-listed coordinates per thumbnail — the layout is derived, so adding a story
// page automatically shows up here.
//
// The panel chrome is fully code-built (CSS/SVG from the --ui-* tokens), matching the
// Petunjuk/Tentang popups: a tan panel + title plaque + a coded page indicator. The
// only PNGs are the page thumbnails themselves. A faded Elang Jawa + terraced-field
// motif gives the panel its Menoreh identity without crowding the thumbnails.
import { computed, ref } from 'vue'
import StagePopup from '@/components/StagePopup.vue'
import IconButton from '@/components/IconButton.vue'
import { SLIDES } from '@/data/slides'

const emit = defineEmits<{ select: [page: number]; close: [] }>()

const PER_PAGE = 6
const pages = computed(() => {
  const chunks: (typeof SLIDES)[] = []
  for (let i = 0; i < SLIDES.length; i += PER_PAGE) chunks.push(SLIDES.slice(i, i + PER_PAGE))
  return chunks
})

const index = ref(0) // 0-based grid page
const current = computed(() => pages.value[index.value] ?? [])
const hasPrev = computed(() => index.value > 0)
const hasNext = computed(() => index.value < pages.value.length - 1)
</script>

<template>
  <StagePopup scrim="rgba(254, 184, 70, 0.60)" :close-x="1180" :close-y="32" @close="emit('close')">
    <!-- Code-built tan panel (mirrors Petunjuk/Tentang chrome). -->
    <section class="panel" aria-label="Pilih Halaman">
      <!-- Menoreh identity: faded Elang Jawa in the upper corners + terraced-field band
           at the bottom. Decorative only, sits behind the thumbnails. -->
      <svg class="eagle eagle-l" viewBox="0 0 200 120" aria-hidden="true">
        <path
          d="M100 38C92 30 84 26 70 22C46 16 22 14 4 20C26 26 40 34 56 44C40 46 26 52 14 62C34 60 52 58 70 56C66 64 64 74 66 86C72 76 80 66 92 60C95 70 98 78 100 96C102 78 105 70 108 60C120 66 128 76 134 86C136 74 134 64 130 56C148 58 166 60 186 62C174 52 160 46 144 44C160 34 174 26 196 20C178 14 154 16 130 22C116 26 108 30 100 38Z"
        />
      </svg>
      <svg class="eagle eagle-r" viewBox="0 0 200 120" aria-hidden="true">
        <path
          d="M100 38C92 30 84 26 70 22C46 16 22 14 4 20C26 26 40 34 56 44C40 46 26 52 14 62C34 60 52 58 70 56C66 64 64 74 66 86C72 76 80 66 92 60C95 70 98 78 100 96C102 78 105 70 108 60C120 66 128 76 134 86C136 74 134 64 130 56C148 58 166 60 186 62C174 52 160 46 144 44C160 34 174 26 196 20C178 14 154 16 130 22C116 26 108 30 100 38Z"
        />
      </svg>
      <svg class="terrace" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 66C200 46 400 88 600 70C800 52 1000 92 1200 66V120H0Z" opacity=".45" />
        <path d="M0 88C220 72 460 104 700 90C920 76 1080 102 1200 88V120H0Z" opacity=".65" />
        <path d="M0 106C260 96 520 116 800 104C1000 98 1100 112 1200 104V120H0Z" />
      </svg>
    </section>

    <!-- Title plaque straddles the panel's top edge, so it lives OUTSIDE the panel
         (which clips its motifs with overflow:hidden) to avoid being cut off. -->
    <h2 class="banner">Pilih Halaman</h2>

    <!-- thumbnail grid laid over the panel -->
    <div class="grid">
      <button
        v-for="s in current"
        :key="s.page"
        class="thumb"
        :aria-label="`Halaman ${s.page}`"
        @click="emit('select', s.page)"
      >
        <img :src="`assets/img/mulai/mini-page${s.page}.png`" :alt="`Mini Cerita ${s.page}`" />
      </button>
    </div>

    <IconButton
      v-if="hasPrev"
      :x="508"
      :y="585"
      :w="53"
      :h="53"
      name="arrow"
      flip
      alt="Halaman sebelumnya"
      @activate="index--"
    />
    <IconButton
      v-if="hasNext"
      :x="719"
      :y="585"
      :w="53"
      :h="53"
      name="arrow"
      alt="Halaman berikutnya"
      @activate="index++"
    />

    <div class="indicator" aria-live="polite">{{ index + 1 }} / {{ pages.length }}</div>
  </StagePopup>
</template>

<style scoped>
.panel {
  position: absolute;
  left: 40px;
  top: 34px;
  width: 1200px;
  height: 656px;
  box-sizing: border-box;
  border: 5px solid var(--ui-outline);
  border-radius: 34px;
  background: var(--ui-panel-petunjuk);
  box-shadow:
    var(--ui-shadow),
    inset 0 0 0 4px rgba(255, 255, 255, 0.25);
  overflow: hidden;
}
/* Title plaque straddling the panel's top edge. Positioned on the stage (not inside
   .panel) so the panel's overflow:hidden doesn't clip it. The stage and the panel
   share the same horizontal center (640px), so left:50% lines up over the panel. */
.banner {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 260px;
  margin: 0;
  padding: 12px 36px;
  text-align: center;
  font-family: var(--ui-font);
  font-weight: 600;
  font-size: 32px;
  line-height: 1.05;
  color: var(--ui-text);
  border: 4px solid var(--ui-outline);
  border-radius: var(--ui-radius-banner);
  background: linear-gradient(var(--ui-banner-top), var(--ui-banner-bottom));
  box-shadow: var(--ui-shadow);
}
/* --- Menoreh identity motifs (faded, decorative) --- */
.eagle,
.terrace {
  position: absolute;
  color: var(--ui-text-soft);
  fill: currentColor;
  opacity: 0.12;
  pointer-events: none;
}
.eagle {
  width: 150px;
  height: 90px;
  top: 66px;
}
.eagle-l {
  left: 26px;
}
.eagle-r {
  right: 26px;
  transform: scaleX(-1);
}
.terrace {
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 150px;
}
/* Mirrors the original 3-column / 2-row thumbnail block (x 178/510/841, y 137/357,
   ~261x185) using grid math instead of per-thumbnail absolute coordinates. */
.grid {
  position: absolute;
  left: 178px;
  top: 137px;
  width: 924px; /* 841 + 261 - 178 */
  display: grid;
  grid-template-columns: repeat(3, 261px);
  grid-template-rows: repeat(2, 185px);
  column-gap: 71px; /* 510 - 178 - 261 */
  row-gap: 35px; /* 357 - 137 - 185 */
}
.thumb {
  box-sizing: border-box;
  padding: 0;
  background: #fff;
  cursor: pointer;
  width: 261px;
  height: 185px;
  border: 3px solid var(--ui-outline);
  border-radius: 12px;
  box-shadow: var(--ui-shadow);
  overflow: hidden;
  transition: transform 0.08s ease;
}
.thumb:active {
  transform: scale(0.97);
}
.thumb img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: fill;
}
/* Coded page indicator (replaces the old footer PNG). */
.indicator {
  position: absolute;
  left: 50%;
  top: 586px;
  transform: translateX(-50%);
  min-width: 92px;
  padding: 8px 24px;
  text-align: center;
  font-family: var(--ui-font);
  font-weight: 600;
  font-size: 24px;
  color: var(--ui-text);
  border: 4px solid var(--ui-outline);
  border-radius: var(--ui-radius-banner);
  background: linear-gradient(var(--ui-banner-top), var(--ui-banner-bottom));
  box-shadow: var(--ui-shadow);
}
</style>
