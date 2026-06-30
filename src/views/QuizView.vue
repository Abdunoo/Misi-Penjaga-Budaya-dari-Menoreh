<script setup lang="ts">
// The post-story quiz: a single route (/kuis) with three internal phases (intro ->
// playing -> score) held in component state so moving between questions never thrashes
// the router or replays a slide transition. Re-skinned to the app's playful design
// language (Fredoka + the --ui-* tokens, PillButton CTAs, floating decor, confetti) while
// keeping the original FLOW: no per-answer right/wrong feedback — the selection stays
// changeable, "Lanjut" only unlocks once an option is picked, and the score is revealed
// only at the end. Reachable only via Next on the last story page.
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import SlideStage from '@/components/SlideStage.vue'
import PillButton from '@/components/PillButton.vue'
import QuizDecor from '@/components/QuizDecor.vue'
import QuizConfetti from '@/components/QuizConfetti.vue'
import QuizOption from '@/components/QuizOption.vue'
import { click, fanfare, unlock } from '@/composables/useSfx'
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

// Encouraging score bands for a 10-question quiz: stars + an Indonesian message. Ordered
// high → low; the first whose threshold is met wins (the 0-band is a guaranteed fallback).
interface ScoreBand {
  min: number
  stars: number
  message: string
}
const BANDS: ScoreBand[] = [
  { min: 9, stars: 3, message: 'Luar biasa! Kamu Penjaga Budaya sejati!' },
  { min: 7, stars: 2, message: 'Hebat! Pemahamanmu sudah sangat baik.' },
  { min: 4, stars: 1, message: 'Bagus! Ayo baca lagi ceritanya dan coba lagi.' },
  { min: 0, stars: 0, message: 'Jangan menyerah! Yuk pelajari lagi kisah Menoreh.' },
]
const scoreBand = computed<ScoreBand>(
  () => BANDS.find((b) => score.value >= b.min) ?? BANDS[BANDS.length - 1]!,
)
// Three star slots, filled left-to-right per the band.
const starSlots = computed(() => [0, 1, 2].map((i) => i < scoreBand.value.stars))

// Progress bar fill (1-based on the current question).
const progressPct = computed(() => `${((currentIndex.value + 1) / QUIZ_COUNT) * 100}%`)

// Mascot "Jaya" — supplied as transparent PNGs by the user. Bound as runtime string paths
// (never a static src="assets/…", which Vite would try to bundle). If a file is missing,
// @error flips mascotOk so nothing renders — no broken-image icon.
const mascotOk = ref(true)
const JAYA_CHEER = 'assets/img/quiz/jaya-cheer.webp'
const JAYA_CELEBRATE = 'assets/img/quiz/jaya-celebrate.webp'
const mascotSrc = computed(() => (phase.value === 'score' ? JAYA_CELEBRATE : JAYA_CHEER))

// Celebrate once when the score screen appears (the only entry into 'score').
watch(phase, (v) => {
  if (v === 'score') fanfare()
})

// First tap resumes the SFX audio context (mobile WebViews start it suspended).
function onHostGesture() {
  unlock()
}

// PillButton plays its own click() on activate, so these handlers don't double up SFX —
// except choose(), whose source (QuizOption) is silent.
function start() {
  phase.value = 'playing'
}

function choose(i: number) {
  click()
  answers.value[currentIndex.value] = i
}

function next() {
  if (!canAdvance.value) return
  if (isLast.value) {
    phase.value = 'score'
    return
  }
  currentIndex.value++
}

function restart() {
  answers.value = Array(QUIZ_COUNT).fill(null)
  currentIndex.value = 0
  phase.value = 'playing'
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <SlideStage @hostgesture="onHostGesture">
    <div class="quiz">
      <!-- Cover artwork behind every phase, dimmed by a warm scrim so the text stays legible. -->
      <img class="bg" :src="'assets/img/page-cover.webp'" alt="" aria-hidden="true" />
      <div class="bg-scrim" aria-hidden="true" />
      <QuizDecor />

      <!-- Friendly mascot Jaya, persists across phases; positioned per phase, kept clear of
           the question / answer text. Hidden entirely if the PNG is absent. -->
      <img
        v-if="mascotOk"
        class="jaya"
        :class="phase"
        :src="mascotSrc"
        alt=""
        aria-hidden="true"
        @error="mascotOk = false"
      />

      <!-- Intro: a friendly cover with the big "Mulai Kuis" call to action. -->
      <div v-if="phase === 'intro'" class="intro">
        <div class="plaque intro-title">Ayo Uji Pemahamanmu!</div>
        <p class="intro-sub">Jawab 10 pertanyaan tentang petualangan Penjaga Budaya.</p>
        <PillButton :x="490" :y="440" :w="300" :h="96" label="Mulai Kuis" pulse @activate="start" />
      </div>

      <!-- Playing: one question, four answer cards, and the Lanjut/Selesai button. -->
      <div v-else-if="phase === 'playing'" class="play">
        <div class="progress" aria-live="polite">
          Soal {{ currentIndex + 1 }} / {{ QUIZ_COUNT }}
        </div>
        <div class="progress-bar" aria-hidden="true">
          <div class="progress-fill" :style="{ width: progressPct }" />
        </div>

        <Transition name="qslide" mode="out-in">
          <div :key="currentIndex" class="qblock">
            <div class="question">{{ current.question }}</div>
            <div class="options" role="radiogroup" aria-label="Pilihan jawaban">
              <QuizOption
                v-for="(opt, i) in current.options"
                :key="i"
                :letter="LETTERS[i] ?? ''"
                :label="opt"
                :selected="selected === i"
                @select="choose(i)"
              />
            </div>
          </div>
        </Transition>

        <!-- The advance button is a real PillButton once an answer is chosen; otherwise a
             dimmed inert placeholder (PillButton has no disabled prop). next() also guards. -->
        <PillButton
          v-if="canAdvance"
          :x="900"
          :y="628"
          :w="240"
          :h="72"
          :label="isLast ? 'Selesai' : 'Lanjut'"
          @activate="next"
        />
        <div v-else class="advance-placeholder">{{ isLast ? 'Selesai' : 'Lanjut' }}</div>
      </div>

      <!-- Score: stars + tally + an encouraging message, with confetti and two ways out. -->
      <div v-else class="score">
        <div class="plaque score-title">Skormu</div>
        <div class="stars" aria-hidden="true">
          <svg
            v-for="(filled, i) in starSlots"
            :key="i"
            class="star"
            :class="{ filled }"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2.6l2.7 5.47 6.04.88-4.37 4.26 1.03 6.02L12 16.85 6.57 19.23l1.03-6.02-4.37-4.26 6.04-.88z"
            />
          </svg>
        </div>
        <div class="score-value">{{ score }} / {{ QUIZ_COUNT }}</div>
        <p class="score-message">{{ scoreBand.message }}</p>
        <PillButton :x="320" :y="590" :w="300" :h="84" label="Kembali ke Home" @activate="goHome" />
        <PillButton :x="660" :y="590" :w="300" :h="84" label="Coba Lagi" @activate="restart" />
        <QuizConfetti />
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
  color: var(--ui-text);
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
/* A warm maroon→dark scrim over the busy artwork so the UI reads clearly. */
.bg-scrim {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
  background: linear-gradient(rgba(110, 18, 12, 0.45), rgba(20, 12, 4, 0.62));
}
/* Phase content sits above the cover + scrim + decor + mascot. */
.intro,
.play,
.score {
  position: absolute;
  inset: 0;
  z-index: 1;
}

/* ---- Mascot ---- */
.jaya {
  position: absolute;
  height: auto;
  user-select: none;
  animation: mascot-bob 6s ease-in-out infinite;
}
.jaya.intro {
  left: 30px;
  bottom: 0;
  width: 280px;
}
.jaya.playing {
  left: 5px;
  bottom: 0;
  width: 130px;
}
.jaya.score {
  right: 14px;
  bottom: 0;
  width: 250px;
}
@keyframes mascot-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

/* ---- Shared banner plaque (headings) ---- */
.plaque {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: inline-block;
  background: linear-gradient(var(--ui-banner-top), var(--ui-banner-bottom));
  border: var(--ui-stroke-w) solid var(--ui-outline);
  border-radius: var(--ui-radius-banner);
  box-shadow:
    var(--ui-shadow),
    inset 0 4px 0 rgba(255, 255, 255, 0.28);
  font-family: var(--ui-font);
  font-weight: 600;
  color: var(--ui-text);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.4);
  white-space: nowrap;
}

/* ---- Intro phase ---- */
.intro-title {
  top: 150px;
  padding: 14px 46px;
  font-size: 46px;
}
.intro-sub {
  position: absolute;
  top: 296px;
  left: 240px;
  width: 800px;
  text-align: center;
  font-family: var(--ui-font);
  font-size: 27px;
  font-weight: 500;
  color: #ffffff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
}

/* ---- Playing phase ---- */
.progress {
  position: absolute;
  top: 24px;
  left: 0;
  width: 1280px;
  text-align: center;
  font-family: var(--ui-font);
  font-size: 24px;
  font-weight: 600;
  color: #ffe1a8;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
}
.progress-bar {
  position: absolute;
  top: 62px;
  left: 50%;
  transform: translateX(-50%);
  width: 360px;
  height: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid var(--ui-outline);
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ui-banner-top), var(--ui-fill-bottom));
  border-radius: 999px;
  transition: width 0.3s ease;
}
.qblock {
  position: absolute;
  left: 140px;
  top: 96px;
  width: 1000px;
}
.question {
  box-sizing: border-box;
  width: 100%;
  min-height: 92px;
  margin-bottom: 18px;
  padding: 18px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--ui-panel-petunjuk);
  border: var(--ui-stroke-w) solid var(--ui-outline);
  border-radius: var(--ui-radius-panel);
  box-shadow:
    var(--ui-shadow),
    inset 0 0 0 4px rgba(255, 255, 255, 0.25);
  font-family: var(--ui-font);
  font-size: 30px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--ui-text);
}
.options {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.advance-placeholder {
  position: absolute;
  left: 900px;
  top: 628px;
  width: 240px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--ui-stroke-w) solid var(--ui-outline);
  border-radius: var(--ui-radius-pill);
  background: linear-gradient(var(--ui-fill-top), var(--ui-fill-bottom));
  box-shadow: var(--ui-shadow);
  opacity: 0.45;
  font-family: var(--ui-font);
  font-size: 33px;
  font-weight: 600;
  color: var(--ui-text);
  pointer-events: none;
}

/* ---- Score phase ---- */
.score-title {
  top: 70px;
  padding: 12px 44px;
  font-size: 40px;
}
.stars {
  position: absolute;
  top: 168px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 14px;
}
.star {
  width: 64px;
  height: 64px;
  animation: star-pop 0.4s ease-out backwards;
}
.star path {
  fill: var(--ui-badge-cream-top);
  stroke: var(--ui-outline);
  stroke-width: 1.2;
  stroke-linejoin: round;
}
.star.filled path {
  fill: #ffcf4d;
}
.stars .star:nth-child(1) {
  animation-delay: 0s;
}
.stars .star:nth-child(2) {
  animation-delay: 0.15s;
}
.stars .star:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes star-pop {
  0% {
    transform: scale(0);
  }
  70% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
.score-value {
  position: absolute;
  top: 296px;
  left: 0;
  width: 1280px;
  text-align: center;
  font-family: var(--ui-font);
  font-size: 80px;
  font-weight: 600;
  color: #ffe1a8;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.7);
}
.score-message {
  position: absolute;
  top: 420px;
  left: 280px;
  width: 720px;
  text-align: center;
  font-family: var(--ui-font);
  font-size: 26px;
  font-weight: 500;
  color: #ffffff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
}

/* ---- Question-to-question transition ---- */
.qslide-enter-active,
.qslide-leave-active {
  transition:
    transform 0.3s cubic-bezier(0.22, 0.61, 0.36, 1),
    opacity 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.qslide-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.qslide-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

@media (prefers-reduced-motion: reduce) {
  .jaya {
    animation: none;
  }
  .star {
    animation: none;
  }
  .progress-fill {
    transition-duration: 1ms;
  }
  .qslide-enter-active,
  .qslide-leave-active {
    transition-duration: 1ms;
  }
}
</style>
