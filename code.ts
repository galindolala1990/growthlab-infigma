// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {
  figma.showUI(__html__);

  figma.ui.onmessage = async (msg: any) => {
    if (msg.type === 'create-flow' && msg.payload) {
      const {
        experimentName,
        roundNumber,
        entryLabel,
        exitLabel,
        variants
      } = msg.payload;

      // --- Constants ---
      const CARD_WIDTH = 360;
      const CARD_HEIGHT = 180;
      const THUMB_SIZE = { width: 240, height: 140 };
      const VARIANT_CARD_RADIUS = 16;
      const VARIANT_CARD_SPACING = 20;
      const ROUND_CONTAINER_PADDING = 24;
      const VARIANT_CONTAINER_BG = { type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } };
      const ENTRY_EXIT_CARD_BG = { type: 'SOLID', color: { r: 0.98, g: 0.98, b: 0.98 } };
      const WINNER_COLOR = { r: 0.22, g: 0.7, b: 0.36 };
      const RUNNING_COLOR = { r: 0.18, g: 0.45, b: 0.85 };
      const NONE_COLOR = { r: 0.7, g: 0.7, b: 0.7 };
      const CONNECTOR_COLOR = { r: 0.18, g: 0.45, b: 0.85 };
      const WINNER_CONNECTOR_COLOR = { r: 0.22, g: 0.7, b: 0.36 };

      // --- Helper functions ---
      function createPill(text: string, color: RGB, bgAlpha = 0.15): TextNode {
        const pill = figma.createText();
        pill.characters = text;
        pill.fontSize = 13;
        pill.fills = [{ type: 'SOLID', color, opacity: 1 }];
        pill.textAutoResize = 'WIDTH_AND_HEIGHT';
        pill.paddingLeft = pill.paddingRight = 12;
        pill.paddingTop = pill.paddingBottom = 4;
        pill.cornerRadius = 10;
        pill.opacity = 1;
        pill.name = 'Pill';
        return pill;
      }

      async function loadFonts() {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Inter", style: "Medium" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Inter", style: "Bold" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(()=>{});
      }

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
      const roundBadge = figma.createFrame();
      roundBadge.layoutMode = 'VERTICAL';
      roundBadge.counterAxisSizingMode = 'AUTO';
      roundBadge.primaryAxisSizingMode = 'AUTO';
      roundBadge.fills = [];
      roundBadge.name = 'Round Badge';
      roundBadge.paddingLeft = roundBadge.paddingRight = 12;
      roundBadge.paddingTop = roundBadge.paddingBottom = 4;
      roundBadge.cornerRadius = 12;
      roundBadge.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.7 } }];
      roundBadge.strokeWeight = 1;
      const roundText = figma.createText();
      roundText.characters = `ROUND #${roundNumber}`;
      roundText.fontSize = 14;
      roundText.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.45, b: 0.1 } }];
      roundText.fontName = { family: "Inter", style: "Bold" };
      roundBadge.appendChild(roundText);
      flowFrame.appendChild(roundBadge);

      // --- Entry node card ---
      const entryCard = figma.createFrame();
      entryCard.name = 'Entry Node';
      entryCard.layoutMode = 'VERTICAL';
      entryCard.counterAxisSizingMode = 'AUTO';
      entryCard.primaryAxisSizingMode = 'AUTO';
      entryCard.itemSpacing = 8;
      entryCard.paddingLeft = entryCard.paddingRight = 20;
      entryCard.paddingTop = entryCard.paddingBottom = 16;
      entryCard.cornerRadius = 16;
      entryCard.fills = [ENTRY_EXIT_CARD_BG];
      entryCard.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.9 } }];
      entryCard.strokeWeight = 1;
      // Thumbnail placeholder
      const entryThumb = figma.createRectangle();
      entryThumb.resize(THUMB_SIZE.width, THUMB_SIZE.height);
      entryThumb.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.93, b: 0.97 } }];
      entryThumb.cornerRadius = 10;
      entryThumb.name = 'Thumbnail';
      entryCard.appendChild(entryThumb);
      // Label
      const entryLabelText = figma.createText();
      entryLabelText.characters = entryLabel;
      entryLabelText.fontSize = 18;
      entryLabelText.fontName = { family: "Inter", style: "Bold" };
      entryLabelText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
      entryLabelText.textAutoResize = 'WIDTH_AND_HEIGHT';
      entryCard.appendChild(entryLabelText);
      // 100% chip
      const entryChip = figma.createText();
      entryChip.characters = '100%';
      entryChip.fontSize = 13;
      entryChip.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
      entryChip.textAutoResize = 'WIDTH_AND_HEIGHT';
      entryChip.paddingLeft = entryChip.paddingRight = 10;
      entryChip.paddingTop = entryChip.paddingBottom = 3;
      entryChip.cornerRadius = 10;
      entryChip.opacity = 1;
      entryChip.name = 'Traffic Chip';
      entryCard.appendChild(entryChip);
      flowFrame.appendChild(entryCard);

      // --- Round 1 variants container ---
      const roundContainer = figma.createFrame();
      roundContainer.name = 'Round 1 Variants';
      roundContainer.layoutMode = 'VERTICAL';
      roundContainer.counterAxisSizingMode = 'AUTO';
      roundContainer.primaryAxisSizingMode = 'AUTO';
      roundContainer.itemSpacing = VARIANT_CARD_SPACING;
      roundContainer.paddingLeft = roundContainer.paddingRight = ROUND_CONTAINER_PADDING;
      roundContainer.paddingTop = roundContainer.paddingBottom = ROUND_CONTAINER_PADDING;
      roundContainer.cornerRadius = 24;
      roundContainer.fills = [VARIANT_CONTAINER_BG];
      roundContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
      roundContainer.strokeWeight = 1;

      // --- Variant cards ---
      const variantNodes: FrameNode[] = [];
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const card = figma.createFrame();
        card.name = `Variant ${v.key}`;
        card.layoutMode = 'VERTICAL';
        card.counterAxisSizingMode = 'AUTO';
        card.primaryAxisSizingMode = 'AUTO';
        card.itemSpacing = 8;
        card.paddingLeft = card.paddingRight = 20;
        card.paddingTop = card.paddingBottom = 16;
        card.cornerRadius = VARIANT_CARD_RADIUS;
        card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
        card.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
        card.strokeWeight = 1;

        // Top row: Key circle + name + badge
        const topRow = figma.createFrame();
        topRow.layoutMode = 'HORIZONTAL';
        topRow.counterAxisSizingMode = 'AUTO';
        topRow.primaryAxisSizingMode = 'AUTO';
        topRow.itemSpacing = 10;
        topRow.fills = [];
        topRow.name = 'Top Row';
        // Key circle
        const keyCircle = figma.createEllipse();
        keyCircle.resize(28, 28);
        keyCircle.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.95, b: 1 } }];
        keyCircle.strokes = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
        keyCircle.strokeWeight = 2;
        const keyText = figma.createText();
        keyText.characters = v.key;
        keyText.fontSize = 16;
        keyText.fontName = { family: "Inter", style: "Bold" };
        keyText.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
        keyText.textAutoResize = 'WIDTH_AND_HEIGHT';
        keyText.x = 7; keyText.y = 5;
        keyCircle.appendChild(keyText);
        topRow.appendChild(keyCircle);
        // Name
        const nameText = figma.createText();
        nameText.characters = v.name;
        nameText.fontSize = 16;
        nameText.fontName = { family: "Inter", style: "Medium" };
        nameText.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
        nameText.textAutoResize = 'WIDTH_AND_HEIGHT';
        topRow.appendChild(nameText);
        // Badge
        if (v.status === 'Winner' || v.status === 'Running') {
          const badge = figma.createText();
          badge.characters = v.status;
          badge.fontSize = 13;
          badge.fontName = { family: "Inter", style: "Bold" };
          badge.fills = [{ type: 'SOLID', color: v.status === 'Winner' ? WINNER_COLOR : RUNNING_COLOR }];
          badge.textAutoResize = 'WIDTH_AND_HEIGHT';
          badge.paddingLeft = badge.paddingRight = 10;
          badge.paddingTop = badge.paddingBottom = 3;
          badge.cornerRadius = 10;
          badge.opacity = 1;
          badge.name = 'Status Badge';
          topRow.appendChild(badge);
        }
        card.appendChild(topRow);

        // Thumbnail
        const thumb = figma.createRectangle();
        thumb.resize(THUMB_SIZE.width, THUMB_SIZE.height);
        thumb.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.93, b: 0.97 } }];
        thumb.cornerRadius = 10;
        thumb.name = 'Thumbnail';
        card.appendChild(thumb);

        // Bottom row: metrics chips
        const bottomRow = figma.createFrame();
        bottomRow.layoutMode = 'HORIZONTAL';
        bottomRow.counterAxisSizingMode = 'AUTO';
        bottomRow.primaryAxisSizingMode = 'AUTO';
        bottomRow.itemSpacing = 8;
        bottomRow.fills = [];
        bottomRow.name = 'Metrics Row';
        // Metrics: CTR, CR, SU
        for (const metric of ['CTR', 'CR', 'SU']) {
          const chip = figma.createText();
          const upArrow = '↑';
          const val = v.metrics[metric];
          chip.characters = `${metric} ${upArrow} ${val}%`;
          chip.fontSize = 13;
          chip.fontName = { family: "Inter", style: "Medium" };
          chip.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
          chip.textAutoResize = 'WIDTH_AND_HEIGHT';
          chip.paddingLeft = chip.paddingRight = 8;
          chip.paddingTop = chip.paddingBottom = 2;
          chip.cornerRadius = 8;
          chip.opacity = 1;
          chip.name = 'Metric Chip';
          bottomRow.appendChild(chip);
        }
        card.appendChild(bottomRow);

        roundContainer.appendChild(card);
        variantNodes.push(card);
      }
      flowFrame.appendChild(roundContainer);

      // --- Exit node card ---
      const exitCard = figma.createFrame();
      exitCard.name = 'Exit Node';
      exitCard.layoutMode = 'VERTICAL';
      exitCard.counterAxisSizingMode = 'AUTO';
      exitCard.primaryAxisSizingMode = 'AUTO';
      exitCard.itemSpacing = 8;
      exitCard.paddingLeft = exitCard.paddingRight = 20;
      exitCard.paddingTop = exitCard.paddingBottom = 16;
      exitCard.cornerRadius = 16;
      exitCard.fills = [ENTRY_EXIT_CARD_BG];
      exitCard.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.9 } }];
      exitCard.strokeWeight = 1;
      // Thumbnail placeholder
      const exitThumb = figma.createRectangle();
      exitThumb.resize(THUMB_SIZE.width, THUMB_SIZE.height);
      exitThumb.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.93, b: 0.97 } }];
      exitThumb.cornerRadius = 10;
      exitThumb.name = 'Thumbnail';
      exitCard.appendChild(exitThumb);
      // Label
      const exitLabelText = figma.createText();
      exitLabelText.characters = exitLabel;
      exitLabelText.fontSize = 18;
      exitLabelText.fontName = { family: "Inter", style: "Bold" };
      exitLabelText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
      exitLabelText.textAutoResize = 'WIDTH_AND_HEIGHT';
      exitCard.appendChild(exitLabelText);
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
        const variant = variantNodes[i];
        const connector = figma.createConnector();
        connector.connectorStart = { endpointNodeId: entryCard.id, magnet: 'AUTO' };
        connector.connectorEnd = { endpointNodeId: variant.id, magnet: 'AUTO' };
        connector.strokeWeight = 4;
        connector.strokeAlign = 'CENTER';
        connector.strokes = [{ type: 'SOLID', color: CONNECTOR_COLOR }];
        // Winner connector emphasized
        if (variants[i].status === 'Winner') {
          connector.strokeWeight = 7;
          connector.strokes = [{ type: 'SOLID', color: WINNER_CONNECTOR_COLOR }];
        }
        // Traffic % label
        const trafficLabel = figma.createText();
        trafficLabel.characters = `${variants[i].traffic}%`;
        trafficLabel.fontSize = 13;
        trafficLabel.fontName = { family: "Inter", style: "Bold" };
        trafficLabel.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
        trafficLabel.textAutoResize = 'WIDTH_AND_HEIGHT';
        trafficLabel.x = (entryCard.x + variant.x) / 2 + 30;
        trafficLabel.y = (entryCard.y + variant.y) / 2;
        figma.currentPage.appendChild(trafficLabel);
      }
      // Each variant → Exit
      for (let i = 0; i < variantNodes.length; i++) {
        const variant = variantNodes[i];
        const connector = figma.createConnector();
        connector.connectorStart = { endpointNodeId: variant.id, magnet: 'AUTO' };
        connector.connectorEnd = { endpointNodeId: exitCard.id, magnet: 'AUTO' };
        connector.strokeWeight = 4;
        connector.strokeAlign = 'CENTER';
        connector.strokes = [{ type: 'SOLID', color: CONNECTOR_COLOR }];
        if (variants[i].status === 'Winner') {
          connector.strokeWeight = 7;
          connector.strokes = [{ type: 'SOLID', color: WINNER_CONNECTOR_COLOR }];
        }
      }

      // --- Done ---
      figma.closePlugin('Experiment flow created.');
    }
    else if (msg.type === 'create-from-selection') {
      // Not implemented yet: would use selected frames as thumbnails
      figma.closePlugin('Create from selection is not yet implemented.');
    }
    else if (msg.type === 'cancel') {
      figma.closePlugin('Cancelled.');
    }
  };
}

// Runs this code if the plugin is run in FigJam
if (figma.editorType === 'figjam') {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many shapes and connectors on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);

  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage =  (msg: {type: string, count: number}) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-shapes') {
      // This plugin creates shapes and connectors on the screen.
      const numberOfShapes = msg.count;

      const nodes: SceneNode[] = [];
      for (let i = 0; i < numberOfShapes; i++) {
        const shape = figma.createShapeWithText();
        // You can set shapeType to one of: 'SQUARE' | 'ELLIPSE' | 'ROUNDED_RECTANGLE' | 'DIAMOND' | 'TRIANGLE_UP' | 'TRIANGLE_DOWN' | 'PARALLELOGRAM_RIGHT' | 'PARALLELOGRAM_LEFT'
        shape.shapeType = 'ROUNDED_RECTANGLE';
        shape.x = i * (shape.width + 200);
        shape.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
        figma.currentPage.appendChild(shape);
        nodes.push(shape);
      }

      for (let i = 0; i < numberOfShapes - 1; i++) {
        const connector = figma.createConnector();
        connector.strokeWeight = 8;

        connector.connectorStart = {
          endpointNodeId: nodes[i].id,
          magnet: 'AUTO',
        };

        connector.connectorEnd = {
          endpointNodeId: nodes[i + 1].id,
          magnet: 'AUTO',
        };
      }

      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  };
}

// Runs this code if the plugin is run in Slides
if (figma.editorType === 'slides') {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many slides on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);

  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage =  (msg: {type: string, count: number}) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-shapes') {
      // This plugin creates slides and puts the user in grid view.
      const numberOfSlides = msg.count;

      const nodes: SlideNode[] = [];
      for (let i = 0; i < numberOfSlides; i++) {
        const slide = figma.createSlide();
        nodes.push(slide);
      }

      figma.viewport.slidesView = 'grid';
      figma.currentPage.selection = nodes;
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  };
}

// Runs this code if the plugin is run in Buzz
if (figma.editorType === 'buzz') {
  // This plugin will open a window to prompt the user to enter a number, and
  // it will then create that many frames on the screen.

  // This shows the HTML page in "ui.html".
  figma.showUI(__html__);

  // Calls to "parent.postMessage" from within the HTML page will trigger this
  // callback. The callback will be passed the "pluginMessage" property of the
  // posted message.
  figma.ui.onmessage =  (msg: {type: string, count: number}) => {
    // One way of distinguishing between different types of messages sent from
    // your HTML page is to use an object with a "type" property like this.
    if (msg.type === 'create-shapes') {
      // This plugin creates frames and puts the user in grid view.
      const numberOfFrames = msg.count;

      const nodes: FrameNode[] = [];
      for (let i = 0; i < numberOfFrames; i++) {
        const frame = figma.buzz.createFrame();
        nodes.push(frame);
      }

      figma.viewport.canvasView = 'grid';
      figma.currentPage.selection = nodes;
      figma.viewport.scrollAndZoomIntoView(nodes);
    }

    // Make sure to close the plugin when you're done. Otherwise the plugin will
    // keep running, which shows the cancel button at the bottom of the screen.
    figma.closePlugin();
  };
}
