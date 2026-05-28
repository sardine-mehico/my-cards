import type { Card, BarcodeFormat } from '~/types/card'
import { mergeCards } from '~/utils/db'
import { DEFAULT_COLOR } from '~/utils/cards'

const BACKUP_VERSION = 1
const VALID_FORMATS: BarcodeFormat[] = [
  'code128',
  'ean13',
  'upca',
  'code39',
  'itf14',
  'codabar',
  'pdf417',
  'qrcode',
  'azteccode',
]

interface BackupFile {
  app: 'my-cards'
  version: number
  exportedAt: number
  cards: Card[]
}

function filename(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `my-cards-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate(),
  )}.json`
}

// Export all cards (photos included as base64) to one JSON file. Prefer the
// OS share sheet (so the user can send it to Drive/Files/email); fall back to
// a plain download on desktop. The app itself never talks to any cloud API.
export async function exportCards(cards: Card[]): Promise<'shared' | 'downloaded'> {
  const payload: BackupFile = {
    app: 'my-cards',
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    cards,
  }
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const name = filename()
  const file = new File([blob], name, { type: 'application/json' })

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
  }
  if (
    nav.canShare &&
    nav.canShare({ files: [file] }) &&
    typeof nav.share === 'function'
  ) {
    try {
      await nav.share({ files: [file], title: 'My Cards backup' })
      return 'shared'
    } catch (e: any) {
      // User cancelled the share sheet — don't fall through to a download.
      if (e?.name === 'AbortError') throw e
      // Otherwise fall back to download.
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return 'downloaded'
}

// Parse + validate a backup file, then merge (dedupe by name+number).
export async function importCardsFromFile(
  file: File,
): Promise<{ added: number; skipped: number }> {
  const text = await file.text()
  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('That file isn’t valid JSON.')
  }
  const rawCards = Array.isArray(data) ? data : data?.cards
  if (!Array.isArray(rawCards)) {
    throw new Error('No cards found in that file.')
  }

  const now = Date.now()
  const cards: Card[] = []
  for (const r of rawCards) {
    if (!r || typeof r.name !== 'string' || typeof r.number !== 'string')
      continue
    const format: BarcodeFormat = VALID_FORMATS.includes(r.format)
      ? r.format
      : 'code128'
    cards.push({
      id:
        typeof r.id === 'string' && r.id
          ? r.id
          : crypto.randomUUID(),
      name: r.name,
      number: r.number,
      format,
      color: typeof r.color === 'string' ? r.color : DEFAULT_COLOR,
      front: typeof r.front === 'string' ? r.front : null,
      back: typeof r.back === 'string' ? r.back : null,
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : now,
      updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : now,
    })
  }
  if (!cards.length) throw new Error('No valid cards found in that file.')
  return mergeCards(cards)
}
