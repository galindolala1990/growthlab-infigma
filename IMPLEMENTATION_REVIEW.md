# Implementation Plan Review

## Current Status

### ✅ Completed (Color Alignment)
1. **Updated `design-tokens.ts`** - Added all colors from `design-tokens.css`
2. **Fixed Entry/Exit Node Cards** - Replaced hardcoded colors with tokens
3. **Fixed Variant Checker Pattern** - Using token colors
4. **Fixed Sample Variant Colors** - Using design tokens
5. **Fixed Connector Colors** - Using design tokens for default, winner, and normal states

### 🔄 In Progress
- Entry notes and outcome frames still need color fixes
- Some connector functions may need additional updates

---

## Implementation Plan Overview

### Phase 1: Core Node Cards (HIGH PRIORITY) ⚠️
**Status:** Partially Complete

**What's Done:**
- ✅ Entry/Exit node cards use design tokens
- ✅ Event cards already use tokens (well implemented)
- ✅ Variant cards already use tokens (well implemented)

**What's Needed:**
- [ ] Add status badges to variant cards (winner/running indicators)
- [ ] Add traffic percentage display to variant cards
- [ ] Support variant-specific color accents on variant cards
- [ ] Enhance metrics display formatting
- [ ] Add note/description support to entry nodes

**Estimated Time:** 2-3 days

---

### Phase 2: Connector System (HIGH PRIORITY) ⚠️
**Status:** Partially Complete

**What's Done:**
- ✅ Basic connector colors use design tokens
- ✅ Winner/normal connector colors use tokens
- ✅ Default connector color uses tokens

**What's Needed:**
- [ ] Create unified `createConnectorV2()` function supporting all three types:
  - PRIMARY_FLOW_LINE (Entry → Events → Exit)
  - BRANCH_LINE (Event → Variants)
  - MERGE_LINE (Variants → Next Event)
- [ ] Implement type-specific styling:
  - PRIMARY: 4-7px, solid, royal blue (#2563eb)
  - BRANCH: 3-4px, solid, variant-specific or secondary blue
  - MERGE: 2-3px, dashed or solid, muted gray
- [ ] Add label support (traffic percentages on branch lines)
- [ ] Improve routing algorithm for complex branching
- [ ] Add connector refresh system
- [ ] Support curved/bezier paths (optional enhancement)

**Estimated Time:** 3-4 days

---

### Phase 3: Layout System (MEDIUM PRIORITY)
**Status:** Mostly Complete

**What's Done:**
- ✅ Horizontal flow frame layout
- ✅ Vertical event group structure
- ✅ Variants container layout

**What's Needed:**
- [ ] Optimize spacing configuration
- [ ] Support layout toggles (horizontal/vertical)
- [ ] Handle complex branching patterns (many variants)
- [ ] Support variant wrapping/scrolling for many variants
- [ ] Ensure consistent alignment across all flow configurations

**Estimated Time:** 2-3 days

---

### Phase 4: UI/UX Enhancements (MEDIUM PRIORITY)
**Status:** Not Started

**What's Needed:**
- [ ] Improve plugin UI styling (use design tokens)
- [ ] Add validation and error handling
- [ ] Implement drag-and-drop for event reordering
- [ ] Create preview panel component
- [ ] Add help/tooltips system
- [ ] Improve form layout and spacing
- [ ] Add loading states
- [ ] Add success/error notifications

**Estimated Time:** 4-5 days

---

### Phase 5: Advanced Features (LOW PRIORITY)
**Status:** Not Started

**What's Needed:**
- [ ] Save/load flow templates
- [ ] Export/import functionality (JSON, YAML)
- [ ] Undo/redo system
- [ ] Flow management (delete, duplicate)
- [ ] Advanced connector routing (bezier curves)
- [ ] Animation/transitions (optional)

**Estimated Time:** 5-7 days

---

## Key Decisions Needed

### 1. Connector Implementation Strategy
**Question:** Should we use Figma's native `ConnectorNode` or custom `VectorNode` paths?

**Current Approach:** Mix of both
- `createMagnetizedConnector()` uses native `ConnectorNode`
- `connectNodes()` uses custom `VectorNode` paths

**Recommendation:** 
- Use native `ConnectorNode` for PRIMARY_FLOW_LINE (better auto-update)
- Use custom `VectorNode` for BRANCH_LINE and MERGE_LINE (more control)

### 2. Variant Card Enhancements
**Question:** What information should be displayed on variant cards?

**Current:** Name, thumbnail, metrics (CTR, CR, SU)

**Proposed Additions:**
- Traffic percentage badge
- Status indicator (winner/running/none)
- Variant key badge (A, B, C)
- Variant-specific color accent border

### 3. Connector Labeling
**Question:** Should connector labels be always visible or on hover?

**Recommendation:** 
- Traffic percentages: Always visible on branch lines
- Metric labels: Optional, on hover or toggle
- Keep labels minimal to avoid clutter

### 4. Layout Flexibility
**Question:** Should we support both horizontal and vertical flow layouts?

**Current:** Horizontal only

**Recommendation:**
- Start with horizontal (current implementation)
- Add vertical option later if needed
- Make layout configurable in flow schema

---

## Recommended Implementation Order

### Week 1: Foundation
1. **Day 1-2:** Complete Phase 1 (Node Cards)
   - Add status badges
   - Add traffic display
   - Enhance metrics formatting

2. **Day 3-5:** Complete Phase 2 (Connector System)
   - Create unified connector function
   - Implement all three connector types
   - Add label support
   - Test connector rendering

### Week 2: Polish
3. **Day 1-2:** Complete Phase 3 (Layout System)
   - Optimize spacing
   - Handle edge cases
   - Test various configurations

4. **Day 3-5:** Start Phase 4 (UI/UX)
   - Improve UI styling
   - Add validation
   - Create preview panel

### Week 3: Advanced (Optional)
5. **Day 1-5:** Phase 5 (Advanced Features)
   - Save/load templates
   - Export/import
   - Undo/redo

---

## Technical Considerations

### Design Token Alignment ✅
- All colors now reference `design-tokens.ts`
- Consistent with `design-tokens.css`
- Easy to maintain and update

### Performance
- Current implementation handles 5-10 events well
- May need optimization for 20+ events
- Consider virtualization for large flows

### Figma API Limitations
- Auto-layout can cause positioning quirks
- Absolute positioning needed for connectors
- Some manual calculations required

### Testing Strategy
- Visual regression testing
- Test with various flow configurations
- Test edge cases (many variants, long names, etc.)

---

## Questions for Review

1. **Priority:** Which phase should we tackle first?
   - Option A: Complete Phase 1 & 2 (Cards + Connectors) - Recommended
   - Option B: Start with Phase 4 (UI/UX) for better user experience
   - Option C: Focus on Phase 3 (Layout) for stability

2. **Connector Style:** Do you prefer the current elbow connectors or should we explore curved/bezier paths?

3. **Variant Display:** Should variant cards show all metrics or allow collapsing/expanding?

4. **Layout Direction:** Is horizontal-only acceptable, or do we need vertical support?

5. **Entry Notes:** Should entry notes be always visible or collapsible?

---

## Next Steps

1. **Review this plan** and provide feedback
2. **Decide on priorities** (which phase to start)
3. **Clarify requirements** for any unclear items
4. **Begin implementation** based on agreed priorities

---

**Last Updated:** January 2026  
**Status:** Ready for Review
