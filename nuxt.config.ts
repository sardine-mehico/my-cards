// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false, // SPA / static — the app is local-first and runs entirely in the browser.

  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],

  app: {
    // Pushed/popped views slide in like a native stack.
    pageTransition: { name: 'slide', mode: 'out-in' },
    head: {
      title: 'My Cards',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content:
            'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1',
        },
        { name: 'theme-color', content: '#ffffff' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'My Cards' },
        {
          name: 'description',
          content:
            'Keep your loyalty and membership cards on your phone. Local-only, works offline.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/icon.svg' },
        { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon.png' },
      ],
    },
  },

  css: ['~/assets/css/tokens.css'],

  // Bundle the CommonJS build of bwip-js cleanly.
  vite: {
    optimizeDeps: {
      include: ['bwip-js/browser', '@zxing/browser', '@zxing/library'],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'My Cards',
      short_name: 'My Cards',
      description: 'Your loyalty cards, on your phone. Local-only and offline.',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icons/icon-maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      // Precache the app shell so it opens offline after first load.
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: false,
    },
  },

  typescript: {
    strict: true,
  },
})
