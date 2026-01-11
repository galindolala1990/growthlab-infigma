# Experiment Flow Plugin Update Summary (Jan 2026)

## Major Updates & Fixes

1. **Horizontal Event Spine**
   - The main experiment flow (event spine) now uses a horizontal auto layout, with event groups arranged side by side.

2. **Equal Spacing & Alignment**
   - All event nodes are spaced equally and aligned on a shared Y axis for a clear, readable map.

3. **Variants as Vertical Branches**
   - Variants for each event are rendered as vertical branches below their parent event node.

4. **Merge Lines**
   - Merge connectors are drawn from each variant back to the next event, visually rejoining the main flow.

5. **Entry Notes Anchoring**
   - Entry notes are now anchored near their target event or connector, using the v2 schema's `attachTo` property for precise placement.

6. **Exit Node Placement**
   - The exit node is always placed at the end of the event spine, with only a single incoming connection (from the last event or merge).

7. **Connector & Arrowhead Styling**
   - Connectors and arrowheads are visually distinct by type (primary, branch, merge), with color, weight, and drop shadow for clarity.

8. **Connector Rendering Reliability**
   - Connectors and arrowheads are now rendered after all nodes are appended and positioned, using absolute positions to ensure correct placement.

9. **Info Card & Flow Frame Positioning**
   - The experiment info card and flow frame are explicitly positioned to avoid overlap, with fixed x/y coordinates for reliable side-by-side layout.

10. **Defensive Layout Handling**
    - Minimum widths are enforced for both info card and flow frame to guarantee separation, regardless of content or auto layout.

## Outstanding Issues
- Some Figma auto layout quirks may still affect absolute positioning in rare cases.
- Further refinement may be needed for dynamic resizing or more complex flows.

---

_This note summarizes all incremental updates, bug fixes, and layout improvements made during the January 2026 session for the Growthlab experiment flow plugin._
