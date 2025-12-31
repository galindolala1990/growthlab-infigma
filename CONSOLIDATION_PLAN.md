# Design Token Consolidation Strategy

## Problem Summary

**Current State**: Duplicate token definitions in both files
- **design-tokens.css**: Source of truth with Figma-extracted values
- **ui.css**: Redundant `:root` block with conflicting values (lines 3-72)

**Impact**: Variables resolve to different values depending on CSS specificity/cascade

---

## Consolidation Plan

### Phase 1: Identify All Duplicates

#### Variables Defined in BOTH files (CONFLICTS):

| Variable | design-tokens.css | ui.css | Status |
|----------|-------------------|--------|--------|
| `--typography-h1-color` | `var(--accent-primary-dark)` | `var(--accent-primary-dark)` | ✓ Same |
| `--primary` | `#6F4CFF` | `#6F4CFF` | ✓ Same |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | ✓ Same |
| `--primary-hover` | `#5F3DE6` | `#5F3DE6` | ✓ Same |
| `--primary-active` | `#4C2FCC` | `#4C2FCC` | ✓ Same |
| `--primary-soft` | `#F0EBFF` | `#F0EBFF` | ✓ Same |
| `--primary-soft-foreground` | `#5F3DE6` | `#5F3DE6` | ✓ Same |
| `--background` | `#FFFFFF` | `#FFFFFF` | ✓ Same |
| `--background-subtle` | `#F9FAFB` | `#F9FAFB` | ✓ Same |
| `--background-surface` | `#FFFFFF` | `#FFFFFF` | ✓ Same |
| `--background-muted` | `#ECEFF2` | `#F3F4F6` | ❌ CONFLICT |
| `--foreground` | `#0F1729` | `#0F172A` | ❌ CONFLICT |
| `--text` | `var(--foreground)` | `var(--foreground)` | ✓ Same |
| `--text-secondary` | `#333B47` | `#374151` | ❌ CONFLICT |
| `--text-muted` | `#3F4C5F` | `#6B7280` | ❌ CONFLICT |
| `--text-subtle` | `#D1D5DB` | `#D1D5DB` | ✓ Same |
| `--muted-foreground` | `var(--text-secondary)` | `var(--text-secondary)` | ✓ Same |
| `--border` | `#EDEDF1` | `#e6eaf2` | ❌ CONFLICT |
| `--border-strong` | `#b7c6e0` | `#b7c6e0` | ✓ Same |
| `--accent-success` | `#126930` | `#217a4d` | ❌ CONFLICT |
| `--accent-success-bg` | `#eaf7f0` | `#eaf7f0` | ✓ Same |
| `--accent-primary` | `#2a4d7a` | `#2a4d7a` | ✓ Same |
| `--accent-primary-dark` | `#18305a` | `#18305a` | ✓ Same |

#### Variables ONLY in design-tokens.css (Missing from ui.css):
- `--text-tertiary: #394453`
- `--border-light: #EDEDF1`
- `--border-dark: #D8DBDF`
- `--accent-success-light: #0ACF83`
- `--accent-error: #F24E1E`
- `--accent-warning: #DD7602`
- `--accent-info: #2684FF`
- `--accent-highlight: #1ABCFE`
- `--status-variant-a: #2563EB`
- `--status-variant-b: #A259FF`
- `--status-variant-c: #F24E1E`
- All typography size/weight variables (`--text-lg-size`, etc.)
- All radius variables

#### Variables ONLY in ui.css (Component-specific):
- `--section-bg, --section-border, --section-radius, --section-shadow`
- `--emphasized-bg, --emphasized-border, --emphasized-shadow`
- `--meta-bg, --meta-border, --meta-shadow`
- `--input-bg, --input-border, --input-radius, --input-height`
- `--label-color, --label-weight`
- `--variant-card-bg, --variant-card-border, --variant-card-radius, --variant-card-shadow`
- `--variant-key-badge-*` (size, bg, color, radius)
- `--variant-traffic-*` (bg, border, radius, color)

---

## Recommended Consolidation Strategy

### Option A: RECOMMENDED - Merge into design-tokens.css (Single Source of Truth)

**Rationale**: 
- `design-tokens.css` has Figma-extracted values (more authoritative)
- Remove redundancy entirely
- Cleaner separation: tokens vs. components

**Steps**:

1. **Delete the entire `:root` block from ui.css** (lines 3-72)
2. **Add component-specific variables to design-tokens.css** (new section)
3. **ui.css keeps only** component classes and utility classes

**Changes to make**:

#### In `design-tokens.css` - ADD NEW SECTION after typography:

```css
  /* === Component-Specific Variables === */
  
  /* Sections */
  --section-bg: var(--background-muted);
  --section-border: var(--border);
  --section-radius: var(--radius-xl);
  --section-shadow: 0 4px 16px 0 rgba(40,60,90,0.06);
  
  /* Emphasized/Meta Areas */
  --emphasized-bg: #f5f8fd;
  --emphasized-border: var(--border-strong);
  --emphasized-shadow: 0 2px 12px 0 rgba(40,60,90,0.05);
  
  --meta-bg: #f9fbfd;
  --meta-border: var(--border);
  --meta-shadow: 0 2px 12px 0 rgba(40,60,90,0.04);
  
  /* Form Inputs */
  --input-bg: var(--background-surface);
  --input-border: 1px solid #dbe3ef;
  --input-radius: var(--radius-sm);
  --input-height: 40px;
  
  /* Labels */
  --label-color: #6b7a90;
  --label-weight: 600;
  
  /* Variant Cards */
  --variant-card-bg: var(--background-muted);
  --variant-card-border: var(--border);
  --variant-card-radius: var(--radius-lg);
  --variant-card-shadow: 0 2px 8px 0 rgba(40,60,90,0.06);
  
  /* Variant Key Badge */
  --variant-key-badge-bg: var(--accent-primary);
  --variant-key-badge-color: var(--primary-foreground);
  --variant-key-badge-radius: 50%;
  --variant-key-badge-size: 28px;
  
  /* Variant Traffic */
  --variant-traffic-bg: var(--accent-success-bg);
  --variant-traffic-border: #b6e2c6;
  --variant-traffic-radius: var(--radius-sm);
  --variant-traffic-color: var(--accent-success);
}
```

#### In `ui.css` - REMOVE lines 3-72:

DELETE the entire `:root { ... }` block and replace with:

```css
@import "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap";

/* ui.css - Component styles using design tokens from design-tokens.css */

/* Component styles start below */
```

Then keep all the component classes (`.Stack`, `.Row`, `.Card`, `.Section`, `.Button`, etc.)

---

### Option B: Alternative - Keep Separated (If Components Need Flexibility)

**Rationale**: Components can have different theming
**Downside**: Harder to maintain, conflicts persist

**Steps**:
1. Rename all conflicting variables in ui.css with `--component-` prefix
2. Map them to design-tokens values
3. Not recommended - increases complexity

---

## Conflict Resolution Reference

For the 5 conflicting colors, use **design-tokens.css values** (Figma-extracted):

| Variable | Use This Value | Reason |
|----------|----------------|--------|
| `--background-muted` | `#ECEFF2` | Figma extracted: rgb(236,239,242) |
| `--foreground` | `#0F1729` | Matches primary text in Figma |
| `--text-secondary` | `#333B47` | Extracted: rgb(51,59,71) |
| `--text-muted` | `#3F4C5F` | Extracted: rgb(63,76,95) |
| `--border` | `#EDEDF1` | Extracted: rgb(237,238,241) |

Also update `--accent-success` to `#126930` (Figma green for winner status)

---

## Implementation Checklist

- [ ] **Step 1**: Add component-specific variables to design-tokens.css (before closing `}`)
- [ ] **Step 2**: Remove entire `:root` block from ui.css (lines 3-72)
- [ ] **Step 3**: Update conflicting color values in design-tokens.css:
  - [ ] `--background-muted` → `#ECEFF2`
  - [ ] `--foreground` → `#0F1729`
  - [ ] `--text-secondary` → `#333B47`
  - [ ] `--text-muted` → `#3F4C5F`
  - [ ] `--border` → `#EDEDF1`
  - [ ] `--accent-success` → `#126930`
- [ ] **Step 4**: Verify no CSS errors with `npm run build`
- [ ] **Step 5**: Test all UI elements display correctly

---

## Expected Outcomes

✅ **Single source of truth** for all design tokens  
✅ **No more conflicts** from duplicate definitions  
✅ **Easier maintenance** - change once, affects everywhere  
✅ **Smaller CSS** - less redundancy  
✅ **Better consistency** - Figma values always used  

---

## File Size Impact

- **Before**: 
  - design-tokens.css: ~145 lines
  - ui.css: ~718 lines
  - Total: ~863 lines

- **After**:
  - design-tokens.css: ~200 lines
  - ui.css: ~650 lines
  - Total: ~850 lines
  - **Savings**: ~13 lines, cleaner separation

---

## Testing After Consolidation

1. **Visual regression**: All UI elements should look identical
2. **Color consistency**: Check header, metrics, events sections use correct colors
3. **Spacing**: All gaps and padding should be unchanged
4. **Typography**: Font sizes and weights should match
5. **Build**: `npm run build` should complete with no errors

---

## Migration Path (Safe)

If you want to migrate gradually:

1. **Create `design-tokens-consolidated.css`** with all merged tokens
2. **Test using new file** in ui.html
3. **Replace old files** once verified
4. **Commit and document** the consolidation

