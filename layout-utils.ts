// layout-utils.ts
// Utility functions for layout, color, and formatting used in Figma node creation

import { TOKENS } from './design-tokens';

// Convert hex color to RGB
export function hexToRgb(hex: string): RGB {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(x => x + x).join('');
  }
  const num = parseInt(hex, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255,
  };
}

// Example: spacing utility (can be expanded)
export function getSpacing(token: keyof typeof TOKENS): number {
  return TOKENS[token] as number;
}

// Example: font style utility
export function getFontStyle(style: 'Bold' | 'Regular' | 'Medium' = 'Regular') {
  return { family: TOKENS.fontFamily, style };
}

// ============================================
// BADGE UTILITIES
// Consolidated badge creation for consistent styling across the plugin
// ============================================

export type BadgeStyle = 'filled' | 'outlined' | 'micro';

/**
 * Create a badge with consistent styling
 * @param label - Badge text
 * @param style - 'filled' (card type), 'outlined' (status), or 'micro' (table cells)
 * @param bgColor - Background color (for filled/micro) or border color (for outlined)
 * @param textColor - Text color
 */
export function createBadge(
  label: string,
  style: BadgeStyle,
  bgColor: string,
  textColor: string
): FrameNode {
  const badge = figma.createFrame();
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisAlignItems = "CENTER";
  badge.name = `${label} Badge`;

  if (style === 'micro') {
    // Micro badge: smaller, auto height, for table cells
    badge.counterAxisSizingMode = "AUTO";
    badge.paddingLeft = badge.paddingRight = 4;
    badge.paddingTop = badge.paddingBottom = 2;
    badge.cornerRadius = 3;
    badge.fills = [{ type: "SOLID", color: hexToRgb(bgColor) }];
  } else if (style === 'outlined') {
    // Outlined badge: fixed 16px height, border, no fill
    badge.counterAxisSizingMode = "FIXED";
    badge.minHeight = 16;
    badge.maxHeight = 16;
    badge.paddingLeft = badge.paddingRight = 4;
    badge.paddingTop = badge.paddingBottom = 2;
    badge.cornerRadius = 4;
    badge.fills = [];
    badge.strokes = [{ type: "SOLID", color: hexToRgb(bgColor) }];
    badge.strokeWeight = 1;
  } else {
    // Filled badge: fixed 16px height, solid fill
    badge.counterAxisSizingMode = "FIXED";
    badge.minHeight = 16;
    badge.maxHeight = 16;
    badge.paddingLeft = badge.paddingRight = 4;
    badge.paddingTop = badge.paddingBottom = 2;
    badge.cornerRadius = 4;
    badge.fills = [{ type: "SOLID", color: hexToRgb(bgColor) }];
  }

  const text = figma.createText();
  text.fontName = getFontStyle("Medium");
  text.fontSize = style === 'micro' ? TOKENS.fontSizeLabel : 9;
  text.lineHeight = style === 'micro' ? { unit: "AUTO" } : { unit: "PIXELS", value: 10 };
  text.fills = [{ type: "SOLID", color: hexToRgb(textColor) }];
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  text.characters = label;
  badge.appendChild(text);

  return badge;
}
