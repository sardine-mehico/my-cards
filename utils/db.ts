import Dexie, { type Table } from 'dexie'
import type { Card, AppMeta } from '~/types/card'

// Local-only persistence. No backend, no sync — everything lives in IndexedDB.
class MyCardsDB extends Dexie {
  cards!: Table<Card, string>
  meta!: Table<AppMeta, string>

  constructor() {
    super('my-cards')
    this.version(1).stores({
      // Index by name for alphabetical reads; id is the primary key.
      cards: 'id, name',
      meta: 'key',
    })
  }
}

// Guard against SSR/prerender where IndexedDB doesn't exist.
let _db: MyCardsDB | null = null
export function db(): MyCardsDB {
  if (!_db) _db = new MyCardsDB()
  return _db
}

// ── Cards ────────────────────────────────────────────────────────────────
function byName(a: Card, b: Card) {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
}

export async function getAllCards(): Promise<Card[]> {
  const all = await db().cards.toArray()
  return all.sort(byName)
}

export async function getCard(id: string): Promise<Card | undefined> {
  return db().cards.get(id)
}

export async function putCard(card: Card): Promise<void> {
  await db().cards.put(card)
}

export async function deleteCard(id: string): Promise<void> {
  await db().cards.delete(id)
}

// Merge an incoming list, deduping by name+number (idempotent import).
export async function mergeCards(
  incoming: Card[],
): Promise<{ added: number; skipped: number }> {
  const existing = await db().cards.toArray()
  const seen = new Set(existing.map((c) => dedupeKey(c.name, c.number)))
  let added = 0
  let skipped = 0
  const toAdd: Card[] = []
  for (const c of incoming) {
    const key = dedupeKey(c.name, c.number)
    if (seen.has(key)) {
      skipped++
      continue
    }
    seen.add(key)
    toAdd.push(c)
    added++
  }
  if (toAdd.length) await db().cards.bulkPut(toAdd)
  return { added, skipped }
}

function dedupeKey(name: string, number: string): string {
  return `${name.trim().toLowerCase()}|${number.trim()}`
}

// ── PIN meta ───────────────────────────────────────────────────────────────
export async function getPin(): Promise<string | null> {
  const row = await db().meta.get('pin')
  return row?.value ?? null
}

export async function setPin(value: string): Promise<void> {
  await db().meta.put({ key: 'pin', value })
}
