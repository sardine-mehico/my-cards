<script setup lang="ts">
// iOS-style nav bar: optional left action, centred title, optional right action.
defineProps<{ title?: string }>()
</script>

<template>
  <header class="nav">
    <div class="side left"><slot name="left" /></div>
    <div class="title">
      <slot name="title">{{ title }}</slot>
    </div>
    <div class="side right"><slot name="right" /></div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  padding-top: calc(8px + var(--safe-top));
  min-height: 44px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--hair);
}
.side {
  display: flex;
  align-items: center;
}
.left {
  justify-content: flex-start;
}
.right {
  justify-content: flex-end;
}
.title {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60vw;
}
</style>
