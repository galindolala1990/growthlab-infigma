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

import { createExperimentInfoCard } from './experiment-info-card';

if (figma.editorType === 'figma') {

  function createPill(text: string, fillColor: RGB, textColor: RGB): FrameNode {
    const pill = figma.createFrame();
    pill.layoutMode = 'HORIZONTAL';
    pill.counterAxisSizingMode = 'AUTO';
    pill.primaryAxisSizingMode = 'AUTO';
    pill.paddingLeft = pill.paddingRight = 12;
    pill.paddingTop = pill.paddingBottom = 4;
    pill.cornerRadius = 12;
    pill.fills = [{ type: 'SOLID', color: fillColor }];
    pill.strokes = [];
    pill.name = 'Pill';
    const txt = figma.createText();
    txt.fontName = { family: "Figtree", style: "Bold" };
    txt.fontSize = 13;
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
    chip.paddingLeft = chip.paddingRight = 8;
    chip.paddingTop = chip.paddingBottom = 2;
    chip.cornerRadius = 8;
    chip.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } }];
    chip.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
    chip.strokeWeight = 1;
    chip.name = 'Metric Chip';
    const txt = figma.createText();
    txt.fontSize = 12;
    try {
      txt.fontName = { family: "Figtree", style: "Semibold" };
    } catch {
      txt.fontName = { family: "Figtree", style: "Medium" };
    }
    txt.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
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
    card.paddingLeft = card.paddingRight = 12;
    card.paddingTop = card.paddingBottom = 12;
    card.cornerRadius = 16;
    card.fills = [{ type: 'SOLID', color: { r: 0.87, g: 0.90, b: 1 } }];
    card.strokes = [{ type: 'SOLID', color: { r: 0.06, g: 0.09, b: 0.16 } }];
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
    topRow.itemSpacing = 8;
    topRow.fills = [];
    topRow.strokes = [];
    topRow.name = 'Top Row';

    const keyCircle = figma.createEllipse();
    keyCircle.resize(28, 28);
    keyCircle.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
    keyCircle.strokes = [];
    keyCircle.name = 'Key Circle';
    const keyText = figma.createText();
    keyText.fontName = { family: "Figtree", style: "Bold" };
    keyText.fontSize = 16;
    keyText.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    keyText.textAutoResize = 'WIDTH_AND_HEIGHT';
    keyText.characters = variant.key;
    keyText.x = keyCircle.x + keyCircle.width / 2 - 8;
    keyText.y = keyCircle.y + keyCircle.height / 2 - 10;
    topRow.appendChild(keyCircle);
    topRow.appendChild(keyText);

    const nameText = figma.createText();
    nameText.fontName = { family: "Figtree", style: "Bold" };
    nameText.fontSize = 18;
    nameText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
    nameText.textAutoResize = 'WIDTH_AND_HEIGHT';
    nameText.characters = variant.name;
    topRow.appendChild(nameText);

    if (variant.status === 'winner' || variant.status === 'running') {
      const badgeColor = variant.status === 'winner' ? { r: 0.22, g: 0.7, b: 0.36 } : { r: 0.18, g: 0.45, b: 0.85 };
      const badgeLabel = variant.status.charAt(0).toUpperCase() + variant.status.slice(1);
      const badge = createPill(badgeLabel, badgeColor, { r: 1, g: 1, b: 1 });
      badge.name = 'Status Badge';
      topRow.appendChild(badge);
    }
    card.appendChild(topRow);

    const thumb = figma.createFrame();
    thumb.layoutGrow = 1;
    thumb.layoutAlign = 'STRETCH';
    thumb.cornerRadius = 12;
    thumb.fills = [{ type: 'SOLID', color: { r: 0.83, g: 0.84, b: 0.86 } }];
    thumb.strokes = [];
    thumb.strokeWeight = 0;
    thumb.name = 'Thumbnail';
    card.appendChild(thumb);

    const metricsRow = figma.createFrame();
    metricsRow.layoutMode = 'HORIZONTAL';
    metricsRow.counterAxisSizingMode = 'AUTO';
    metricsRow.primaryAxisSizingMode = 'AUTO';
    metricsRow.itemSpacing = 8;
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
    card.name = `Node: ${title}`;

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
    titleText.characters = title;
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
      subtitleText.characters = subtitle;
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

      const variantsContainer = createFrame({
        name: 'Round 1 Variants',
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

        connectNodes(entryCard, card, {
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

      flowFrame.appendChild(entryCard);
      flowFrame.appendChild(variantsContainer);
      flowFrame.appendChild(exitCard);

      const center = figma.viewport.center;
      flowFrame.x = center.x - flowFrame.width / 2;
      flowFrame.y = center.y - flowFrame.height / 2;
      figma.currentPage.appendChild(flowFrame);

      infoCard.x = flowFrame.x - infoCard.width - 64;
      infoCard.y = flowFrame.y + entryCard.y + (entryCard.height / 2) - (infoCard.height / 2);
      if (infoCard.parent == null) figma.currentPage.appendChild(infoCard);

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

      const entryCard = createNodeCard(entryLabel, undefined, '100%');
      entryCard.name = 'Entry Node';
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