import { useApp } from '~/stores/app'

// The whole app is unreachable until the PIN is entered. On launch/reload the
// store starts locked, so the very first navigation always lands on /lock.
export default defineNuxtRouteMiddleware(async (to) => {
  // Runs client-side only (ssr: false); guard for safety during prerender.
  if (import.meta.server) return

  const app = useApp()
  if (!app.ready) await app.init()

  if (to.path === '/lock') {
    // Already unlocked? No reason to sit on the lock screen.
    if (app.unlocked) return navigateTo('/')
    return
  }

  if (!app.unlocked) {
    return navigateTo('/lock')
  }
})
