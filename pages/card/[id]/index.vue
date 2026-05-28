<script setup lang="ts">
import { useApp } from '~/stores/app'

const app = useApp()
const route = useRoute()
const router = useRouter()
const { show } = useToast()

const id = computed(() => route.params.id as string)
const card = computed(() => app.cardById(id.value))

onMounted(async () => {
  if (!app.cards.length) await app.loadCards()
  if (!card.value) router.replace('/')
})

const fullscreen = ref(false)
const viewerSrc = ref<string | null>(null)

const groupedNumber = computed(() => {
  const n = card.value?.number ?? ''
  return n.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim() || n
})

async function copyNumber() {
  if (!card.value) return
  try {
    await navigator.clipboard.writeText(card.value.number)
    show('Card number copied')
  } catch {
    show('Couldn’t copy')
  }
}
</script>

<template>
  <div v-if="card" class="page">
    <NavBar :title="card.name">
      <template #left>
        <button class="nav-btn back" @click="router.push('/')">
          <span class="chev">‹</span>Cards
        </button>
      </template>
      <template #right>
        <NuxtLink :to="`/card/${card.id}/edit`" class="nav-btn">Edit</NuxtLink>
      </template>
    </NavBar>

    <div class="body">
      <CardThumb
        :card="card"
        :width="120"
        :height="96"
        :radius="18"
        :font-size="28"
        class="hero"
      />
      <h1 class="cardname">{{ card.name }}</h1>

      <button class="barcode-card" @click="fullscreen = true">
        <BarcodeCanvas :format="card.format" :text="card.number" />
        <span class="hint">Tap to enlarge for scanning</span>
      </button>

      <p class="label num-label">Card Number</p>
      <p class="number">{{ groupedNumber }}</p>
      <div class="copy-row">
        <button class="copy" @click="copyNumber">Copy number</button>
      </div>

      <p class="label photos-label">Card Photos</p>
      <div class="photos">
        <button
          class="photo"
          :class="{ empty: !card.front }"
          @click="card.front && (viewerSrc = card.front)"
        >
          <img v-if="card.front" :src="card.front" alt="Front photo" />
          <span v-else class="ph">
            <span class="ph-icon">▢</span>
            No front photo
          </span>
          <span v-if="card.front" class="photo-tag">Front</span>
        </button>
        <button
          class="photo"
          :class="{ empty: !card.back }"
          @click="card.back && (viewerSrc = card.back)"
        >
          <img v-if="card.back" :src="card.back" alt="Back photo" />
          <span v-else class="ph">
            <span class="ph-icon">▢</span>
            No back photo
          </span>
          <span v-if="card.back" class="photo-tag">Back</span>
        </button>
      </div>
    </div>

    <FullscreenBarcode
      :open="fullscreen"
      :format="card.format"
      :number="card.number"
      @close="fullscreen = false"
    />
    <PhotoViewer :src="viewerSrc" @close="viewerSrc = null" />
  </div>
</template>

<style scoped>
.body {
  padding: 16px 20px calc(48px + var(--safe-bottom));
  display: flex;
  flex-direction: column;
  align-items: center;
}
.back {
  display: inline-flex;
  align-items: center;
}
.chev {
  font-size: 26px;
  line-height: 1;
  margin-right: 2px;
}
.hero {
  margin-top: 8px;
}
.cardname {
  font-size: 30px;
  font-weight: 800;
  margin: 14px 0 18px;
  text-align: center;
}
.barcode-card {
  width: 100%;
  background: #fff;
  border: 1px solid var(--hair);
  border-radius: 16px;
  padding: 22px 18px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.barcode-card:active {
  background: #fafafa;
}
.hint {
  color: var(--muted);
  font-size: 15px;
}
.num-label {
  margin: 26px 0 6px;
  text-align: center;
}
.number {
  font-family: var(--mono);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin: 0;
}
.copy-row {
  margin-top: 14px;
}
.copy {
  background: var(--field);
  color: var(--tint);
  font-weight: 600;
  font-size: 16px;
  padding: 9px 18px;
  border-radius: 999px;
}
.copy:active {
  filter: brightness(0.95);
}
.photos-label {
  align-self: flex-start;
  margin: 34px 0 10px;
}
.photos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  width: 100%;
}
.photo {
  position: relative;
  aspect-ratio: 1.6;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo.empty {
  background: var(--field);
}
.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ph {
  color: var(--muted);
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.ph-icon {
  font-size: 26px;
}
.photo-tag {
  position: absolute;
  left: 12px;
  bottom: 10px;
  color: #fff;
  font-weight: 700;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
</style>
