"use strict";
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Runs this code if the plugin is run in Figma
if (figma.editorType === 'figma') {
    figma.showUI(__html__);
    figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (msg.type === 'create-flow' && msg.payload) {
            const { experimentName, roundNumber, entryLabel, exitLabel, variants } = msg.payload;
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
            // --- Helper utilities ---
            function createPill(text, bgColor, textColor) {
                const pill = figma.createFrame();
                pill.layoutMode = 'HORIZONTAL';
                pill.counterAxisSizingMode = 'AUTO';
                pill.primaryAxisSizingMode = 'AUTO';
                pill.paddingLeft = pill.paddingRight = 10;
                pill.paddingTop = pill.paddingBottom = 3;
                pill.cornerRadius = 10;
                pill.fills = [{ type: 'SOLID', color: bgColor }];
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
            function createMetricChip(label, value) {
                const chip = figma.createFrame();
                chip.layoutMode = 'HORIZONTAL';
                chip.counterAxisSizingMode = 'AUTO';
                chip.primaryAxisSizingMode = 'AUTO';
                // removed stray card.fills assignment
                chip.paddingTop = chip.paddingBottom = 2;
                chip.cornerRadius = 8;
                chip.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } }];
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
            function createVariantCard(variant) {
                const card = figma.createFrame();
                card.name = `Variant ${variant.key}`;
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
                keyText.characters = variant.key;
                keyText.fontSize = 16;
                keyText.fontName = { family: "Inter", style: "Bold" };
                keyText.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
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
                    const badge = createPill(variant.status, variant.status === 'Winner' ? WINNER_COLOR : RUNNING_COLOR, { r: 1, g: 1, b: 1 });
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
                for (const metric of ['CTR', 'CR', 'SU']) {
                    bottomRow.appendChild(createMetricChip(metric, variant.metrics[metric]));
                }
                card.appendChild(bottomRow);
                return card;
            }
            function createNodeCard(title, subtitle, trafficLabel) {
                const card = figma.createFrame();
                card.layoutMode = 'VERTICAL';
                card.counterAxisSizingMode = 'AUTO';
                card.primaryAxisSizingMode = 'AUTO';
                card.itemSpacing = 8;
                card.paddingLeft = card.paddingRight = 20;
                card.paddingTop = card.paddingBottom = 16;
                card.cornerRadius = 16;
                card.fills = [{ type: 'SOLID', color: ENTRY_EXIT_CARD_BG.color }];
                card.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.85, b: 0.9 } }];
                card.strokeWeight = 1;
                // Thumbnail placeholder
                const thumb = figma.createRectangle();
                thumb.resize(THUMB_SIZE.width, THUMB_SIZE.height);
                thumb.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.93, b: 0.97 } }];
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
            function connectNodes(fromNode, toNode, options) {
                const connector = figma.createConnector();
                connector.connectorStart = { endpointNodeId: fromNode.id, magnet: 'AUTO' };
                connector.connectorEnd = { endpointNodeId: toNode.id, magnet: 'AUTO' };
                connector.strokeWeight = (options === null || options === void 0 ? void 0 : options.winner) ? 7 : 4;
                connector.strokeAlign = 'CENTER';
                connector.strokes = [{ type: 'SOLID', color: (options === null || options === void 0 ? void 0 : options.winner) ? WINNER_CONNECTOR_COLOR : CONNECTOR_COLOR }];
                connector.connectorLineType = 'ELBOWED';
                // Arrowheads not supported in Figma Plugin API as of now
                // Label (traffic %)
                if (options === null || options === void 0 ? void 0 : options.label) {
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
            function loadFonts() {
                return __awaiter(this, void 0, void 0, function* () {
                    yield figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(() => { });
                    yield figma.loadFontAsync({ family: "Inter", style: "Medium" }).catch(() => { });
                    yield figma.loadFontAsync({ family: "Inter", style: "Bold" }).catch(() => { });
                    yield figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(() => { });
                    yield figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(() => { });
                });
            }
            yield loadFonts();
            // --- Main Frame ---
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
            roundContainer.itemSpacing = VARIANT_CARD_SPACING;
            roundContainer.paddingLeft = roundContainer.paddingRight = ROUND_CONTAINER_PADDING;
            roundContainer.paddingTop = roundContainer.paddingBottom = ROUND_CONTAINER_PADDING;
            roundContainer.cornerRadius = 24;
            roundContainer.fills = [{ type: 'SOLID', color: VARIANT_CONTAINER_BG.color }];
            roundContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
            roundContainer.strokeWeight = 1;
            // --- Variant cards ---
            const variantNodes = [];
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
    });
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
    figma.ui.onmessage = (msg) => {
        // One way of distinguishing between different types of messages sent from
        // your HTML page is to use an object with a "type" property like this.
        if (msg.type === 'create-shapes') {
            // This plugin creates shapes and connectors on the screen.
            const numberOfShapes = msg.count;
            const nodes = [];
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
    figma.ui.onmessage = (msg) => {
        // One way of distinguishing between different types of messages sent from
        // your HTML page is to use an object with a "type" property like this.
        if (msg.type === 'create-shapes') {
            // This plugin creates slides and puts the user in grid view.
            const numberOfSlides = msg.count;
            const nodes = [];
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
    figma.ui.onmessage = (msg) => {
        // One way of distinguishing between different types of messages sent from
        // your HTML page is to use an object with a "type" property like this.
        if (msg.type === 'create-shapes') {
            // This plugin creates frames and puts the user in grid view.
            const numberOfFrames = msg.count;
            const nodes = [];
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
