<script setup lang="ts">
import type { Card } from '~/types/card'
import { initials } from '~/utils/cards'

// Rectangular, card-shaped thumbnail. Front photo if present, else a solid
// colour tile with the name's initials.
const props = withDefaults(
  defineProps<{
    card: Pick<Card, 'name' | 'color' | 'front'>
    width?: number
    height?: number
    radius?: number
    fontSize?: number
  }>(),
  { width: 76, height: 48, radius: 8, fontSize: 16 },
)

const style = computed(() => ({
  width: props.width + 'px',
  height: props.height + 'px',
  borderRadius: props.radius + 'px',
  background: props.card.front ? '#000' : props.card.color,
}))
</script>

<template>
  <div class="thumb" :style="style">
    <img v-if="card.front" :src="card.front" :alt="card.name" />
    <span v-else class="mono" :style="{ fontSize: fontSize + 'px' }">
      {{ initials(card.name) }}
    </span>
  </div>
</template>

<style scoped>
.thumb {
  flex: none;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.mono {
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.02em;
}
</style>
