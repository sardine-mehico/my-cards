// Keep the screen awake (and bright-ish) while a barcode is shown fullscreen.
// Wrapped in try/catch — the API is best-effort and unsupported on some browsers.
export function useWakeLock() {
  let sentinel: WakeLockSentinel | null = null

  async function request() {
    try {
      if ('wakeLock' in navigator) {
        sentinel = await (navigator as any).wakeLock.request('screen')
      }
    } catch {
      // Ignore — not critical. The user can still scan.
    }
  }

  async function release() {
    try {
      await sentinel?.release()
    } catch {
      /* ignore */
    } finally {
      sentinel = null
    }
  }

  return { request, release }
}
