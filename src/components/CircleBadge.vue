<script setup lang="ts">
// Presentational round icon badge: gradient fill + maroon ring + a centered glyph.
// Themeable through the --ui-* tokens; override per-instance by setting those vars
// (or --badge-* below) in the caller's style. No interactivity — IconButton wraps this
// for taps, and the Petunjuk legend renders it statically.
import UiGlyph, { type GlyphName } from '@/components/icons/UiGlyph.vue'

withDefaults(
  defineProps<{
    name: GlyphName
    /** 'cream' = the lighter close/tutup fill; 'default' = cream→orange. */
    variant?: 'default' | 'cream'
    /** Mirror the glyph horizontally (used for the "prev" arrow). */
    flip?: boolean
    /** Glyph size as a fraction of the badge (0–1). */
    glyphScale?: number
  }>(),
  { variant: 'default', flip: false, glyphScale: 0.56 },
)
</script>

<template>
  <span class="badge" :class="{ cream: variant === 'cream' }">
    <span
      class="glyph-wrap"
      :class="{ flip }"
      :style="{ width: `${glyphScale * 100}%`, height: `${glyphScale * 100}%` }"
    >
      <UiGlyph :name="name" />
    </span>
  </span>
</template>

<style scoped>
.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: var(--ui-stroke-w) solid var(--ui-outline);
  background: linear-gradient(var(--ui-badge-top), var(--ui-badge-bottom));
  box-shadow: var(--ui-shadow);
  box-sizing: border-box;
}
.badge.cream {
  background: linear-gradient(var(--ui-badge-cream-top), var(--ui-badge-cream-bottom));
}
.glyph-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-glyph);
}
.glyph-wrap.flip {
  transform: scaleX(-1);
}
</style>
