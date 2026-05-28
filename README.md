# My Cards

A **local-first loyalty-card PWA**. Store your loyalty/membership cards on your
phone, show a scannable barcode for each, and install it to your home screen —
no app store, no account, no backend.

- **Local-only.** Everything lives in your browser's IndexedDB (via Dexie). No
  server, no database, no network calls. Works fully offline after first load.
- **PIN gate.** A 4-digit PIN locks the UI. It is **not** encryption — it's a
  convenience gate, stored in plaintext. There is intentionally **no "forgot
  PIN" / reset** flow.
- **Backup is yours.** Export produces a plain JSON file you hand to your OS
  share sheet (Drive, Files, email…). The app never talks to any cloud API.

## Tech stack

- Nuxt 3 + Vue 3 (`<script setup>`, TypeScript), SPA (`ssr: false`)
- Pinia (lock state + cards in memory)
- Dexie.js (IndexedDB persistence)
- @vite-pwa/nuxt (installable manifest + offline service worker)
- bwip-js (barcode rendering — 1D, PDF417, QR, Aztec)
- @zxing/browser (camera barcode scanning)

## Features

- **PIN lock** — first run sets a PIN (set → confirm); every relaunch/reload
  requires it. Re-locks after **>15s in the background** or **2 min idle**
  (tunable constants in `stores/app.ts`).
- **Card list** — alphabetical, live search by name **or** number, rectangular
  thumbnails (front photo, monogram fallback).
- **Card detail** — rendered barcode, tap to enlarge fullscreen (with Screen
  Wake Lock), copy number, front/back photos with a fullscreen viewer.
- **Add / Edit** — manual entry, format dropdown, tile colour, front/back camera
  capture, and **scan a barcode** to auto-fill number + format. Delete in edit.
- **Import / Export** — Web Share with a JSON file (download fallback on
  desktop); import merges and dedupes by name + number.

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

> The PIN, cards, and photos persist in your browser's IndexedDB. Clearing site
> data resets everything — including the PIN (the only "reset" path that exists).

## Build (static)

```bash
npm run generate     # static output in .output/public
npx serve .output/public   # preview locally
```

## Deploy — Cloudflare Pages

Connect this repo in the Cloudflare Pages dashboard and set:

- **Build command:** `npm run generate`
- **Build output directory:** `.output/public`

It serves at a root `https://<project>.pages.dev` URL over HTTPS, which is a
secure context — required for the service worker, install-to-home-screen, camera
and clipboard to work.

## Deploy — private, via Tailscale

For private access you can serve the static output on your tailnet:

```bash
npx serve .output/public -l 8080
tailscale serve 8080
```

You **must** reach it over the `https://<machine>.<tailnet>.ts.net` MagicDNS
name (a secure context). A raw `100.x.y.z` IP is **not** a secure origin, so the
service worker, PWA install, and camera will not work there.

## Notes

- The backup file is plaintext JSON by design — easy to read, restore, and move
  between devices.
- **PWA icons** live in `public/icons/`. The app/home-screen glyph is cherry
  `#D2042D`. (Icon glyph: a Noun Project icon by Adrien Coquet — keep a credit
  line or assume a Pro licence; not blocking for the build.)

## Security model (read this)

This app deliberately has **no encryption, no biometrics, no account recovery**.
The PIN only hides the UI; anyone with developer access to the device's browser
storage can read the cards. That's an acceptable trade-off for loyalty cards —
do not store anything sensitive (no real payment cards, passwords, etc.).
