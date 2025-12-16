// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
// Runs this code if the plugin is run in Figma

// --- Type and helper declarations ---
type Variant = {
  key: string;
  name: string;
  status: string;
  traffic: number;
  metrics: { CTR: number; CR: number; SU: number };
};

interface PluginMessage {
  type: string;
  payload?: any;
}

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
    txt.characters = text;
    txt.fontSize = 13;
    txt.fontName = { family: "Figtree", style: "Bold" };
    txt.fills = [{ type: 'SOLID', color: textColor }];
    txt.textAutoResize = 'WIDTH_AND_HEIGHT';
    pill.appendChild(txt);
    return pill;
  }

  figma.showUI(__html__, {
    width: 640,
    height: 720,
    title: 'Growthlab Flow Builder',
    themeColors: true,
  });


  // Helper: Metric chip
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
    txt.characters = `${label}: ${value}`;
    txt.fontSize = 12;
    // Figtree Semibold fallback to Medium if Semibold is not available
    try {
      txt.fontName = { family: "Figtree", style: "Semibold" };
    } catch {
      txt.fontName = { family: "Figtree", style: "Medium" };
    }
    txt.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
    txt.textAutoResize = 'WIDTH_AND_HEIGHT';
    chip.appendChild(txt);
    return chip;
  }

  // Helper: Variant card
  function createVariantCard(variant: Variant): FrameNode {
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
    card.name = `Variant: ${variant.name}`;
    // Title
    const titleText = figma.createText();
    titleText.characters = variant.name;
    titleText.fontSize = 18;
    titleText.fontName = { family: "Figtree", style: "Bold" };
    titleText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
    titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    card.appendChild(titleText);
    // Status
    card.appendChild(createPill(variant.status, { r: 0.22, g: 0.7, b: 0.36 }, { r: 1, g: 1, b: 1 }));
    // Metrics
    card.appendChild(createMetricChip('CTR', variant.metrics.CTR));
    card.appendChild(createMetricChip('CR', variant.metrics.CR));
    card.appendChild(createMetricChip('SU', variant.metrics.SU));
    return card;
  }

  // Helper: Node card
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
    // Title
    const titleText = figma.createText();
    titleText.characters = title;
    titleText.fontSize = 18;
    titleText.fontName = { family: "Figtree", style: "Bold" };
    titleText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
    titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    card.appendChild(titleText);
    // Subtitle (optional)
    if (subtitle) {
      const subtitleText = figma.createText();
      subtitleText.characters = subtitle;
      subtitleText.fontSize = 14;
      subtitleText.fontName = { family: "Figtree", style: "Regular" };
      subtitleText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.5 } }];
      subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
      card.appendChild(subtitleText);
    }
    // Traffic label (optional)
    if (trafficLabel) {
      card.appendChild(createPill(trafficLabel, { r: 0.18, g: 0.45, b: 0.85 }, { r: 1, g: 1, b: 1 }));
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
        variants
      } = msg.payload;

      await loadFonts();

      // --- Main Frame ---
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

      // --- Round badge ---
      const roundBadge = createPill(`ROUND #${roundNumber}`, { r: 1, g: 0.97, b: 0.8 }, { r: 0.5, g: 0.45, b: 0.1 });
      roundBadge.name = 'Round Badge';
      flowFrame.appendChild(roundBadge);

      // --- Entry node card ---
      const entryCard = createNodeCard(entryLabel, undefined, '100%');
      entryCard.name = 'Entry Node';
      flowFrame.appendChild(entryCard);

      // --- Round 1 variants container ---
      const roundContainer = figma.createFrame();
      roundContainer.name = 'Round 1 Variants';
      roundContainer.layoutMode = 'VERTICAL';
      roundContainer.counterAxisSizingMode = 'AUTO';
      roundContainer.primaryAxisSizingMode = 'AUTO';
      roundContainer.itemSpacing = 20;
      roundContainer.paddingLeft = roundContainer.paddingRight = 24;
      roundContainer.paddingTop = roundContainer.paddingBottom = 24;
      roundContainer.cornerRadius = 24;
      roundContainer.fills = [{ type: 'SOLID' as const, color: { r: 0.95, g: 0.97, b: 1 } }];
      roundContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
      roundContainer.strokeWeight = 1;

      // --- Variant cards ---
      const variantNodes: FrameNode[] = [];
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const card = createVariantCard(v);
        roundContainer.appendChild(card);
        variantNodes.push(card);
      }
      flowFrame.appendChild(roundContainer);

      // --- Exit node card ---
      const exitCard = createNodeCard(exitLabel);
      exitCard.name = 'Exit Node';
      flowFrame.appendChild(exitCard);

      // --- Place in viewport center ---
      const center = figma.viewport.center;
      flowFrame.x = center.x - 600;
      flowFrame.y = center.y - 200;
      figma.currentPage.appendChild(flowFrame);
      figma.currentPage.selection = [flowFrame];
      figma.viewport.scrollAndZoomIntoView([flowFrame]);

      // --- Draw connectors ---
      // Entry → each variant
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(entryCard, variantNodes[i], {
          winner: variants[i].status === 'Winner',
          label: `${variants[i].traffic}%`
        });
      }
      // Each variant → Exit
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(variantNodes[i], exitCard, {
          winner: variants[i].status === 'Winner'
        });
      }

      // --- Done ---
      figma.closePlugin('Experiment flow created.');
    } else if (msg.type === 'create-from-selection') {
      // Not implemented yet: would use selected frames as thumbnails
      figma.closePlugin('Create from selection is not yet implemented.');
    } else if (msg.type === 'cancel') {
      figma.closePlugin('Cancelled.');
    }
  };

        function connectNodes(fromNode: SceneNode, toNode: SceneNode, options?: { winner?: boolean, label?: string }): ConnectorNode {
          const connector = figma.createConnector();
          connector.connectorStart = { endpointNodeId: fromNode.id, magnet: 'AUTO' };
          connector.connectorEnd = { endpointNodeId: toNode.id, magnet: 'AUTO' };
          connector.strokeWeight = options?.winner ? 7 : 4;
          connector.strokeAlign = 'CENTER';
          connector.strokes = [{ type: 'SOLID', color: options?.winner ? { r: 0.22, g: 0.7, b: 0.36 } : { r: 0.18, g: 0.45, b: 0.85 } }];
          connector.connectorLineType = 'ELBOWED';
          // Arrowheads not supported in Figma Plugin API as of now
          // Label (traffic %)
          if (options?.label) {
            const label = figma.createText();
            label.characters = options.label;
            label.fontSize = 13;
            label.fontName = { family: "Figtree", style: "Bold" };
            label.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
            label.textAutoResize = 'WIDTH_AND_HEIGHT';
            // Place label near the midpoint (approximate)
            label.x = (fromNode.x + toNode.x) / 2 + 30;
            label.y = (fromNode.y + toNode.y) / 2;
            figma.currentPage.appendChild(label);
          }
          return connector;
        }


      async function loadFonts() {
        // Always load Figtree Regular
        await figma.loadFontAsync({ family: "Figtree", style: "Regular" }).catch(()=>{});
        // Try to load Semibold, fallback to Medium if not available
        try {
          await figma.loadFontAsync({ family: "Figtree", style: "Semibold" });
        } catch {
          await figma.loadFontAsync({ family: "Figtree", style: "Medium" }).catch(()=>{});
        }
        // Always load Figtree Bold
        await figma.loadFontAsync({ family: "Figtree", style: "Bold" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(()=>{});
      }
    // End of if (figma.editorType === 'figma')
}

