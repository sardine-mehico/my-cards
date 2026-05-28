<script setup lang="ts">
import { useApp } from '~/stores/app'
import { newCard } from '~/utils/cards'
import type { Card } from '~/types/card'

const app = useApp()
const router = useRouter()
const { show } = useToast()

const draft = newCard()

async function save(card: Card) {
  await app.saveCard(card)
  show('Card saved')
  router.replace(`/card/${card.id}`)
}
</script>

<template>
  <CardEditor
    :initial="draft"
    mode="new"
    @save="save"
    @cancel="router.back()"
  />
</template>
