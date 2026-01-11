// ...existing code...
  // Delete frames named 'Sample Experiment Flow' or matching 'Experiment Flow' patterns
  function deleteExperimentFlowFrames() {
    const pattern = /Sample Experiment Flow|Experiment Flow.*|undefined/i;
    const frames = figma.currentPage.findAll(node =>
      node.type === "FRAME" && pattern.test(node.name)
    );
    for (const frame of frames) {
      frame.remove();
    }
  }
  // Utility: Convert hex color to RGB
  function hexToRgb(hex: string): RGB {
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

  // Create an Event Card styled similarly to Variant Card -- ACTUAL CARD
  function createEventCard(eventName: string): FrameNode {
    // Card container
    const card = figma.createFrame();
    card.resize(300, 280);
    card.layoutMode = 'VERTICAL';
    card.counterAxisSizingMode = 'FIXED';
    card.primaryAxisSizingMode = 'FIXED';
    // Use design token variable for padding
    card.paddingLeft = card.paddingRight = TOKENS.space16;
    card.paddingTop = card.paddingBottom = TOKENS.space16;
    card.cornerRadius = TOKENS.radiusLG;
    card.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsSurface) }];
    card.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
    card.strokeWeight = 0;
    card.effects = [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.05 },
      offset: { x: 0, y: 1 },
      radius: 2,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL',
    }];
    card.name = `Event: ${eventName}`;

    // Top Row: Icon and label
    const topRow = figma.createFrame();
    topRow.layoutMode = 'HORIZONTAL';
    topRow.counterAxisSizingMode = 'AUTO';
    topRow.primaryAxisSizingMode = 'AUTO';
    topRow.itemSpacing = TOKENS.space4;
    topRow.fills = [];
    topRow.strokes = [];
    topRow.name = 'Top Row';
    topRow.layoutAlign = 'MIN';

    // Removed Event Icon

    // "Event" label
    const eventLabel = figma.createText();
    eventLabel.fontName = { family: TOKENS.fontFamily, style: "Bold" };
    eventLabel.fontSize = TOKENS.fontSizeBodyMd;
    eventLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    eventLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
    eventLabel.characters = 'Event';
    eventLabel.name = 'Event Label';
    topRow.appendChild(eventLabel);

    card.appendChild(topRow);

    // Thumbnail area: use selected image if available, else placeholder
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
      // Clone the selected image node and resize for thumbnail
      thumb = imageNode.clone();
      thumb.resize(268, 160);
      if ('cornerRadius' in thumb) thumb.cornerRadius = 16;
      thumb.name = 'Thumbnail';
      thumb.layoutAlign = 'MIN';
    } else {
      // Fallback: checkerboard placeholder frame
      const placeholder = figma.createFrame();
      placeholder.resize(268, 160);
      placeholder.cornerRadius = TOKENS.radiusSM;
      placeholder.name = 'Thumbnail';
      placeholder.layoutAlign = 'MIN';
      placeholder.clipsContent = true;
      // Checkerboard pattern: 8x8 grid, 32x32px squares
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
          placeholder.appendChild(square);
        }
      }
      placeholder.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
      placeholder.strokeWeight = 1;
      thumb = placeholder;
    }
    card.appendChild(thumb);

    // No variant name heading in event card; only event name is shown

    // Event name as heading
    const eventNameText = figma.createText();
    eventNameText.fontName = { family: TOKENS.fontFamily, style: "Bold" };
    eventNameText.fontSize = TOKENS.fontSizeBodyLg;
    eventNameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    eventNameText.textAutoResize = 'WIDTH_AND_HEIGHT';
    eventNameText.characters = 'Event Name';
    eventNameText.name = 'Event Name Text';
    card.appendChild(eventNameText);



    // Subtitle for variants (default: 0 variants)
    const subtitleText = figma.createText();
    subtitleText.fontName = { family: TOKENS.fontFamily, style: "Regular" };
    subtitleText.fontSize = TOKENS.fontSizeBodyMd;
    subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    subtitleText.characters = '0 variants';
    subtitleText.name = 'Number of Variants';
    card.appendChild(subtitleText);

    // Alignment: distribute vertically, align all left
    card.primaryAxisAlignItems = 'MIN';
    card.counterAxisAlignItems = 'MIN';
    card.itemSpacing = TOKENS.space12;

    return card;
  }
interface CreateFlowPayload {
  experimentName: string;
  roundNumber: number;
  entryLabel: string;
  exitLabel: string;
  variants: Variant[];
  experimentDescription?: string;
  figmaLink?: string;
  jiraLink?: string;
  miroLink?: string;
}

interface PluginMessage {
  type: string;
  payload?: CreateFlowPayload;
}
/// <reference types="@figma/plugin-typings" />
/* eslint-disable no-inner-declarations */

type VariantStatus = "running" | "winner" | "none";

type VariantMetrics = {
  ctr: number;
  cr: number;
  su: number;
};

type Variant = {
  key: string;        // "A", "B", "C"
  name: string;       // "Black btn"
  traffic: number;    // 50, 25, etc
  status: VariantStatus;
  metrics: VariantMetrics;
};

const KEEP_OPEN = true;


import { TOKENS } from './design-tokens';
import { createExperimentInfoCard } from './experiment-info-card';

if (figma.editorType === 'figma') {

  // --- SAMPLE DATA (mirrors UI sample) ---
  const sampleEvents = [
    {
      id: 'event-0', // THIS IS AN EVENT ID IN AN EVENT CARD
      name: 'Landing page', // THIS IS THE EVENT NAME IN AN EVENT CARD
      hasVariants: false, // THIS IS AN EVENT WITHOUT VARIANTS  
      variants: [] // THIS IS AN EMPTY VARIANTS ARRAY FOR AN EVENT WITHOUT VARIANTS
    },
    {
      id: 'event-1', // THIS IS AN EVENT ID IN AN EVENT CARD
      name: 'Conversion button', // THIS IS THE EVENT NAME IN AN EVENT CARD
      hasVariants: true, // THIS IS AN EVENT WITH VARIANTS
      variants: [
        {
          key: 'A', // THIS IS A VARIANT KEY IN AN VARIANT CARD, RELATED TO AN EVENT
          name: 'Control', // THIS IS A VARIANT NAME IN AN VARIANT CARD, RELATED TO AN EVENT
          description: 'Original version without changes', // THIS IS A VARIANT DESCRIPTION IN AN VARIANT CARD, RELATED TO AN EVENT
          color: '#2563eb', // THIS IS THE COLOR FOR THIS VARIANT IN AN EVENT CARD
          traffic: 50, // THIS IS THE TRAFFIC PERCENTAGE FOR THIS VARIANT IN AN EVENT CARD
          status: 'none' as VariantStatus, // THIS IS THE STATUS FOR THIS VARIANT IN AN EVENT CARD
          metrics: { ctr: 0.695, cr: 0.425, su: 0.0 } // THIS IS THE METRICS FOR THIS VARIANT IN AN EVENT CARD
        },
        {
          key: 'B', // THIS IS A VARIANT KEY IN AN VARIANT CARD, RELATED TO AN EVENT
          name: 'Variation A',  // THIS IS A VARIANT NAME IN AN VARIANT CARD, RELATED TO AN EVENT
          description: 'New CTA button design', // THIS IS A VARIANT DESCRIPTION IN AN VARIANT CARD, RELATED TO AN EVENT  
          color: '#0eab43', // THIS IS THE COLOR FOR THIS VARIANT IN AN EVENT CARD
          traffic: 30, // THIS IS THE TRAFFIC PERCENTAGE FOR THIS VARIANT IN AN EVENT CARD  
          status: 'running' as VariantStatus, // THIS IS THE STATUS FOR THIS VARIANT IN AN EVENT CARD
          metrics: { ctr: 0.725, cr: 0.480, su: 0.0 } // THIS IS THE METRICS FOR THIS VARIANT IN AN EVENT CARD
        },
        {
          key: 'C', // THIS IS A VARIANT KEY IN AN VARIANT CARD, RELATED TO AN EVENT
          name: 'Variation B', // THIS IS A VARIANT NAME IN AN VARIANT CARD, RELATED TO AN EVENT
          description: 'CTA with icon', // THIS IS A VARIANT DESCRIPTION IN AN VARIANT CARD, RELATED TO AN EVENT
          color: '#f59e42', // THIS IS THE COLOR FOR THIS VARIANT IN AN EVENT CARD
          traffic: 20, // THIS IS THE TRAFFIC PERCENTAGE FOR THIS VARIANT IN AN EVENT CARD
          status: 'winner' as VariantStatus, // THIS IS THE STATUS FOR THIS VARIANT IN AN EVENT CARD
          metrics: { ctr: 0.755, cr: 0.510, su: 0.0 } // THIS IS THE METRICS FOR THIS VARIANT IN AN EVENT CARD
        }
      ]
    },
    {
      id: 'event-2', // THIS IS AN EVENT ID IN AN EVENT CARD
      name: 'Checkout page', // THIS IS THE EVENT NAME IN AN EVENT CARD
      hasVariants: false, // THIS IS AN EVENT WITHOUT VARIANTS    
      variants: [] // THIS IS AN EMPTY VARIANTS ARRAY FOR AN EVENT WITHOUT VARIANTS
    },
  ];

  // --- DEMO: Create node cards for each event and its variants ---
  async function createSampleFlowFromData() {
    await loadFonts();
    const experimentInfoCard = await createExperimentInfoCard(
      'Sample Experiment',
      'This is a sample experiment info card.',
      '', '', ''
    );
    experimentInfoCard.name = 'Experiment Info — sample-experiment';

    const flowFrame = figma.createFrame();
    flowFrame.name = 'Sample Experiment Flow';
    flowFrame.layoutMode = 'HORIZONTAL';
    flowFrame.counterAxisSizingMode = 'AUTO';
    flowFrame.primaryAxisSizingMode = 'AUTO';
    flowFrame.itemSpacing = 48;
    flowFrame.paddingLeft = flowFrame.paddingRight = 48;
    flowFrame.paddingTop = flowFrame.paddingBottom = 48;
    flowFrame.fills = [];
    flowFrame.cornerRadius = 24;

    for (const [i, event] of sampleEvents.entries()) {
      // Event Card (ungrouped)
      const eventCard = createEventCard(event.name);
      flowFrame.appendChild(eventCard);

      // Add variant cards directly to flowFrame (ungrouped)
      if (event.hasVariants && event.variants.length > 0) {
        for (let v = 0; v < event.variants.length; v++) {
          const variant = event.variants[v];
          const variantCard = createVariantCard(variant, v);
          flowFrame.appendChild(variantCard);
        }
      }
    }

    // Position and append to canvas
    const center = figma.viewport.center;
    let totalWidth = flowFrame.width;
    if (experimentInfoCard) totalWidth += experimentInfoCard.width + 48;
    let startX = center.x - totalWidth / 2;

    if (experimentInfoCard) {
      experimentInfoCard.x = startX;
      experimentInfoCard.y = center.y - experimentInfoCard.height / 2;
      figma.currentPage.appendChild(experimentInfoCard);
      startX += experimentInfoCard.width + 48;
    }
    flowFrame.x = startX;
    flowFrame.y = center.y - flowFrame.height / 2;
    figma.currentPage.appendChild(flowFrame);
    figma.currentPage.selection = [flowFrame];
    figma.viewport.scrollAndZoomIntoView([flowFrame, experimentInfoCard]);
  }

  // Uncomment to auto-run sample flow on plugin open:
  // createSampleFlowFromData();

  function hexToRgb(hex: string): RGB {
    // Remove # if present
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


  figma.showUI(__html__, {
    width: 400,
    height: 720,
    title: 'Growthlab Builder',
    themeColors: true,
  });

  function createMetricChip(label: string, value: number): FrameNode {
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
      txt.fontName = { family: TOKENS.fontFamily, style: "Bold" };
    } catch {
      txt.fontName = { family: TOKENS.fontFamily, style: "Medium" };
    }
    txt.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
    txt.textAutoResize = 'WIDTH_AND_HEIGHT';
    txt.characters = `${label}: ${value}`;
    chip.appendChild(txt);
    return chip;
  }

    // Old Experiment Flow Row Card -- ACTUAL Variant Card
  function createVariantCard(variant: Variant, variantIndex?: number): FrameNode {
    // Card container (modern auto layout)
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

    // Top Row: label (A/B/C), "Variant"
    const topRow = figma.createFrame();
    topRow.layoutMode = 'HORIZONTAL';
    topRow.counterAxisSizingMode = 'AUTO';
    topRow.primaryAxisSizingMode = 'AUTO';
    topRow.itemSpacing = TOKENS.space4;
    topRow.fills = [];
    topRow.strokes = [];
    topRow.name = 'Top Row';
    topRow.layoutAlign = 'MIN';


    // "Variant" label
    const variantTypeLabel = figma.createText();
    variantTypeLabel.fontName = { family: TOKENS.fontFamily, style: "Bold" };
    variantTypeLabel.fontSize = TOKENS.fontSizeBodyMd;
    variantTypeLabel.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    variantTypeLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
    variantTypeLabel.characters = 'Variant';
    variantTypeLabel.name = 'Variant Type Label';
    topRow.appendChild(variantTypeLabel);

    card.appendChild(topRow);

    // Thumbnail area: checkerboard placeholder (match event card)
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

    // Variant name heading above metrics
    const variantNameText = figma.createText();
    variantNameText.fontName = { family: TOKENS.fontFamily, style: "Bold" };
    variantNameText.fontSize = TOKENS.fontSizeBodyLg;
    variantNameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    variantNameText.textAutoResize = 'WIDTH_AND_HEIGHT';
    variantNameText.characters = 'Variant Name';
    variantNameText.name = 'Variant Name';
    card.appendChild(variantNameText);

    // Subtitle for metrics (match event card subtitle style)
    const subtitleText = figma.createText();
    subtitleText.fontName = { family: TOKENS.fontFamily, style: "Regular" };
    subtitleText.fontSize = TOKENS.fontSizeBodyMd;
    subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    subtitleText.characters = `CTR: ${variant.metrics?.ctr ?? 0}  CR: ${variant.metrics?.cr ?? 0}  SU: ${variant.metrics?.su ?? 0}`;
    subtitleText.name = 'Variant Metrics Subtitle';
    card.appendChild(subtitleText);

    // Alignment: distribute vertically, align all left
    card.primaryAxisAlignItems = 'MIN';
    card.counterAxisAlignItems = 'MIN';
    card.itemSpacing = TOKENS.space12;

    return card;
  }

  function createNodeCard(title: string, subtitle?: string, trafficLabel?: string): FrameNode {
    const card = figma.createFrame();
    card.layoutMode = 'VERTICAL';
    card.counterAxisSizingMode = 'AUTO';
    card.primaryAxisSizingMode = 'AUTO';
    card.paddingLeft = card.paddingRight = 20;
    card.paddingTop = card.paddingBottom = 16;
    card.cornerRadius = 16;
    card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    card.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
    card.strokeWeight = 1;
    card.name = title ? `Node: ${title}` : 'Node';

    const topRow = figma.createFrame();
    topRow.layoutMode = 'HORIZONTAL';
    topRow.counterAxisSizingMode = 'AUTO';
    topRow.primaryAxisSizingMode = 'AUTO';
    topRow.itemSpacing = TOKENS.space4;
    topRow.fills = [];
    topRow.strokes = [];
    topRow.name = 'Top Row';

    const titleText = figma.createText();
    titleText.fontName = { family: "Figtree", style: "Bold" };
    titleText.fontSize = 18;
    titleText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
    titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    titleText.characters = title && title.length > 0 ? title : '';
    topRow.appendChild(titleText);

    if (trafficLabel) {
      // Removed Pill: traffic chip
    }
    card.appendChild(topRow);

    const thumb = figma.createFrame();
    thumb.resize(240, 140);
    thumb.cornerRadius = 12;
    thumb.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.95, b: 0.99 } }];
    thumb.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
      if (trafficLabel) {
        // Removed Pill: traffic chip
      const subtitleText = figma.createText();
      subtitleText.fontName = { family: "Figtree", style: "Regular" };
      subtitleText.fontSize = 14;
      subtitleText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.5 } }];
      subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
      subtitleText.characters = subtitle && subtitle.length > 0 ? subtitle : '';
      card.appendChild(subtitleText);
    }
    return card;
  }

  figma.ui.onmessage = async (msg: PluginMessage) => {
    if (msg.type === 'delete-experiment-flows') {
      deleteExperimentFlowFrames();
      figma.notify('Experiment Flow frames deleted (if any were found).');
      return;
    }

    if (msg.type === 'create-flow' && msg.payload) {
      const {
        experimentName,
        roundNumber,
        entryLabel,
        exitLabel,
        variants,
        experimentDescription,
        figmaLink,
        jiraLink,
        miroLink
      } = msg.payload as CreateFlowPayload;

      if (!Array.isArray(variants) || variants.length === 0) {
        figma.notify('You must add at least one variant to create a flow.');
        return;
      }

      await loadFonts();

      function slugify(str: string): string {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      const slug = slugify(experimentName);
      const flowFrameName = `Experiment Flow — ${slug} — Round ${roundNumber}`;
      const infoCardName = `Experiment Info — ${slug}`;

      const existingFlow = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === flowFrameName);
      if (existingFlow) existingFlow.remove();

      let infoCard = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === infoCardName) as FrameNode | undefined;
      if (infoCard) infoCard.remove();
      infoCard = await createExperimentInfoCard(
        experimentName,
        experimentDescription || '',
        figmaLink || '',
        jiraLink || '',
        miroLink || ''
      );
      attachNodeMeta(infoCard, {
        name: infoCardName,
        type: 'frame' as const,
        experimentName,
        role: 'experiment-info',
      });

      const flowFrameMeta = {
        name: flowFrameName,
        type: 'frame' as const,
        experimentName,
        roundNumber,
        role: 'experiment-flow',
      };
      let flowFrame = createFrame(flowFrameMeta, {
        layoutMode: 'HORIZONTAL',
        counterAxisSizingMode: 'AUTO',
        primaryAxisSizingMode: 'AUTO',
        itemSpacing: 64,
        padding: 32,
        paddingLeft: 48,
        paddingRight: 48,
        fills: [{ type: 'SOLID', color: hexToRgb(TOKENS.coralRed500) }],
        cornerRadius: 24
      });


      const entryCard = createNodeCard(entryLabel, undefined, '100%');
      entryCard.name = 'Entry Node';
      attachNodeMeta(entryCard, {
        name: entryLabel,
        type: 'frame' as const,
        role: 'entry',
        experimentName,
        roundNumber,
      });


      // Always use entryLabel for the event card name (never a variant name)
      const eventCard = createEventCard(entryLabel || 'Event');
      flowFrame.appendChild(eventCard);

      // Add variant cards directly to flowFrame (ungrouped)
      const variantNodes: FrameNode[] = [];
      variants.forEach((variant: Variant, index: number) => {
        const card = createVariantCard(variant, index);
        // Compute fallback display name for meta and node name
        const variantLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        let fallbackName = 'Variant';
        if (typeof index === 'number' && index >= 0 && index < variantLetters.length) {
          fallbackName = variantLetters[index];
        }
        const displayName = (variant.name && variant.name.trim().length > 0) ? variant.name : fallbackName;
        card.name = `Variant: ${displayName}`;
        attachNodeMeta(card, {
          name: displayName,
          type: 'frame' as const,
          role: 'variant',
          experimentName,
          roundNumber,
          variantIndex: index,
          traffic: variant.traffic,
          status: variant.status,
        });
        flowFrame.appendChild(card);
        variantNodes.push(card);

        connectNodes(eventCard, card, {
          label: `${variant.traffic}%`,
          winner: variant.status === "winner",
          index,
        });
      });

      const exitCard = createNodeCard(exitLabel);
      exitCard.name = 'Exit Node';
      attachNodeMeta(exitCard, {
        name: exitLabel,
        type: 'frame' as const,
        role: 'exit',
        experimentName,
        roundNumber,
      });

      flowFrame.appendChild(exitCard);


      // Horizontally align infoCard and flowFrame, centered vertically
      const center = figma.viewport.center;

      const gap = 100;
      // Compute total width and center both as a group
      const totalWidth = infoCard.width + gap + flowFrame.width;
      const startX = center.x - totalWidth / 2;

      // Remove from parent if already present to avoid double-append
      let infoCardValid = infoCard && infoCard.parent;
      let flowFrameValid = flowFrame && flowFrame.parent;
      if (!infoCardValid) {
        infoCard = await createExperimentInfoCard(
          experimentName,
          experimentDescription || '',
          figmaLink || '',
          jiraLink || '',
          miroLink || ''
        );
        attachNodeMeta(infoCard, {
          name: infoCardName,
          type: 'frame' as const,
          experimentName,
          role: 'experiment-info',
        });
      }
      if (!flowFrameValid) {
        const flowFrameMeta = {
          name: flowFrameName,
          type: 'frame' as const,
          experimentName,
          roundNumber,
          role: 'experiment-flow',
        };
        flowFrame = createFrame(flowFrameMeta, {
          layoutMode: 'HORIZONTAL',
          counterAxisSizingMode: 'AUTO', // hug content vertically
          primaryAxisSizingMode: 'AUTO', // hug content horizontally
          itemSpacing: 64,
          padding: 32,
          paddingLeft: 48,
          paddingRight: 48,
          fills: [],
          cornerRadius: 24
        });
        // Removed reference to undefined roundBadge
        // Entry card is not appended here, as eventGroup and variantGroup are appended independently
      }

      // Only set position and append if node is valid
      if (infoCard && infoCard.parent === null) {
        infoCard.x = startX;
        infoCard.y = center.y - infoCard.height / 2;
        figma.currentPage.appendChild(infoCard);
      }
      if (flowFrame && flowFrame.parent === null) {
        flowFrame.x = startX + infoCard.width + gap;
        flowFrame.y = center.y - flowFrame.height / 2;
        figma.currentPage.appendChild(flowFrame);
      }

      figma.currentPage.appendChild(infoCard);
      figma.currentPage.appendChild(flowFrame);

      figma.currentPage.selection = [flowFrame];
      figma.viewport.scrollAndZoomIntoView([flowFrame, infoCard]);

        // --- Visual QA: Send node data to UI ---
        // figma.ui.postMessage({ type: 'qa-node', payload: serializeNode(flowFrame) }); // Debug output hidden

      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(entryCard, variantNodes[i], {
          winner: variants[i].status === 'winner',
          label: `${variants[i].traffic}%`,
          index: i
        });
      }
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(variantNodes[i], exitCard, {
          winner: variants[i].status === 'winner',
          index: i
        });
      }

      figma.notify('Experiment flow created.');
    } else if (msg.type === 'create-from-selection') {
      const selection = figma.currentPage.selection.filter(node => node.type === 'FRAME' || node.type === 'GROUP');
      if (selection.length === 0) {
        figma.notify('Select up to 3 frames to use as variant thumbnails.');
        return;
      }
      if (!msg.payload) {
        figma.notify('Please fill the experiment form and click \"Create from selection\" again.');
        return;
      }
      const { experimentName, roundNumber, entryLabel, exitLabel, variants } = msg.payload as CreateFlowPayload;

      await loadFonts();
      const flowFrame = figma.createFrame();
      flowFrame.name = `Experiment Flow: ${experimentName}`;
      flowFrame.layoutMode = 'HORIZONTAL';
      flowFrame.counterAxisSizingMode = 'AUTO'; // Hug content vertically
      flowFrame.primaryAxisSizingMode = 'AUTO'; // Hug content horizontally
      flowFrame.itemSpacing = 32;
      flowFrame.paddingLeft = flowFrame.paddingRight = 32;
      flowFrame.paddingTop = flowFrame.paddingBottom = 32;
      flowFrame.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.coralRed500) }];
      flowFrame.cornerRadius = 24;

      // Removed Pill: roundBadge

      // Detect if entryLabel matches a variant name
      let entryCard: FrameNode;
      const matchingVariant = variants.find(v => v.name === entryLabel);
      if (matchingVariant) {
        entryCard = createVariantCard(matchingVariant);
        entryCard.name = 'Entry Variant Node';
      } else {
        entryCard = createEventCard(entryLabel);
        entryCard.name = 'Entry Event Node';
      }
      flowFrame.appendChild(entryCard);

      const roundContainer = figma.createFrame();
      roundContainer.name = 'Round 1 Variants';
      roundContainer.layoutMode = 'VERTICAL';
      roundContainer.counterAxisSizingMode = 'AUTO';
      roundContainer.primaryAxisSizingMode = 'AUTO';
      roundContainer.itemSpacing = 20;
      roundContainer.paddingLeft = roundContainer.paddingRight = 24;
      roundContainer.paddingTop = roundContainer.paddingBottom = 24;
      roundContainer.cornerRadius = 24;
      roundContainer.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.coralRed500) }];
      roundContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
      roundContainer.strokeWeight = 1;

      const variantNodes: FrameNode[] = [];
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const card = createVariantCard(v);
        if (selection[i]) {
          const thumb = selection[i].clone();
          thumb.resize(240, 140);
          if (thumb.type === 'FRAME') thumb.cornerRadius = TOKENS.radiusSM;
          thumb.name = 'Thumbnail';
          for (const child of Array.from(card.children)) {
            if (child.name === 'Thumbnail') child.remove();
          }
          card.insertChild(1, thumb);
        }
        roundContainer.appendChild(card);
        variantNodes.push(card);
      }
      flowFrame.appendChild(roundContainer);

      const exitCard = createNodeCard(exitLabel);
      exitCard.name = 'Exit Node';
      flowFrame.appendChild(exitCard);

      const center = figma.viewport.center;
      flowFrame.x = center.x - 600;
      flowFrame.y = center.y - 200;
      figma.currentPage.appendChild(flowFrame);
      figma.currentPage.selection = [flowFrame];
      figma.viewport.scrollAndZoomIntoView([flowFrame]);

      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(entryCard, variantNodes[i], {
          winner: variants[i].status === 'winner',
          label: `${variants[i].traffic}%`,
          index: i
        });
      }
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(variantNodes[i], exitCard, {
          winner: variants[i].status === 'winner',
          index: i
        });
      }

      figma.notify('Experiment flow created from selection.');
    } else if (msg.type === 'cancel') {
      if (!KEEP_OPEN) figma.closePlugin('Plugin closed.');
      else figma.notify('Canceled');
      return;
    }
  };

  function connectNodes(
    fromNode: SceneNode,
    toNode: SceneNode,
    options?: {
      winner?: boolean;
      label?: string;
      index?: number;
    }
  ): SceneNode | null {
    const color = options?.winner
      ? { r: 0.22, g: 0.7, b: 0.36 }
      : { r: 0.18, g: 0.45, b: 0.85 };

    const strokeWeight = options?.winner ? 7 : 4;

    const fx = fromNode.absoluteTransform[0][2];
    const fy = fromNode.absoluteTransform[1][2];
    const tx = toNode.absoluteTransform[0][2];
    const ty = toNode.absoluteTransform[1][2];

    const startX = fx + fromNode.width;
    const startY = fy + fromNode.height / 2;
    const endX = tx;
    const endY = ty + toNode.height / 2;

    const index = options?.index ?? 0;
    const midX = startX + 96 + index * 12;

    const pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

    const line = figma.createVector();
    line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
    line.strokes = [{ type: "SOLID", color }];
    line.strokeWeight = strokeWeight;
    line.strokeAlign = "CENTER";
    line.name = "Flow Line";
    figma.currentPage.appendChild(line);

    if (options?.label) {
      // Removed Pill: label chip
    }

    const arrow = figma.createVector();
    const size = 10;
    arrow.vectorPaths = [
      {
        windingRule: "NONZERO",
        data: `M ${endX} ${endY} L ${endX - size} ${endY - size / 2} L ${endX - size} ${endY + size / 2} Z`,
      },
    ];
    arrow.fills = [{ type: "SOLID", color }];
    arrow.strokes = [];
    arrow.name = "Arrowhead";
    figma.currentPage.appendChild(arrow);

    return line;
  }

  async function loadFonts() {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(()=>{});
    await figma.loadFontAsync({ family: "Figtree", style: "Regular" }).catch(()=>{});
    try {
      await figma.loadFontAsync({ family: "Figtree", style: "Semibold" });
    } catch {
      await figma.loadFontAsync({ family: "Figtree", style: "Medium" }).catch(()=>{});
    }
    await figma.loadFontAsync({ family: "Figtree", style: "Bold" }).catch(()=>{});
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(()=>{});
    await figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(()=>{});
  }
}

// --- Canvas Node Framework ---

export type CanvasNodeType = 'frame' | 'component' | 'group' | 'text' | 'shape';

export interface CanvasNodeMeta {
  id?: string;
  name: string;
  type: CanvasNodeType;
  description?: string;
  tags?: string[];
  [key: string]: any;
}

export interface CanvasNodeOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  fills?: Paint[];
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  padding?: number;
  itemSpacing?: number;
  [key: string]: any;
}

export function attachNodeMeta(node: BaseNode, meta: CanvasNodeMeta) {
  node.setPluginData('meta', JSON.stringify(meta));
}

 //OLD EXPERIMENT FLOW ROW FRAME THAT HOLDS OLD FLOW
export function createFrame(meta: CanvasNodeMeta, options: CanvasNodeOptions = {}): FrameNode {
  const frame = figma.createFrame();
  frame.name = meta.name;
  // Hug content logic for auto layout
  if (options.width && options.height) {
    frame.resizeWithoutConstraints(options.width, options.height);
  } else if (options.width) {
    frame.resizeWithoutConstraints(options.width, frame.height);
  } else if (options.height) {
    frame.resizeWithoutConstraints(frame.width, options.height);
  }

  if (options.x !== undefined && options.y !== undefined) {
    frame.x = options.x;
    frame.y = options.y;
  }
  if (options.fills) frame.fills = options.fills;
  if (options.layoutMode) frame.layoutMode = options.layoutMode;
  if (options.padding !== undefined) {
    frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = options.padding;
  }
  if (options.itemSpacing !== undefined) frame.itemSpacing = options.itemSpacing;

  // Hug content for auto layout
  if (options.layoutMode === 'HORIZONTAL' || options.layoutMode === 'VERTICAL') {
    if (options.primaryAxisSizingMode === 'AUTO' || options.primaryAxisSizingMode === 'HUG' || options.primaryAxisSizingMode === 'hug') {
      frame.primaryAxisSizingMode = 'AUTO';
    } else if (options.primaryAxisSizingMode === 'FIXED' || options.primaryAxisSizingMode === 'fixed') {
      frame.primaryAxisSizingMode = 'FIXED';
    }
    if (options.counterAxisSizingMode === 'AUTO' || options.counterAxisSizingMode === 'HUG' || options.counterAxisSizingMode === 'hug') {
      frame.counterAxisSizingMode = 'AUTO';
    } else if (options.counterAxisSizingMode === 'FIXED' || options.counterAxisSizingMode === 'fixed') {
      frame.counterAxisSizingMode = 'FIXED';
    }
  }

  attachNodeMeta(frame, meta);
  return frame;
}

export function createComponent(meta: CanvasNodeMeta, options: CanvasNodeOptions = {}): ComponentNode {
  const component = figma.createComponent();
  component.name = meta.name;
  if (options.width) component.resizeWithoutConstraints(options.width, options.height || 100);
  if (options.x !== undefined && options.y !== undefined) {
    component.x = options.x;
    component.y = options.y;
  }
  if (options.fills) component.fills = options.fills;
  if (options.layoutMode) component.layoutMode = options.layoutMode;
  if (options.padding !== undefined) {
    component.paddingLeft = component.paddingRight = component.paddingTop = component.paddingBottom = options.padding;
  }
  if (options.itemSpacing !== undefined) component.itemSpacing = options.itemSpacing;
  attachNodeMeta(component, meta);
  return component;
}

export function getNodeMeta(node: BaseNode): CanvasNodeMeta | null {
  const data = node.getPluginData('meta');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// --- Visual QA Helper ---
function serializeNode(node: SceneNode): any {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    layoutMode: 'layoutMode' in node ? node.layoutMode : undefined,
    fills: 'fills' in node ? node.fills : undefined,
    fontName: 'fontName' in node ? node.fontName : undefined,
    characters: 'characters' in node ? node.characters : undefined,
    children: 'children' in node ? node.children.map(child => serializeNode(child)) : undefined,
    width: node.width,
    height: node.height,
    paddingLeft: 'paddingLeft' in node ? node.paddingLeft : undefined,
    paddingRight: 'paddingRight' in node ? node.paddingRight : undefined,
    paddingTop: 'paddingTop' in node ? node.paddingTop : undefined,
    paddingBottom: 'paddingBottom' in node ? node.paddingBottom : undefined,
    itemSpacing: 'itemSpacing' in node ? node.itemSpacing : undefined,
    cornerRadius: 'cornerRadius' in node ? node.cornerRadius : undefined,
  };
}

// Example usage (to be replaced with actual plugin logic):
// const frame = createFrame({ name: 'Experiment Frame', type: 'frame' as const }, { width: 400, height: 300 });
// figma.currentPage.appendChild(frame);
// const meta = getNodeMeta(frame);
// console.log(meta);