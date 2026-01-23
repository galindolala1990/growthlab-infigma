# Nodes Flow Implementation Plan

## Executive Summary

This document provides a comprehensive analysis and implementation plan for the GrowthLab experiment flow system, including nodes, connectors, cards, UI, and UX based on the existing codebase structure and design specifications.

---

## 1. Current Architecture Analysis

### 1.1 Node Types (V2 Schema)

The system currently supports four primary node types:

1. **Entry Node** (`ENTRY_NODE`)
   - Purpose: Starting point of the experiment flow
   - Structure: Simple card with label and optional note
   - Location: Leftmost position in horizontal flow

2. **Event Node** (`EVENT_NODE`)
   - Purpose: Represents a decision point or interaction in the flow
   - Structure: Event card with name, thumbnail, variant count
   - Can have variants as children
   - Location: Middle of flow spine (horizontal layout)

3. **Variant Node** (`VARIANT_NODE`)
   - Purpose: Represents a specific variant of an event
   - Structure: Variant card with key, name, metrics, traffic percentage
   - Location: Vertical branches below parent event node

4. **Exit Node** (`EXIT_NODE`)
   - Purpose: End point of the experiment flow
   - Structure: Simple card with label
   - Location: Rightmost position in horizontal flow

### 1.2 Connector Types

Three connector types are defined in the schema:

1. **PRIMARY_FLOW_LINE**
   - Connects: Entry → Events → Exit (main spine)
   - Style: Solid, thicker stroke (4-7px), primary color
   - Arrowhead: Yes, at end

2. **BRANCH_LINE**
   - Connects: Event → Variants (downward branches)
   - Style: Medium stroke (3-4px), variant-specific color
   - Arrowhead: Yes, at end

3. **MERGE_LINE**
   - Connects: Variants → Next Event (rejoining flow)
   - Style: Dashed or lighter stroke (2-3px), secondary color
   - Arrowhead: Yes, at end

### 1.3 Current Layout Structure

```text
[Experiment Overview Card]  [Entry] → [Event 1] → [Event 2] → [Exit]
                              ↓         ↓
                          [Var A]   [Var A]
                          [Var B]   [Var B]
                              ↓         ↓
                          [Merge]   [Merge]
```

**Layout Properties:**

- Main flow: Horizontal auto-layout
- Event groups: Vertical auto-layout
- Variants: Vertical stack within event group
- Spacing: Configurable (default: 160px event, 32px variant)

---

## 2. Implementation Plan

### 2.1 Node Cards Implementation

#### 2.1.1 Entry Node Card

**Current Implementation:** `createNodeCard()` function
**Enhancements Needed:**

```typescript
interface EntryNodeCard {
  // Visual Structure
  - Label text (bold, large)
  - Optional note/description (smaller, muted)
  - Background: White surface
  - Border: Light gray (1px)
  - Shadow: Subtle drop shadow
  - Corner radius: 16px
  
  // Layout
  - Padding: 16px all sides
  - Auto-sizing: Hug content
  - Min width: 200px
  - Min height: 80px
}
```

**Implementation Tasks:**

- [ ] Enhance `createNodeCard()` to support entry-specific styling
- [ ] Add note/description support
- [ ] Implement proper spacing and alignment
- [ ] Add metadata attachment for node identification

#### 2.1.2 Event Node Card

**Current Implementation:** `createEventCard()` in `experiment-node.ts`
**Status:** ✅ Well implemented
**Enhancements Needed:**

```typescript
interface EventNodeCard {
  // Visual Structure
  - "Event" label (small, bold)
  - Thumbnail/image (268x160px)
  - Event name (large, bold)
  - Variant count subtitle ("X variants")
  
  // Styling
  - Background: White surface
  - Border: Light gray (0px stroke, shadow instead)
  - Shadow: Drop shadow (0, 1px, 2px, rgba(0,0,0,0.05))
  - Corner radius: 16px
  
  // Layout
  - Fixed size: 300x280px
  - Vertical auto-layout
  - Item spacing: 12px
}
```

**Implementation Tasks:**

- [ ] Verify thumbnail placeholder pattern
- [ ] Ensure variant count updates dynamically
- [ ] Add hover states (if interactive)
- [ ] Support image selection from canvas

#### 2.1.3 Variant Node Card

**Current Implementation:** `createVariantCard()` in `experiment-node.ts`
**Status:** ✅ Well implemented
**Enhancements Needed:**

```typescript
interface VariantNodeCard {
  // Visual Structure
  - "Variant" label (small, bold)
  - Thumbnail/image (268x160px)
  - Variant name (large, bold)
  - Metrics subtitle (CTR, CR, SU)
  
  // Status Indicators (Future)
  - Winner badge (if status === 'winner')
  - Running indicator (if status === 'running')
  - Traffic percentage badge
  
  // Styling
  - Background: White surface
  - Border: Variant color accent (optional)
  - Shadow: Drop shadow
  - Corner radius: 16px
  
  // Layout
  - Auto-sizing: Hug content
  - Min size: 300x280px
  - Vertical auto-layout
}
```

**Implementation Tasks:**

- [ ] Add status badges (winner/running)
- [ ] Add traffic percentage display
- [ ] Support variant-specific color accents
- [ ] Enhance metrics display formatting

#### 2.1.4 Exit Node Card

**Current Implementation:** `createNodeCard()` function
**Enhancements Needed:**

```typescript
interface ExitNodeCard {
  // Visual Structure
  - Label text (bold, large)
  - Optional completion indicator
  - Background: White surface
  - Border: Light gray
  - Shadow: Subtle drop shadow
  
  // Layout
  - Similar to Entry Node
  - Min width: 200px
  - Min height: 80px
}
```

**Implementation Tasks:**

- [ ] Create dedicated exit node styling
- [ ] Add visual distinction from entry node
- [ ] Support outcome annotations

---

### 2.2 Connectors Implementation

#### 2.2.1 Connector Rendering System

**Current Implementation:** `connectNodes()` function
**Status:** ✅ Functional but needs enhancement

**Current Approach:**

- Uses VectorNode with custom path drawing
- Calculates edge-to-edge connection points
- Supports horizontal and vertical elbow connectors
- Creates separate arrowhead vector

**Enhancements Needed:**

```typescript
interface ConnectorSystem {
  // Connection Types
  1. PRIMARY_FLOW_LINE
     - Color: Primary blue (#2563eb or #2a4d7a)
     - Weight: 4-7px (thicker for emphasis)
     - Style: Solid
     - Arrowhead: Filled triangle
     - Shadow: Optional subtle shadow
  
  2. BRANCH_LINE
     - Color: Variant-specific or secondary blue
     - Weight: 3-4px
     - Style: Solid
     - Arrowhead: Filled triangle
     - Offset: Staggered for parallel branches
  
  3. MERGE_LINE
     - Color: Muted gray or secondary
     - Weight: 2-3px
     - Style: Dashed (optional) or solid
     - Arrowhead: Filled triangle
     - Pattern: Converging to single point
}
```

**Implementation Tasks:**

1. **Enhanced Connector Function**

   - [ ] Create `createConnectorV2()` function
   - [ ] Support all three connector types
   - [ ] Implement type-specific styling
   - [ ] Add label support (traffic percentages, etc.)
   - [ ] Support curved/bezier paths (optional)

2. **Connection Point Calculation**

   - [ ] Improve edge-to-edge point detection
   - [ ] Support magnet points (LEFT, RIGHT, TOP, BOTTOM)
   - [ ] Handle auto-layout position changes
   - [ ] Calculate optimal routing paths

3. **Arrowhead Rendering**

   - [ ] Unified arrowhead creation function
   - [ ] Support different arrowhead styles
   - [ ] Proper sizing relative to stroke weight
   - [ ] Color matching with connector

4. **Label Support**

   - [ ] Traffic percentage labels on branch lines
   - [ ] Metric labels on merge lines
   - [ ] Optional text annotations
   - [ ] Proper positioning relative to connector

5. **Refresh/Update System**

   - [ ] Connector refresh on node movement
   - [ ] Dynamic connector updates
   - [ ] Cleanup of orphaned connectors

#### 2.2.2 Connector Routing Logic

**Current Approach:**
- Simple elbow connectors (horizontal then vertical, or vice versa)
- Midpoint calculation for routing

**Enhanced Routing Strategy:**

```typescript
interface RoutingStrategy {
  // Primary Flow (Horizontal)
  - Entry → Event: Right edge to left edge
  - Event → Event: Right edge to left edge
  - Event → Exit: Right edge to left edge
  
  // Branch Flow (Vertical)
  - Event → Variant: Bottom edge to top edge
  - Multiple variants: Staggered horizontal offsets
  
  // Merge Flow (Converging)
  - Variant → Next Event: Top edge to top edge
  - Multiple variants merge: Converge to single point
  - Then connect to next event's left edge
}
```

**Implementation Tasks:**

- [ ] Implement smart routing algorithm
- [ ] Support for complex branching patterns
- [ ] Avoid overlapping connectors
- [ ] Handle edge cases (many variants, tight spacing)

---

### 2.3 Flow Layout System

#### 2.3.1 Main Flow Frame

**Current Implementation:** Horizontal auto-layout frame
**Structure:**

```typescript
interface FlowFrame {
  // Layout Properties
  - layoutMode: 'HORIZONTAL'
  - primaryAxisSizingMode: 'AUTO'
  - counterAxisSizingMode: 'AUTO'
  - itemSpacing: 160px (configurable)
  - padding: 32-48px
  
  // Visual Properties
  - fills: Light background or transparent
  - cornerRadius: 24px
  - strokes: Optional border
  
  // Children
  - Entry Node (first)
  - Event Groups (middle)
  - Exit Node (last)
}
```

**Implementation Tasks:**

- [ ] Ensure proper spacing configuration
- [ ] Support vertical layout option
- [ ] Add background styling options
- [ ] Implement frame metadata

#### 2.3.2 Event Group Structure

**Current Implementation:** Vertical auto-layout frame
**Structure:**

```typescript
interface EventGroup {
  // Layout Properties
  - layoutMode: 'VERTICAL'
  - itemSpacing: 32-100px (configurable)
  - alignment: CENTER
  
  // Children
  - Event Card (top)
  - Variants Container (bottom, if variants exist)
}
```

**Implementation Tasks:**

- [ ] Optimize spacing for variant branches
- [ ] Support horizontal variant layout option
- [ ] Ensure proper alignment
- [ ] Handle empty variant cases

#### 2.3.3 Variants Container

**Current Implementation:** Vertical auto-layout frame
**Structure:**

```typescript
interface VariantsContainer {
  // Layout Properties
  - layoutMode: 'VERTICAL' (or 'HORIZONTAL' for side-by-side)
  - itemSpacing: 24px
  - alignment: CENTER or START
  
  // Children
  - Variant Cards (array)
}
```

**Implementation Tasks:**

- [ ] Support both vertical and horizontal layouts
- [ ] Optimize for many variants (scrolling/wrapping)
- [ ] Ensure consistent spacing
- [ ] Handle variant ordering

---

### 2.4 UI/UX Implementation

#### 2.4.1 Plugin UI Structure

**Current Implementation:** `ui.html` with form-based interface
**Components:**

1. **Experiment Header Section**
   - Experiment name input
   - Description textarea
   - Round number selector

2. **Metrics Section**
   - Metric cards (CTR, CR, SU)
   - Add metric button
   - Metric value inputs

3. **Events Section**
   - Event list/table
   - Add event button
   - Event name inputs
   - Variant management per event

4. **Variants Section**
   - Variant cards within events
   - Variant name, traffic, metrics
   - Status selection (none/running/winner)
   - Color picker

5. **Actions Section**
   - Create flow button
   - Cancel button
   - Refresh connectors button

**Enhancements Needed:**

```typescript
interface UIEnhancements {
  // Visual Improvements
  - Better spacing and typography
  - Consistent color scheme
  - Loading states
  - Success/error notifications
  
  // Interaction Improvements
  - Drag-and-drop event reordering
  - Inline editing
  - Real-time preview
  - Validation feedback
  
  // Functionality
  - Save/load flow templates
  - Export flow data
  - Import from JSON
  - Undo/redo support
}
```

**Implementation Tasks:**

- [ ] Improve form layout and styling
- [ ] Add validation and error handling
- [ ] Implement drag-and-drop for events
- [ ] Add real-time preview panel
- [ ] Create save/load functionality
- [ ] Add keyboard shortcuts

#### 2.4.2 User Experience Flow

**Current Flow:**
1. User opens plugin
2. Fills in experiment details
3. Adds events and variants
4. Clicks "Create flow"
5. Flow appears on canvas

**Enhanced Flow:**

```text
1. Plugin Opens
   ↓
2. Welcome/Quick Start Screen (optional)
   ↓
3. Experiment Setup
   - Name, description, links
   ↓
4. Events & Variants Builder
   - Add events
   - Add variants to events
   - Configure metrics
   ↓
5. Preview Panel (optional)
   - Visual preview of flow
   - Validation indicators
   ↓
6. Create Flow
   - Generate on canvas
   - Auto-select created flow
   - Show success message
   ↓
7. Edit Mode (optional)
   - Refresh connectors
   - Update flow
   - Delete flow
```

**Implementation Tasks:**

- [ ] Design welcome/onboarding screen
- [ ] Create preview panel component
- [ ] Implement edit/update flow functionality
- [ ] Add flow management (delete, duplicate)
- [ ] Create help/tooltips system

---

### 2.5 Data Schema & State Management

#### 2.5.1 V2 Schema Structure

**Current Schema:** Well-defined TypeScript interfaces
**Status:** ✅ Good foundation

**Schema Components:**

```typescript
// Experiment
interface ExperimentV2 {
  id: string
  name: string
  roundNumber: number
  description?: string
  links?: { figma?, jira?, miro? }
  outcomes?: { winningPaths?, notes? }
}

// Flow
interface FlowV2 {
  id: string
  layout?: FlowLayoutV2
  entry: EntryNodeV2
  events: EventNodeV2[]
  exit: ExitNodeV2
  connectors: ConnectorV2[]
}

// Nodes
interface EntryNodeV2 { id, label, note?, nodeType }
interface EventNodeV2 { id, name, nodeType, entryNote?, variants? }
interface VariantV2 { id, parentEventId, key, name, description?, traffic, metrics?, style? }
interface ExitNodeV2 { id, label, nodeType }

// Connectors
interface ConnectorV2 {
  id: string
  type: 'PRIMARY_FLOW_LINE' | 'BRANCH_LINE' | 'MERGE_LINE'
  from: { nodeType, id }
  to: { nodeType, id }
  label?: string
  arrowhead?: boolean
  style?: Record<string, any>
}
```

**Enhancements Needed:**
- [ ] Add validation schema (Zod or similar)
- [ ] Support for flow templates
- [ ] Version migration system
- [ ] Export/import formats (JSON, YAML)

#### 2.5.2 State Management

**Current Approach:** Direct message passing between UI and plugin
**Enhancements Needed:**

```typescript
interface StateManagement {
  // UI State
  - Form state (React-like or vanilla JS)
  - Validation state
  - Loading state
  - Error state
  
  // Flow State
  - Current flow data
  - Flow history (undo/redo)
  - Selected nodes
  - Hover states
  
  // Canvas State
  - Created flows on canvas
  - Node positions
  - Connector states
}
```

**Implementation Tasks:**

- [ ] Create state management system
- [ ] Implement undo/redo functionality
- [ ] Add state persistence (localStorage)
- [ ] Create state synchronization between UI and canvas

---

## 3. Implementation Phases

### Phase 1: Core Node Cards (Week 1-2)

**Priority: High**

- [ ] Enhance entry node card
- [ ] Enhance exit node card
- [ ] Improve event node card (variant count, styling)
- [ ] Improve variant node card (status badges, traffic display)
- [ ] Add proper metadata attachment
- [ ] Test card rendering and styling

**Deliverables:**
- All node cards render correctly
- Consistent styling across all cards
- Proper metadata for node identification

### Phase 2: Connector System (Week 2-3)

**Priority: High**

- [ ] Create `createConnectorV2()` function
- [ ] Implement all three connector types
- [ ] Enhance routing algorithm
- [ ] Add label support
- [ ] Improve arrowhead rendering
- [ ] Add connector refresh system
- [ ] Test connector rendering

**Deliverables:**
- All connector types render correctly
- Smart routing for complex flows
- Labels display properly
- Connectors update on node movement

### Phase 3: Layout System (Week 3-4)

**Priority: Medium**

- [ ] Optimize flow frame layout
- [ ] Enhance event group structure
- [ ] Improve variants container
- [ ] Add layout configuration options
- [ ] Support vertical/horizontal toggles
- [ ] Test various flow configurations

**Deliverables:**
- Flexible layout system
- Support for different flow patterns
- Proper spacing and alignment

### Phase 4: UI/UX Enhancements (Week 4-5)

**Priority: Medium**

- [ ] Improve plugin UI styling
- [ ] Add validation and error handling
- [ ] Implement drag-and-drop
- [ ] Create preview panel
- [ ] Add help/tooltips
- [ ] Improve user flow

**Deliverables:**
- Polished UI
- Better user experience
- Helpful guidance for users

### Phase 5: Advanced Features (Week 5-6)

**Priority: Low**

- [ ] Save/load flow templates
- [ ] Export/import functionality
- [ ] Undo/redo system
- [ ] Flow management (delete, duplicate)
- [ ] Advanced connector routing
- [ ] Animation/transitions (optional)

**Deliverables:**
- Advanced features working
- Better workflow efficiency
- User productivity improvements

---

## 4. Technical Specifications

### 4.1 Design Tokens

**Colors:**
- Primary: `#2563eb` (royalBlue600)
- Success: `#126930` (malachite800)
- Text Primary: `#22272f` (textPrimary)
- Text Secondary: `#506179` (textSecondary)
- Border: `#edeef1` (border)
- Background: `#eceff2` (fillsBackground)
- Surface: `#ffffff` (fillsSurface)

**Spacing:**
- XS: 4px
- SM: 8px
- MD: 12px
- LG: 16px
- XL: 24px
- XXL: 32px

**Typography:**
- Font: Figtree
- Body MD: 11px
- Body LG: 12px
- Weight Regular: 400
- Weight Medium: 500
- Weight SemiBold: 600
- Weight Bold: 700

**Radius:**
- SM: 8px
- MD: 12px
- LG: 16px
- XL: 18px

### 4.2 Node Dimensions

**Entry/Exit Nodes:**
- Min width: 200px
- Min height: 80px
- Padding: 16px

**Event Nodes:**
- Fixed width: 300px
- Fixed height: 280px
- Padding: 16px

**Variant Nodes:**
- Min width: 300px
- Min height: 280px
- Padding: 16px

### 4.3 Connector Specifications

**Primary Flow Line:**
- Stroke weight: 4-7px
- Color: Primary blue
- Arrowhead: 10-12px triangle
- Style: Solid

**Branch Line:**
- Stroke weight: 3-4px
- Color: Variant-specific or secondary
- Arrowhead: 8-10px triangle
- Style: Solid
- Offset: 12px per parallel branch

**Merge Line:**
- Stroke weight: 2-3px
- Color: Muted gray
- Arrowhead: 8px triangle
- Style: Solid or dashed
- Pattern: Converging

### 4.4 Spacing Configuration

**Flow Frame:**
- Event spacing: 160px (default, configurable)
- Padding: 32-48px

**Event Group:**
- Event to variants spacing: 32-100px
- Alignment: Center

**Variants Container:**
- Variant spacing: 24px
- Alignment: Center or Start

---

## 5. Testing Strategy

### 5.1 Unit Tests

- [ ] Node card creation functions
- [ ] Connector calculation functions
- [ ] Layout utility functions
- [ ] Data validation functions

### 5.2 Integration Tests

- [ ] Full flow creation
- [ ] Connector rendering
- [ ] Node positioning
- [ ] Metadata attachment

### 5.3 Visual Tests

- [ ] Card styling consistency
- [ ] Connector appearance
- [ ] Layout spacing
- [ ] Responsive behavior

### 5.4 User Acceptance Tests

- [ ] Create simple flow
- [ ] Create complex flow (many events/variants)
- [ ] Edit existing flow
- [ ] Delete flow
- [ ] Refresh connectors

---

## 6. Documentation Requirements

### 6.1 Code Documentation

- [ ] JSDoc comments for all functions
- [ ] Type definitions for all interfaces
- [ ] Usage examples in comments
- [ ] Architecture diagrams

### 6.2 User Documentation

- [ ] Plugin usage guide
- [ ] Flow creation tutorial
- [ ] Best practices
- [ ] Troubleshooting guide

### 6.3 Developer Documentation

- [ ] Architecture overview
- [ ] Extension points
- [ ] Contributing guidelines
- [ ] API reference

---

## 7. Risk Assessment

### 7.1 Technical Risks

1. **Figma Auto-Layout Quirks**

   - Risk: Positioning issues with absolute connectors
   - Mitigation: Use absoluteTransform, add delays, test thoroughly

2. **Performance with Many Nodes**

   - Risk: Slow rendering with 10+ events/variants
   - Mitigation: Optimize rendering, consider virtualization

3. **Connector Routing Complexity**

   - Risk: Overlapping or confusing connectors
   - Mitigation: Smart routing algorithm, user feedback

### 7.2 UX Risks

1. **Complex Flow Creation**

   - Risk: Users find it difficult to create flows
   - Mitigation: Better UI, tutorials, templates

2. **Connector Confusion**

   - Risk: Users don't understand connector types
   - Mitigation: Visual distinction, labels, tooltips

---

## 8. Success Metrics

### 8.1 Functional Metrics

- ✅ All node types render correctly
- ✅ All connector types render correctly
- ✅ Layout system works for various configurations
- ✅ Metadata system functions properly

### 8.2 Quality Metrics

- ✅ Consistent styling across all components
- ✅ Proper spacing and alignment
- ✅ Clean, maintainable code
- ✅ Good performance (< 2s for flow creation)

### 8.3 User Experience Metrics

- ✅ Intuitive UI
- ✅ Clear visual hierarchy
- ✅ Helpful error messages
- ✅ Fast workflow

---

## 9. Next Steps

1. **Review and Approve Plan**

   - Review this document with stakeholders
   - Get feedback on priorities
   - Adjust timeline if needed

2. **Set Up Development Environment**

   - Ensure all dependencies are installed
   - Set up testing framework
   - Configure build tools

3. **Begin Phase 1 Implementation**

   - Start with node card enhancements
   - Create detailed task breakdown
   - Set up project tracking

4. **Regular Reviews**

   - Weekly progress reviews
   - Adjust plan based on learnings
   - Update documentation

---

## Appendix A: Code Structure Reference

### Key Files

- `code.ts` - Main plugin code, flow creation logic
- `experiment-node.ts` - Node card creation functions
- `experiment-info-card.ts` - Info card creation
- `layout-utils.ts` - Layout utility functions
- `design-tokens.ts` - Design token definitions
- `ui.html` - Plugin UI interface

### Key Functions

- `createEventCard()` - Creates event node card
- `createVariantCard()` - Creates variant node card
- `createNodeCard()` - Creates entry/exit node card
- `connectNodes()` - Creates connector between nodes
- `createFlowV2()` - Main flow creation handler
- `createExperimentInfoCard()` - Creates info card

### Key Interfaces

- `ExperimentV2` - Experiment data structure
- `FlowV2` - Flow data structure
- `EventNodeV2` - Event node structure
- `VariantV2` - Variant node structure
- `ConnectorV2` - Connector structure

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Author:** GrowthLab Plugin Team
