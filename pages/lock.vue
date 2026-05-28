<script setup lang="ts">
import { useApp } from '~/stores/app'

const app = useApp()
const router = useRouter()

// Steps: 'set' → 'confirm' (first run), or 'enter' (returning).
type Step = 'set' | 'confirm' | 'enter'
const step = ref<Step>('enter')
const firstPin = ref('')
const shakeKey = ref(0)
const resetKey = ref(0)

onMounted(async () => {
  if (!app.ready) await app.init()
  step.value = app.pinIsSet ? 'enter' : 'set'
})

const title = computed(() => {
  if (step.value === 'set') return 'Set your PIN'
  if (step.value === 'confirm') return 'Confirm your PIN'
  return 'Enter PIN'
})
const subtitle = computed(() => {
  if (step.value === 'set') return 'Create a 4-digit PIN to protect your cards'
  if (step.value === 'confirm') return 'Re-enter your PIN to confirm'
  return 'Enter your 4-digit PIN'
})

async function onComplete(pin: string) {
  if (step.value === 'set') {
    firstPin.value = pin
    step.value = 'confirm'
    resetKey.value++ // clear the dots for re-entry
    return
  }
  if (step.value === 'confirm') {
    if (pin === firstPin.value) {
      await app.createPin(pin)
      finishUnlock()
    } else {
      // Mismatch → shake and start over.
      firstPin.value = ''
      step.value = 'set'
      shakeKey.value++
    }
    return
  }
  // 'enter'
  if (await app.checkPin(pin)) {
    finishUnlock()
  } else {
    shakeKey.value++
  }
}

async function finishUnlock() {
  app.unlock()
  await app.loadCards()
  router.replace('/')
}

definePageMeta({ layout: false })
</script>

<template>
  <PinPad
    :title="title"
    :subtitle="subtitle"
    :shake-key="shakeKey"
    :reset-key="resetKey"
    @complete="onComplete"
  />
</template>
