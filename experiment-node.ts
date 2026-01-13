// experiment-node.ts
// Modularized node creation functions for Figma plugin

import { TOKENS } from './design-tokens';
import { hexToRgb, getFontStyle } from './layout-utils';

export function createEventCard(eventName: string, variantCount?: number): FrameNode {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'AUTO';
  card.primaryAxisSizingMode = 'AUTO';
  card.minWidth = 300; // 18.75rem
  card.maxWidth = 400; // 25rem
  card.resize(300, 280); // Default width 300px (18.75rem)
  card.paddingLeft = 0;
  card.paddingRight = 0;
  card.paddingTop = 16; // 1rem
  card.paddingBottom = 12; // 0.75rem
  card.cornerRadius = 16; // 1rem
  card.fills = [{ type: 'SOLID', color: hexToRgb('#FFFFFF') }];
  card.strokes = [{ type: 'SOLID', color: hexToRgb('#EDEEF1') }];
  card.strokeWeight = 1;
  card.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.05 },
    offset: { x: 0, y: 1 },
    radius: 2,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  }];
  card.itemSpacing = 12; // 0.75rem gap
  card.primaryAxisAlignItems = 'MIN';
  card.counterAxisAlignItems = 'MIN';
  card.name = `Event: ${eventName}`;

  const topRow = figma.createFrame();
  topRow.layoutMode = 'HORIZONTAL';
  topRow.counterAxisSizingMode = 'AUTO';
  topRow.primaryAxisSizingMode = 'AUTO';
  topRow.itemSpacing = TOKENS.space4;
  topRow.fills = [];
  topRow.strokes = [];
  topRow.name = 'Top Row';
  topRow.layoutAlign = 'MIN'; // Left align to match card alignment

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
  eventNameText.characters = eventName || 'Event Name';
  eventNameText.name = 'Event Name Text';
  card.appendChild(eventNameText);

  const subtitleText = figma.createText();
  subtitleText.fontName = getFontStyle("Regular");
  subtitleText.fontSize = TOKENS.fontSizeBodyMd;
  subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
  const count = variantCount ?? 0;
  subtitleText.characters = `${count} variant${count !== 1 ? 's' : ''}`;
  subtitleText.name = 'Number of Variants';
  card.appendChild(subtitleText);

  return card;
}

import type { Variant } from './code';

export function createVariantCard(variant: Variant, variantIndex?: number): FrameNode {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'AUTO';
  card.primaryAxisSizingMode = 'AUTO';
  card.minWidth = 300; // 18.75rem
  card.maxWidth = 400; // 25rem
  card.resize(300, 280); // Default width 300px (18.75rem)
  card.paddingLeft = 0;
  card.paddingRight = 0;
  card.paddingTop = 16; // 1rem
  card.paddingBottom = 12; // 0.75rem
  card.cornerRadius = 16; // 1rem
  card.fills = [{ type: 'SOLID', color: hexToRgb('#FFFFFF') }];
  card.strokes = [{ type: 'SOLID', color: hexToRgb('#EDEEF1') }];
  card.strokeWeight = 1;
  card.effects = [{
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.05 },
    offset: { x: 0, y: 1 },
    radius: 2,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  }];
  card.itemSpacing = 12; // 0.75rem gap
  card.primaryAxisAlignItems = 'MIN';
  card.counterAxisAlignItems = 'MIN';

  const topRow = figma.createFrame();
  topRow.layoutMode = 'HORIZONTAL';
  topRow.counterAxisSizingMode = 'AUTO';
  topRow.primaryAxisSizingMode = 'AUTO';
  topRow.itemSpacing = TOKENS.space4;
  topRow.fills = [];
  topRow.strokes = [];
  topRow.name = 'Top Row';
  topRow.layoutAlign = 'MIN'; // Left align to match card alignment

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
      square.fills = [{ type: 'SOLID', color: (x + y) % 2 === 0 ? TOKENS.checkerLight : TOKENS.checkerDark }];
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
  variantNameText.characters = variant.name || 'Variant Name';
  variantNameText.name = 'Variant Name';
  card.appendChild(variantNameText);

  // Enhanced Metrics Display
  const metricsContainer = figma.createFrame();
  metricsContainer.layoutMode = 'HORIZONTAL';
  metricsContainer.counterAxisSizingMode = 'AUTO';
  metricsContainer.primaryAxisSizingMode = 'AUTO';
  metricsContainer.itemSpacing = TOKENS.space8;
  metricsContainer.fills = [];
  metricsContainer.strokes = [];
  metricsContainer.name = 'Metrics Container';
  
  // Format metrics with proper decimal places
  const formatMetric = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0.00';
    return value.toFixed(2);
  };
  
  if (variant.metrics?.ctr !== undefined) {
    const ctrChip = createMetricChip('CTR', parseFloat(formatMetric(variant.metrics.ctr)));
    metricsContainer.appendChild(ctrChip);
  }
  if (variant.metrics?.cr !== undefined) {
    const crChip = createMetricChip('CR', parseFloat(formatMetric(variant.metrics.cr)));
    metricsContainer.appendChild(crChip);
  }
  if (variant.metrics?.su !== undefined) {
    const suChip = createMetricChip('SU', parseFloat(formatMetric(variant.metrics.su)));
    metricsContainer.appendChild(suChip);
  }
  
  // Fallback to text if no metrics chips created
  if (metricsContainer.children.length === 0) {
    const subtitleText = figma.createText();
    subtitleText.fontName = getFontStyle("Regular");
    subtitleText.fontSize = TOKENS.fontSizeBodyMd;
    subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
    subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    subtitleText.characters = `CTR: ${formatMetric(variant.metrics?.ctr)}  CR: ${formatMetric(variant.metrics?.cr)}  SU: ${formatMetric(variant.metrics?.su)}`;
    subtitleText.name = 'Variant Metrics Subtitle';
    card.appendChild(subtitleText);
  } else {
    card.appendChild(metricsContainer);
  }

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
