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

  <template v-if="!props.buttonsHidden">
    <StageButton
      :x="888"
      :y="312"
      :w="285"
      :h="101"
      :up="`${UI}/tombol-mulai.png`"
      :down="`${UI}/tombol-mulai-pressed.png`"
      alt="Tombol Mulai.png"
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
</style>
