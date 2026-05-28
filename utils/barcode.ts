import type { BarcodeFormat } from '~/types/card'

// Human labels for the format dropdown → bwip-js `bcid` values (which are
// identical to our BarcodeFormat strings, chosen deliberately).
export interface FormatOption {
  value: BarcodeFormat
  label: string
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { value: 'code128', label: 'Code 128 (most common)' },
  { value: 'ean13', label: 'EAN-13' },
  { value: 'upca', label: 'UPC-A' },
  { value: 'code39', label: 'Code 39' },
  { value: 'itf14', label: 'ITF-14' },
  { value: 'codabar', label: 'Codabar' },
  { value: 'pdf417', label: 'PDF417' },
  { value: 'qrcode', label: 'QR Code' },
  { value: 'azteccode', label: 'Aztec' },
]

export function formatLabel(format: BarcodeFormat): string {
  return FORMAT_OPTIONS.find((o) => o.value === format)?.label ?? format
}

const TWO_D: BarcodeFormat[] = ['pdf417', 'qrcode', 'azteccode']
export function is2D(format: BarcodeFormat): boolean {
  return TWO_D.includes(format)
}

// Render a barcode to a canvas using bwip-js. Returns true on success.
// Wrapped by the caller in try/catch — invalid value/format throws here.
export async function renderBarcode(
  canvas: HTMLCanvasElement,
  format: BarcodeFormat,
  text: string,
): Promise<void> {
  // Use the explicit browser entry — it draws straight to a canvas element.
  const bwipjs = (await import('bwip-js/browser')).default as any
  bwipjs.toCanvas(canvas, {
    bcid: format,
    text,
    scale: 3,
    includetext: false, // we show the number separately
    paddingwidth: 10,
    paddingheight: is2D(format) ? 10 : 6,
    backgroundcolor: 'FFFFFF',
  })
}

// Map ZXing's BarcodeFormat enum names → our BarcodeFormat.
// (ZXing returns names like "CODE_128", "QR_CODE", "PDF_417", "EAN_13"…)
export function zxingToFormat(zxingName: string): BarcodeFormat {
  const map: Record<string, BarcodeFormat> = {
    CODE_128: 'code128',
    CODE_39: 'code39',
    EAN_13: 'ean13',
    UPC_A: 'upca',
    ITF: 'itf14',
    CODABAR: 'codabar',
    PDF_417: 'pdf417',
    QR_CODE: 'qrcode',
    AZTEC: 'azteccode',
  }
  return map[zxingName] ?? 'code128'
}
