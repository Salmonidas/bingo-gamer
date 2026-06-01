# Bingo Gamer 🎮

[![es](https://img.shields.io/badge/lang-es-yellow.svg)](README.es.md)

Bingo Gamer is a fully local-first, offline-ready web application for creating, customizing, and playing digital Bingo cards. Specially designed for streamers and communities, it features grids up to 20x20, drag & drop image customization, and private URL-based offline sharing without needing any backend server.

## How It Works (Technical Implementation) ⚙️

Bingo Gamer is built around a **100% Local-First** architecture, meaning it relies entirely on the user's browser rather than a backend server.

- **Storage & State (IndexedDB):** All Bingo cards, custom images, logos, and user preferences are saved locally in the browser using IndexedDB (via the `idb` wrapper). This guarantees privacy, zero server costs, and instant load times.
- **Offline Sharing Engine:** To share complex Bingo cards (like a 20x20 grid with custom text) without a database, the app uses a **GZIP prefix-dictionary compression** algorithm. The board's data is serialized into JSON, compressed using the browser's native `CompressionStream` API, and encoded in Base64URL.
- **URL-Based Import:** The compressed payload is appended to the URL as a hash fragment (e.g., `bingo-gamer.com/en/import#payload`). When another user opens the link, the app locally decodes the payload, recreates the exact Bingo card, and saves it to their own IndexedDB instance as a private clone.
- **Image Handling:** Images are processed in the browser, stored as Base64/Blobs in IndexedDB, and injected into the cells. Drag & drop and clipboard paste events are heavily optimized.
- **Internationalization:** The UI supports 8 languages, automatically routed via Next.js Edge Middleware and translated using `next-intl`.

## Features ✨

- **100% Local & Private:** No servers, no databases. Your data stays on your machine.
- **Extreme Customization:** Grids up to 20x20, central free spaces, and individual cell background images.
- **Streamer Friendly:** Download cards as PNGs, add custom logos, and celebrate wins with confetti.
- **Multilingual Support:** English, Spanish, French, German, Italian, Portuguese, Japanese, and Catalan.

## Getting Started 🚀

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
