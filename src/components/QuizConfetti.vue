<script setup lang="ts">
// A lightweight CSS/DOM confetti burst — no npm dependency. Each piece is an absolutely
// positioned span that falls + spins once via a single keyframe. The parent mounts this
// with v-if only on the score phase, so the animation plays exactly once on insert and the
// pieces fade out (animation-fill-mode: forwards). Purely decorative: aria-hidden, never
// intercepts taps. Disabled under prefers-reduced-motion (see the media query below).
import { ref } from 'vue'

const props = withDefaults(defineProps<{ count?: number }>(), { count: 28 })

// Brand palette so the confetti reads as part of the app, plus a maroon accent.
const COLORS = ['#ffc24d', '#f0892f', '#ffe0a8', '#ffd479', '#f9a73a', '#6e120c'] as const

// Pick a random element; the `!` is safe because the source arrays are non-empty.
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}
function between(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

interface Piece {
  id: number
  left: number // px across the 1280-wide stage
  color: string
  w: number
  h: number
  radius: number
  delay: number // s
  duration: number // s
  drift: number // px horizontal travel during the fall
}

// Built once at setup (the component only ever mounts on the score screen).
const pieces = ref<Piece[]>(
  Array.from({ length: props.count }, (_, id) => ({
    id,
    left: Math.round(between(40, 1240)),
    color: pick(COLORS),
    w: Math.round(between(9, 16)),
    h: Math.round(between(12, 22)),
    radius: Math.random() < 0.4 ? 50 : 3, // a few round confetti among the rectangles
    delay: Number(between(0, 0.5).toFixed(2)),
    duration: Number(between(1.8, 3.2).toFixed(2)),
    drift: Math.round(between(-80, 80)),
  })),
)
</script>

<template>
  <div class="confetti" aria-hidden="true">
    <span
      v-for="p in pieces"
      :key="p.id"
      class="piece"
      :style="{
        left: `${p.left}px`,
        width: `${p.w}px`,
        height: `${p.h}px`,
        borderRadius: `${p.radius}px`,
        background: p.color,
        animationDelay: `${p.delay}s`,
        animationDuration: `${p.duration}s`,
        '--drift': `${p.drift}px`,
      }"
    />
  </div>
</template>

<style scoped>
.confetti {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.piece {
  position: absolute;
  top: 0;
  will-change: transform, opacity;
  animation-name: confetti-fall;
  animation-timing-function: ease-in;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}
@keyframes confetti-fall {
  0% {
    transform: translate(0, -40px) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--drift), 760px) rotate(720deg);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .confetti {
    display: none;
  }
}
</style>
