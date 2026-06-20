<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SlideStage from '@/components/SlideStage.vue'
import NavControls from '@/components/NavControls.vue'
import { useSlideAudio } from '@/composables/useSlideAudio'
import { slideByPage, PAGE_COUNT } from '@/data/slides'

const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.params.n))
const slide = computed(() => slideByPage(page.value))

const { state, attach, toggle, resumeAfterGesture } = useSlideAudio()

// (re)load the narration whenever the page changes
watch(slide, (s) => attach(s?.backsound ?? null), { immediate: true })

// Prev/Next walk the page chain; the ends fall back to the home menu.
function go(delta: number) {
  const next = page.value + delta
  router.push(next < 1 || next > PAGE_COUNT ? '/' : `/slide/${next}`)
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
  <SlideStage @hostgesture="resumeAfterGesture">
    <img v-if="slide" class="slide-bg" :src="slide.background" :alt="slide.backgroundAlt" />
    <NavControls :audio-state="state" @activate="onControl" />
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
