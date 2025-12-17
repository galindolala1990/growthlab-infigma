# Copilot Instructions for Growthlab Flow Builder

## Project Overview
- **Purpose:** Figma plugin to visually build and manage experiment flows (entry/exit nodes, variants, metrics, integrations).
- **UI:** Modern React (TSX) UI in `ui.tsx` and `components/` (bundled to `build/ui.js`), styled with `ui.css` and `design-tokens.css`.
- **Plugin Logic:** Main Figma plugin logic in `code.ts` (bundled to `build/code.js`). Handles Figma API, node creation, and communication with UI.

## Architecture & Data Flow
- **UI ↔ Plugin Communication:**
  - Uses `figma.showUI` and `figma.ui.onmessage` for message passing between UI and plugin logic.
  - UI form submits experiment data; plugin script generates Figma nodes accordingly.
- **Component Structure:**
  - All UI logic/components in `ui.tsx` and `components/` (e.g., `VariantCard`, `FlowSetup`).
  - Data types (e.g., `Variant`) are shared between UI and plugin logic.
- **Design Tokens:**
  - Centralized in `design-tokens.css` for consistent styling.
- **Font:**
  - Uses [Figtree](https://fonts.google.com/specimen/Figtree) for all UI and generated nodes. Ensure it's available in Figma.

## Developer Workflows
- **Install dependencies:** `npm install`
- **Build plugin:** `npm run build` (bundles TS/TSX to `build/`)
- **Watch mode:** `npm run watch` (auto-rebuild on save)
- **Lint:** `npm run lint` / `npm run lint:fix`
- **Test:** (if present) `npm test` (see `setupTests.ts` and `*.test.tsx`)

## Conventions & Patterns
- **TypeScript everywhere:** All logic and UI in TS/TSX.
- **React for UI:** Use functional components, hooks, and colocate styles with components when possible.
- **Figma API:** All Figma node creation/manipulation in `code.ts`.
- **UI/Plugin contract:** Message types and payloads must be kept in sync between UI and plugin logic.
- **No direct DOM manipulation:** All UI changes via React state.
- **Auto Layout:** All generated Figma frames/cards use Auto Layout for flexibility.

## Integration Points
- **External links:** UI supports Figma, Jira, and Miro links for experiment context.
- **No backend:** All logic runs client-side in Figma and browser context.

## Key Files
- `code.ts` — Figma plugin entry, node creation, message handling
- `ui.tsx` — Main UI entry, React root
- `components/` — UI components (cards, forms, sections)
- `esbuild.config.js` — Build config for bundling plugin and UI
- `design-tokens.css` — Design tokens for consistent styling
- `setupTests.ts` — Test setup (if tests are present)

## Example: UI to Plugin Message
```ts
// In ui.tsx
figma.ui.postMessage({ type: 'create-flow', payload: { experimentName, variants, ... } });

// In code.ts
figma.ui.onmessage = (msg) => {
  if (msg.type === 'create-flow') {
    // handle payload
  }
};
```

## References
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [TypeScript](https://www.typescriptlang.org/)

---
_Keep instructions concise and up-to-date. Update this file if project structure or workflows change._
