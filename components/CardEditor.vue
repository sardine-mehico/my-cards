<script setup lang="ts">
import type { Card } from '~/types/card'
import type { BarcodeFormat } from '~/types/card'
import { FORMAT_OPTIONS } from '~/utils/barcode'
import { TILE_COLORS, initials } from '~/utils/cards'

const props = defineProps<{
  initial: Card
  mode: 'new' | 'edit'
}>()
const emit = defineEmits<{
  save: [card: Card]
  cancel: []
  delete: []
}>()

const { show } = useToast()

// Local working copy so edits don't mutate the store until Save.
const form = reactive<Card>({ ...props.initial })

const scanning = ref(false)
const frontInput = ref<HTMLInputElement | null>(null)
const backInput = ref<HTMLInputElement | null>(null)

const title = computed(() => (props.mode === 'new' ? 'New Card' : 'Edit Card'))
const canSave = computed(
  () => form.name.trim().length > 0 && form.number.trim().length > 0,
)

function onSave() {
  if (!canSave.value) {
    show('Add a name and number first')
    return
  }
  form.name = form.name.trim()
  form.number = form.number.trim()
  emit('save', { ...form })
}

// ── Photos ─────────────────────────────────────────────────────────────────
function readPhoto(e: Event, side: 'front' | 'back') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form[side] = reader.result as string
  }
  reader.onerror = () => show('Couldn’t read that image')
  reader.readAsDataURL(file)
}

function clearPhoto(side: 'front' | 'back') {
  form[side] = null
}

// ── Scan ─────────────────────────────────────────────────────────────────
function onScanResult(payload: { number: string; format: BarcodeFormat }) {
  form.number = payload.number
  form.format = payload.format
  scanning.value = false
  show('Scanned — number & format filled')
}
</script>

<template>
  <div class="page">
    <NavBar :title="title">
      <template #left>
        <button class="nav-btn" @click="emit('cancel')">Cancel</button>
      </template>
      <template #right>
        <button
          class="nav-btn save"
          :class="{ disabled: !canSave }"
          @click="onSave"
        >
          Save
        </button>
      </template>
    </NavBar>

    <div class="body">
      <!-- Live preview -->
      <div class="preview">
        <div class="tile" :style="{ background: form.front ? '#000' : form.color }">
          <img v-if="form.front" :src="form.front" alt="" />
          <span v-else>{{ initials(form.name || '?') }}</span>
        </div>
        <span class="preview-name">{{ form.name || 'Card name' }}</span>
      </div>

      <button class="scan-btn" @click="scanning = true">
        <span class="cam">▣</span> Scan barcode
      </button>
      <p class="scan-hint">
        Scanning fills the number and format automatically — the most reliable
        way to capture a card.
      </p>

      <label class="label" for="f-name">Card name</label>
      <input
        id="f-name"
        v-model="form.name"
        class="field"
        placeholder="e.g. Bakers Delight"
        autocapitalize="words"
      />

      <label class="label" for="f-number">Card number</label>
      <input
        id="f-number"
        v-model="form.number"
        class="field"
        placeholder="Number under the barcode"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />

      <label class="label" for="f-format">Barcode format</label>
      <div class="select-wrap">
        <select id="f-format" v-model="form.format" class="field select">
          <option v-for="o in FORMAT_OPTIONS" :key="o.value" :value="o.value">
            {{ o.label }}
          </option>
        </select>
        <span class="chev" aria-hidden="true">⌄</span>
      </div>
      <p class="hint">
        Pick the symbology printed on the card. Wrong format = wrong scan.
      </p>

      <p class="label">Tile colour</p>
      <div class="swatches">
        <button
          v-for="c in TILE_COLORS"
          :key="c"
          class="swatch"
          :class="{ active: form.color === c }"
          :style="{ background: c }"
          :aria-label="`Colour ${c}`"
          @click="form.color = c"
        />
      </div>

      <p class="label">Photos</p>
      <div class="photos">
        <div class="photo-slot">
          <button
            class="photo"
            :class="{ filled: form.front }"
            @click="frontInput?.click()"
          >
            <img v-if="form.front" :src="form.front" alt="Front" />
            <span v-else class="ph"><span class="cam2">▤</span>Front</span>
          </button>
          <button v-if="form.front" class="clear" @click="clearPhoto('front')">
            Remove
          </button>
        </div>
        <div class="photo-slot">
          <button
            class="photo"
            :class="{ filled: form.back }"
            @click="backInput?.click()"
          >
            <img v-if="form.back" :src="form.back" alt="Back" />
            <span v-else class="ph"><span class="cam2">▤</span>Back</span>
          </button>
          <button v-if="form.back" class="clear" @click="clearPhoto('back')">
            Remove
          </button>
        </div>
      </div>

      <input
        ref="frontInput"
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        @change="(e) => readPhoto(e, 'front')"
      />
      <input
        ref="backInput"
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        @change="(e) => readPhoto(e, 'back')"
      />

      <button
        v-if="mode === 'edit'"
        class="delete"
        @click="emit('delete')"
      >
        Delete Card
      </button>
    </div>

    <BarcodeScanner
      :open="scanning"
      @close="scanning = false"
      @result="onScanResult"
    />
  </div>
</template>

<style scoped>
.body {
  padding: 18px 20px calc(60px + var(--safe-bottom));
}
.save {
  font-weight: 700;
}
.save.disabled {
  opacity: 0.4;
}

.preview {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}
.tile {
  width: 96px;
  height: 72px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 26px;
  font-weight: 800;
  overflow: hidden;
  flex: none;
}
.tile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.preview-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--ink);
}

.scan-btn {
  width: 100%;
  background: var(--ink);
  color: #fff;
  font-weight: 700;
  font-size: 17px;
  padding: 14px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.scan-btn:active {
  opacity: 0.85;
}
.cam {
  font-size: 18px;
}
.scan-hint {
  color: var(--muted);
  font-size: 14px;
  margin: 8px 2px 22px;
}

.label {
  display: block;
  margin: 20px 0 8px;
}
.hint {
  color: var(--muted);
  font-size: 14px;
  margin: 8px 2px 0;
}

.select-wrap {
  position: relative;
}
.select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 40px;
}
.select-wrap .chev {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
  font-size: 18px;
}

.swatches {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 14px;
}
.swatch {
  aspect-ratio: 1;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  position: relative;
}
.swatch.active {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px var(--ink);
}

.photos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.photo-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.photo {
  width: 100%;
  aspect-ratio: 1.6;
  background: var(--field);
  border: 1px dashed var(--hair);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo.filled {
  border-style: solid;
  background: #000;
}
.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.ph {
  color: var(--muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 15px;
}
.cam2 {
  font-size: 24px;
}
.clear {
  color: var(--tint);
  font-size: 14px;
  font-weight: 600;
}

.delete {
  display: block;
  width: 100%;
  margin-top: 40px;
  padding: 15px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--danger) 10%, #fff);
  color: var(--danger);
  font-weight: 700;
  font-size: 17px;
}
.delete:active {
  background: color-mix(in srgb, var(--danger) 18%, #fff);
}
</style>
