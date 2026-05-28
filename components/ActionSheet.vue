<script setup lang="ts">
// iOS-style action sheet: dimmed backdrop + a card that slides up from the
// bottom, plus a separate Cancel button. Actions are provided via the default
// slot using <button class="sheet-item">.
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

watch(
  () => props.open,
  (o) => {
    if (import.meta.client) {
      document.body.style.overflow = o ? 'hidden' : ''
    }
  },
)
onBeforeUnmount(() => {
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="backdrop" @click="emit('close')">
        <div class="sheet-stack" @click.stop>
          <div class="group">
            <slot />
          </div>
          <button class="group cancel" @click="emit('close')">Cancel</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 900;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.sheet-stack {
  width: 100%;
  max-width: var(--maxw);
  margin: 0 auto;
  padding: 8px 8px calc(8px + var(--safe-bottom));
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.group {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  width: 100%;
}
.cancel {
  text-align: center;
  padding: 17px;
  font-size: 18px;
  font-weight: 600;
  color: var(--tint);
}
.cancel:active {
  background: var(--tap);
}

/* Style the slotted items (deep, since they live in the default slot). */
.group :deep(.sheet-item) {
  display: block;
  width: 100%;
  text-align: center;
  padding: 17px;
  font-size: 18px;
  color: var(--tint);
  font-weight: 600;
  background: #fff;
}
.group :deep(.sheet-item:active) {
  background: var(--tap);
}
.group :deep(.sheet-item + .sheet-item) {
  border-top: 1px solid var(--hair);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.25s ease;
}
.sheet-enter-active .sheet-stack,
.sheet-leave-active .sheet-stack {
  transition: transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet-stack,
.sheet-leave-to .sheet-stack {
  transform: translateY(100%);
}
</style>
