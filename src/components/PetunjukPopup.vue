<script setup lang="ts">
// "Petunjuk" (Instructions) popup: scrim + a fully code-built legend panel + close.
// The panel, header plaque, and each icon+label row are CSS/SVG (no PNG), so colors
// re-theme from the --ui-* tokens. Rows are data so the legend stays in one place.
import StagePopup from '@/components/StagePopup.vue'
import CircleBadge from '@/components/CircleBadge.vue'
import type { GlyphName } from '@/components/icons/UiGlyph.vue'

const emit = defineEmits<{ close: [] }>()

const ROWS: { name: GlyphName; flip?: boolean; label: string }[] = [
  { name: 'speaker-off', label: 'Matikan Suara' },
  { name: 'speaker', label: 'Nyalakan Suara' },
  { name: 'arrow', flip: true, label: 'Halaman Sebelumnya' },
  { name: 'arrow', label: 'Halaman Berikutnya' },
  { name: 'home', label: 'Menu Utama' },
  { name: 'close', label: 'Tutup' },
  { name: 'replay', label: 'Ulangi' },
]
</script>

<template>
  <StagePopup scrim="rgba(136, 212, 238, 0.64)" :close-x="800" :close-y="72" @close="emit('close')">
    <section class="panel" aria-label="Petunjuk Penggunaan">
      <h2 class="banner">Petunjuk<br />Penggunaan</h2>

      <ul class="list">
        <li v-for="(row, i) in ROWS" :key="i" class="row">
          <span class="badge-slot">
            <CircleBadge :name="row.name" :flip="row.flip" />
          </span>
          <span class="label">{{ row.label }}</span>
        </li>
      </ul>
    </section>
  </StagePopup>
</template>

<style scoped>
.panel {
  position: absolute;
  left: 437px;
  top: 35px;
  width: 414px;
  height: 656px;
  box-sizing: border-box;
  padding: 96px 26px 26px;
  border: 5px solid var(--ui-outline);
  border-radius: 34px;
  background: var(--ui-panel-petunjuk);
  box-shadow:
    var(--ui-shadow),
    inset 0 0 0 4px rgba(255, 255, 255, 0.25);
}
/* Title plaque straddling the top edge of the panel. */
.banner {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 232px;
  padding: 12px 26px;
  text-align: center;
  font-family: var(--ui-font);
  font-weight: 600;
  font-size: 30px;
  line-height: 1.05;
  color: var(--ui-text);
  border: 4px solid var(--ui-outline);
  border-radius: var(--ui-radius-banner);
  background: linear-gradient(var(--ui-banner-top), var(--ui-banner-bottom));
  box-shadow: var(--ui-shadow);
}
.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.badge-slot {
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
}
.label {
  font-family: var(--ui-font);
  font-weight: 500;
  font-size: 23px;
  color: var(--ui-text);
  white-space: nowrap;
}
</style>
