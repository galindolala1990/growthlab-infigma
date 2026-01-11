// experiment-node.ts
// Modularized node creation functions for Figma plugin

import { TOKENS } from './design-tokens';
import { hexToRgb, getFontStyle } from './layout-utils';

export function createEventCard(eventName: string): FrameNode {
  const card = figma.createFrame();
  card.resize(300, 280);
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'FIXED';
  card.primaryAxisSizingMode = 'FIXED';
  card.paddingLeft = card.paddingRight = TOKENS.space16;
  card.paddingTop = card.paddingBottom = TOKENS.space16;
  card.cornerRadius = TOKENS.radiusLG;
  card.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsSurface) }];
  card.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
  card.strokeWeight = 0;
  card.effects = [{
    type: 'DROP_SHADOW',
    color: TOKENS.shadowColor,
    offset: { x: 0, y: 1 },
    radius: 2,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  }];
  card.name = `Event: ${eventName}`;

  const topRow = figma.createFrame();
  topRow.layoutMode = 'HORIZONTAL';
  topRow.counterAxisSizingMode = 'AUTO';
  topRow.primaryAxisSizingMode = 'AUTO';
  topRow.itemSpacing = TOKENS.space4;
  topRow.fills = [];
  topRow.strokes = [];
  topRow.name = 'Top Row';
  topRow.layoutAlign = 'MIN';

  const eventLabel = figma.createText();
  eventLabel.fontName = getFontStyle("Bold");
  eventLabel.fontSize = TOKENS.fontSizeBodyMd;
  eventLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  eventLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
  eventLabel.characters = 'Event';
  eventLabel.name = 'Event Label';
  topRow.appendChild(eventLabel);

  card.appendChild(topRow);

  let thumb: FrameNode | SceneNode;
  const selection = figma.currentPage.selection;
  let imageNode: RectangleNode | null = null;
  if (
    selection &&
    selection.length > 0 &&
    selection[0].type === 'RECTANGLE'
  ) {
    const rect = selection[0] as RectangleNode;
    const fills = rect.fills;
    if (Array.isArray(fills) && fills.length > 0 && fills[0].type === 'IMAGE') {
      imageNode = rect;
    }
  }
  if (imageNode) {
    thumb = imageNode.clone();
    thumb.resize(268, 160);
    if ('cornerRadius' in thumb) thumb.cornerRadius = 16;
    thumb.name = 'Thumbnail';
    thumb.layoutAlign = 'MIN';
  } else {
    const placeholder = figma.createFrame();
    placeholder.resize(268, 160);
    placeholder.cornerRadius = TOKENS.radiusSM;
    placeholder.name = 'Thumbnail';
    placeholder.layoutAlign = 'MIN';
    placeholder.clipsContent = true;
    const squareSize = 32;
    const cols = Math.ceil(268 / squareSize);
    const rows = Math.ceil(160 / squareSize);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const square = figma.createRectangle();
        square.resize(squareSize, squareSize);
        square.x = x * squareSize;
        square.y = y * squareSize;
        square.fills = [{ type: 'SOLID', color: (x + y) % 2 === 0 ? TOKENS.checkerLight : TOKENS.checkerDark }];
        square.strokes = [];
        square.strokeWeight = 0;
        square.name = 'Checker';
        placeholder.appendChild(square);
      }
    }
    placeholder.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
    placeholder.strokeWeight = 1;
    thumb = placeholder;
  }
  card.appendChild(thumb);

  const eventNameText = figma.createText();
  eventNameText.fontName = getFontStyle("Bold");
  eventNameText.fontSize = TOKENS.fontSizeBodyLg;
  eventNameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  eventNameText.textAutoResize = 'WIDTH_AND_HEIGHT';
  eventNameText.characters = 'Event Name';
  eventNameText.name = 'Event Name Text';
  card.appendChild(eventNameText);

  const subtitleText = figma.createText();
  subtitleText.fontName = getFontStyle("Regular");
  subtitleText.fontSize = TOKENS.fontSizeBodyMd;
  subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
  subtitleText.characters = '0 variants';
  subtitleText.name = 'Number of Variants';
  card.appendChild(subtitleText);

  card.primaryAxisAlignItems = 'MIN';
  card.counterAxisAlignItems = 'MIN';
  card.itemSpacing = TOKENS.space12;

  return card;
}

import type { Variant } from './code';

export function createVariantCard(variant: Variant, variantIndex?: number): FrameNode {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'AUTO';
  card.primaryAxisSizingMode = 'AUTO';
  card.paddingLeft = card.paddingRight = TOKENS.space16;
  card.paddingTop = card.paddingBottom = TOKENS.space16;
  card.cornerRadius = TOKENS.radiusLG;
  card.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsSurface) }];
  card.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
  card.strokeWeight = 0;
  card.resize(300, 280);
  card.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.05 },
    offset: { x: 0, y: 1 },
    radius: 2,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  }];

  const topRow = figma.createFrame();
  topRow.layoutMode = 'HORIZONTAL';
  topRow.counterAxisSizingMode = 'AUTO';
  topRow.primaryAxisSizingMode = 'AUTO';
  topRow.itemSpacing = TOKENS.space4;
  topRow.fills = [];
  topRow.strokes = [];
  topRow.name = 'Top Row';
  topRow.layoutAlign = 'MIN';

  const variantTypeLabel = figma.createText();
  variantTypeLabel.fontName = getFontStyle("Bold");
  variantTypeLabel.fontSize = TOKENS.fontSizeBodyMd;
  variantTypeLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  variantTypeLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
  variantTypeLabel.characters = 'Variant';
  variantTypeLabel.name = 'Variant Type Label';
  topRow.appendChild(variantTypeLabel);

  card.appendChild(topRow);

  const thumb = figma.createFrame();
  thumb.layoutMode = 'NONE';
  thumb.resize(268, 160);
  thumb.cornerRadius = TOKENS.radiusSM;
  thumb.name = 'Thumbnail';
  thumb.layoutAlign = 'MIN';
  thumb.clipsContent = true;
  const squareSize = 32;
  const cols = Math.ceil(268 / squareSize);
  const rows = Math.ceil(160 / squareSize);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const square = figma.createRectangle();
      square.resize(squareSize, squareSize);
      square.x = x * squareSize;
      square.y = y * squareSize;
      square.fills = [{ type: 'SOLID', color: (x + y) % 2 === 0 ? { r: 0.96, g: 0.96, b: 0.96 } : { r: 0.89, g: 0.89, b: 0.89 } }];
      square.strokes = [];
      square.strokeWeight = 0;
      square.name = 'Checker';
      thumb.appendChild(square);
    }
  }
  thumb.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
  thumb.strokeWeight = 1;
  card.appendChild(thumb);

  const variantNameText = figma.createText();
  variantNameText.fontName = getFontStyle("Bold");
  variantNameText.fontSize = TOKENS.fontSizeBodyLg;
  variantNameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  variantNameText.textAutoResize = 'WIDTH_AND_HEIGHT';
  variantNameText.characters = 'Variant Name';
  variantNameText.name = 'Variant Name';
  card.appendChild(variantNameText);

  const subtitleText = figma.createText();
  subtitleText.fontName = getFontStyle("Regular");
  subtitleText.fontSize = TOKENS.fontSizeBodyMd;
  subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
  subtitleText.characters = `CTR: ${variant.metrics?.ctr ?? 0}  CR: ${variant.metrics?.cr ?? 0}  SU: ${variant.metrics?.su ?? 0}`;
  subtitleText.name = 'Variant Metrics Subtitle';
  card.appendChild(subtitleText);

  card.primaryAxisAlignItems = 'MIN';
  card.counterAxisAlignItems = 'MIN';
  card.itemSpacing = TOKENS.space12;

  return card;
}

export function createMetricChip(label: string, value: number): FrameNode {
  const chip = figma.createFrame();
  chip.layoutMode = 'HORIZONTAL';
  chip.counterAxisSizingMode = 'AUTO';
  chip.primaryAxisSizingMode = 'AUTO';
  chip.paddingLeft = chip.paddingRight = TOKENS.space8;
  chip.paddingTop = chip.paddingBottom = TOKENS.space4 / 2;
  chip.cornerRadius = TOKENS.radiusSM;
  chip.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBackground) }];
  chip.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
  chip.strokeWeight = 1;
  chip.name = 'Metric Chip';
  const txt = figma.createText();
  txt.fontSize = TOKENS.fontSizeBodyLg;
  try {
    txt.fontName = getFontStyle("Bold");
  } catch {
    txt.fontName = getFontStyle("Medium");
  }
  txt.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
  txt.textAutoResize = 'WIDTH_AND_HEIGHT';
  txt.characters = `${label}: ${value}`;
  chip.appendChild(txt);
  return chip;
}

// Add more node creation functions as needed.
