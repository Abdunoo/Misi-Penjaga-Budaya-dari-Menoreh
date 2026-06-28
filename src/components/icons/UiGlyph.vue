<script setup lang="ts">
// A single inline-SVG glyph, drawn in `currentColor` so the parent owns the color
// (no per-icon PNG). One 0 0 24 24 viewBox for every glyph; pick with `name`.
// `arrow` points right — flip it with CSS (transform: scaleX(-1)) for "prev".
export type GlyphName = 'home' | 'arrow' | 'speaker' | 'speaker-off' | 'replay' | 'close'

defineProps<{ name: GlyphName }>()
</script>

<template>
  <svg
    class="glyph"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <!-- House with a doorway cut out (evenodd hole reveals the badge behind). -->
    <path
      v-if="name === 'home'"
      fill="currentColor"
      fill-rule="evenodd"
      d="M12 3 L21.6 11.9 L19 11.9 L19 20 L5 20 L5 11.9 L2.4 11.9 Z
         M10 20 L10 14.6 Q10 13.5 12 13.5 Q14 13.5 14 14.6 L14 20 Z"
    />

    <!-- Chunky right-pointing arrow. -->
    <path
      v-else-if="name === 'arrow'"
      fill="currentColor"
      d="M3 9.6 L13 9.6 L13 5.4 L21.2 12 L13 18.6 L13 14.4 L3 14.4 Z"
    />

    <!-- Speaker + two sound waves (volume on). -->
    <g v-else-if="name === 'speaker'">
      <path fill="currentColor" d="M3 9.4 L7 9.4 L12 4.8 L12 19.2 L7 14.6 L3 14.6 Z" />
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="2.1"
        stroke-linecap="round"
        d="M14.6 8.8 Q16.8 12 14.6 15.2"
      />
      <path
        fill="none"
        stroke="currentColor"
        stroke-width="2.1"
        stroke-linecap="round"
        d="M17.4 6.6 Q21 12 17.4 17.4"
      />
    </g>

    <!-- Speaker + ✕ (muted). -->
    <g v-else-if="name === 'speaker-off'">
      <path fill="currentColor" d="M3 9.4 L7 9.4 L12 4.8 L12 19.2 L7 14.6 L3 14.6 Z" />
      <g stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
        <path d="M15.2 9 L20.4 14.2" />
        <path d="M20.4 9 L15.2 14.2" />
      </g>
    </g>

    <!-- Circular reload arrow (replay / ulangi). -->
    <g
      v-else-if="name === 'replay'"
      fill="none"
      stroke="currentColor"
      stroke-width="2.3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="20.5 4.5 20.5 9.5 15.5 9.5" />
      <path d="M18.4 14.5 A7.2 7.2 0 1 1 16.7 6.1 L20.5 9.5" />
    </g>

    <!-- Bold ✕ (close / tutup). -->
    <g v-else stroke="currentColor" stroke-width="3.2" stroke-linecap="round">
      <path d="M7 7 L17 17" />
      <path d="M17 7 L7 17" />
    </g>
  </svg>
</template>

<style scoped>
.glyph {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
