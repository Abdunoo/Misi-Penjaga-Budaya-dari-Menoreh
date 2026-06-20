import { onMounted, onUnmounted, ref } from 'vue'
import { STAGE } from '@/data/slides'

/**
 * Scales the fixed 1280x720 stage to fit the viewport while preserving aspect
 * ratio (Storyline `noscale` -> responsive letterbox equivalent). Returns the
 * scale factor and the centered offset so the stage sits in the middle of a
 * white background. Hit-testing stays accurate because events bind inside the
 * scaled `.stage`.
 */
export function useStageScale() {
  const scale = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)

  function recompute() {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const s = Math.min(vw / STAGE.width, vh / STAGE.height)
    scale.value = s
    offsetX.value = (vw - STAGE.width * s) / 2
    offsetY.value = (vh - STAGE.height * s) / 2
  }

  let raf = 0
  function onResize() {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(recompute)
  }

  onMounted(() => {
    recompute()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
  })
  onUnmounted(() => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
  })

  return { scale, offsetX, offsetY, stage: STAGE }
}
