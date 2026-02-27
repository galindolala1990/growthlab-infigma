# AGENTS.md

## Cursor Cloud specific instructions

This is a **Figma plugin** (Growthlab Builder / pulpo). There is no backend, no database, and no Docker. The plugin runs exclusively inside Figma's sandbox.

### Services

| Service | How to run | Notes |
|---------|-----------|-------|
| Plugin build | `npm run build` | Bundles `code.ts` to `build/code.js` and copies static assets to `build/` |
| Watch mode | `npm run watch` | Auto-rebuilds on save (do not use in Cloud Agent — runs forever) |
| VitePress docs | `npm run docs:dev` | Requires a valid `docs/.vitepress/config.mts` (currently empty — will fail) |

### Key commands

See `package.json` scripts and the README for full details:
- **Lint:** `npm run lint` / `npm run lint:fix`
- **Type check:** `npm run build:tsc`
- **Build:** `npm run build`

### Caveats

- **No automated tests exist.** There is no test framework or test files in this codebase.
- **Lint has ~116 pre-existing errors** (unused vars, `any` types). These are known; do not attempt to fix them unless explicitly asked.
- **VitePress config is empty:** `docs/.vitepress/config.mts` is a 0-byte file. `npm run docs:dev` and `npm run docs:build` will fail until it is populated.
- **Plugin UI preview:** You can preview `ui.html` outside Figma by serving the `build/` directory (e.g. `python3 -m http.server 8080 --directory build`) and opening `http://localhost:8080/ui.html`. The UI renders and is interactive, but `Create flow` / `Refresh` actions require the Figma Plugin API and will not work outside Figma.
- **Fonts:** The plugin bundles Figtree as self-hosted WOFF2 files in `fonts/`.
