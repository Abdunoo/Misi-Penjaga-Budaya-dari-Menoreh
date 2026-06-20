import { onUnmounted, ref } from 'vue'

/**
 * Auto-hides UI after `delayMs` of no interaction. Starts visible and arms the timer
 * immediately, so untouched controls fade out after the delay. Call poke() on every
 * interaction to reveal + restart the countdown.
 */
export function useIdleHide(delayMs = 3000) {
  const visible = ref(true)
  let timer: ReturnType<typeof setTimeout> | null = null

  function clear() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function arm() {
    clear()
    timer = setTimeout(() => (visible.value = false), delayMs)
  }

  // Reveal (if hidden) and restart the idle countdown.
  function poke() {
    visible.value = true
    arm()
  }

  // Keep visible indefinitely (unused for now; handy if a popup ever needs it).
  function stop() {
    clear()
    visible.value = true
  }

  arm()
  onUnmounted(clear)

  return { visible, poke, stop }
}
