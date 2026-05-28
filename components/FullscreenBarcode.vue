<script setup lang="ts">
import type { BarcodeFormat } from '~/types/card'
import { is2D } from '~/utils/barcode'

const props = defineProps<{
  open: boolean
  format: BarcodeFormat
  number: string
}>()
const emit = defineEmits<{ close: [] }>()

const { request, release } = useWakeLock()

watch(
  () => props.open,
  (o) => {
    if (o) request()
    else release()
  },
)
onBeforeUnmount(release)

// Pretty-print the number in groups of four for readability.
const grouped = computed(() =>
  props.number.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim() ||
  props.number,
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="full">
        <div class="bar">
          <button class="nav-btn done" @click="emit('close')">Done</button>
        </div>
        <div class="center">
          <BarcodeCanvas
            :key="open ? 'open' : 'closed'"
            class="bigbc"
            :class="{ twod: is2D(format) }"
            :format="format"
            :text="number"
          />
          <p class="num">{{ grouped }}</p>
          <p class="hint">Turn your screen brightness up to scan</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.full {
  position: fixed;
  inset: 0;
  z-index: 950;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.bar {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  padding-top: calc(12px + var(--safe-top));
}
.done {
  font-size: 19px;
  font-weight: 700;
  color: var(--tint);
}
.center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px 12vh;
}
.bigbc {
  width: 86%;
}
.bigbc.twod {
  width: min(70%, 320px);
}
.bigbc :deep(canvas) {
  width: 100%;
  height: auto;
}
.num {
  margin: 20px 0 0;
  font-family: var(--mono);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--ink);
}
.hint {
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 16px;
  text-align: center;
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
