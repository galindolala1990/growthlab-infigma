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
 * @param icon - Optional icon node to display before the text
 */
export function createBadge(
  label: string,
  style: BadgeStyle,
  bgColor: string,
  textColor: string,
  icon?: SceneNode
): FrameNode {
  const badge = figma.createFrame();
  badge.layoutMode = "HORIZONTAL";
  badge.primaryAxisSizingMode = "AUTO";
  badge.counterAxisAlignItems = "CENTER";
  badge.itemSpacing = icon ? 4 : 0;
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

  // Add icon if provided
  if (icon) {
    // Clone the icon to avoid issues if it's already in the document
    const iconClone = icon.clone();
    // Resize icon to fit badge (typically 10-12px for micro badges)
    const iconSize = style === 'micro' ? 10 : 12;
    // Check if the cloned node has resize method (FrameNode, RectangleNode, etc.)
    if ('resize' in iconClone && typeof iconClone.resize === 'function') {
      if (iconClone.width > 0 && iconClone.height > 0) {
        const scale = iconSize / Math.max(iconClone.width, iconClone.height);
        iconClone.resize(iconClone.width * scale, iconClone.height * scale);
      } else {
        iconClone.resize(iconSize, iconSize);
      }
    } else if ('children' in iconClone && iconClone.children.length > 0) {
      // If it's a group/frame, try to resize the first child
      const firstChild = iconClone.children[0];
      if ('resize' in firstChild && typeof firstChild.resize === 'function') {
        if (firstChild.width > 0 && firstChild.height > 0) {
          const scale = iconSize / Math.max(firstChild.width, firstChild.height);
          firstChild.resize(firstChild.width * scale, firstChild.height * scale);
        } else {
          firstChild.resize(iconSize, iconSize);
        }
      }
    }
    badge.appendChild(iconClone);
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
