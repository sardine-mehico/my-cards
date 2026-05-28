import { defineStore } from 'pinia'
import type { Card } from '~/types/card'
import {
  getAllCards,
  getPin,
  setPin as dbSetPin,
  putCard,
  deleteCard as dbDeleteCard,
} from '~/utils/db'

// ── Tunable lock timings ───────────────────────────────────────────────────
export const BACKGROUND_GRACE_MS = 15_000 // re-lock if hidden longer than this
export const IDLE_TIMEOUT_MS = 2 * 60_000 // re-lock after 2 min of no interaction

export const useApp = defineStore('app', {
  state: () => ({
    unlocked: false,
    pinIsSet: false,
    ready: false, // finished reading meta/cards at least once
    cards: [] as Card[],
  }),

  getters: {
    cardById:
      (state) =>
      (id: string): Card | undefined =>
        state.cards.find((c) => c.id === id),
  },

  actions: {
    async init() {
      const pin = await getPin()
      this.pinIsSet = !!pin
      this.ready = true
    },

    async loadCards() {
      this.cards = await getAllCards()
    },

    async checkPin(pin: string): Promise<boolean> {
      const stored = await getPin()
      return stored !== null && stored === pin
    },

    async createPin(pin: string) {
      await dbSetPin(pin)
      this.pinIsSet = true
    },

    unlock() {
      this.unlocked = true
    },

    lock() {
      this.unlocked = false
    },

    async saveCard(card: Card) {
      card.updatedAt = Date.now()
      await putCard(card)
      await this.loadCards()
    },

    async removeCard(id: string) {
      await dbDeleteCard(id)
      await this.loadCards()
    },
  },
})
