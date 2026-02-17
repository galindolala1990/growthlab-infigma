## Growthlab Builder Figma Plugin


This plugin helps you quickly create clean, Growth Labs–style experiment flows in Figma.

**Font:** This plugin uses the [Figtree](https://fonts.google.com/specimen/Figtree) font for all UI and generated nodes. Make sure Figtree is available in your Figma environment for best results.

### Features

#### Core Experiment Documentation
- Experiment name, description, hypothesis, status, timeline, audience, sample size, and owner
- Status tracking: Draft, Planned, Running, Paused, Concluded
- Advanced settings (collapsible) for detailed metadata

#### Goals & Metrics
- Multiple metrics with primary designation
- Direction and threshold targets per metric
- Drag-and-drop reordering

#### Journey Mapping
- Entry/exit nodes and touchpoint steps
- Experiment-step designation for variants
- Auto layout and connected flow spine

#### Variants
- Unlimited variants (A/B, A/B/C, multivariate)
- Control and winner badges
- Traffic splits and color badges
- Drag-and-drop ordering
- Create from selection (use up to 3 selected frames as thumbnails)

#### Resources & Links
- Smart link detection with service icons (Figma, Jira, Miro, Notion, Asana, Linear, GitHub, Slack, Trello, Confluence, Monday, ClickUp)
- Multiple links per experiment

#### UX & Design
- Modern compact UI with Figtree font
- Auto Layout for all generated frames
- Refresh to update existing flows

### Usage
1. Open your Figma file and run the plugin
2. Fill in the experiment name and status
3. Add goals/metrics and set the primary metric
4. Define journey touchpoints and mark the experiment step
5. Configure variants and traffic splits
6. Click **Create flow** to generate the diagram

**Optional workflows**
- Select **Concluded** and choose the rolled-out variant to show the winner
- Add resource links (Figma, Jira, Miro, Notion, etc.)
- Use **Refresh** to update an existing flow without recreating
- Select up to 3 frames and use **Create from selection** for visual variants

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

### Project Maintenance
**Feb 2026 - Code Cleanup & Optimization:**
- ✅ Removed ~1.1 MB of build artifacts from root directory (source maps, compiled JS)
- ✅ Archived 13 historical process documents to `_archive/` folder for cleaner root
- ✅ Removed 52+ debug console.log/warn/error statements throughout codebase
- ✅ Removed QA debug panel from UI (visual debugging helper)
- ✅ Deleted unused `scripts/` and `assets/` folders
- ✅ Reorganized TypeScript imports (all imports now at top of files)
- ✅ Improved type safety (eliminated `any` types, added proper interfaces)
- ✅ Updated `.gitignore` to prevent build artifacts from being tracked
- **Result:** Cleaner codebase, better maintainability, zero TypeScript errors

### Docs
**For users**
- [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)
- [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
- [docs/FAQ.md](docs/FAQ.md)
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

**For developers**
- [docs/FIGMA_PLUGIN_API.md](docs/FIGMA_PLUGIN_API.md)
- [docs/PLUGIN_MESSAGING.md](docs/PLUGIN_MESSAGING.md)
- [docs/PLUGIN_MANIFEST.md](docs/PLUGIN_MANIFEST.md)
- [docs/PLUGIN_UX_GUIDELINES.md](docs/PLUGIN_UX_GUIDELINES.md)
- [docs/RELEASE_CHECKLIST.md](docs/RELEASE_CHECKLIST.md)
