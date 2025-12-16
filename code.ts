// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {

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
    txt.fontName = { family: "Inter", style: "Bold" };
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

  figma.ui.onmessage = async (msg: PluginMessage) => {
    // ...existing code...

        function createMetricChip(label: string, value: number): FrameNode {
          const chip = figma.createFrame();
          chip.layoutMode = 'HORIZONTAL';
          chip.counterAxisSizingMode = 'AUTO';
          chip.primaryAxisSizingMode = 'AUTO';
          chip.paddingTop = chip.paddingBottom = 2;
          chip.cornerRadius = 8;
          chip.fills = [{ type: 'SOLID' as const, color: { r: 0.95, g: 0.97, b: 1 } }];
          chip.name = 'Metric Chip';
          const txt = figma.createText();
          txt.characters = `${label} ↑ ${value}%`;
          txt.fontSize = 13;
          txt.fontName = { family: "Inter", style: "Medium" };
          txt.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
          txt.textAutoResize = 'WIDTH_AND_HEIGHT';
          chip.appendChild(txt);
          return chip;
        }

        function createVariantCard(variant: Variant): FrameNode {
          const card = figma.createFrame();
          card.name = `Variant ${variant.key}`;
          card.layoutMode = 'VERTICAL';
          card.counterAxisSizingMode = 'AUTO';
          card.primaryAxisSizingMode = 'AUTO';
          card.itemSpacing = 8;
          card.paddingLeft = card.paddingRight = 20;
          card.paddingTop = card.paddingBottom = 16;
          card.cornerRadius = 16;
          card.fills = [{ type: 'SOLID' as const, color: { r: 1, g: 1, b: 1 } }];
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
          keyCircle.fills = [{ type: 'SOLID' as const, color: { r: 0.93, g: 0.95, b: 1 } }];
          keyCircle.strokes = [{ type: 'SOLID' as const, color: { r: 0.18, g: 0.45, b: 0.85 } }];
          keyCircle.strokeWeight = 2;
          const keyText = figma.createText();
          keyText.characters = variant.key;
          keyText.fontSize = 16;
          keyText.fontName = { family: "Inter", style: "Bold" };
          keyText.fills = [{ type: 'SOLID' as const, color: { r: 0.18, g: 0.45, b: 0.85 } }];
          keyText.textAutoResize = 'WIDTH_AND_HEIGHT';
          // Overlay text on ellipse by grouping
          keyText.x = keyCircle.x + keyCircle.width / 2 - keyText.width / 2;
          keyText.y = keyCircle.y + keyCircle.height / 2 - keyText.height / 2;
          const keyGroup = figma.group([keyCircle, keyText], topRow);
          topRow.appendChild(keyGroup);
          // Name
          const nameText = figma.createText();
          nameText.characters = variant.name;
          nameText.fontSize = 16;
          nameText.fontName = { family: "Inter", style: "Medium" };
          nameText.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
          nameText.textAutoResize = 'WIDTH_AND_HEIGHT';
          topRow.appendChild(nameText);
          // Badge
          if (variant.status === 'Winner' || variant.status === 'Running') {
            const badge = createPill(
              variant.status,
              variant.status === 'Winner' ? { r: 0.22, g: 0.7, b: 0.36 } : { r: 0.18, g: 0.45, b: 0.85 },
              { r: 1, g: 1, b: 1 }
            );
            topRow.appendChild(badge);
          }
          card.appendChild(topRow);

          // Thumbnail
          const thumb = figma.createRectangle();
          thumb.resize(240, 140);
          thumb.fills = [{ type: 'SOLID' as const, color: { r: 0.93, g: 0.93, b: 0.97 } }];
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
          for (const metric of ['CTR', 'CR', 'SU'] as const) {
            bottomRow.appendChild(createMetricChip(metric, variant.metrics[metric]));
          }
          card.appendChild(bottomRow);
          return card;
        }

        function createNodeCard(title: string, subtitle?: string, trafficLabel?: string): FrameNode {
          const card = figma.createFrame();
          card.layoutMode = 'VERTICAL';
          card.counterAxisSizingMode = 'AUTO';
          card.primaryAxisSizingMode = 'AUTO';
          card.itemSpacing = 8;
          card.paddingLeft = card.paddingRight = 20;
          card.paddingTop = card.paddingBottom = 16;
          card.cornerRadius = 16;
          card.fills = [{ type: 'SOLID' as const, color: { r: 0.98, g: 0.98, b: 0.98 } }];
          card.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.9 } }];
          card.strokeWeight = 1;
          // Thumbnail placeholder
          const thumb = figma.createRectangle();
          thumb.resize(240, 140);
          thumb.fills = [{ type: 'SOLID' as const, color: { r: 0.93, g: 0.93, b: 0.97 } }];
          thumb.cornerRadius = 10;
          thumb.name = 'Thumbnail';
          card.appendChild(thumb);
          // Title
          const titleText = figma.createText();
          titleText.characters = title;
          titleText.fontSize = 18;
          titleText.fontName = { family: "Inter", style: "Bold" };
          titleText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
          titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
          card.appendChild(titleText);
          // Subtitle (optional)
          if (subtitle) {
            const subtitleText = figma.createText();
            subtitleText.characters = subtitle;
            subtitleText.fontSize = 14;
            subtitleText.fontName = { family: "Inter", style: "Regular" };
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
            label.fontName = { family: "Inter", style: "Bold" };
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
        await figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Inter", style: "Medium" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Inter", style: "Bold" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(()=>{});
        await figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(()=>{});
      }

        // ...existing code...
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
            }
            else if (msg.type === 'create-from-selection') {
              // Not implemented yet: would use selected frames as thumbnails
              figma.closePlugin('Create from selection is not yet implemented.');
            }


            else if (msg.type === 'cancel') {
              figma.closePlugin('Cancelled.');
            }















