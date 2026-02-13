# UI ↔ Plugin Messaging

## Official Docs
- Messaging overview: https://www.figma.com/plugin-docs/how-plugins-run/

## Key concepts
- UI uses `parent.postMessage({ pluginMessage: {...} }, '*')`
- Plugin uses `figma.ui.onmessage` to receive
- Plugin uses `figma.ui.postMessage(...)` to send back

## In this project
- UI: [ui.html](../ui.html)
- Plugin: [code.ts](../code.ts)
