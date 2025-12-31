# Figma Design Extract - Plugin Create Experiment (467-13896)

## Typography Styles

### Headings & Text Elements
| Name | Font Size | Weight | Font Family | Line Height | Usage |
|------|-----------|--------|-------------|-------------|-------|
| Title | 12px | 600 | Figtree | 83% (≈10px) | "Untitled experiment" |
| Subtitle | 11px | 400 | Figtree | 108% (≈12px) | "Group design variants..." |
| Labels | 9px | 500 | Figtree | 83% (≈7.5px) | Section labels |
| Body Text | 11px | 400 | Figtree | 76% (≈8.4px) | Input placeholders |
| Metric Names | 11px | 500 | Figtree | 76% (≈8.4px) | "A/B/C Test" |
| Meta Text | 9px | 500 | Figtree | 83% (≈7.5px) | "(CR)", status labels |

## Color Palette

### Primary Colors
| Color | RGB | HEX | Usage |
|-------|-----|-----|-------|
| White | (255,255,255) | #FFFFFF | Backgrounds, text on dark |
| Dark Blue | (15,23,41) | #0F1729 | Primary text, headings |
| Medium Blue | (51,59,71) | #333B47 | Secondary text, labels |
| Light Blue | (57,68,83) | #394453 | Tertiary text |
| Muted Blue | (63,76,95) | #3F4C5F | Meta text, descriptions |

### Variant/Status Colors
| Color | RGB | HEX | Usage |
|-------|-----|-----|-------|
| Success Green | (18,105,48) | #126930 | Winner/positive status |
| Success Light | (10,207,131) | #0ACF83 | Success indicator |
| Error Red | (242,78,30) | #F24E1E | Error state |
| Warning Orange | (221,118,2) | #DD7602 | Warning state |
| Info Blue | (38,132,255) | #2684FF | Info indicator |
| Bright Purple | (162,89,255) | #A259FF | Accent color |
| Bright Blue | (26,188,254) | #1ABC FE | Highlight |
| Bright Cyan | (37,99,235) | #2563EB | Variant color |

### UI Border/Background Colors
| Color | RGB | HEX | Usage |
|-------|-----|-----|-------|
| Light Border | (220,222,223) | #DCDEFF | Borders, dividers |
| Lighter BG | (236,239,242) | #ECEFF2 | Input backgrounds, section BGs |
| Very Light BG | (216,219,223) | #D8DBDF | Disabled/muted areas |
| Dark Neutral | (34,39,47) | #222F2F | Dark text on light |
| Medium Neutral | (82,82,91) | #52525B | Icon colors |

## Layout & Spacing

### Frame Dimensions
- **Main Frame**: 467x13896 (plugin canvas area)
- **Corner Radius**: 16px (main frame)

### Section Spacing
| Section | Border | Stroke Weight | Notes |
|---------|--------|---------------|-------|
| Header | #EDEFF2 | 1px | Light border below |
| Metrics | #EDEFF2 | 1px | Light border below |
| Events | #D8DBDF | 1px | Darker border |
| Footer | #EDEFF2 | 1px | Light border below |

### Padding & Gaps
- **Metric Cards**: Padding bottom 16px between items
- **Event Rows**: Padding bottom 16px between items
- **Section Padding**: 16-24px standard padding

## Components

### Section/Header
- Contains title, subtitle, and input fields
- Uses semantic component with property overrides
- Input fields: 40px height, rounded corners

### Section/Metrics
- **Header**: "Metrics" title with "+" add button
- **Cards**: 
  - Metric rate (variant 2): Light border #EDEFF2
  - Metric rate (variant 3): Darker border #D8DBDF
- Shows CTR, CR, and Conversion Rate
- Add button for additional metrics

### Section/Events
- **Header**: "Events" title with count badge "3 events • 3 variants"
- **Event Rows** (multiple variants):
  - Event type: Standard border
  - Variant type: Darker border, number indicator
  - Alternating visual patterns
  
### Section/Footer
- Action buttons: "Create flow" (primary), "Cancel" (secondary)
- Sticky footer positioning

## Design Tokens to Implement

### CSS Variables Extracted
```css
/* Typography */
--font-title-size: 12px;          /* h1 equivalent */
--font-title-weight: 600;
--font-subtitle-size: 11px;       /* h2 equivalent */
--font-subtitle-weight: 400;
--font-body-size: 11px;           /* body text */
--font-body-weight: 400;
--font-label-size: 9px;           /* labels, meta */
--font-label-weight: 500;
--font-metric-size: 11px;
--font-metric-weight: 500;

/* Colors */
--color-bg-primary: #FFFFFF;
--color-text-primary: #0F1729;
--color-text-secondary: #333B47;
--color-text-tertiary: #394453;
--color-text-muted: #3F4C5F;
--color-border-light: #DCDEFF;
--color-border-lighter: #EDEFF2;
--color-border-dark: #D8DBDF;
--color-bg-input: #ECEFF2;
--color-status-success: #126930;
--color-status-error: #F24E1E;
--color-status-warning: #DD7602;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;

/* Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
```

## Variant States

### Metric Cards
1. **Add Button State**: Empty card with add button
2. **Filled Name & Rate**: Card with metric name and percentage value
3. **Mixed**: Some metrics filled, some empty

### Event Rows
1. **Event Type**: Standard border, no variant count
2. **Variant Type**: Special indicator showing number of variants
3. **Winner Row**: Highlighted variant marked as winner
4. **Event Top/Bottom Lines**: Alternating dividers between events

## Additional Notes
- All text uses "Figtree" font family exclusively
- Line heights are percentage-based (75-108%)
- Metric values shown as percentages
- Event/variant counts dynamically updated
- Color scheme optimized for light mode
- Borders are 1px solid throughout
