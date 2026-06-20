<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SlideObject } from '@/data/slides'

const props = defineProps<{
  obj: SlideObject
  clickable?: boolean
}>()

const emit = defineEmits<{ (e: 'activate'): void }>()

const pressed = ref(false)
const src = computed(() => (pressed.value && props.obj.down ? props.obj.down : props.obj.up))

const style = computed(() => ({
  left: props.obj.x + 'px',
  top: props.obj.y + 'px',
  width: props.obj.w + 'px',
  height: props.obj.h + 'px',
  zIndex: props.obj.depth,
  background: props.obj.fill || undefined,
}))

const isButton = computed(() => props.clickable && props.obj.accType === 'button')

function down() {
  if (isButton.value) pressed.value = true
}
function up() {
  pressed.value = false
}
function activate() {
  if (isButton.value) emit('activate')
}
</script>

<template>
  <component
    :is="isButton ? 'button' : 'div'"
    class="stage-object"
    :class="{ btn: isButton }"
    :style="style"
    :aria-label="obj.altText || undefined"
    @pointerdown="down"
    @pointerup="up"
    @pointerleave="up"
    @pointercancel="up"
    @click="activate"
  >
    <img v-if="src" :src="src" :alt="obj.altText || ''" />
  </component>
</template>

<style scoped>
.stage-object {
  position: absolute;
  border: 0;
  padding: 0;
  background: transparent;
  display: block;
}
.stage-object img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: fill;
}
.btn {
  cursor: pointer;
  transition: transform 0.08s ease;
  /* approximate Storyline's #000 @29% drop shadow baked into the SVG filter */
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.29));
}
.btn:active {
  transform: scale(0.96);
}
</style>
