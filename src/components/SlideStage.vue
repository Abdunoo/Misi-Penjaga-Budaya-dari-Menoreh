<script setup lang="ts">
import { computed } from 'vue'
import { useStageScale } from '@/composables/useStageScale'

const { scale, offsetX, offsetY, stage } = useStageScale()

const stageStyle = computed(() => ({
  width: stage.width + 'px',
  height: stage.height + 'px',
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
}))
</script>

<template>
  <div class="stage-host" @pointerdown="$emit('hostgesture')">
    <div class="stage" :style="stageStyle">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.stage-host {
  position: fixed;
  inset: 0;
  background: #ffffff;
  overflow: hidden;
}
.stage {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: top left;
  will-change: transform;
  background: #ffffff;
}
</style>
