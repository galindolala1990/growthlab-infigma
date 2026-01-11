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

// Add more utilities as needed for layout, formatting, etc.
