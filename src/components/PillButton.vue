<script setup lang="ts">
// An absolutely-positioned rounded "lozenge" text button on the 1280x720 stage — the
// code-built replacement for the menu PNGs (Mulai / Petunjuk / Tentang). Themeable
// gradient fill + maroon outline + label in the rounded display font. Geometry as typed
// props; press feedback + click SFX built in. A parent-passed :style (e.g. animationDelay)
// merges onto the root via Vue's fallthrough, so the staggered pulse keeps working.
import { computed } from 'vue'
import { click } from '@/composables/useSfx'

const props = withDefaults(
  defineProps<{
    x: number
    y: number
    w: number
    h: number
    label: string
    /** Idle breathing animation. */
    pulse?: boolean
    alt?: string
  }>(),
  { pulse: false },
)

const emit = defineEmits<{ activate: [] }>()

// Scale the label to the button height so each pill reads at a consistent weight.
const fontSize = computed(() => `${Math.round(props.h * 0.46)}px`)

function onClick() {
  click()
  emit('activate')
}
</script>

<template>
  <button
    class="pill-button"
    :class="{ pulse: props.pulse }"
    :style="{
      left: `${props.x}px`,
      top: `${props.y}px`,
      width: `${props.w}px`,
      height: `${props.h}px`,
    }"
    :aria-label="props.alt || props.label"
    @click="onClick"
  >
    <span class="label" :style="{ fontSize }">{{ props.label }}</span>
  </button>
</template>

<style scoped>
.pill-button {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  border: var(--ui-stroke-w) solid var(--ui-outline);
  border-radius: var(--ui-radius-pill);
  background: linear-gradient(var(--ui-fill-top), var(--ui-fill-bottom));
  box-shadow:
    var(--ui-shadow),
    inset 0 5px 0 rgba(255, 255, 255, 0.28);
  transition:
    transform 0.08s ease,
    filter 0.08s ease;
}
.label {
  font-family: var(--ui-font);
  font-weight: 600;
  line-height: 1;
  color: var(--ui-text);
  /* Soft light edge so the chunky letters lift off the orange fill. */
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
  pointer-events: none;
  white-space: nowrap;
}
.pill-button:active {
  transform: translateY(2px) scale(0.99);
  background: linear-gradient(var(--ui-fill-pressed-top), var(--ui-fill-pressed-bottom));
  box-shadow: var(--ui-shadow);
}

/* Idle "breathing"; pauses on press so the :active feedback wins. */
.pill-button.pulse {
  animation: pill-pulse 2.6s ease-in-out infinite;
}
.pill-button.pulse:active {
  animation-play-state: paused;
  transform: translateY(2px) scale(0.99);
}
@keyframes pill-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
}
@media (prefers-reduced-motion: reduce) {
  .pill-button.pulse {
    animation: none;
  }
}
</style>
