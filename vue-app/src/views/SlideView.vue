<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SlideStage from '@/components/SlideStage.vue'
import StageObject from '@/components/StageObject.vue'
import { useSlideAudio } from '@/composables/useSlideAudio'
import { slideByPage, targetToRoute, type SlideObject } from '@/data/slides'

const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.params.n))
const slide = computed(() => slideByPage(page.value))

const { state, attach, toggle, resumeAfterGesture } = useSlideAudio()

// (re)load backsound whenever the page changes
watch(
  slide,
  (s) => {
    if (s) attach(s.backsound)
    else attach(null)
  },
  { immediate: true },
)

// Objects to render: hide the two audio-control variants that aren't active.
const visibleObjects = computed<SlideObject[]>(() => {
  const s = slide.value
  if (!s) return []
  return s.objects.filter((o) => {
    if (o.role === 'volume') return state.value === 'volume'
    if (o.role === 'mute') return state.value === 'mute'
    if (o.role === 'replay') return state.value === 'replay'
    return true
  })
})

function onActivate(o: SlideObject) {
  switch (o.role) {
    case 'home':
      router.push('/')
      break
    case 'next':
    case 'prev':
      router.push(targetToRoute(o.target))
      break
    case 'volume':
    case 'mute':
    case 'replay':
      toggle()
      break
    default:
      if (o.target) router.push(targetToRoute(o.target))
  }
}
</script>

<template>
  <SlideStage @hostgesture="resumeAfterGesture">
    <StageObject
      v-for="o in visibleObjects"
      :key="o.id"
      :obj="o"
      :clickable="o.accType === 'button'"
      @activate="onActivate(o)"
    />
  </SlideStage>
</template>
