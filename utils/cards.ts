import type { Card } from '~/types/card'

// Tile-colour swatches shown in the editor (matches the screenshot palette).
export const TILE_COLORS: string[] = [
  '#E08A2A', // orange
  '#1c1c1e', // near-black
  '#E11D2E', // red
  '#D2042D', // cherry
  '#4AA8A0', // teal
  '#9B86A8', // mauve
  '#6E2B2B', // maroon
  '#6E7B5A', // sage
  '#1B7FA8', // blue
  '#8B3CF0', // purple
  '#2E7D32', // green
  '#3D4F58', // slate
]

export const DEFAULT_COLOR = TILE_COLORS[0]

// 1–2 uppercase initials from the card name for the monogram fallback.
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

// Filter helper for the live search: matches name OR number.
export function matchesQuery(card: Card, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  return (
    card.name.toLowerCase().includes(needle) ||
    card.number.toLowerCase().includes(needle)
  )
}

export function newCard(partial: Partial<Card> = {}): Card {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    name: '',
    number: '',
    format: 'code128',
    color: DEFAULT_COLOR,
    front: null,
    back: null,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}
