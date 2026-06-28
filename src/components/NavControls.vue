<script setup lang="ts">
// The six on-stage controls shared by every story page: Home (top-left), the audio
// trio (top-right, exactly one visible per audio state) and Prev/Next (bottom corners).
// Geometry is baked in here — these positions come straight from the original course and
// never change per page. Visuals are code-built <IconButton>s (no PNGs). Presentational
// only: the parent owns audio + routing.
import { computed } from 'vue'
import IconButton from '@/components/IconButton.vue'
import type { GlyphName } from '@/components/icons/UiGlyph.vue'
import type { AudioState } from '@/composables/useSlideAudio'

const props = defineProps<{
  /** Which audio control to show; also reflects play/mute/ended state. */
  audioState: AudioState
  /** When false the whole control layer fades out and stops receiving taps. */
  visible: boolean
}>()

type Intent = 'home' | 'prev' | 'next' | 'toggle-audio'
const emit = defineEmits<{ activate: [intent: Intent] }>()

// The audio trio shares one slot in the top-right; we render whichever matches state.
const audio = computed<{ name: GlyphName; alt: string; y: number }>(() => {
  switch (props.audioState) {
    case 'mute':
      return { name: 'speaker-off', alt: 'Matikan suara', y: 13 }
    case 'replay':
      return { name: 'replay', alt: 'Ulangi suara', y: 14 }
    default:
      return { name: 'speaker', alt: 'Suara', y: 13 }
  }
})
</script>

<template>
  <!-- One wrapper so the four controls fade and toggle interactivity as a unit.
       No `position` here: the buttons stay anchored to .stage, not this div. -->
  <div class="nav-layer" :class="{ 'nav-hidden': !props.visible }">
    <IconButton
      :x="16"
      :y="13"
      :w="53"
      :h="53"
      name="home"
      alt="Menu Utama"
      @activate="emit('activate', 'home')"
    />
    <IconButton
      :x="16"
      :y="654"
      :w="53"
      :h="53"
      name="arrow"
      flip
      alt="Halaman Sebelumnya"
      @activate="emit('activate', 'prev')"
    />
    <IconButton
      :x="1211"
      :y="654"
      :w="53"
      :h="53"
      name="arrow"
      alt="Halaman Berikutnya"
      @activate="emit('activate', 'next')"
    />
    <IconButton
      :x="1211"
      :y="audio.y"
      :w="53"
      :h="53"
      :name="audio.name"
      :alt="audio.alt"
      @activate="emit('activate', 'toggle-audio')"
    />
  </div>
</template>

<style scoped>
.nav-layer {
  opacity: 1;
  transition: opacity 300ms ease;
}
/* pointer-events flips off the instant we hide, so no taps land during the fade-out */
.nav-hidden {
  opacity: 0;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .nav-layer {
    transition-duration: 1ms;
  }
}
</style>
