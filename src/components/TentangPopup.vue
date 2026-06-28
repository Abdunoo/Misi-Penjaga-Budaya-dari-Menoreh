<script setup lang="ts">
// "Tentang" (About) popup: scrim + a fully code-built panel + close. The real developer
// photo is replaced by a coded avatar placeholder (a photo can't be pure code); the
// panel, header plaque, avatar, and info rows are CSS/SVG and re-theme from --ui-* tokens.
// The developer details live in one editable object below.
import StagePopup from '@/components/StagePopup.vue'

const emit = defineEmits<{ close: [] }>()

const DEV = {
  nama: 'Dhesta Youlandi Rahayu Sulistiyawati',
  ttl: 'Kulon Progo, 2 Desember 1999',
  nim: '20712251064',
  prodi: 'S2 Pendidikan Dasar',
}

const INFO: { label: string; value: string }[] = [
  { label: 'Nama', value: DEV.nama },
  { label: 'TTL', value: DEV.ttl },
  { label: 'NIM', value: DEV.nim },
  { label: 'Prodi', value: DEV.prodi },
]
</script>

<template>
  <StagePopup
    scrim="rgba(136, 212, 238, 0.64)"
    :close-x="1096"
    :close-y="88"
    @close="emit('close')"
  >
    <section class="panel" aria-label="Tentang Pengembang">
      <h2 class="banner">Tentang<br />Pengembang</h2>

      <div class="body">
        <!-- Coded avatar placeholder (replaces the original portrait photo). -->
        <div class="avatar" aria-hidden="true">
          <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="40" r="22" fill="var(--ui-avatar-fg)" />
            <path d="M22 120 C22 86 36 78 50 78 C64 78 78 86 78 120 Z" fill="var(--ui-avatar-fg)" />
          </svg>
        </div>

        <dl class="info">
          <div v-for="row in INFO" :key="row.label" class="info-row">
            <dt>{{ row.label }}</dt>
            <dd class="colon">:</dd>
            <dd class="value">{{ row.value }}</dd>
          </div>
        </dl>
      </div>
    </section>
  </StagePopup>
</template>

<style scoped>
.panel {
  position: absolute;
  left: 130px;
  top: 52px;
  width: 1026px;
  height: 612px;
  box-sizing: border-box;
  padding: 118px 60px 48px;
  border: 5px solid var(--ui-outline);
  border-radius: 34px;
  background: linear-gradient(var(--ui-panel-tentang-top), var(--ui-panel-tentang-bottom));
  box-shadow:
    var(--ui-shadow),
    inset 0 0 0 4px rgba(255, 255, 255, 0.22);
}
.banner {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 280px;
  padding: 12px 30px;
  text-align: center;
  font-family: var(--ui-font);
  font-weight: 600;
  font-size: 34px;
  line-height: 1.05;
  color: var(--ui-text);
  border: 4px solid var(--ui-outline);
  border-radius: var(--ui-radius-banner);
  background: linear-gradient(var(--ui-banner-top), var(--ui-banner-bottom));
  box-shadow: var(--ui-shadow);
}
.body {
  display: flex;
  align-items: center;
  gap: 56px;
  height: 100%;
}
.avatar {
  flex: 0 0 248px;
  width: 248px;
  height: 326px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  border: 5px solid var(--ui-outline);
  border-radius: 26px;
  background: var(--ui-avatar-bg);
  box-shadow: var(--ui-shadow);
}
.avatar svg {
  width: 78%;
  height: 84%;
  display: block;
}
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: var(--ui-font);
  color: var(--ui-text);
}
.info-row {
  display: grid;
  grid-template-columns: 120px 18px 1fr;
  align-items: baseline;
  font-size: 34px;
  font-weight: 500;
}
.info-row dt {
  font-weight: 600;
}
.value {
  font-weight: 500;
}
</style>
