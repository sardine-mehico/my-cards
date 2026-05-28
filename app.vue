<script setup lang="ts">
const { state: toast } = useToast()
</script>

<template>
  <div class="app-shell">
    <NuxtPage />

    <!-- Global toast -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" role="status">
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(32px + var(--safe-bottom));
  transform: translateX(-50%);
  background: rgba(28, 28, 30, 0.94);
  color: #fff;
  padding: 11px 18px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  z-index: 1000;
  max-width: calc(var(--maxw) - 48px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
