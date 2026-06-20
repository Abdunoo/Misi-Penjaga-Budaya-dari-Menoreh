<script setup lang="ts">
// The post-story quiz: a single route (/kuis) with three internal phases (intro ->
// playing -> score) held in component state so moving between questions never thrashes
// the router or replays a slide transition. Unlike the story pages (PNG artwork) the quiz
// is rendered as CSS text on the same scaled 1280x720 stage. Reachable only via Next on
// the last story page.
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SlideStage from '@/components/SlideStage.vue'
import { click, pop, unlock } from '@/composables/useSfx'
import { QUIZ, QUIZ_COUNT } from '@/data/quiz'

const router = useRouter()

type Phase = 'intro' | 'playing' | 'score'
const phase = ref<Phase>('intro')

// One slot per question: the chosen option index, or null while unanswered.
const answers = ref<(number | null)[]>(Array(QUIZ_COUNT).fill(null))
const currentIndex = ref(0)

const current = computed(() => QUIZ[currentIndex.value]!)
const selected = computed(() => answers.value[currentIndex.value] ?? null)
const isLast = computed(() => currentIndex.value === QUIZ_COUNT - 1)
// `!== null` (not a truthy check) so option a / index 0 still counts as answered.
const canAdvance = computed(() => selected.value !== null)

const score = computed(() =>
  QUIZ.reduce<number>((sum, q, i) => (answers.value[i] === q.answer ? sum + 1 : sum), 0),
)

const LETTERS = ['a', 'b', 'c', 'd']

// First tap resumes the SFX audio context (mobile WebViews start it suspended).
function onHostGesture() {
  unlock()
}

function start() {
  pop()
  phase.value = 'playing'
}

function choose(i: number) {
  click()
  answers.value[currentIndex.value] = i
}

function next() {
  if (!canAdvance.value) return
  if (isLast.value) {
    pop()
    phase.value = 'score'
    return
  }
  click()
  currentIndex.value++
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <SlideStage @hostgesture="onHostGesture">
    <div class="quiz">
      <!-- Cover artwork behind every phase, dimmed by a scrim so the text stays legible. -->
      <img class="bg" :src="'assets/img/page-cover.png'" alt="" aria-hidden="true" />
      <div class="bg-scrim" aria-hidden="true" />

      <!-- Intro: a friendly cover with the big "Mulai Kuis" call to action. -->
      <div v-if="phase === 'intro'" class="intro">
        <h1 class="intro-title">Ayo Uji Pemahamanmu!</h1>
        <p class="intro-sub">Jawab 10 pertanyaan tentang petualangan Penjaga Budaya.</p>
        <button class="cta" type="button" @click="start">Mulai Kuis</button>
      </div>

      <!-- Playing: one question, four answer cards, and the Lanjut/Selesai button. -->
      <div v-else-if="phase === 'playing'" class="play">
        <div class="progress" aria-live="polite">
          Soal {{ currentIndex + 1 }} / {{ QUIZ_COUNT }}
        </div>

        <div class="question">{{ current.question }}</div>

        <div class="options" role="radiogroup" aria-label="Pilihan jawaban">
          <button
            v-for="(opt, i) in current.options"
            :key="i"
            type="button"
            class="option"
            :class="{ selected: selected === i }"
            role="radio"
            :aria-checked="selected === i"
            @click="choose(i)"
          >
            <span class="badge">{{ LETTERS[i] }}</span>
            <span class="label">{{ opt }}</span>
          </button>
        </div>

        <button class="cta advance" type="button" :disabled="!canAdvance" @click="next">
          {{ isLast ? 'Selesai' : 'Lanjut' }}
        </button>
      </div>

      <!-- Score: final tally plus the single way out, back to the home menu. -->
      <div v-else class="score">
        <h1 class="score-title">Skormu</h1>
        <p class="score-value">{{ score }} / {{ QUIZ_COUNT }}</p>
        <button class="cta" type="button" @click="goHome">Kembali ke Home</button>
      </div>
    </div>
  </SlideStage>
</template>

<style scoped>
.quiz {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
  color: #3a2c12;
}
/* The story cover fills the stage behind every quiz phase. */
.bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
  object-fit: cover;
}
/* A warm scrim over the busy artwork so question and answer text stays readable. */
.bg-scrim {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
  background: rgba(20, 12, 4, 0.5);
}
/* Phase content sits above the cover + scrim. */
.intro,
.play,
.score {
  z-index: 1;
}

/* ---- Intro phase ---- */
.intro {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
  text-align: center;
  padding: 0 120px;
}
.intro-title {
  font-size: 56px;
  font-weight: 800;
  color: #ffd479;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
.intro-sub {
  font-size: 28px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
}

/* ---- Playing phase ---- */
.progress {
  position: absolute;
  top: 40px;
  left: 0;
  width: 1280px;
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  color: #ffd479;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
}
.question {
  position: absolute;
  left: 140px;
  top: 80px;
  width: 1000px;
  min-height: 120px;
  text-align: center;
  font-size: 34px;
  font-weight: 700;
  line-height: 1.25;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
}
.options {
  position: absolute;
  left: 140px;
  top: 210px;
  width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.option {
  display: flex;
  align-items: center;
  gap: 18px;
  width: 1000px;
  min-height: 84px;
  padding: 14px 22px;
  background: #ffffff;
  border: 3px solid #e4d4b0;
  border-radius: 18px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    border-color 0.12s ease,
    box-shadow 0.12s ease;
}
.option:active {
  transform: scale(0.99);
}
/* Selected state keeps the white background; only the border, badge and shadow change. */
.option.selected {
  border-color: #fe8b46;
  border-width: 4px;
  box-shadow: 0 2px 10px rgba(254, 139, 70, 0.35);
}
.badge {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #feb846;
  color: #ffffff;
  font-size: 26px;
  font-weight: 800;
}
.option.selected .badge {
  background: #fe8b46;
}
.label {
  flex: 1;
  font-size: 27px;
  line-height: 1.25;
  color: #3a2c12;
}

/* ---- Score phase ---- */
.score {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  text-align: center;
}
.score-title {
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
.score-value {
  font-size: 88px;
  font-weight: 800;
  color: #ffd479;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.7);
}

/* ---- Shared pill button ---- */
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 260px;
  height: 84px;
  padding: 0 44px;
  background: #feb846;
  color: #ffffff;
  font-size: 36px;
  font-weight: 800;
  border: 0;
  border-radius: 999px;
  box-shadow: 0 4px 0 #d98e2a;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    background 0.12s ease;
}
.cta:active {
  transform: translateY(2px);
  background: #fe8b46;
  box-shadow: 0 2px 0 #d98e2a;
}
.cta:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}
/* The advance button is pinned to the bottom-right of the playing stage. */
.cta.advance {
  position: absolute;
  bottom: 30px;
  right: 140px;
  min-width: 240px;
  height: 72px;
  font-size: 32px;
}

@media (prefers-reduced-motion: reduce) {
  .option,
  .cta {
    transition-duration: 1ms;
  }
}
</style>
