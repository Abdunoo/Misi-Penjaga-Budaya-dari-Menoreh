<script setup lang="ts">
// Home base layer: the cover artwork plus the three menu buttons. Emits which popup the
// user wants to open; HomeView owns the actual popup state.
import StageButton from '@/components/StageButton.vue'

const props = withDefaults(
  defineProps<{
    /** Hide the menu buttons while a popup is open (they'd otherwise show through the
     *  translucent scrim). The cover stays visible behind the scrim. */
    buttonsHidden?: boolean
  }>(),
  { buttonsHidden: false },
)

const emit = defineEmits<{ open: [popup: 'mulai' | 'petunjuk' | 'tentang'] }>()

const UI = 'assets/img/ui'
</script>

<template>
  <img class="cover" :src="'assets/img/page-cover.png'" alt="Background.jpg" />

  <!-- Decorative floating bubbles. Sits above the cover but below the menu buttons
       (DOM order) and never intercepts taps. Kept to the left/lower area so it doesn't
       fight the menu column on the right. -->
  <div class="decor" aria-hidden="true">
    <span class="dot d1" />
    <span class="dot d2" />
    <span class="dot d3" />
    <span class="dot d4" />
    <span class="dot d5" />
  </div>

  <template v-if="!props.buttonsHidden">
    <StageButton
      :x="888"
      :y="312"
      :w="285"
      :h="101"
      :up="`${UI}/tombol-mulai.png`"
      :down="`${UI}/tombol-mulai-pressed.png`"
      alt="Tombol Mulai.png"
      pulse
      :style="{ animationDelay: '0s' }"
      @activate="emit('open', 'mulai')"
    />
    <StageButton
      :x="888"
      :y="440"
      :w="285"
      :h="91"
      :up="`${UI}/tombol-petunjuk.png`"
      :down="`${UI}/tombol-petunjuk-pressed.png`"
      alt="Tombol Petunjuk.png"
      pulse
      :style="{ animationDelay: '0.4s' }"
      @activate="emit('open', 'petunjuk')"
    />
    <StageButton
      :x="888"
      :y="560"
      :w="284"
      :h="101"
      :up="`${UI}/tentang.png`"
      :down="`${UI}/tentang-pressed.png`"
      alt="Tentang.png"
      pulse
      :style="{ animationDelay: '0.8s' }"
      @activate="emit('open', 'tentang')"
    />
  </template>
</template>

<style scoped>
.cover {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
  display: block;
  object-fit: fill;
}

/* Floating decorative bubbles — soft, low-opacity, transform-only (no reflow). */
.decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.dot {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ffffff, rgba(255, 255, 255, 0));
  opacity: 0.18;
  will-change: transform;
  animation: float 11s ease-in-out infinite;
}
.d1 {
  left: 120px;
  top: 180px;
  width: 90px;
  height: 90px;
  animation-delay: 0s;
}
.d2 {
  left: 260px;
  top: 480px;
  width: 60px;
  height: 60px;
  animation-delay: 1.5s;
}
.d3 {
  left: 540px;
  top: 120px;
  width: 70px;
  height: 70px;
  animation-delay: 3s;
}
.d4 {
  left: 420px;
  top: 560px;
  width: 50px;
  height: 50px;
  animation-delay: 4.5s;
}
.d5 {
  left: 700px;
  top: 420px;
  width: 80px;
  height: 80px;
  animation-delay: 2.2s;
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
