import { onUnmounted, ref } from 'vue'

/**
 * Per-slide audio for the looping background music (backsound):
 *  - backsound auto-plays and LOOPS softly on slide enter (vol 0.5); the top-right
 *    control toggles between Volume and Mute.
 *  - Volume tap  -> pause backsound, show Mute.
 *  - Mute tap    -> resume backsound, show Volume.
 *  - The track loops, so it never "ends"; the Replay state is kept only as a
 *    fallback in case a non-looping track is ever used.
 *
 * Mobile WebViews block autoplay-with-sound until a user gesture, so the first
 * play() may reject; we surface that as `needsGesture` and retry after any tap.
 */
export type AudioState = 'volume' | 'mute' | 'replay'

export function useSlideAudio() {
  const state = ref<AudioState>('volume')
  const needsGesture = ref(false)
  let audio: HTMLAudioElement | null = null
  let sfx: HTMLAudioElement | null = null

  function attach(src: string | null) {
    detach()
    if (!src) return
    audio = new Audio(src)
    audio.loop = true
    audio.volume = 0.5
    audio.addEventListener('ended', onEnded)
    state.value = 'volume'
    tryPlay()
  }

  function tryPlay() {
    if (!audio) return
    const p = audio.play()
    if (p && typeof p.catch === 'function') {
      p.then(() => {
        needsGesture.value = false
      }).catch(() => {
        needsGesture.value = true
      })
    }
  }

  function onEnded() {
    state.value = 'replay'
  }

  // Called by the visible top-right control depending on current state.
  function toggle() {
    if (!audio) return
    if (state.value === 'volume') {
      audio.pause()
      state.value = 'mute'
    } else if (state.value === 'mute') {
      state.value = 'volume'
      tryPlay()
    } else {
      // replay
      audio.currentTime = 0
      state.value = 'volume'
      tryPlay()
    }
  }

  // Resume audio after the first user gesture if autoplay was blocked.
  function resumeAfterGesture() {
    if (needsGesture.value && state.value === 'volume') tryPlay()
  }

  function playSfx(src: string | null) {
    if (!src) return
    try {
      sfx = new Audio(src)
      sfx.volume = 1
      void sfx.play().catch(() => {})
    } catch {
      /* ignore */
    }
  }

  function detach() {
    if (audio) {
      audio.pause()
      audio.removeEventListener('ended', onEnded)
      audio = null
    }
  }

  onUnmounted(detach)

  return { state, needsGesture, attach, detach, toggle, resumeAfterGesture, playSfx }
}
