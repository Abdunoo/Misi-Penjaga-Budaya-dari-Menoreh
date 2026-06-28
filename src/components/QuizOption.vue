<script setup lang="ts">
// One answer card on the quiz "playing" screen: a white lozenge holding the a/b/c/d letter
// badge + the option text. Presentational — the parent owns selection state and passes
// `selected`; this emits `select` on tap. Re-skinned to the app's design tokens (maroon
// outline, badge gradient, Fredoka). The letter badge is a TEXT element (not CircleBadge,
// which only renders SVG glyphs). No correctness colour (green/red) by design: the quiz
// reveals the score only at the end, so selection is a neutral highlight.
const props = defineProps<{ letter: string; label: string; selected: boolean }>()

const emit = defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    class="option"
    :class="{ selected: props.selected }"
    role="radio"
    :aria-checked="props.selected"
    @click="emit('select')"
  >
    <span class="badge">{{ props.letter }}</span>
    <span class="label">{{ props.label }}</span>
  </button>
</template>

<style scoped>
.option {
  display: flex;
  align-items: center;
  gap: 18px;
  width: 1000px;
  min-height: 84px;
  padding: 14px 22px;
  background: #ffffff;
  border: var(--ui-stroke-w) solid var(--ui-outline);
  border-radius: var(--ui-radius-pill);
  box-shadow: var(--ui-shadow);
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.12s ease,
    background 0.12s ease;
}
.option:active {
  transform: scale(0.99);
}
/* Selected: warm tint + a thicker glowing ring. Stays opaque so the cover artwork behind
   the stage never shows through the card. */
.option.selected {
  background: #fff3df;
  box-shadow:
    var(--ui-shadow),
    0 0 0 3px var(--ui-fill-bottom),
    0 4px 14px rgba(240, 137, 47, 0.45);
}
.badge {
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  border: 3px solid var(--ui-outline);
  background: linear-gradient(var(--ui-badge-top), var(--ui-badge-bottom));
  color: var(--ui-text);
  font-family: var(--ui-font);
  font-size: 28px;
  font-weight: 600;
  text-transform: lowercase;
}
/* Selected badge picks up the stronger orange "lozenge" fill. */
.option.selected .badge {
  background: linear-gradient(var(--ui-fill-top), var(--ui-fill-bottom));
}
.label {
  flex: 1;
  font-family: var(--ui-font);
  font-size: 26px;
  font-weight: 500;
  line-height: 1.25;
  color: var(--ui-text);
}
@media (prefers-reduced-motion: reduce) {
  .option {
    transition-duration: 1ms;
  }
}
</style>
