<script setup lang="ts">
// "Petunjuk" (Instructions) popup: scrim + panel + close.
import StagePopup from '@/components/StagePopup.vue'

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <StagePopup scrim="rgba(136, 212, 238, 0.64)" :close-x="800" :close-y="72" @close="emit('close')">
    <img class="panel" :src="'assets/img/petunjuk/popup.png'" alt="Petunjukk.png" />
  </StagePopup>
</template>

<style scoped>
.panel {
  position: absolute;
  left: 437px;
  top: 35px;
  width: 414px;
  height: 656px;
  display: block;
  object-fit: fill;
}
</style>
