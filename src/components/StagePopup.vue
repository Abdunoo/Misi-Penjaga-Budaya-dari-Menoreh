<script setup lang="ts">
// Shared popup chrome: a full-stage tinted scrim plus a close button. The panel artwork
// (and any interactive content) goes in the default slot, positioned by the caller.
import IconButton from '@/components/IconButton.vue'

defineProps<{
  /** Scrim tint, e.g. 'rgba(136, 212, 238, 0.64)'. */
  scrim: string
  /** Close button position. */
  closeX: number
  closeY: number
}>()

const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <!-- Single root so the whole popup (scrim + panel + close) can be animated as one
       unit by a parent <Transition>. Shares the .stage top-left origin, so the absolute
       coordinates of its children are unchanged (zero layout shift). -->
  <div class="popup-root">
    <div class="scrim" :style="{ background: scrim }" />
    <slot />
    <IconButton
      :x="closeX"
      :y="closeY"
      :w="54"
      :h="53"
      name="close"
      variant="cream"
      alt="Tutup"
      @activate="emit('close')"
    />
  </div>
</template>

<style scoped>
.popup-root {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
}
.scrim {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
}
</style>
