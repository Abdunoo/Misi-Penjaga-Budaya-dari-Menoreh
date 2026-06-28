<script setup lang="ts">
// Lively floating-bubble backdrop for the quiz, shared across every phase. Same idea as
// HomeMenu's decorative dots (soft, low-opacity, transform-only so there is no reflow),
// but the bubbles are pushed toward the stage margins so they never sit under the centred
// question panel / answer cards. Purely decorative: aria-hidden and never intercepts taps.
</script>

<template>
  <div class="decor" aria-hidden="true">
    <span class="dot d1" />
    <span class="dot d2" />
    <span class="dot d3" />
    <span class="dot d4" />
    <span class="dot d5" />
    <span class="dot d6" />
  </div>
</template>

<style scoped>
.decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.dot {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ffffff, rgba(255, 255, 255, 0));
  opacity: 0.16;
  will-change: transform;
  animation: float 11s ease-in-out infinite;
}
.d1 {
  left: 70px;
  top: 90px;
  width: 90px;
  height: 90px;
  animation-delay: 0s;
}
.d2 {
  left: 1090px;
  top: 110px;
  width: 70px;
  height: 70px;
  animation-delay: 1.5s;
}
.d3 {
  left: 1170px;
  top: 380px;
  width: 56px;
  height: 56px;
  animation-delay: 3s;
}
.d4 {
  left: 100px;
  top: 560px;
  width: 80px;
  height: 80px;
  animation-delay: 4.5s;
}
.d5 {
  left: 1050px;
  top: 580px;
  width: 64px;
  height: 64px;
  animation-delay: 2.2s;
}
.d6 {
  left: 40px;
  top: 330px;
  width: 52px;
  height: 52px;
  animation-delay: 3.7s;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-22px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .dot {
    animation: none;
  }
}
</style>
