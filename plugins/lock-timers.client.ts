import {
  useApp,
  BACKGROUND_GRACE_MS,
  IDLE_TIMEOUT_MS,
} from '~/stores/app'

// Installs the re-lock triggers once, app-wide:
//   • >15s in the background  → lock on return
//   • 2 min of no interaction → lock
// (Launch/reload starts locked because the store defaults to unlocked:false.)
export default defineNuxtPlugin((nuxtApp) => {
  const app = useApp()
  const router = useRouter()

  let hiddenAt = 0
  let idleTimer: ReturnType<typeof setTimeout> | null = null

  function lockNow() {
    if (!app.unlocked) return
    app.lock()
    router.replace('/lock')
  }

  function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer)
    if (!app.unlocked) return
    idleTimer = setTimeout(lockNow, IDLE_TIMEOUT_MS)
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now()
    } else {
      if (hiddenAt && Date.now() - hiddenAt > BACKGROUND_GRACE_MS) {
        lockNow()
      }
      hiddenAt = 0
      resetIdle()
    }
  }

  const activity = ['pointerdown', 'keydown', 'touchstart', 'mousemove']

  nuxtApp.hook('app:mounted', () => {
    document.addEventListener('visibilitychange', onVisibility)
    activity.forEach((e) =>
      window.addEventListener(e, resetIdle, { passive: true }),
    )
    resetIdle()
  })
})
