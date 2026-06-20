<script setup lang="ts">
// "Tentang" (About) popup: scrim + panel + close.
import StagePopup from '@/components/StagePopup.vue'

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <StagePopup
    scrim="rgba(136, 212, 238, 0.64)"
    :close-x="1096"
    :close-y="88"
    @close="emit('close')"
  >
    <img class="panel" :src="'assets/img/tentang/popup.png'" alt="Pop Up Tentang.png" />
  </StagePopup>
</template>

<style scoped>
.panel {
  position: absolute;
  left: 130px;
  top: 52px;
  width: 1026px;
  height: 612px;
  display: block;
  object-fit: fill;
}
</style>
