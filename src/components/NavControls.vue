<script setup lang="ts">
// The six on-stage controls shared by every story page: Home (top-left), the audio
// trio (top-right, exactly one visible per audio state) and Prev/Next (bottom corners).
// Geometry/images are baked in here — these positions come straight from the original
// course and never change per page. Presentational only: the parent owns audio + routing.
import { computed } from 'vue'
import StageButton from '@/components/StageButton.vue'
import type { AudioState } from '@/composables/useSlideAudio'

const props = defineProps<{
  /** Which audio control to show; also reflects play/mute/ended state. */
  audioState: AudioState
}>()

type Intent = 'home' | 'prev' | 'next' | 'toggle-audio'
const emit = defineEmits<{ activate: [intent: Intent] }>()

const UI = 'assets/img/ui'

// The audio trio shares one slot in the top-right; we render whichever matches state.
const audio = computed(() => {
  switch (props.audioState) {
    case 'mute':
      return { up: `${UI}/mute.png`, alt: 'Mute.png', y: 13 }
    case 'replay':
      return { up: `${UI}/replay.png`, alt: 'Ulangi.png', y: 14 }
    default:
      return { up: `${UI}/volume.png`, alt: 'Volume.png', y: 13 }
  }
})
</script>

<template>
  <StageButton
    :x="16"
    :y="13"
    :w="53"
    :h="53"
    :up="`${UI}/home.png`"
    :down="`${UI}/home-pressed.png`"
    alt="Home.png"
    @activate="emit('activate', 'home')"
  />
  <StageButton
    :x="32"
    :y="595"
    :w="106"
    :h="101"
    :up="`${UI}/prev.png`"
    alt="Kiri.png"
    @activate="emit('activate', 'prev')"
  />
  <StageButton
    :x="1147"
    :y="595"
    :w="106"
    :h="101"
    :up="`${UI}/next.png`"
    alt="Kanan.png"
    @activate="emit('activate', 'next')"
  />
  <StageButton
    :x="1211"
    :y="audio.y"
    :w="53"
    :h="53"
    :up="audio.up"
    :alt="audio.alt"
    @activate="emit('activate', 'toggle-audio')"
  />
</template>
