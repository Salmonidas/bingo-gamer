# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-06-01

### Added
- Fully local-first card configuration and settings via IndexedDB.
- Offline template sharing using GZIP prefix-dictionary compression to pack 20x20 grids into short, shareable import URLs.
- Local template import page to decode, instantiate, and redirect to private offline card clones.
- Inline cell editing and simplified card creation flow.
- Grid size up to 20x20 and central free space option.
- Individual cell background image customization (drag & drop, Base64 clipboard pasting).
- Client-side caching for copyright protection of images.
- Bulk reset with confirmations, Win Confetti animation, and PNG card export.
- Full UI localization for 8 languages.

### Removed
- PostgreSQL backend and `@vercel/postgres` dependency.
- Community sharing feature (moved fully to private URL sharing).
