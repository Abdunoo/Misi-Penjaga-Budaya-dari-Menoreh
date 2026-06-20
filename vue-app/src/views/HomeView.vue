<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SlideStage from '@/components/SlideStage.vue'
import StageObject from '@/components/StageObject.vue'
import { HOME, targetToRoute, type HomeLayer, type SlideObject } from '@/data/slides'

const router = useRouter()

const baseLayer = computed<HomeLayer>(
  () => HOME.layers.find((l) => l.isBase) ?? HOME.layers[0]!,
)

// id of the currently-open popup layer (null = only base layer visible)
const openLayerId = ref<string | null>(null)
const openLayer = computed<HomeLayer | null>(
  () => HOME.layers.find((l) => l.id === openLayerId.value) ?? null,
)

// While a popup is open, hide the base-layer buttons (Mulai/Petunjuk/Tentang) so
// they don't show through the translucent scrim — keep only the background.
const visibleBaseObjects = computed<SlideObject[]>(() =>
  openLayer.value
    ? baseLayer.value.objects.filter((o) => o.accType !== 'button')
    : baseLayer.value.objects,
)

// looping background music, gated behind the first user gesture
let music: HTMLAudioElement | null = null
const musicGated = ref(false)
function startMusic() {
  if (!HOME.music) return
  music = new Audio(HOME.music)
  music.loop = true
  music.volume = 0.6
  const p = music.play()
  if (p?.catch) p.catch(() => (musicGated.value = true))
}
function resumeMusic() {
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

function onBaseActivate(o: SlideObject) {
  if (o.openLayer) openLayerId.value = o.openLayer
}

function onPopupActivate(o: SlideObject) {
  if (o.role === 'close') {
    openLayerId.value = null
  } else if (o.openLayer) {
    // grid page arrows switch between the 3 "Pilih Halaman" pages
    openLayerId.value = o.openLayer
  } else if (o.target) {
    // a thumbnail -> navigate to that story page
    router.push(targetToRoute(o.target))
  }
}
</script>

<template>
  <SlideStage @hostgesture="resumeMusic">
    <!-- base layer: background + Mulai / Petunjuk / Tentang
         (buttons hidden while a popup is open) -->
    <StageObject
      v-for="o in visibleBaseObjects"
      :key="o.id"
      :obj="o"
      :clickable="o.accType === 'button'"
      @activate="onBaseActivate(o)"
    />

    <!-- active popup layer (scrim + panel + controls) -->
    <template v-if="openLayer">
      <StageObject
        v-for="o in openLayer.objects"
        :key="openLayer.id + ':' + o.id"
        :obj="o"
        :clickable="o.accType === 'button'"
        @activate="onPopupActivate(o)"
      />
    </template>
  </SlideStage>
</template>
