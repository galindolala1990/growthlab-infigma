// experiment-node.ts
// Modularized node creation functions for Figma plugin

import { TOKENS } from './design-tokens';
import { hexToRgb, getFontStyle } from './layout-utils';

/**
 * Create an icon from SVG string using Figma's importSVGAsync
 * @param svgString - Complete SVG string
 * @param size - Desired icon size
 * @param name - Node name
 * @returns Promise<FrameNode> containing the imported SVG
 */
async function createIconFromSVG(
  svgString: string,
  size: number = 16,
  name: string = 'Icon',
  color: RGB = { r: 0, g: 0, b: 0 } // Default black
): Promise<FrameNode> {
  // Create container frame first
  const frame = figma.createFrame();
  frame.resize(size, size);
  frame.fills = [];
  frame.strokes = [];
  frame.name = name;
  frame.clipsContent = false;

  try {
    // Check if importSVGAsync exists
    if (typeof (figma as any).importSVGAsync !== 'function') {
      console.warn('importSVGAsync not available, using fallback');
      return frame;
    }

    // Use type assertion to access importSVGAsync (may not be in TypeScript types)
    const importedNode = await (figma as any).importSVGAsync(svgString);
    
    if (!importedNode) {
      console.warn('importSVGAsync returned null/undefined');
      return frame;
    }
    
    // Recursively update stroke colors to the desired color
    function updateStrokeColors(node: SceneNode) {
      if (node.type === 'VECTOR') {
        if (node.strokes && node.strokes.length > 0) {
          node.strokes = [{ type: 'SOLID', color }];
        }
      } else if ('children' in node) {
        for (const child of node.children) {
          updateStrokeColors(child);
        }
      }
    }
    updateStrokeColors(importedNode);
    
    // Append the imported node to frame
    frame.appendChild(importedNode);
    
    // Scale the imported node to fit the desired size
    // The SVG has viewBox="0 0 16 16", so we need to scale it
    const scale = size / 16;
    if (importedNode.width > 0 && importedNode.height > 0) {
      importedNode.resize(importedNode.width * scale, importedNode.height * scale);
    } else {
      // If width/height are 0, try to set a default size
      importedNode.resize(size, size);
    }
    
    // Center the imported node in the frame
    importedNode.x = (size - importedNode.width) / 2;
    importedNode.y = (size - importedNode.height) / 2;
    
    return frame;
  } catch (error) {
    console.error('Failed to import SVG:', error);
    // Fallback: create a simple placeholder rectangle so something is visible
    const placeholder = figma.createRectangle();
    placeholder.resize(size, size);
    placeholder.fills = [{ type: 'SOLID', color }];
    placeholder.strokes = [];
    placeholder.cornerRadius = 2;
    frame.appendChild(placeholder);
    return frame;
  }
}




export function createEventCard(eventName: string, variantCount?: number): FrameNode {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'AUTO';
  card.primaryAxisSizingMode = 'AUTO';
  card.minWidth = 300; // 18.75rem
  card.maxWidth = 400; // 25rem
  card.resize(300, 280); // Default width 300px (18.75rem)
  card.paddingLeft = 16;
  card.paddingRight = 16;
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
    placeholder.layoutMode = 'NONE';
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
  eventNameText.textAlignHorizontal = 'LEFT';
  eventNameText.characters = eventName || 'Event Name';
  eventNameText.name = 'Event Name Text';
  card.appendChild(eventNameText);

  const subtitleText = figma.createText();
  subtitleText.fontName = getFontStyle("Regular");
  subtitleText.fontSize = TOKENS.fontSizeBodyMd;
  subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
  subtitleText.textAlignHorizontal = 'LEFT';
  const count = variantCount ?? 0;
  subtitleText.characters = `${count} variant${count !== 1 ? 's' : ''}`;
  subtitleText.name = 'Number of Variants';
  card.appendChild(subtitleText);

  return card;
}

import type { Variant } from './code';

export async function createVariantCard(variant: Variant, variantIndex?: number): Promise<FrameNode> {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'AUTO';
  card.primaryAxisSizingMode = 'AUTO';
  card.minWidth = 300; // 18.75rem
  card.maxWidth = 400; // 25rem
  card.resize(300, 400); // Default width 300px (18.75rem)
  card.paddingLeft = 16;
  card.paddingRight = 16;
  card.paddingTop = 16; // 1rem
  card.paddingBottom = 16; // 0.75rem
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
  topRow.primaryAxisAlignItems = 'MIN'; // Vertically distribute/center items along horizontal axis
  topRow.counterAxisAlignItems = 'CENTER'; // Middle align vertically (center items in the row)
  // topRow.height = 24; // Removed because .height is read-only for auto layout frames
  topRow.itemSpacing = TOKENS.space4;
  topRow.fills = [];
  topRow.strokes = [];
  topRow.name = 'Top Row';
  topRow.layoutAlign = 'MIN'; // Left align to match card alignment

  // Icon: split icon representation using simple rectangles (fallback approach)
  // SVG import is not reliable, so using simple shapes that work consistently
  // HIDDEN: Icon is hidden per user request
  const iconFrame = figma.createFrame();
  iconFrame.resize(16, 16);
  iconFrame.fills = [];
  iconFrame.strokes = [];
  iconFrame.name = 'Variant Icon';
  iconFrame.visible = false; // Hide the icon
  
  // Create a simple split icon representation using rectangles
  // Left arrow pointing left
  const leftArrow = figma.createRectangle();
  leftArrow.resize(3, 1.5);
  leftArrow.x = 2;
  leftArrow.y = 7.25;
  leftArrow.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  leftArrow.strokes = [];
  leftArrow.cornerRadius = 0.75;
  iconFrame.appendChild(leftArrow);
  
  // Right arrow pointing right
  const rightArrow = figma.createRectangle();
  rightArrow.resize(3, 1.5);
  rightArrow.x = 11;
  rightArrow.y = 7.25;
  rightArrow.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
  rightArrow.strokes = [];
  rightArrow.cornerRadius = 0.75;
  iconFrame.appendChild(rightArrow);
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

  // Radio button indicator (uses variant color)
  const radioButton = figma.createEllipse();
  radioButton.resize(10, 10);
  const variantColor = (variant as any).color || TOKENS.royalBlue600;
  radioButton.fills = [{ type: 'SOLID', color: hexToRgb(variantColor) }];
  radioButton.strokes = [];
  radioButton.name = 'Radio Button';
  nameRow.appendChild(radioButton);

  // Variant name (e.g., "Variant A")
  const variantNameText = figma.createText();
  variantNameText.fontName = getFontStyle("Bold");
  variantNameText.fontSize = TOKENS.fontSizeBodyLg;
  variantNameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  variantNameText.textAutoResize = 'WIDTH_AND_HEIGHT';
  const variantName = variant.name || (variantIndex !== undefined ? String.fromCharCode(65 + variantIndex) : 'A');
  variantNameText.characters = `${variantName}`;
  variantNameText.name = 'Variant Name';
  nameRow.appendChild(variantNameText);

  variantDetailsContainer.appendChild(nameRow);

  // Variant label (shows variant description for all variants)
  const variantLabel = figma.createText();
  variantLabel.fontName = getFontStyle("Regular");
  variantLabel.fontSize = TOKENS.fontSizeBodyMd;
  variantLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
  variantLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
  variantLabel.characters = (variant as any).description || '';
  variantLabel.name = 'Variant Label';
  variantDetailsContainer.appendChild(variantLabel);

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
  // HIDDEN: Icon is hidden per user request
  const peopleIcon = figma.createFrame();
  peopleIcon.resize(16, 16);
  peopleIcon.fills = [];
  peopleIcon.strokes = [];
  peopleIcon.name = 'People Icon';
  peopleIcon.visible = false; // Hide the icon
  
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
  trafficText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
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
  metricsHeader.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
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
    labelText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
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
