<p align="center">
  <img src="icon-exploration/f2-chubby-green-polished.svg" width="128" height="128" alt="Sneaky Spanish icon — a chubby green chameleon viewed from above">
</p>

<h1 align="center">Sneaky Spanish</h1>

<p align="center">A browser extension that sneaks Spanish into your everyday browsing.</p>

---

Sneaky Spanish quietly swaps English words on any webpage with their Spanish equivalents while you browse. No flashcards, no scheduled study sessions, no app you have to remember to open — just Spanish words showing up naturally in the pages you're already reading.

Set your level (A1 through C2, aligned to [CEFR](https://en.wikipedia.org/wiki/Common_European_Framework_of_Reference_for_Languages)), and the extension adjusts how many words get replaced. Beginners see a handful per page. Advanced learners get a heavy dose. Click any translated word to see the original English and its IPA pronunciation.

Everything runs locally. The dictionary is bundled in the extension, no API calls, no data leaving your device.

## Features

- **CEFR-aligned difficulty** — A1 through C2, each level includes all words from levels below it
- **1,300+ word dictionary** — bundled locally, works offline
- **Multi-word phrases** — matches phrases up to 4 words (e.g., "take care of" → "cuidar de")
- **Tooltip on click** — shows original English word + IPA pronunciation
- **Highlight mode** — optional underline + tinted background on replaced words
- **Per-site exclusions** — turn it off for specific domains
- **Word tracking** — tracks which words you've encountered and how often
- **Cross-browser** — Chrome and Firefox (MV3)

## Install

### From source

```bash
git clone git@github.com:eriksaulnier/sneaky-spanish-v2.git
cd sneaky-spanish-v2
pnpm install
pnpm build          # Chrome/Chromium
pnpm build:firefox  # Firefox
```

Then load the `dist/` directory as an unpacked extension:

- **Chrome**: `chrome://extensions` → Enable developer mode → Load unpacked → select `dist/`
- **Firefox**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select any file in `dist/`

## Usage

1. Click the extension icon in your toolbar
2. Pick your CEFR level
3. Browse normally — Spanish words will start appearing on pages
4. Click any green word to see the original English and pronunciation
5. Toggle highlight mode if you want replaced words to stand out more
6. Exclude sites where you don't want replacements (like your bank)

## Development

```bash
pnpm dev              # Watch mode — rebuilds on file changes
pnpm build            # Production build (Chrome)
pnpm build:firefox    # Production build (Firefox)
pnpm generate-dict    # Regenerate dictionary from word data
pnpm generate-icon    # Regenerate icon PNGs from SVG
pnpm package          # Package with web-ext
```

### Project structure

```
src/
├── background/       Service worker (settings init)
├── content/          Content script (the word replacement engine)
│   ├── walker.ts     DOM traversal & word matching
│   ├── observer.ts   MutationObserver for dynamic content
│   ├── tooltip.ts    Hover tooltip (Shadow DOM)
│   └── restore.ts    Restore original text
├── popup/            Extension popup UI
├── options/          Options page (excluded sites)
├── shared/           Storage, types, constants
└── data/
    └── dictionary.json   Generated word dictionary
```

### Tech stack

- TypeScript, Vite, [vite-plugin-web-extension](https://github.com/nicedoc/vite-plugin-web-extension)
- Vanilla CSS (no framework)
- [Sharp](https://sharp.pixelplumbing.com/) for icon generation
- [web-ext](https://github.com/nicedoc/web-ext) for packaging

## Privacy

All data stays on your device. The dictionary is bundled in the extension. No network requests, no analytics, no tracking. Settings sync across your browser profile via `chrome.storage.sync`, but nothing goes to any third-party server.
