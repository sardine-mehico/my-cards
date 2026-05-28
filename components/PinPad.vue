<script setup lang="ts">
// Custom numeric keypad with 4 dot indicators. Auto-submits on the 4th digit.
// Parent drives title/subtitle and triggers a shake+clear by bumping `shakeKey`.
const props = defineProps<{
  title: string
  subtitle: string
  shakeKey?: number // bump to shake + clear (wrong PIN / mismatch)
  resetKey?: number // bump to clear silently (advancing a step)
}>()
const emit = defineEmits<{ complete: [pin: string] }>()

const value = ref('')
const shaking = ref(false)

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

function press(k: string) {
  if (k === '') return
  if (k === 'del') {
    value.value = value.value.slice(0, -1)
    return
  }
  if (value.value.length >= 4) return
  value.value += k
  if (value.value.length === 4) {
    const pin = value.value
    // Let the 4th dot paint before handing off.
    requestAnimationFrame(() => emit('complete', pin))
  }
}

// Parent bumps shakeKey on a mismatch / wrong PIN → shake and clear.
watch(
  () => props.shakeKey,
  () => {
    shaking.value = true
    setTimeout(() => {
      shaking.value = false
      value.value = ''
    }, 420)
  },
)

watch(
  () => props.resetKey,
  () => {
    value.value = ''
  },
)

function onKey(e: KeyboardEvent) {
  if (e.key >= '0' && e.key <= '9') press(e.key)
  else if (e.key === 'Backspace') press('del')
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="pin">
    <div class="logo">MC</div>
    <h1 class="title">{{ title }}</h1>
    <p class="subtitle">{{ subtitle }}</p>

    <div class="dots" :class="{ shake: shaking }">
      <span
        v-for="i in 4"
        :key="i"
        class="dot"
        :class="{ filled: value.length >= i }"
      />
    </div>

    <div class="spacer" />

    <div class="keypad">
      <button
        v-for="(k, i) in keys"
        :key="i"
        class="key"
        :class="{ ghost: k === '', del: k === 'del' }"
        :disabled="k === ''"
        @click="press(k)"
      >
        <span v-if="k === 'del'" class="del-icon" aria-label="Delete">⌫</span>
        <span v-else>{{ k }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.pin {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: calc(48px + var(--safe-top)) 24px calc(24px + var(--safe-bottom));
}
.logo {
  width: 88px;
  height: 88px;
  border-radius: 22px;
  background: var(--ink);
  color: #fff;
  font-size: 34px;
  font-weight: 800;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
}
.title {
  margin: 26px 0 0;
  font-size: 28px;
  font-weight: 700;
}
.subtitle {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 17px;
  text-align: center;
}
.dots {
  display: flex;
  gap: 26px;
  margin-top: 30px;
}
.dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--ink);
  transition: background 0.12s ease;
}
.dot.filled {
  background: var(--ink);
}
.spacer {
  flex: 1;
}
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px 24px;
  width: 100%;
  max-width: 340px;
}
.key {
  height: 76px;
  border-radius: 999px;
  background: var(--field);
  font-size: 32px;
  font-weight: 400;
  color: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
.key:active {
  background: var(--tap);
  filter: brightness(0.94);
}
.key.ghost {
  background: transparent;
  pointer-events: none;
}
.key.del {
  background: transparent;
  font-size: 26px;
}
.del-icon {
  color: var(--ink-2);
}
</style>
