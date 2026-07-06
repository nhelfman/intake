# Intake — Offline-First Nutrition Tracker

A fully client-side, offline-first PWA for personal nutrition tracking.

## Features

- 🏠 **Today view** — daily calorie & protein progress with entry list
- ⚡ **Quick Picks** — smart food suggestions based on frequency, recency & time of day
- 🍽️ **Food library** — create, edit, and favorite foods
- 📅 **Daily history** — browse previous days
- ⚙️ **Settings** — set daily calorie/protein goals
- 📤 **Export/Import** — full JSON backup & restore
- 📱 **PWA** — installable, offline-capable

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Dexie.js (IndexedDB)
- vite-plugin-pwa
- GitHub Pages deployment

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

Automatically deployed to GitHub Pages via GitHub Actions on push to `main`.

Live at: https://nhelfman.github.io/intake/
