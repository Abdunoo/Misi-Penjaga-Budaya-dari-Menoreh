<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <!-- Clips the off-screen page during a slide and is the containing block for the
       position:fixed view roots (translateZ keeps that robust across WebViews). -->
  <div class="route-viewport">
    <RouterView v-slot="{ Component, route }">
      <Transition :name="(route.meta.transition as string) || 'none'">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
.route-viewport {
  position: fixed;
  inset: 0;
  overflow: hidden;
  transform: translateZ(0);
}
</style>
