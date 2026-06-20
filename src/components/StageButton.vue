<script setup lang="ts">
// An absolutely-positioned image button on the 1280x720 stage. Swaps to `down` while
// pressed and carries Storyline's subtle drop-shadow. Geometry comes in as typed props
// so callers stay self-describing — there is no data-object indirection.
import { ref } from 'vue'

const props = defineProps<{
  x: number
  y: number
  w: number
  h: number
  up: string
  /** Pressed-state image; falls back to `up`. */
  down?: string
  alt?: string
}>()

const emit = defineEmits<{ activate: [] }>()

const pressed = ref(false)
const release = () => (pressed.value = false)
</script>

<template>
  <button
    class="stage-button"
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
    @click="emit('activate')"
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
</style>
