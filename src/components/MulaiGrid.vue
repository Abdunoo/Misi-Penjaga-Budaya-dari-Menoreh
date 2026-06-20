<script setup lang="ts">
// "Pilih Halaman" (Mulai) popup: a paged thumbnail grid built by iterating SLIDES.
// Six thumbnails per page laid out with CSS grid (3 x 2), paged with prev/next arrows.
// No hand-listed coordinates per thumbnail — the layout is derived, so adding a story
// page automatically shows up here.
import { computed, ref } from 'vue'
import StagePopup from '@/components/StagePopup.vue'
import StageButton from '@/components/StageButton.vue'
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
const footer = computed(() => `assets/img/mulai/${index.value + 1}-per-3.png`)
</script>

<template>
  <StagePopup scrim="rgba(254, 184, 70, 0.60)" :close-x="1180" :close-y="32" @close="emit('close')">
    <img class="panel" :src="'assets/img/mulai/popup.png'" alt="Pop Up Mulai.png" />

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

    <StageButton
      v-if="hasPrev"
      :x="400"
      :y="565"
      :w="106"
      :h="101"
      up="assets/img/ui/prev.png"
      alt="Kiri.png"
      @activate="index--"
    />
    <StageButton
      v-if="hasNext"
      :x="772"
      :y="565"
      :w="106"
      :h="101"
      up="assets/img/ui/next.png"
      alt="Kanan.png"
      @activate="index++"
    />

    <img class="footer" :src="footer" :alt="`${index + 1} per ${pages.length}`" />
  </StagePopup>
</template>

<style scoped>
.panel {
  position: absolute;
  left: 48px;
  top: 29px;
  width: 1184px;
  height: 663px;
  display: block;
  object-fit: fill;
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
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  width: 261px;
  height: 185px;
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
.footer {
  position: absolute;
  left: 590px;
  top: 587px;
  width: 96px;
  height: 60px;
  display: block;
  object-fit: fill;
}
</style>
