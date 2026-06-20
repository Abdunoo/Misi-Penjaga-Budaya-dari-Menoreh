<script setup lang="ts">
// An absolutely-positioned image button on the 1280x720 stage. Swaps to `down` while
// pressed and carries Storyline's subtle drop-shadow. Geometry comes in as typed props
// so callers stay self-describing — there is no data-object indirection.
import { ref } from 'vue'
import { click } from '@/composables/useSfx'

const props = defineProps<{
  x: number
  y: number
  w: number
  h: number
  up: string
  /** Pressed-state image; falls back to `up`. */
  down?: string
  alt?: string
  /** Idle breathing animation (used by the home menu buttons). */
  pulse?: boolean
}>()

const emit = defineEmits<{ activate: [] }>()

const pressed = ref(false)
const release = () => (pressed.value = false)

// Soft click on every activation (no-ops under reduced-motion / no Web Audio).
function onClick() {
  click()
  emit('activate')
}
</script>

<template>
  <button
    class="stage-button"
    :class="{ pulse: props.pulse }"
    :style="{
      left: `${props.x}px`,
      top: `${props.y}px`,
      width: `${props.w}px`,
      height: `${props.h}px`,
    }"
    :aria-label="props.alt || undefined"
    @pointerdown="pressed = true"
    @pointerup="release"
    @pointerleave="release"
    @pointercancel="release"
    @click="onClick"
  >
    <img :src="pressed && props.down ? props.down : props.up" :alt="props.alt || ''" />
  </button>
</template>

<style scoped>
.stage-button {
  position: absolute;
  border: 0;
  padding: 0;
  background: transparent;
  display: block;
  cursor: pointer;
  transition: transform 0.08s ease;
  /* approximate Storyline's #000 @29% drop shadow baked into the SVG filter */
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.29));
}
.stage-button:active {
  transform: scale(0.96);
}
.stage-button img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: fill;
}

/* Idle "breathing" for the home menu buttons. While pressed the animation pauses so the
   :active scale(0.96) feedback wins (animation would otherwise own `transform`). */
.stage-button.pulse {
  animation: pulse 2.6s ease-in-out infinite;
}
.stage-button.pulse:active {
  animation-play-state: paused;
  transform: scale(0.96);
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.04);
  }
}
@media (prefers-reduced-motion: reduce) {
  .stage-button.pulse {
    animation: none;
  }
}
</style>
