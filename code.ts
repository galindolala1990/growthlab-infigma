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

  // Create an Event Card styled similarly to Variant Card
  function createEventCard(eventName: string): FrameNode {
    const card = figma.createFrame();
    card.layoutMode = 'VERTICAL';
    card.counterAxisSizingMode = 'AUTO';
    card.primaryAxisSizingMode = 'AUTO';
    card.paddingLeft = card.paddingRight = TOKENS.space12;
    card.paddingTop = card.paddingBottom = TOKENS.space12;
    card.cornerRadius = TOKENS.radiusLG;
    card.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBackground) }];
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

    const nameText = figma.createText();
    nameText.fontName = { family: TOKENS.fontFamily, style: "Bold" };
    nameText.fontSize = 18;
    nameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    nameText.textAutoResize = 'WIDTH_AND_HEIGHT';
    nameText.characters = eventName;
    card.appendChild(nameText);

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
      id: 'event-0',
      name: 'Landing page',
      hasVariants: false,
      variants: []
    },
    {
      id: 'event-1',
      name: 'Conversion button',
      hasVariants: true,
      variants: [
        { key: 'A', name: 'Control', description: 'Original version without changes', color: '#2563eb', traffic: 50, status: 'none' as VariantStatus, metrics: { ctr: 0.695, cr: 0.425, su: 0.0 } },
        { key: 'B', name: 'Variation A', description: 'New CTA button design', color: '#0eab43', traffic: 50, status: 'none' as VariantStatus, metrics: { ctr: 0.725, cr: 0.480, su: 0.0 } },
      ]
    },
    {
      id: 'event-2',
      name: 'Checkout page',
      hasVariants: false,
      variants: []
    },
  ];

  // --- DEMO: Create node cards for each event and its variants ---
  async function createSampleFlowFromData() {
    await loadFonts();
    // Create Experiment Info Card (optional, can be commented out if not needed)
    const experimentInfoCard = await createExperimentInfoCard(
      'Sample Experiment',
      'This is a sample experiment info card.',
      '', '', ''
    );
    experimentInfoCard.name = 'Experiment Info — sample-experiment';

    // Create the main flow frame
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

    // Entry Node (first event) is always an event card
    const entryEvent = sampleEvents[0];
    const entryNode = createEventCard(entryEvent.name);
    entryNode.name = 'Entry Event Node';
    flowFrame.appendChild(entryNode);

    // For each event after the entry, create event card and variants
    for (let i = 1; i < sampleEvents.length; i++) {
      const event = sampleEvents[i];
      // Event Card
      const eventCard = createEventCard(event.name);
      eventCard.name = `Event: ${event.name}`;
      flowFrame.appendChild(eventCard);

      // Variants Container (if any)
      if (event.hasVariants && event.variants.length > 0) {
        const variantsContainer = figma.createFrame();
        variantsContainer.name = `${event.name} Variants`;
        variantsContainer.layoutMode = 'VERTICAL';
        variantsContainer.counterAxisSizingMode = 'AUTO';
        variantsContainer.primaryAxisSizingMode = 'AUTO';
        variantsContainer.itemSpacing = 16;
        variantsContainer.paddingLeft = variantsContainer.paddingRight = 16;
        variantsContainer.paddingTop = variantsContainer.paddingBottom = 16;
        variantsContainer.cornerRadius = 16;
        variantsContainer.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } }];
        variantsContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
        variantsContainer.strokeWeight = 1;
        for (const variant of event.variants) {
          const variantCard = createVariantCard(variant);
          variantsContainer.appendChild(variantCard);
        }
        flowFrame.appendChild(variantsContainer);
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

  function createPill(text: string, fillColor: RGB, textColor: RGB): FrameNode {
    const pill = figma.createFrame();
    pill.layoutMode = 'HORIZONTAL';
    pill.counterAxisSizingMode = 'AUTO';
    pill.primaryAxisSizingMode = 'AUTO';
    pill.paddingLeft = pill.paddingRight = TOKENS.space12;
    pill.paddingTop = pill.paddingBottom = TOKENS.space4;
    pill.cornerRadius = TOKENS.radiusMD;
    pill.fills = [{ type: 'SOLID', color: fillColor }];
    pill.strokes = [];
    pill.name = 'Pill';
    const txt = figma.createText();
    txt.fontName = { family: TOKENS.fontFamily, style: "Bold" };
    txt.fontSize = TOKENS.fontSizeBodyLg;
    txt.fills = [{ type: 'SOLID', color: textColor }];
    txt.textAutoResize = 'WIDTH_AND_HEIGHT';
    txt.characters = text;
    pill.appendChild(txt);
    return pill;
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
      txt.fontName = { family: TOKENS.fontFamily, style: "Semibold" };
    } catch {
      txt.fontName = { family: TOKENS.fontFamily, style: "Medium" };
    }
    txt.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
    txt.textAutoResize = 'WIDTH_AND_HEIGHT';
    txt.characters = `${label}: ${value}`;
    chip.appendChild(txt);
    return chip;
  }

  function createVariantCard(variant: Variant): FrameNode {
    const card = figma.createFrame();
    card.layoutMode = 'VERTICAL';
    card.counterAxisSizingMode = 'AUTO';
    card.primaryAxisSizingMode = 'AUTO';
    card.paddingLeft = card.paddingRight = TOKENS.space12;
    card.paddingTop = card.paddingBottom = TOKENS.space12;
    card.cornerRadius = TOKENS.radiusLG;
    card.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBackground) }];
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
    card.name = `Variant: ${variant.name}`;

    const topRow = figma.createFrame();
    topRow.layoutMode = 'HORIZONTAL';
    topRow.counterAxisSizingMode = 'AUTO';
    topRow.primaryAxisSizingMode = 'AUTO';
    topRow.itemSpacing = TOKENS.space8;
    topRow.fills = [];
    topRow.strokes = [];
    topRow.name = 'Top Row';

    const keyCircle = figma.createEllipse();
    keyCircle.resize(28, 28);
    keyCircle.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.royalBlue600) }];
    keyCircle.strokes = [];
    keyCircle.name = 'Key Circle';
    const keyText = figma.createText();
    keyText.fontName = { family: TOKENS.fontFamily, style: "Bold" };
    keyText.fontSize = 16;
    keyText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.white) }];
    keyText.textAutoResize = 'WIDTH_AND_HEIGHT';
    keyText.characters = variant.key;
    keyText.x = keyCircle.x + keyCircle.width / 2 - 8;
    keyText.y = keyCircle.y + keyCircle.height / 2 - 10;
    topRow.appendChild(keyCircle);
    topRow.appendChild(keyText);

    const nameText = figma.createText();
    nameText.fontName = { family: TOKENS.fontFamily, style: "Bold" };
    nameText.fontSize = 18;
    nameText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    nameText.textAutoResize = 'WIDTH_AND_HEIGHT';
    nameText.characters = variant.name;
    topRow.appendChild(nameText);

    if (variant.status === 'winner' || variant.status === 'running') {
      const badgeColor = variant.status === 'winner' ? hexToRgb(TOKENS.malachite800) : hexToRgb(TOKENS.royalBlue600);
      const badgeLabel = variant.status.charAt(0).toUpperCase() + variant.status.slice(1);
      const badge = createPill(badgeLabel, badgeColor, hexToRgb(TOKENS.white));
      badge.name = 'Status Badge';
      topRow.appendChild(badge);
    }
    card.appendChild(topRow);

    const thumb = figma.createFrame();
    thumb.layoutGrow = 1;
    thumb.layoutAlign = 'STRETCH';
    thumb.cornerRadius = TOKENS.radiusMD;
    thumb.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsSurface) }];
    thumb.strokes = [];
    thumb.strokeWeight = 0;
    thumb.name = 'Thumbnail';
    card.appendChild(thumb);

    const metricsRow = figma.createFrame();
    metricsRow.layoutMode = 'HORIZONTAL';
    metricsRow.counterAxisSizingMode = 'AUTO';
    metricsRow.primaryAxisSizingMode = 'AUTO';
    metricsRow.itemSpacing = TOKENS.space8;
    metricsRow.fills = [];
    metricsRow.strokes = [];
    metricsRow.name = 'Metrics Row';
    metricsRow.appendChild(createMetricChip('CTR', variant.metrics.ctr));
    metricsRow.appendChild(createMetricChip('CR', variant.metrics.cr));
    metricsRow.appendChild(createMetricChip('SU', variant.metrics.su));
    card.appendChild(metricsRow);

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
    card.name = `Node: ${title || 'Untitled'}`;

    const topRow = figma.createFrame();
    topRow.layoutMode = 'HORIZONTAL';
    topRow.counterAxisSizingMode = 'AUTO';
    topRow.primaryAxisSizingMode = 'AUTO';
    topRow.itemSpacing = 8;
    topRow.fills = [];
    topRow.strokes = [];
    topRow.name = 'Top Row';

    const titleText = figma.createText();
    titleText.fontName = { family: "Figtree", style: "Bold" };
    titleText.fontSize = 18;
    titleText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
    titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    titleText.characters = title && title.length > 0 ? title : 'Untitled';
    topRow.appendChild(titleText);

    if (trafficLabel) {
      const chip = createPill(trafficLabel, { r: 0.18, g: 0.45, b: 0.85 }, { r: 1, g: 1, b: 1 });
      chip.name = 'Traffic Chip';
      topRow.appendChild(chip);
    }
    card.appendChild(topRow);

    const thumb = figma.createFrame();
    thumb.resize(240, 140);
    thumb.cornerRadius = 12;
    thumb.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.95, b: 0.99 } }];
    thumb.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
    thumb.strokeWeight = 1;
    thumb.name = 'Thumbnail';
    card.appendChild(thumb);

    if (subtitle) {
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
      const flowFrame = createFrame(flowFrameMeta, {
        layoutMode: 'HORIZONTAL',
        counterAxisSizingMode: 'AUTO',
        primaryAxisSizingMode: 'AUTO',
        itemSpacing: 64,
        padding: 32,
        paddingLeft: 48,
        paddingRight: 48,
        fills: [],
        cornerRadius: 24,
      });

      const roundBadge = createPill(`ROUND #${roundNumber}`, { r: 1, g: 0.97, b: 0.8 }, { r: 0.5, g: 0.45, b: 0.1 });
      roundBadge.name = 'Round Badge';
      flowFrame.appendChild(roundBadge);

      const entryCard = createNodeCard(entryLabel, undefined, '100%');
      entryCard.name = 'Entry Node';
      attachNodeMeta(entryCard, {
        name: entryLabel,
        type: 'frame' as const,
        role: 'entry',
        experimentName,
        roundNumber,
      });


      // Example: group all variants under a single event for now
      // In a real scenario, you would loop through events and their variants
      const eventName = 'Event 1'; // Replace with actual event name from your data
      const eventCard = createEventCard(eventName);
      eventCard.name = 'Event Card';
      const variantsContainer = createFrame({
        name: 'Event 1 Variants',
        type: 'frame' as const,
        experimentName,
        roundNumber,
        role: 'variants-container',
      }, {
        layoutMode: 'VERTICAL',
        primaryAxisSizingMode: 'AUTO',
        counterAxisSizingMode: 'AUTO',
        itemSpacing: 24,
        paddingTop: 24,
        paddingBottom: 24,
        paddingLeft: 24,
        paddingRight: 24,
        cornerRadius: 24,
        fills: [{ type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } }],
        strokes: [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }],
        strokeWeight: 1,
      });

      const variantNodes: FrameNode[] = [];
      variants.forEach((variant: Variant, index: number) => {
        const card = createVariantCard(variant);
        attachNodeMeta(card, {
          name: variant.name,
          type: 'frame' as const,
          role: 'variant',
          experimentName,
          roundNumber,
          variantIndex: index,
          traffic: variant.traffic,
          status: variant.status,
        });
        variantsContainer.appendChild(card);
        variantNodes.push(card);

        connectNodes(eventCard, card, {
          label: `${variant.traffic}%`,
          winner: variant.status === "winner",
          index,
        });
      });

      // Group event card and its variants in a vertical stack
      const eventGroup = figma.createFrame();
      eventGroup.layoutMode = 'VERTICAL';
      eventGroup.counterAxisSizingMode = 'AUTO';
      eventGroup.primaryAxisSizingMode = 'AUTO';
      eventGroup.itemSpacing = 24;
      eventGroup.fills = [];
      eventGroup.strokes = [];
      eventGroup.name = 'Event Group';
      eventGroup.appendChild(eventCard);
      eventGroup.appendChild(variantsContainer);

      const exitCard = createNodeCard(exitLabel);
      exitCard.name = 'Exit Node';
      attachNodeMeta(exitCard, {
        name: exitLabel,
        type: 'frame' as const,
        role: 'exit',
        experimentName,
        roundNumber,
      });

      flowFrame.appendChild(entryCard);
      flowFrame.appendChild(variantsContainer);
      flowFrame.appendChild(exitCard);


      // Horizontally align infoCard and flowFrame, centered vertically
      const center = figma.viewport.center;


      const gap = 100;
      // Compute total width and center both as a group
      const totalWidth = infoCard.width + gap + flowFrame.width;
      const startX = center.x - totalWidth / 2;


      // Remove from parent if already present to avoid double-append
      if (infoCard.parent) infoCard.remove();
      if (flowFrame.parent) flowFrame.remove();

      infoCard.x = startX;
      infoCard.y = center.y - infoCard.height / 2;
      flowFrame.x = startX + infoCard.width + gap;
      flowFrame.y = center.y - flowFrame.height / 2;

      figma.currentPage.appendChild(infoCard);
      figma.currentPage.appendChild(flowFrame);

      figma.currentPage.selection = [flowFrame];
      figma.viewport.scrollAndZoomIntoView([flowFrame, infoCard]);

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
      flowFrame.counterAxisSizingMode = 'AUTO';
      flowFrame.primaryAxisSizingMode = 'AUTO';
      flowFrame.itemSpacing = 32;
      flowFrame.paddingLeft = flowFrame.paddingRight = 32;
      flowFrame.paddingTop = flowFrame.paddingBottom = 32;
      flowFrame.fills = [];
      flowFrame.cornerRadius = 24;

      const roundBadge = createPill(`ROUND #${roundNumber}`, { r: 1, g: 0.97, b: 0.8 }, { r: 0.5, g: 0.45, b: 0.1 });
      roundBadge.name = 'Round Badge';
      flowFrame.appendChild(roundBadge);

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
      roundContainer.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } }];
      roundContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
      roundContainer.strokeWeight = 1;

      const variantNodes: FrameNode[] = [];
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const card = createVariantCard(v);
        if (selection[i]) {
          const thumb = selection[i].clone();
          thumb.resize(240, 140);
          if (thumb.type === 'FRAME') thumb.cornerRadius = 12;
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
      const pill = createPill(options.label, { r: 1, g: 1, b: 1 }, color);
      pill.strokes = [{ type: "SOLID", color }];
      pill.strokeWeight = 1;
      pill.x = midX + 6;
      pill.y = startY - pill.height / 2;
      figma.currentPage.appendChild(pill);
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

export function createFrame(meta: CanvasNodeMeta, options: CanvasNodeOptions = {}): FrameNode {
  const frame = figma.createFrame();
  frame.name = meta.name;
  if (options.width) frame.resizeWithoutConstraints(options.width, options.height || 100);
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

// Example usage (to be replaced with actual plugin logic):
// const frame = createFrame({ name: 'Experiment Frame', type: 'frame' as const }, { width: 400, height: 300 });
// figma.currentPage.appendChild(frame);
// const meta = getNodeMeta(frame);
// console.log(meta);