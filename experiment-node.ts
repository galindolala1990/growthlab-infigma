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
  card.counterAxisAlignItems = 'CENTER';
  card.name = `Event: ${eventName}`;

  const topRow = figma.createFrame();
  topRow.layoutMode = 'HORIZONTAL';
  topRow.counterAxisSizingMode = 'AUTO';
  topRow.primaryAxisSizingMode = 'AUTO';
  topRow.primaryAxisAlignItems = 'MIN'; // Vertically distribute/center items along horizontal axis
  topRow.counterAxisAlignItems = 'CENTER'; // Middle align vertically (center items in the row)
  // topRow.height = 24; // Removed because .height is read-only for auto layout frames
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
  card.resize(300, 400); // Default width 300px (18.75rem)
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

  // Header with icon and "Variant" text
  const topRow = figma.createFrame();
  topRow.layoutMode = 'HORIZONTAL';
  topRow.counterAxisSizingMode = 'AUTO';
  topRow.primaryAxisSizingMode = 'AUTO';
  topRow.itemSpacing = TOKENS.space4;
  topRow.fills = [];
  topRow.strokes = [];
  topRow.name = 'Top Row';
  topRow.layoutAlign = 'MIN'; // Left align to match card alignment

  // Icon: two arrows pointing in opposite directions (using simple rectangles as placeholder)
  // Note: Complex vector icons would require SVG import, using simple shape as placeholder
  const iconFrame = figma.createFrame();
  iconFrame.resize(16, 16);
  iconFrame.fills = [];
  iconFrame.strokes = [];
  iconFrame.name = 'Variant Icon';
  
  // Create a simple representation using rectangles
  // Left arrow body
  const leftBody = figma.createRectangle();
  leftBody.resize(4, 1.5);
  leftBody.x = 2;
  leftBody.y = 7.25;
  leftBody.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  leftBody.strokes = [];
  leftBody.cornerRadius = 0.75;
  iconFrame.appendChild(leftBody);
  
  // Right arrow body
  const rightBody = figma.createRectangle();
  rightBody.resize(4, 1.5);
  rightBody.x = 10;
  rightBody.y = 7.25;
  rightBody.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  rightBody.strokes = [];
  rightBody.cornerRadius = 0.75;
  iconFrame.appendChild(rightBody);
  
  topRow.appendChild(iconFrame);

  const variantTypeLabel = figma.createText();
  variantTypeLabel.fontName = getFontStyle("Bold");
  variantTypeLabel.fontSize = TOKENS.fontSizeBodyMd;
  variantTypeLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  variantTypeLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
  variantTypeLabel.characters = 'Variant';
  variantTypeLabel.name = 'Variant Type Label';
  topRow.appendChild(variantTypeLabel);

  card.appendChild(topRow);

  // Image placeholder with checkerboard pattern
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

  // Variant details section: radio button + name + control label + traffic
  const variantDetailsContainer = figma.createFrame();
  variantDetailsContainer.layoutMode = 'VERTICAL';
  variantDetailsContainer.counterAxisSizingMode = 'AUTO';
  variantDetailsContainer.primaryAxisSizingMode = 'AUTO';
  variantDetailsContainer.itemSpacing = 12;
  variantDetailsContainer.fills = [];
  variantDetailsContainer.strokes = [];
  variantDetailsContainer.name = 'Variant Details';
  variantDetailsContainer.layoutAlign = 'STRETCH';
  variantDetailsContainer.paddingBottom = 12;
  variantDetailsContainer.paddingTop = 12;

  // Radio button + variant name row
  const nameRow = figma.createFrame();
  nameRow.layoutMode = 'HORIZONTAL';
  nameRow.counterAxisSizingMode = 'AUTO';
  nameRow.primaryAxisSizingMode = 'AUTO';
  nameRow.itemSpacing = TOKENS.space8;
  nameRow.primaryAxisAlignItems = 'MIN'; // Vertically distribute/center items along horizontal axis
  nameRow.counterAxisAlignItems = 'CENTER'; // Middle align vertically (center items in the row)
  // nameRow.height = 24; // Removed because .height is read-only for auto layout frames
  nameRow.fills = [];
  nameRow.strokes = [];
  nameRow.name = 'Name Row';
  nameRow.layoutAlign = 'MIN';

  // Blue radio button indicator
  const radioButton = figma.createEllipse();
  radioButton.resize(8, 8);
  radioButton.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.royalBlue600) }];
  radioButton.strokes = [];
  radioButton.name = 'Radio Button';
  nameRow.appendChild(radioButton);

  // Variant name (e.g., "Variant A")
  const variantNameText = figma.createText();
  variantNameText.fontName = getFontStyle("Bold");
  variantNameText.fontSize = TOKENS.fontSizeBodyLg;
  variantNameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  variantNameText.textAutoResize = 'WIDTH_AND_HEIGHT';
  const variantKey = variant.key || (variantIndex !== undefined ? String.fromCharCode(65 + variantIndex) : 'A');
  variantNameText.characters = `Variant ${variantKey}`;
  variantNameText.name = 'Variant Name';
  nameRow.appendChild(variantNameText);

  variantDetailsContainer.appendChild(nameRow);

  // Control label (if first variant or marked as control)
  const isControl = variantIndex === 0 || variant.key === 'A';
  if (isControl) {
    const controlLabel = figma.createText();
    controlLabel.fontName = getFontStyle("Regular");
    controlLabel.fontSize = TOKENS.fontSizeBodyMd;
    controlLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
    controlLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
    controlLabel.characters = '(Control)';
    controlLabel.name = 'Control Label';
    variantDetailsContainer.appendChild(controlLabel);
  }

  // Traffic percentage with icon
  const trafficRow = figma.createFrame();
  trafficRow.layoutMode = 'HORIZONTAL';
  trafficRow.counterAxisSizingMode = 'AUTO';
  trafficRow.primaryAxisSizingMode = 'AUTO';
  trafficRow.primaryAxisAlignItems = 'MIN'; // Vertically distribute/center items along horizontal axis
  trafficRow.counterAxisAlignItems = 'CENTER'; // Middle align vertically (center items in the row)
  // nameRow.height = 24; // Removed because .height is read-only for auto layout frames
  trafficRow.itemSpacing = TOKENS.space4;
  trafficRow.fills = [];
  trafficRow.strokes = [];
  trafficRow.name = 'Traffic Row';
  trafficRow.layoutAlign = 'MIN';

  // People icon (two stylized people)
  const peopleIcon = figma.createFrame();
  peopleIcon.resize(16, 16);
  peopleIcon.fills = [];
  peopleIcon.strokes = [];
  peopleIcon.name = 'People Icon';
  
  // Create simple people icon using ellipses
  const person1 = figma.createEllipse();
  person1.resize(6, 6);
  person1.x = 0;
  person1.y = 5;
  person1.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  person1.strokes = [];
  peopleIcon.appendChild(person1);
  
  const person2 = figma.createEllipse();
  person2.resize(6, 6);
  person2.x = 10;
  person2.y = 5;
  person2.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  person2.strokes = [];
  peopleIcon.appendChild(person2);
  
  trafficRow.appendChild(peopleIcon);

  // Traffic percentage text
  const trafficText = figma.createText();
  trafficText.fontName = getFontStyle("Regular");
  trafficText.fontSize = TOKENS.fontSizeBodyMd;
  trafficText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  trafficText.textAutoResize = 'WIDTH_AND_HEIGHT';
  const trafficValue = variant.traffic !== undefined ? variant.traffic : 0;
  trafficText.characters = `${trafficValue}%`;
  trafficText.name = 'Traffic Percentage';
  trafficRow.appendChild(trafficText);

  variantDetailsContainer.appendChild(trafficRow);
  card.appendChild(variantDetailsContainer);

  // Separator line
  const separator = figma.createFrame();
  separator.resize(268, 1);
  separator.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
  separator.strokes = [];
  separator.name = 'Separator';
  separator.layoutAlign = 'MIN';
  card.appendChild(separator);

  // Metrics section
  const metricsSection = figma.createFrame();
  metricsSection.layoutMode = 'VERTICAL';
  metricsSection.counterAxisSizingMode = 'AUTO';
  metricsSection.primaryAxisSizingMode = 'AUTO';
  metricsSection.itemSpacing = TOKENS.space12;
  metricsSection.fills = [];
  metricsSection.strokes = [];
  metricsSection.name = 'Metrics Section';
  metricsSection.paddingBottom = 12;
  metricsSection.paddingTop = 12;
  metricsSection.layoutAlign = 'MIN';

  // Metrics header
  const metricsHeader = figma.createText();
  metricsHeader.fontName = getFontStyle("Medium");
  metricsHeader.fontSize = TOKENS.fontSizeLabel;
  metricsHeader.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  metricsHeader.textAutoResize = 'WIDTH_AND_HEIGHT';
  metricsHeader.characters = 'Metrics';
  metricsHeader.name = 'Metrics Header';
  metricsSection.appendChild(metricsHeader);

  // Metrics values row
  const metricsRow = figma.createFrame();
  metricsRow.layoutMode = 'HORIZONTAL';
  metricsRow.counterAxisSizingMode = 'AUTO';
  metricsRow.primaryAxisSizingMode = 'AUTO';
  metricsRow.primaryAxisAlignItems = 'MIN'; // Vertically distribute/center items along horizontal axis
  metricsRow.counterAxisAlignItems = 'CENTER'; // Middle align vertically (center items in the row)
  // nameRow.height = 24; // Removed because .height is read-only for auto layout frames
  metricsRow.itemSpacing = TOKENS.space8;
  metricsRow.fills = [];
  metricsRow.strokes = [];
  metricsRow.name = 'Metrics Row';
  metricsRow.layoutAlign = 'MIN';

  // Format metrics with proper decimal places
  const formatMetric = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0.00';
    return value.toFixed(2);
  };

  // Create metric text items: **CTR** 0.00 format (bold label + regular value)
  const createMetricItem = (label: string, value: string): FrameNode => {
    const metricItem = figma.createFrame();
    metricItem.layoutMode = 'HORIZONTAL';
    metricItem.counterAxisSizingMode = 'AUTO';
    metricItem.primaryAxisSizingMode = 'AUTO';
    metricItem.itemSpacing = 4;
    metricItem.fills = [];
    metricItem.strokes = [];
    metricItem.name = `${label} Metric Item`;
    
    // Bold label
    const labelText = figma.createText();
    labelText.fontName = getFontStyle("Bold");
    labelText.fontSize = TOKENS.fontSizeBodySm;
    labelText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    labelText.textAutoResize = 'WIDTH_AND_HEIGHT';
    labelText.characters = label;
    labelText.name = `${label} Label`;
    metricItem.appendChild(labelText);
    
    // Regular value
    const valueText = figma.createText();
    valueText.fontName = getFontStyle("Regular");
    valueText.fontSize = TOKENS.fontSizeBodyMd;
    valueText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
    valueText.textAutoResize = 'WIDTH_AND_HEIGHT';
    valueText.characters = value;
    valueText.name = `${label} Value`;
    metricItem.appendChild(valueText);
    
    return metricItem;
  };

  if (variant.metrics?.ctr !== undefined) {
    const ctrItem = createMetricItem('CTR', formatMetric(variant.metrics.ctr));
    metricsRow.appendChild(ctrItem);
  }
  if (variant.metrics?.cr !== undefined) {
    const crItem = createMetricItem('CR', formatMetric(variant.metrics.cr));
    metricsRow.appendChild(crItem);
  }
  if (variant.metrics?.su !== undefined) {
    const suItem = createMetricItem('SU', formatMetric(variant.metrics.su));
    metricsRow.appendChild(suItem);
  }

  // Fallback if no metrics
  if (metricsRow.children.length === 0) {
    const defaultCtr = createMetricItem('CTR', '0.00');
    const defaultCr = createMetricItem('CR', '0.00');
    const defaultSu = createMetricItem('SU', '0.00');
    metricsRow.appendChild(defaultCtr);
    metricsRow.appendChild(defaultCr);
    metricsRow.appendChild(defaultSu);
  }

  metricsSection.appendChild(metricsRow);
  card.appendChild(metricsSection);

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
