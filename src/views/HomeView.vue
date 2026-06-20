<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import SlideStage from '@/components/SlideStage.vue'
import HomeMenu from '@/components/HomeMenu.vue'
import MulaiGrid from '@/components/MulaiGrid.vue'
import PetunjukPopup from '@/components/PetunjukPopup.vue'
import TentangPopup from '@/components/TentangPopup.vue'
import { pop, unlock } from '@/composables/useSfx'

const router = useRouter()

type Popup = 'mulai' | 'petunjuk' | 'tentang'
const popup = ref<Popup | null>(null)
const close = () => (popup.value = null)

// "Pop" SFX whenever a popup appears (null -> open only).
watch(popup, (now, prev) => {
  if (now !== null && prev === null) pop()
})

function selectPage(page: number) {
  router.push(`/slide/${page}`)
}

// Looping background music, gated behind the first user gesture (mobile autoplay block).
const MUSIC = 'assets/audio/musik-home.mp3'
let music: HTMLAudioElement | null = null
const musicGated = ref(false)

function startMusic() {
  music = new Audio(MUSIC)
  music.loop = true
  music.volume = 0.6
  music.play().catch(() => (musicGated.value = true))
}
function resumeMusic() {
  unlock() // first gesture also unlocks the SFX audio context
  if (musicGated.value && music) {
    music
      .play()
      .then(() => (musicGated.value = false))
      .catch(() => {})
  }
}
onMounted(startMusic)
onUnmounted(() => {
  music?.pause()
  music = null
})
</script>

<template>
  <SlideStage @hostgesture="resumeMusic">
    <HomeMenu :buttons-hidden="popup !== null" @open="popup = $event" />

    <Transition name="popup">
      <MulaiGrid v-if="popup === 'mulai'" @select="selectPage" @close="close" />
      <PetunjukPopup v-else-if="popup === 'petunjuk'" @close="close" />
      <TentangPopup v-else-if="popup === 'tentang'" @close="close" />
    </Transition>
  </SlideStage>
</template>
