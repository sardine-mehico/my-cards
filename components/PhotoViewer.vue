<script setup lang="ts">
// Fullscreen image viewer for a card photo.
defineProps<{ src: string | null }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="src" class="viewer" @click="emit('close')">
        <div class="bar">
          <button class="nav-btn done" @click.stop="emit('close')">Done</button>
        </div>
        <div class="img-wrap">
          <img :src="src" alt="Card photo" @click.stop />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.viewer {
  position: fixed;
  inset: 0;
  z-index: 950;
  background: #000;
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
  color: #fff;
  font-size: 19px;
  font-weight: 700;
}
.img-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px 12px;
}
.img-wrap img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
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
