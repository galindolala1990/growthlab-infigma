## Growthlab Flow Builder Figma Plugin


This plugin helps you quickly create clean, Growth Labs–style experiment flows in Figma.

**Font:** This plugin uses the [Figtree](https://fonts.google.com/specimen/Figtree) font for all UI and generated nodes. Make sure Figtree is available in your Figma environment for best results.

### Features
- Build experiment flows with entry/exit nodes, variant cards, traffic splits, winner badges, and metrics chips
- Modern, compact UI for easy experiment setup
- Auto Layout for all frames and cards for easy resizing and alignment
- Supports using selected frames as variant thumbnails ("Create from selection")

### Usage
1. Open your Figma file and run the plugin
2. Fill in the experiment name, round number, entry/exit labels, and edit the variants as needed
3. Click "Create flow" to generate the experiment flow diagram on the canvas
4. Optionally, select up to 3 frames and click "Create from selection" to use them as variant thumbnails

### Development
This plugin uses TypeScript and NPM for development.

#### Setup
1. Install Node.js (includes NPM): https://nodejs.org/en/download/
2. Install dependencies:
   npm install
3. To build once:
   npm run build
4. To watch and auto-build on save:
   npm run watch

#### Linting
Run lint checks with:
   npm run lint
Auto-fix lint issues with:
   npm run lint:fix

#### More info
For Figma plugin API docs, see: https://www.figma.com/plugin-docs/
For TypeScript info: https://www.typescriptlang.org/
