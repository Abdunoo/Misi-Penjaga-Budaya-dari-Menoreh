<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SlideStage from '@/components/SlideStage.vue'
import NavControls from '@/components/NavControls.vue'
import { useSlideAudio } from '@/composables/useSlideAudio'
import { unlock } from '@/composables/useSfx'
import { useIdleHide } from '@/composables/useIdleHide'
import { slideByPage, PAGE_COUNT } from '@/data/slides'

const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.params.n))
const slide = computed(() => slideByPage(page.value))

const { state, attach, toggle, resumeAfterGesture } = useSlideAudio()

// Nav controls auto-hide after 3s of no touch; any tap reveals + restarts the timer.
const { visible: controlsVisible, poke } = useIdleHide(3000)

// First gesture unlocks both the narration retry and the SFX audio context, and also
// reveals the nav controls (when hidden, the tap falls through to the host).
function onHostGesture() {
  unlock()
  resumeAfterGesture()
  poke()
}

// (re)load the narration whenever the page changes
watch(slide, (s) => attach(s?.backsound ?? null), { immediate: true })

// Prev/Next walk the page chain. Stepping forward off the last page enters the quiz; the
// other ends still fall back to the home menu.
function go(delta: number) {
  const next = page.value + delta
  if (next > PAGE_COUNT) {
    router.push('/kuis')
    return
  }
  router.push(next < 1 ? '/' : `/slide/${next}`)
}

function onControl(intent: 'home' | 'prev' | 'next' | 'toggle-audio') {
  switch (intent) {
    case 'home':
      router.push('/')
      break
    case 'prev':
      go(-1)
      break
    case 'next':
      go(1)
      break
    case 'toggle-audio':
      toggle()
      break
  }
}
</script>

<template>
  <SlideStage @hostgesture="onHostGesture">
    <img v-if="slide" class="slide-bg" :src="slide.background" :alt="slide.backgroundAlt" />
    <NavControls :audio-state="state" :visible="controlsVisible" @activate="onControl" />
  </SlideStage>
</template>

<style scoped>
.slide-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
  display: block;
  object-fit: fill;
}
</style>
