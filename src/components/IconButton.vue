<script setup lang="ts">
// An absolutely-positioned round control on the 1280x720 stage — the code-built
// replacement for the old icon PNGs (home / prev / next / volume / mute / replay /
// close). Geometry comes in as typed props (like the former StageButton); the visual
// is a themeable <CircleBadge>. Presentational state only; the parent handles intent.
import { click } from '@/composables/useSfx'
import CircleBadge from '@/components/CircleBadge.vue'
import type { GlyphName } from '@/components/icons/UiGlyph.vue'

const props = withDefaults(
  defineProps<{
    x: number
    y: number
    w: number
    h: number
    name: GlyphName
    /** 'cream' = lighter close/tutup fill. */
    variant?: 'default' | 'cream'
    /** Mirror the glyph (used for the "prev" arrow). */
    flip?: boolean
    /** Idle breathing animation. */
    pulse?: boolean
    alt?: string
  }>(),
  { variant: 'default', flip: false, pulse: false },
)

const emit = defineEmits<{ activate: [] }>()

function onClick() {
  click()
  emit('activate')
}
</script>

<template>
  <button
    class="icon-button"
    :class="{ pulse: props.pulse }"
    :style="{
      left: `${props.x}px`,
      top: `${props.y}px`,
      width: `${props.w}px`,
      height: `${props.h}px`,
    }"
    :aria-label="props.alt || undefined"
    @click="onClick"
  >
    <CircleBadge :name="props.name" :variant="props.variant" :flip="props.flip" />
  </button>
</template>

<style scoped>
.icon-button {
  position: absolute;
  border: 0;
  padding: 0;
  background: transparent;
  display: block;
  cursor: pointer;
  transition: transform 0.08s ease;
}
.icon-button:active {
  transform: scale(0.94);
  filter: brightness(0.92);
}

/* Idle "breathing"; pauses on press so the :active scale wins. */
.icon-button.pulse {
  animation: icon-pulse 2.6s ease-in-out infinite;
}
.icon-button.pulse:active {
  animation-play-state: paused;
  transform: scale(0.94);
}
@keyframes icon-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
}
@media (prefers-reduced-motion: reduce) {
  .icon-button.pulse {
    animation: none;
  }
}
</style>
