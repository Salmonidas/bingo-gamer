# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Added
- Google Search Console HTML meta tag verification in root layout for organic search tracking.
- Premium transparent flat gaming favicon (128x128px) matching the Ethereal Gamer Dark design system.

### Fixed
- Replaced forced 100vh constraints on page containers with a Flexbox spacer in the root layout, correctly anchoring the footer to the bottom of the viewport without unnecessary scrolling.

### Added
- Implemented automated GitHub Release workflow that parses bilingual changelogs upon pushing semantic tags.

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
