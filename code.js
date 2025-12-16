"use strict";
// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).
// Runs this code if the plugin is run in Figma
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Toggle this flag to control plugin close behavior
const KEEP_OPEN = true;
if (figma.editorType === 'figma') {
    function createPill(text, fillColor, textColor) {
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
        width: 450,
        height: 720,
        title: 'Growthlab Flow Builder',
        themeColors: true,
    });
    // Helper: Metric chip
    function createMetricChip(label, value) {
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
        // Figtree Semibold fallback to Medium if Semibold is not available
        try {
            txt.fontName = { family: "Figtree", style: "Semibold" };
        }
        catch (_a) {
            txt.fontName = { family: "Figtree", style: "Medium" };
        }
        txt.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.45, b: 0.85 } }];
        txt.textAutoResize = 'WIDTH_AND_HEIGHT';
        txt.characters = `${label}: ${value}`;
        chip.appendChild(txt);
        return chip;
    }
    // Helper: Variant card
    function createVariantCard(variant) {
        const card = figma.createFrame();
        card.layoutMode = 'VERTICAL';
        card.counterAxisSizingMode = 'AUTO';
        card.primaryAxisSizingMode = 'AUTO';
        card.paddingLeft = card.paddingRight = 20;
        card.paddingTop = card.paddingBottom = 16;
        card.cornerRadius = 16;
        card.fills = [{ type: 'SOLID', color: { r: 0.97, g: 0.98, b: 1 } }];
        card.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
        card.strokeWeight = 1;
        card.name = `Variant: ${variant.name}`;
        // --- Top row: Key circle, name, badge ---
        const topRow = figma.createFrame();
        topRow.layoutMode = 'HORIZONTAL';
        topRow.counterAxisSizingMode = 'AUTO';
        topRow.primaryAxisSizingMode = 'AUTO';
        topRow.itemSpacing = 8;
        topRow.fills = [];
        topRow.strokes = [];
        topRow.name = 'Top Row';
        // Key circle
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
        // Center text in circle (overlay text on ellipse)
        keyText.x = keyCircle.x + keyCircle.width / 2 - 8;
        keyText.y = keyCircle.y + keyCircle.height / 2 - 10;
        // Instead of appendChild (not supported), group them visually by placing both in topRow
        topRow.appendChild(keyCircle);
        topRow.appendChild(keyText);
        // Variant name
        const nameText = figma.createText();
        nameText.fontName = { family: "Figtree", style: "Bold" };
        nameText.fontSize = 18;
        nameText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
        nameText.textAutoResize = 'WIDTH_AND_HEIGHT';
        nameText.characters = variant.name;
        topRow.appendChild(nameText);
        // Badge (winner/running)
        if (variant.status === 'winner' || variant.status === 'running') {
            const badgeColor = variant.status === 'winner' ? { r: 0.22, g: 0.7, b: 0.36 } : { r: 0.18, g: 0.45, b: 0.85 };
            // Capitalize for display
            const badgeLabel = variant.status.charAt(0).toUpperCase() + variant.status.slice(1);
            const badge = createPill(badgeLabel, badgeColor, { r: 1, g: 1, b: 1 });
            badge.name = 'Status Badge';
            topRow.appendChild(badge);
        }
        card.appendChild(topRow);
        // --- Thumbnail rectangle (placeholder for now) ---
        const thumb = figma.createFrame();
        thumb.resize(240, 140);
        thumb.cornerRadius = 12;
        thumb.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.95, b: 0.99 } }];
        thumb.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
        thumb.strokeWeight = 1;
        thumb.name = 'Thumbnail';
        card.appendChild(thumb);
        // --- Bottom row: metrics chips ---
        const metricsRow = figma.createFrame();
        metricsRow.layoutMode = 'HORIZONTAL';
        metricsRow.counterAxisSizingMode = 'AUTO';
        metricsRow.primaryAxisSizingMode = 'AUTO';
        metricsRow.itemSpacing = 8;
        metricsRow.fills = [];
        metricsRow.strokes = [];
        metricsRow.name = 'Metrics Row';
        // ctr, cr, su chips with up arrow and %
        metricsRow.appendChild(createMetricChip('CTR', variant.metrics.ctr));
        metricsRow.appendChild(createMetricChip('CR', variant.metrics.cr));
        metricsRow.appendChild(createMetricChip('SU', variant.metrics.su));
        card.appendChild(metricsRow);
        return card;
    }
    // Helper: Node card
    function createNodeCard(title, subtitle, trafficLabel) {
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
        // --- Top row: Title and traffic chip ---
        const topRow = figma.createFrame();
        topRow.layoutMode = 'HORIZONTAL';
        topRow.counterAxisSizingMode = 'AUTO';
        topRow.primaryAxisSizingMode = 'AUTO';
        topRow.itemSpacing = 8;
        topRow.fills = [];
        topRow.strokes = [];
        topRow.name = 'Top Row';
        // Title
        const titleText = figma.createText();
        titleText.fontName = { family: "Figtree", style: "Bold" };
        titleText.fontSize = 18;
        titleText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
        titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
        titleText.characters = title;
        topRow.appendChild(titleText);
        // Traffic label (optional)
        if (trafficLabel) {
            const chip = createPill(trafficLabel, { r: 0.18, g: 0.45, b: 0.85 }, { r: 1, g: 1, b: 1 });
            chip.name = 'Traffic Chip';
            topRow.appendChild(chip);
        }
        card.appendChild(topRow);
        // --- Thumbnail rectangle (placeholder for now) ---
        const thumb = figma.createFrame();
        thumb.resize(240, 140);
        thumb.cornerRadius = 12;
        thumb.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.95, b: 0.99 } }];
        thumb.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
        thumb.strokeWeight = 1;
        thumb.name = 'Thumbnail';
        card.appendChild(thumb);
        // Subtitle (optional)
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
    figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
        if (msg.type === 'create-flow' && msg.payload) {
            // ...existing code for create-flow...
            const { experimentName, roundNumber, entryLabel, exitLabel, } = msg.payload;
            const variants = msg.payload.variants;
            yield loadFonts();
            // --- Main Frame ---
            const flowFrame = figma.createFrame();
            flowFrame.name = `Experiment Flow: ${experimentName}`;
            flowFrame.layoutMode = 'HORIZONTAL';
            flowFrame.counterAxisSizingMode = 'AUTO';
            flowFrame.primaryAxisSizingMode = 'AUTO';
            flowFrame.itemSpacing = 64;
            flowFrame.paddingLeft = 48;
            flowFrame.paddingRight = 48;
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
            // Will append in correct order below
            // --- Round 1 variants container ---
            // IMPORTANT:
            // Variants MUST be stacked vertically inside a round.
            // Do NOT change variantsContainer.layoutMode to HORIZONTAL.
            const variantsContainer = figma.createFrame();
            variantsContainer.name = 'Round 1 Variants';
            variantsContainer.layoutMode = 'VERTICAL';
            variantsContainer.primaryAxisSizingMode = 'AUTO';
            variantsContainer.counterAxisSizingMode = 'AUTO';
            variantsContainer.itemSpacing = 24;
            variantsContainer.paddingTop = 24;
            variantsContainer.paddingBottom = 24;
            variantsContainer.paddingLeft = 24;
            variantsContainer.paddingRight = 24;
            variantsContainer.cornerRadius = 24;
            variantsContainer.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } }];
            variantsContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
            variantsContainer.strokeWeight = 1;
            // --- Variant cards ---
            const variantNodes = [];
            variants.forEach((variant, index) => {
                const card = createVariantCard(variant);
                variantsContainer.appendChild(card);
                variantNodes.push(card);
                connectNodes(entryCard, card, {
                    label: `${variant.traffic}%`,
                    winner: variant.status === "winner",
                    index,
                });
            });
            // Will append in correct order below
            // --- Exit node card ---
            const exitCard = createNodeCard(exitLabel);
            exitCard.name = 'Exit Node';
            // Will append in correct order below
            // --- Place in viewport center ---
            // Append children in strict order: Entry, Variants, Exit
            flowFrame.appendChild(entryCard);
            flowFrame.appendChild(variantsContainer);
            flowFrame.appendChild(exitCard);
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
                    winner: variants[i].status === 'winner',
                    label: `${variants[i].traffic}%`,
                    index: i
                });
            }
            // Each variant → Exit
            for (let i = 0; i < variantNodes.length; i++) {
                connectNodes(variantNodes[i], exitCard, {
                    winner: variants[i].status === 'winner',
                    index: i
                });
            }
            // --- Done ---
            figma.notify('Experiment flow created.');
            // figma.closePlugin('Experiment flow created.');
        }
        else if (msg.type === 'create-from-selection') {
            // Use up to 3 selected frames as thumbnails for variants A/B/C
            const selection = figma.currentPage.selection.filter(node => node.type === 'FRAME' || node.type === 'GROUP');
            if (selection.length === 0) {
                figma.notify('Select up to 3 frames to use as variant thumbnails.');
                // figma.closePlugin('Select up to 3 frames to use as variant thumbnails.');
                return;
            }
            if (!msg.payload) {
                figma.notify('Please fill the experiment form and click "Create from selection" again.');
                // figma.closePlugin('Please fill the experiment form and click "Create from selection" again.');
                return;
            }
            const { experimentName, roundNumber, entryLabel, exitLabel, variants } = msg.payload;
            yield loadFonts();
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
            roundContainer.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.97, b: 1 } }];
            roundContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
            roundContainer.strokeWeight = 1;
            // --- Variant cards with thumbnails ---
            const variantNodes = [];
            for (let i = 0; i < variants.length; i++) {
                const v = variants[i];
                const card = createVariantCard(v);
                // If a selected frame exists for this variant, clone and resize it into the thumbnail area
                if (selection[i]) {
                    const thumb = selection[i].clone();
                    thumb.resize(240, 140);
                    if (thumb.type === 'FRAME')
                        thumb.cornerRadius = 12;
                    thumb.name = 'Thumbnail';
                    // Remove placeholder thumb from card and insert this one
                    for (const child of Array.from(card.children)) {
                        if (child.name === 'Thumbnail')
                            child.remove();
                    }
                    card.insertChild(1, thumb); // Insert after top row
                }
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
            // figma.closePlugin('Experiment flow created from selection.');
        }
        else if (msg.type === 'cancel') {
            // Explicit cancel action: close the plugin (only if KEEP_OPEN is false)
            if (!KEEP_OPEN)
                figma.closePlugin('Plugin closed.');
            else
                figma.notify('Canceled');
            return;
        }
    });
    function connectNodes(fromNode, toNode, options) {
        var _a;
        const color = (options === null || options === void 0 ? void 0 : options.winner)
            ? { r: 0.22, g: 0.7, b: 0.36 }
            : { r: 0.18, g: 0.45, b: 0.85 };
        const strokeWeight = (options === null || options === void 0 ? void 0 : options.winner) ? 7 : 4;
        // Absolute bounds helpers
        const fx = fromNode.absoluteTransform[0][2];
        const fy = fromNode.absoluteTransform[1][2];
        const tx = toNode.absoluteTransform[0][2];
        const ty = toNode.absoluteTransform[1][2];
        // Anchor points: right-middle -> left-middle
        const startX = fx + fromNode.width;
        const startY = fy + fromNode.height / 2;
        const endX = tx;
        const endY = ty + toNode.height / 2;
        // Restore simple vertical connector routing
        const index = (_a = options === null || options === void 0 ? void 0 : options.index) !== null && _a !== void 0 ? _a : 0; // 0, 1, 2 for A/B/C
        const midX = startX + 96 + index * 12;
        // Build elbow path: start -> midX -> end
        const pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
        // Draw line (vector stroke)
        const line = figma.createVector();
        line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
        line.strokes = [{ type: "SOLID", color }];
        line.strokeWeight = strokeWeight;
        line.strokeAlign = "CENTER";
        line.name = "Flow Line";
        figma.currentPage.appendChild(line);
        // Optional label pill near first segment
        if (options === null || options === void 0 ? void 0 : options.label) {
            const pill = createPill(options.label, { r: 1, g: 1, b: 1 }, color);
            pill.strokes = [{ type: "SOLID", color }];
            pill.strokeWeight = 1;
            pill.x = midX + 6; // slightly right of the vertical segment
            pill.y = startY - pill.height / 2;
            figma.currentPage.appendChild(pill);
        }
        // Optional arrowhead at end (pointing right)
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
    function loadFonts() {
        return __awaiter(this, void 0, void 0, function* () {
            // Always load Inter Regular (default for new text nodes)
            yield figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(() => { });
            // Always load Figtree Regular
            yield figma.loadFontAsync({ family: "Figtree", style: "Regular" }).catch(() => { });
            // Try to load Semibold, fallback to Medium if not available
            try {
                yield figma.loadFontAsync({ family: "Figtree", style: "Semibold" });
            }
            catch (_a) {
                yield figma.loadFontAsync({ family: "Figtree", style: "Medium" }).catch(() => { });
            }
            // Always load Figtree Bold
            yield figma.loadFontAsync({ family: "Figtree", style: "Bold" }).catch(() => { });
            yield figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(() => { });
            yield figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(() => { });
        });
    }
    // End of if (figma.editorType === 'figma')
}
// ...existing code...
