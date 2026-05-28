<script setup lang="ts">
import type { BarcodeFormat } from '~/types/card'
import { renderBarcode } from '~/utils/barcode'

const props = defineProps<{
  format: BarcodeFormat
  text: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const failed = ref(false)

async function draw() {
  failed.value = false
  await nextTick()
  const el = canvas.value
  if (!el) return
  if (!props.text) {
    failed.value = true
    return
  }
  try {
    await renderBarcode(el, props.format, props.text)
  } catch {
    // Invalid value for the chosen symbology, etc.
    failed.value = true
  }
}

onMounted(draw)
watch(() => [props.format, props.text], draw)
</script>

<template>
  <div class="wrap">
    <canvas v-show="!failed" ref="canvas" class="bc" />
    <p v-if="failed" class="unavailable">
      Barcode unavailable — check the number matches the selected format.
    </p>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.bc {
  max-width: 100%;
  height: auto;
}
.unavailable {
  color: var(--muted);
  font-size: 14px;
  text-align: center;
  margin: 8px 0;
}
</style>
