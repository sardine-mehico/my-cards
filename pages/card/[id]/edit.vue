<script setup lang="ts">
import { useApp } from '~/stores/app'
import type { Card } from '~/types/card'

const app = useApp()
const route = useRoute()
const router = useRouter()
const { show } = useToast()

const id = computed(() => route.params.id as string)

onMounted(async () => {
  if (!app.cards.length) await app.loadCards()
  if (!app.cardById(id.value)) router.replace('/')
})

const existing = computed(() => app.cardById(id.value))

async function save(card: Card) {
  await app.saveCard(card)
  show('Changes saved')
  router.replace(`/card/${card.id}`)
}

async function remove() {
  if (!confirm('Delete this card? This cannot be undone.')) return
  await app.removeCard(id.value)
  show('Card deleted')
  router.replace('/')
}
</script>

<template>
  <CardEditor
    v-if="existing"
    :initial="existing"
    mode="edit"
    @save="save"
    @delete="remove"
    @cancel="router.back()"
  />
</template>
