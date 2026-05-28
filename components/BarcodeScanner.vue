<script setup lang="ts">
import type { BarcodeFormat } from '~/types/card'
import { zxingToFormat } from '~/utils/barcode'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  close: []
  result: [payload: { number: string; format: BarcodeFormat }]
}>()

const video = ref<HTMLVideoElement | null>(null)
const error = ref('')
let controls: { stop: () => void } | null = null
let reader: any = null

async function start() {
  error.value = ''
  await nextTick()
  if (!video.value) return
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    reader = new BrowserMultiFormatReader()
    // Prefer the rear camera.
    controls = await reader.decodeFromConstraints(
      { video: { facingMode: { ideal: 'environment' } } },
      video.value,
      (result: any) => {
        if (result) {
          const fmtName = result.getBarcodeFormat?.()
          const zxingName =
            typeof fmtName === 'number'
              ? formatEnumName(fmtName)
              : String(fmtName ?? '')
          emit('result', {
            number: result.getText(),
            format: zxingToFormat(zxingName),
          })
          stop()
        }
      },
    )
  } catch (e: any) {
    error.value =
      e?.name === 'NotAllowedError'
        ? 'Camera permission denied.'
        : 'Could not start the camera.'
  }
}

// ZXing's BarcodeFormat is a numeric enum; map the common values to names.
function formatEnumName(n: number): string {
  const names = [
    'AZTEC',
    'CODABAR',
    'CODE_39',
    'CODE_93',
    'CODE_128',
    'DATA_MATRIX',
    'EAN_8',
    'EAN_13',
    'ITF',
    'MAXICODE',
    'PDF_417',
    'QR_CODE',
    'RSS_14',
    'RSS_EXPANDED',
    'UPC_A',
    'UPC_E',
    'UPC_EAN_EXTENSION',
  ]
  return names[n] ?? ''
}

function stop() {
  try {
    controls?.stop()
  } catch {
    /* ignore */
  }
  controls = null
  reader = null
}

watch(
  () => props.open,
  (o) => {
    if (o) start()
    else stop()
  },
)
onBeforeUnmount(stop)

function done() {
  stop()
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="scan">
        <div class="bar">
          <button class="nav-btn cancel" @click="done">Cancel</button>
          <span class="title">Scan barcode</span>
          <span class="spacer" />
        </div>
        <div class="stage">
          <video ref="video" playsinline muted />
          <div class="reticle" />
          <p v-if="error" class="error">{{ error }}</p>
          <p v-else class="hint">Point the camera at the card's barcode</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scan {
  position: fixed;
  inset: 0;
  z-index: 960;
  background: #000;
  display: flex;
  flex-direction: column;
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  padding-top: calc(12px + var(--safe-top));
  color: #fff;
}
.bar .title {
  font-weight: 600;
}
.bar .spacer {
  width: 56px;
}
.cancel {
  color: #fff;
  font-size: 17px;
}
.stage {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.reticle {
  position: absolute;
  width: 72%;
  max-width: 360px;
  aspect-ratio: 1.6;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.35);
}
.hint,
.error {
  position: absolute;
  bottom: calc(40px + var(--safe-bottom));
  left: 0;
  right: 0;
  text-align: center;
  color: #fff;
  font-size: 15px;
  padding: 0 24px;
}
.error {
  color: #ff8a8a;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
