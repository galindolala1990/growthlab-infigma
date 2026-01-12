# Color Alignment Plan

## Overview
This document tracks the alignment of hardcoded colors in the codebase with design tokens from `design-tokens.css`.

## ✅ Completed

### 1. Updated design-tokens.ts
- Added all base colors from design-tokens.css
- Added all semantic tokens
- Added status variant colors
- Added button colors
- Added shadow colors

---

## 🔴 Critical: Hardcoded Colors to Replace

### Node Cards (`experiment-node.ts` & `code.ts`)

#### ✅ Already Using Tokens (Good!)
- `TOKENS.fillsSurface` - Card backgrounds ✓
- `TOKENS.border` - Card borders ✓
- `TOKENS.textPrimary` - Text colors ✓
- `TOKENS.textSecondary` - Secondary text ✓
- `TOKENS.shadowColor` - Drop shadows ✓

#### ❌ Needs Fixing

**1. Entry/Exit Node Cards (`createNodeCard` in `code.ts`)**
```typescript
// Current (HARDCODED):
card.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
titleText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
subtitleText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.5 } }];

// Should be:
card.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
titleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
```

**2. Variant Colors (Sample Data in `code.ts`)**
```typescript
// Current (HARDCODED):
color: '#2563eb', // Variant A
color: '#0eab43', // Variant B
color: '#f59e42', // Variant C

// Should be:
color: TOKENS.royalBlue600,  // Variant A (blue)
color: TOKENS.malachite600,  // Variant B (green)
color: TOKENS.yellow600,     // Variant C (orange)
```

**3. Checker Pattern Colors (`experiment-node.ts`)**
```typescript
// Current (HARDCODED in variant card):
square.fills = [{ type: 'SOLID', color: (x + y) % 2 === 0 ? { r: 0.96, g: 0.96, b: 0.96 } : { r: 0.89, g: 0.89, b: 0.89 } }];

// Should use:
square.fills = [{ type: 'SOLID', color: (x + y) % 2 === 0 ? TOKENS.checkerLight : TOKENS.checkerDark }];
```

### Connectors (`code.ts`)

#### ❌ Needs Fixing

**1. Default Connector Color (`createMagnetizedConnector`)**
```typescript
// Current (HARDCODED):
connector.strokes = [{ type: 'SOLID', color: options?.color ?? { r: 0.46, g: 0.46, b: 0.46 } }];

// Should be:
connector.strokes = [{ type: 'SOLID', color: options?.color ?? hexToRgb(TOKENS.royalBlue600) }];
```

**2. Connector with Arrow (`createConnectorWithArrow`)**
```typescript
// Current (HARDCODED):
const color = options?.color ?? { r: 0.65, g: 0.72, b: 0.82 };

// Should be:
const color = options?.color ?? hexToRgb(TOKENS.royalBlue400); // Lighter blue for dashed connectors
```

**3. Connect Nodes Function (`connectNodes`)**
```typescript
// Current (HARDCODED):
const color = options?.winner
  ? { r: 0.22, g: 0.7, b: 0.36 }  // Green for winner
  : { r: 0.18, g: 0.45, b: 0.85 }; // Blue for normal

// Should be:
const color = options?.winner
  ? hexToRgb(TOKENS.malachite600)  // Green for winner
  : hexToRgb(TOKENS.royalBlue600);  // Blue for normal
```

### Entry Notes & Outcome Frames (`code.ts`)

#### ❌ Needs Fixing

**1. Entry Note Frame**
```typescript
// Current (HARDCODED):
noteFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 0.7 } }];
noteFrame.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.8, b: 0.2 } }];
noteText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.1 } }];

// Should be:
noteFrame.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.yellow50) }]; // Light yellow background
noteFrame.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.yellow300) }]; // Yellow border
noteText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.yellow900) }]; // Dark yellow text
```

**2. Outcome Frame**
```typescript
// Current (HARDCODED):
outcomeFrame.fills = [{ type: 'SOLID', color: { r: 0.9, g: 1, b: 0.9 } }];
outcomeFrame.strokes = [{ type: 'SOLID', color: { r: 0.3, g: 0.7, b: 0.3 } }];
outcomeText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.3, b: 0.1 } }];

// Should be:
outcomeFrame.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.malachite50) }]; // Light green background
outcomeFrame.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.malachite600) }]; // Green border
outcomeText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.malachite900) }]; // Dark green text
```

### Old Flow Frame (`code.ts` - deprecated handler)

#### ❌ Needs Fixing (if still used)

**1. Round Container**
```typescript
// Current (HARDCODED):
roundContainer.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.royalBlue600) }];
roundContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];

// Should be:
roundContainer.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBackground) }]; // Use background fill
roundContainer.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }]; // Use standard border
```

---

## 🟡 Medium Priority: UI Color Palette

### Variant Color Palette (`ui.html`)

**Current (HARDCODED):**
```javascript
const colorPalette = [
  { id: 'blue', hex: '#2563eb', class: 'variant-blue' },
  { id: 'green', hex: '#0eab43', class: 'variant-green' },
  { id: 'orange', hex: '#dd7602', class: 'variant-orange' },
  // ...
];
```

**Should be:**
```javascript
const colorPalette = [
  { id: 'blue', hex: TOKENS.royalBlue600, class: 'variant-blue' },
  { id: 'green', hex: TOKENS.malachite600, class: 'variant-green' },
  { id: 'orange', hex: TOKENS.yellow600, class: 'variant-orange' },
  { id: 'purple', hex: TOKENS.electricViolet500, class: 'variant-purple' },
  { id: 'pink', hex: TOKENS.pompadour400, class: 'variant-pink' },
  { id: 'teal', hex: TOKENS.lochinvar600, class: 'variant-teal' },
  { id: 'red', hex: TOKENS.coralRed600, class: 'variant-red' },
  { id: 'gray', hex: TOKENS.azure600, class: 'variant-gray' }
];
```

**Note:** This requires exporting TOKENS to the UI context or creating a shared constants file.

---

## Implementation Order (Recommended)

### Phase 1: Core Node Cards (HIGH PRIORITY)
1. ✅ Update design-tokens.ts (DONE)
2. Fix entry/exit node card colors
3. Fix variant checker pattern colors
4. Test node card rendering

### Phase 2: Connectors (HIGH PRIORITY)
1. Fix default connector colors
2. Fix winner/normal connector colors
3. Fix connector arrow colors
4. Test connector rendering

### Phase 3: Annotations (MEDIUM PRIORITY)
1. Fix entry note colors
2. Fix outcome frame colors
3. Test annotation rendering

### Phase 4: UI Palette (LOW PRIORITY)
1. Export tokens to UI context
2. Update variant color palette
3. Test UI color picker

---

## Color Mapping Reference

### Connector Colors
- **Primary Flow Line**: `TOKENS.royalBlue600` (#2563eb) - Main spine
- **Branch Line**: `TOKENS.royalBlue500` (#3b8ff6) - Event to variants
- **Merge Line**: `TOKENS.azure600` (#506179) - Variants to next event
- **Winner Connector**: `TOKENS.malachite600` (#0eab43) - Winning path

### Variant Colors (Standard Set)
- **Variant A**: `TOKENS.royalBlue600` (#2563eb) - Blue
- **Variant B**: `TOKENS.malachite600` (#0eab43) - Green
- **Variant C**: `TOKENS.yellow600` (#dd7602) - Orange
- **Variant D**: `TOKENS.electricViolet500` (#6f4cff) - Purple
- **Variant E**: `TOKENS.pompadour400` (#fe68dd) - Pink
- **Variant F**: `TOKENS.lochinvar600` (#00a496) - Teal

### Status Colors
- **Success/Winner**: `TOKENS.malachite800` (#126930)
- **Success Light**: `TOKENS.malachite400` (#42e679)
- **Error**: `TOKENS.coralRed500` (#ff3838)
- **Warning**: `TOKENS.yellow600` (#dd7602)
- **Info**: `TOKENS.royalBlue600` (#2563eb)

---

## Testing Checklist

After each phase:
- [ ] Visual inspection of all node cards
- [ ] Visual inspection of all connectors
- [ ] Check color consistency across components
- [ ] Verify no hardcoded RGB values remain
- [ ] Test with different variant configurations
- [ ] Test winner/normal connector states

---

**Last Updated:** January 2026
