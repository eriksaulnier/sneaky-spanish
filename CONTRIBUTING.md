# Contributing to Sneaky Spanish

Thanks for your interest in contributing! Here's what you need to get started.

## Prerequisites

- [Node.js](https://nodejs.org/) 22+ (LTS)
- [pnpm](https://pnpm.io/) (see `packageManager` in `package.json` for the exact version)

## Setup

```bash
git clone https://github.com/eriksaulnier/sneaky-spanish-v2.git
cd sneaky-spanish-v2
pnpm install
pnpm dev
```

Then load the `dist/` directory as an unpacked extension:

- **Chrome**: `chrome://extensions` → Enable developer mode → Load unpacked → select `dist/`
- **Firefox**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select any file in `dist/`

The `dev` command watches for file changes and rebuilds automatically.

## Making Changes

### Commit conventions

This project uses [conventional commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `chore:` — maintenance (deps, build config, etc.)
- `docs:` — documentation changes

### Pull requests

- Keep PRs focused on a single change
- Describe what the PR does and why
- Make sure `pnpm build` passes before submitting

### Dictionary changes

The word dictionary is generated from source data. If you're modifying word entries:

```bash
pnpm generate-dict
```

This regenerates `src/data/dictionary.json`. Commit both the source changes and the regenerated file.

## Project Structure

See the [README](README.md#project-structure) for an overview of how the codebase is organized.
