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
  card.resize(300, 270); // Default width 300px (18.75rem)
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
  card.itemSpacing = 8; // 1rem gap
  card.primaryAxisAlignItems = 'MIN';
  card.counterAxisAlignItems = 'MIN';
  card.name = `Event: ${eventName}`;

  // Event label (above thumbnail)
  const eventLabel = figma.createText();
  eventLabel.fontName = getFontStyle("Bold");
  eventLabel.fontSize = TOKENS.fontSizeBodySm;
  eventLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  eventLabel.opacity = 0.5;
  eventLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
  eventLabel.characters = 'Event';
  eventLabel.name = 'Event Label';
  card.appendChild(eventLabel);

  let thumb: FrameNode;
  const selection = figma.currentPage.selection;
  
  // Check if user has selected a Frame or Rectangle to use as thumbnail
  if (selection && selection.length > 0) {
    const selectedNode = selection[0];
    
    // If it's already a Frame, clone it directly
    if (selectedNode.type === 'FRAME') {
      thumb = selectedNode.clone() as FrameNode;
      thumb.resize(268, 160);
      thumb.cornerRadius = TOKENS.radiusSM;
      thumb.name = 'Thumbnail - Replace with image';
      thumb.layoutAlign = 'MIN';
      thumb.clipsContent = true;
    }
    // If it's a Rectangle (with or without image fill), wrap it in a Frame
    else if (selectedNode.type === 'RECTANGLE') {
      const rect = selectedNode.clone() as RectangleNode;
      thumb = figma.createFrame();
      thumb.layoutMode = 'NONE';
      thumb.resize(268, 160);
      thumb.cornerRadius = TOKENS.radiusSM;
      thumb.name = 'Thumbnail - Replace with image';
      thumb.layoutAlign = 'MIN';
      thumb.clipsContent = true;
      
      // Resize and center the rectangle in the frame
      rect.resize(268, 160);
      rect.x = 0;
      rect.y = 0;
      if ('cornerRadius' in rect) rect.cornerRadius = TOKENS.radiusSM;
      thumb.appendChild(rect);
    }
    // For other node types (GROUP, etc.), wrap in a Frame
    else {
      const clonedNode = selectedNode.clone();
      thumb = figma.createFrame();
      thumb.layoutMode = 'NONE';
      thumb.resize(268, 160);
      thumb.cornerRadius = TOKENS.radiusSM;
      thumb.name = 'Thumbnail - Replace with image';
      thumb.layoutAlign = 'MIN';
      thumb.clipsContent = true;
      
      // Scale and center the cloned node to fit (only if it supports resize)
      if ('resize' in clonedNode && typeof clonedNode.resize === 'function') {
        const scaleX = 268 / clonedNode.width;
        const scaleY = 160 / clonedNode.height;
        const scale = Math.min(scaleX, scaleY);
        clonedNode.resize(clonedNode.width * scale, clonedNode.height * scale);
        clonedNode.x = (268 - clonedNode.width) / 2;
        clonedNode.y = (160 - clonedNode.height) / 2;
      }
      thumb.appendChild(clonedNode);
    }
  } else {
    // Create empty placeholder Frame ready for "Replace with"
    const placeholder = figma.createFrame();
    placeholder.layoutMode = 'NONE';
    placeholder.resize(268, 160);
    placeholder.cornerRadius = TOKENS.radiusSM;
    placeholder.name = 'Thumbnail - Replace with image';
    placeholder.layoutAlign = 'MIN';
    placeholder.clipsContent = true;
    placeholder.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBackground) }];
    placeholder.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
    placeholder.strokeWeight = 1;
    // Empty Frame with background fill - ready for "Replace with"
    thumb = placeholder;
  }
  card.appendChild(thumb);

  // Group Event Name Text and Number of Variants
  const eventDetailsContainer = figma.createFrame();
  eventDetailsContainer.layoutMode = 'VERTICAL';
  eventDetailsContainer.counterAxisSizingMode = 'AUTO';
  eventDetailsContainer.primaryAxisSizingMode = 'AUTO';
  eventDetailsContainer.itemSpacing = 8;
  eventDetailsContainer.fills = [];
  eventDetailsContainer.strokes = [];
  eventDetailsContainer.name = 'Event Details Container';
  eventDetailsContainer.layoutAlign = 'STRETCH';
  eventDetailsContainer.paddingBottom = 0;
  eventDetailsContainer.paddingTop = 8;

  const eventNameText = figma.createText();
  eventNameText.fontName = getFontStyle("Bold");
  eventNameText.fontSize = TOKENS.fontSizeBodyLg;
  eventNameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  eventNameText.textAutoResize = 'WIDTH_AND_HEIGHT';
  eventNameText.textAlignHorizontal = 'LEFT';
  // Auto-number fallback: if eventName is empty, use 'Event <n>'
  // Try to extract a number from the card name if possible
  let fallbackEventNumber = 1;
  const match = card.name.match(/Event: (\\d+)/);
  if (!eventName && match && match[1]) {
    fallbackEventNumber = parseInt(match[1], 10);
  }
  eventNameText.characters = eventName || `Event ${fallbackEventNumber}`;
  eventNameText.name = 'Event Name Text';
  eventDetailsContainer.appendChild(eventNameText);

  const subtitleText = figma.createText();
  subtitleText.fontName = getFontStyle("Regular");
  subtitleText.fontSize = TOKENS.fontSizeBodyMd;
  subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
  subtitleText.textAlignHorizontal = 'LEFT';
  const count = variantCount ?? 0;
  subtitleText.characters = `${count} variant${count !== 1 ? 's' : ''}`;
  subtitleText.name = 'Number of Variants';
  eventDetailsContainer.appendChild(subtitleText);

  card.appendChild(eventDetailsContainer);

  return card;
}

import type { Variant } from './code';

export interface MetricDefinition {
  id: string;
  name: string;
  abbreviation?: string;
  min?: number;
  max?: number;
}

export async function createVariantCard(
  variant: Variant, 
  variantIndex?: number, 
  options?: { 
    rolledout?: boolean;
    winningMetrics?: Record<string, string>; // Metric key -> Variant ID that wins this metric
    variantId?: string; // Current variant ID for comparison
    isRecommendedWinner?: boolean; // Whether this variant is the recommended winner based on metrics
    metrics?: MetricDefinition[]; // Available metrics from plugin
  }
): Promise<FrameNode> {
  const card = figma.createFrame();
  card.layoutMode = 'VERTICAL';
  card.counterAxisSizingMode = 'AUTO';
  card.primaryAxisSizingMode = 'AUTO';
  card.minWidth = 300; // 18.75rem
  card.maxWidth = 400; // 25rem
  // Height will hug content automatically with primaryAxisSizingMode = 'AUTO'
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
  card.itemSpacing = 8; // 1rem gap
  card.primaryAxisAlignItems = 'MIN';
  card.counterAxisAlignItems = 'MIN';

  // ...top row removed...

  // Variant type label (above thumbnail)
  const variantTypeLabel = figma.createText();
  variantTypeLabel.fontName = getFontStyle("Bold");
  variantTypeLabel.fontSize = TOKENS.fontSizeBodySm;
  variantTypeLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  variantTypeLabel.opacity = 0.5;
  variantTypeLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
  variantTypeLabel.characters = `Variant`;
  variantTypeLabel.name = 'Variant Type Label';
  card.appendChild(variantTypeLabel);

  // Empty placeholder Frame ready for "Replace with"
  const thumb = figma.createFrame();
  thumb.layoutMode = 'NONE';
  thumb.resize(268, 160);
  thumb.cornerRadius = TOKENS.radiusSM;
  thumb.name = 'Thumbnail - Replace with image';
  thumb.layoutAlign = 'MIN';
  thumb.clipsContent = true;
  thumb.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBackground) }];
  thumb.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
  thumb.strokeWeight = 1;
  // Empty Frame with background fill - ready for "Replace with"
  card.appendChild(thumb);

  // Variant details section: name row + control label + traffic
  const variantDetailsContainer = figma.createFrame();
  variantDetailsContainer.layoutMode = 'VERTICAL';
  variantDetailsContainer.counterAxisSizingMode = 'AUTO';
  variantDetailsContainer.primaryAxisSizingMode = 'AUTO';
  variantDetailsContainer.itemSpacing = 8;
  variantDetailsContainer.fills = [];
  variantDetailsContainer.strokes = [];
  variantDetailsContainer.name = 'Variant Details';
  variantDetailsContainer.layoutAlign = 'STRETCH';
  variantDetailsContainer.paddingBottom = 8 ;
  variantDetailsContainer.paddingTop = 8;

  // Radio button + variant name row
  const nameRow = figma.createFrame();
  nameRow.layoutMode = 'HORIZONTAL';
  nameRow.counterAxisSizingMode = 'AUTO';
  nameRow.primaryAxisSizingMode = 'AUTO';
  nameRow.itemSpacing = 6;
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

  // Variant name (with fallback logic always applied)
  const variantNameText = figma.createText();
  variantNameText.fontName = getFontStyle("Bold");
  variantNameText.fontSize = TOKENS.fontSizeBodyLg;
  variantNameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  variantNameText.textAutoResize = 'WIDTH_AND_HEIGHT';
  // Always apply fallback: if name is empty, whitespace, or missing, use 'Variant <index+1>'
  let displayName = (typeof variant.name === 'string' && variant.name.trim().length > 0)
    ? variant.name
    : (variantIndex !== undefined ? `Variant ${variantIndex + 1}` : 'Variant');
  variantNameText.characters = displayName;
  variantNameText.name = 'Variant Name';
  nameRow.appendChild(variantNameText);

  variantDetailsContainer.appendChild(nameRow);

  // Variant label (shows variant description for all variants)
  const variantLabel = figma.createText();
  variantLabel.fontName = getFontStyle("Regular");
  variantLabel.fontSize = TOKENS.fontSizeBodyMd;
  variantLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  variantLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
  variantLabel.characters = (variant as any).description || 'Variant description goes here.';
  variantLabel.name = 'Variant Label';
  variantDetailsContainer.appendChild(variantLabel);

  // Add status badges row (Recommended winner/Running/Rolled-out) - moved below variant label
  const badgesRow = figma.createFrame();
  badgesRow.layoutMode = 'HORIZONTAL';
  badgesRow.counterAxisSizingMode = 'AUTO';
  badgesRow.primaryAxisSizingMode = 'AUTO';
  badgesRow.itemSpacing = TOKENS.space8;
  badgesRow.fills = [];
  badgesRow.strokes = [];
  badgesRow.name = 'Status Badges Row';
  badgesRow.layoutAlign = 'MIN';
  badgesRow.layoutGrow = 0;

  // Recommended winner badge (based on metrics outcomes)
  if (options?.isRecommendedWinner) {
    const winnerBadge = figma.createFrame();
    winnerBadge.layoutMode = 'HORIZONTAL';
    winnerBadge.counterAxisSizingMode = 'AUTO';
    winnerBadge.primaryAxisSizingMode = 'AUTO';
    winnerBadge.paddingLeft = 6;
    winnerBadge.paddingRight = 6;
    winnerBadge.paddingTop = 2;
    winnerBadge.paddingBottom = 2;
    winnerBadge.cornerRadius = 4;
    winnerBadge.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.malachite100) }];
    winnerBadge.strokes = [];
    winnerBadge.name = 'Recommended Winner Badge';
    
    const winnerText = figma.createText();
    winnerText.fontName = getFontStyle("Medium");
    winnerText.fontSize = TOKENS.fontSizeBodyMd;
    winnerText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.malachite800) }];
    winnerText.textAutoResize = 'WIDTH_AND_HEIGHT';
    winnerText.characters = 'Recommended';
    winnerText.name = 'Recommended Winner Text';
    winnerBadge.appendChild(winnerText);
    badgesRow.appendChild(winnerBadge);
  }

  // Running badge
  if (variant.status === 'running') {
    const runningBadge = figma.createFrame();
    runningBadge.layoutMode = 'HORIZONTAL';
    runningBadge.counterAxisSizingMode = 'AUTO';
    runningBadge.primaryAxisSizingMode = 'AUTO';
    runningBadge.paddingLeft = 6;
    runningBadge.paddingRight = 6;
    runningBadge.paddingTop = 2;
    runningBadge.paddingBottom = 2;
    runningBadge.cornerRadius = 4;
    runningBadge.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.royalBlue50) }];
    runningBadge.strokes = [];
    runningBadge.name = 'Running Badge';
    
    const runningText = figma.createText();
    runningText.fontName = getFontStyle("Bold");
    runningText.fontSize = TOKENS.fontSizeBodySm;
    runningText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.royalBlue600) }];
    runningText.textAutoResize = 'WIDTH_AND_HEIGHT';
    runningText.characters = 'Running';
    runningText.name = 'Running Text';
    runningBadge.appendChild(runningText);
    badgesRow.appendChild(runningBadge);
  }

  // Rolled-out badge (NEW)
  if (options?.rolledout) {
    const rolledoutBadge = figma.createFrame();
    rolledoutBadge.layoutMode = 'HORIZONTAL';
    rolledoutBadge.counterAxisSizingMode = 'AUTO';
    rolledoutBadge.primaryAxisSizingMode = 'AUTO';
    rolledoutBadge.paddingLeft = 6;
    rolledoutBadge.paddingRight = 6;
    rolledoutBadge.paddingTop = 2;
    rolledoutBadge.paddingBottom = 2;
    rolledoutBadge.cornerRadius = 4;
    rolledoutBadge.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBrand) }];
    rolledoutBadge.strokes = [];
    rolledoutBadge.name = 'Rolled-out Badge';
    
    const rolledoutText = figma.createText();
    rolledoutText.fontName = getFontStyle("Bold");
    rolledoutText.fontSize = TOKENS.fontSizeBodyMd;
    rolledoutText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.white) }];
    rolledoutText.textAutoResize = 'WIDTH_AND_HEIGHT';
    rolledoutText.characters = 'Rolled-out';
    rolledoutText.name = 'Rolled-out Text';
    rolledoutBadge.appendChild(rolledoutText);
    badgesRow.appendChild(rolledoutBadge);
  }

  // Only append badges row if there are badges to show
  if (badgesRow.children.length > 0) {
    variantDetailsContainer.appendChild(badgesRow);
  }

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
  metricsSection.itemSpacing = TOKENS.space8;
  metricsSection.fills = [];
  metricsSection.strokes = [];
  metricsSection.name = 'Metrics Section';
  metricsSection.paddingBottom = 0;
  metricsSection.paddingTop = 8;
  metricsSection.layoutAlign = 'STRETCH';

  // Metrics header
  const metricsHeader = figma.createText();
  metricsHeader.fontName = getFontStyle("Bold");
  metricsHeader.fontSize = TOKENS.fontSizeBodySm;
  metricsHeader.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  metricsHeader.opacity = 0.5;
  metricsHeader.textAutoResize = 'WIDTH_AND_HEIGHT';
  metricsHeader.characters = 'Metrics';
  metricsHeader.name = 'Metrics Header';
  metricsSection.appendChild(metricsHeader);

  // Format metrics with proper decimal places
  const formatMetric = (value: number | undefined): string => {
    if (value === undefined || value === null) return '0.00';
    return value.toFixed(2);
  };

  // Create metric text items: metric name (abbreviation): value format
  // If this variant wins the metric, style the value like winner badge
  const createMetricItem = (metricName: string, abbreviation: string, value: string, isWinner: boolean = false): FrameNode => {
    const metricItem = figma.createFrame();
    metricItem.layoutMode = 'HORIZONTAL';
    metricItem.counterAxisSizingMode = 'AUTO';
    metricItem.primaryAxisSizingMode = 'AUTO';
    metricItem.layoutAlign = 'STRETCH'; // Stretch to parent width
    metricItem.primaryAxisAlignItems = 'SPACE_BETWEEN'; // Space between label (left) and value badge (right)
    metricItem.itemSpacing = 8;
    metricItem.fills = [];
    metricItem.strokes = [];
    metricItem.name = `${metricName} Metric Item`;
    metricItem.counterAxisAlignItems = 'CENTER'; // Middle align vertically (center items in the row)
    // metricItem.height = 24; // Removed because .height is read-only for auto layout frames
    
    // Label: metric name (abbreviation):
    const labelText = figma.createText();
    labelText.fontName = getFontStyle("Regular");
    labelText.fontSize = TOKENS.fontSizeBodyMd;
    labelText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    labelText.textAutoResize = 'WIDTH_AND_HEIGHT';
    labelText.characters = `${metricName} (${abbreviation}):`;
    labelText.name = `${metricName} Label`;
    metricItem.appendChild(labelText);
    
    // Value - always displayed as badge, with winner styling if this variant wins
    const valueBadge = figma.createFrame();
    valueBadge.layoutMode = 'HORIZONTAL';
    valueBadge.counterAxisSizingMode = 'AUTO';
    valueBadge.primaryAxisSizingMode = 'AUTO';
    valueBadge.paddingLeft = 6;
    valueBadge.paddingRight = 6;
    valueBadge.paddingTop = 2;
    valueBadge.paddingBottom = 2;
    valueBadge.cornerRadius = 4;
    
    if (isWinner) {
      // Winner value: green background
      valueBadge.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.malachite100) }];
    } else {
      // Regular value: light gray background
      valueBadge.fills = [{ type: 'SOLID', color: hexToRgb('#F5F6F8') }];
    }
    
    valueBadge.strokes = [];
    valueBadge.name = `${metricName} Value Badge`;
    
    const valueText = figma.createText();
    if (isWinner) {
      valueText.fontName = getFontStyle("Medium");
      valueText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.malachite800) }];
    } else {
      valueText.fontName = getFontStyle("Medium");
      valueText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
    }
    valueText.fontSize = TOKENS.fontSizeBodyMd;
    valueText.textAutoResize = 'WIDTH_AND_HEIGHT';
    valueText.characters = value;
    valueText.name = `${metricName} Value`;
    valueBadge.appendChild(valueText);
    metricItem.appendChild(valueBadge);
    
    return metricItem;
  };

  // Display only metrics that are defined in the plugin
  const variantId = options?.variantId || (variant as any).id;
  const winningMetrics = options?.winningMetrics || {};
  const availableMetrics = options?.metrics || [];
  
  // Generate metric key from abbreviation or name (same logic as UI)
  const getMetricKey = (metric: MetricDefinition): string => {
    if (metric.abbreviation) {
      return metric.abbreviation.toLowerCase();
    }
    return metric.name.replace(/\s+/g, '_').toLowerCase();
  };
  
  // Display each available metric (show all defined metrics, even if no value)
  for (const metric of availableMetrics) {
    if (!metric.name) continue; // Skip metrics without a name
    
    const metricKey = getMetricKey(metric);
    const metricValueRaw = (variant.metrics as any)?.[metricKey];
    
    // Use the value if it exists, otherwise default to 0
    // This ensures all defined metrics appear in variant cards
    const metricValue = metricValueRaw !== undefined && metricValueRaw !== null && metricValueRaw !== '' 
      ? (typeof metricValueRaw === 'number' ? metricValueRaw : parseFloat(String(metricValueRaw)) || 0)
      : 0;
    
    const isWinner = winningMetrics[metricKey] === variantId;
    const metricName = metric.name;
    const abbreviation = metric.abbreviation || metric.name;
    const metricItem = createMetricItem(metricName, abbreviation, formatMetric(metricValue), isWinner);
    metricsSection.appendChild(metricItem);
  }

  card.appendChild(metricsSection);
  
  // After metrics section is added to card, resize metric items to match section width
  // This ensures they stretch to full width
  if (metricsSection.children.length > 1) { // More than just the header
    const sectionWidth = metricsSection.width;
    for (let i = 1; i < metricsSection.children.length; i++) {
      const metricItem = metricsSection.children[i] as FrameNode;
      if (metricItem.type === 'FRAME') {
        metricItem.resize(sectionWidth, metricItem.height);
      }
    }
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
