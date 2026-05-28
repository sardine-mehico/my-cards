export type BarcodeFormat =
  // 1D
  | 'code128'
  | 'ean13'
  | 'upca'
  | 'code39'
  | 'itf14'
  | 'codabar'
  // 2D
  | 'pdf417'
  | 'qrcode'
  | 'azteccode'

export interface Card {
  id: string // crypto.randomUUID()
  name: string // e.g. "Bakers Delight"
  number: string // value encoded in the barcode (store the scanned value)
  format: BarcodeFormat
  color: string // hex tile colour for the monogram fallback
  front: string | null // base64 data URL of front photo
  back: string | null // base64 data URL of back photo
  createdAt: number
  updatedAt: number
}

export interface AppMeta {
  key: 'pin'
  value: string // the 4-digit PIN, plaintext (UI gate only)
}
