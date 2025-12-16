"use strict";
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// load-fonts.ts
var loadedFigtreeSemibold = "Semibold";
function loadFonts() {
  return __async(this, null, function* () {
    yield figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(() => {
    });
    yield figma.loadFontAsync({ family: "Figtree", style: "Regular" }).catch(() => {
    });
    try {
      yield figma.loadFontAsync({ family: "Figtree", style: "Semibold" });
      loadedFigtreeSemibold = "Semibold";
    } catch (e) {
      yield figma.loadFontAsync({ family: "Figtree", style: "Medium" }).catch(() => {
      });
      loadedFigtreeSemibold = "Medium";
    }
    yield figma.loadFontAsync({ family: "Figtree", style: "Bold" }).catch(() => {
    });
    yield figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(() => {
    });
    yield figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(() => {
    });
  });
}
function getLoadedFigtreeSemibold() {
  return loadedFigtreeSemibold;
}

// experiment-info-card.ts
function createExperimentInfoCard(experimentName, description = "", figmaLink = "", jiraLink = "", miroLink = "") {
  return __async(this, null, function* () {
    yield loadFonts();
    const card = figma.createFrame();
    card.name = `Experiment Info \u2014 ${experimentName}`;
    card.layoutMode = "VERTICAL";
    card.counterAxisSizingMode = "AUTO";
    card.primaryAxisSizingMode = "FIXED";
    card.itemSpacing = 24;
    card.paddingLeft = card.paddingRight = 32;
    card.paddingTop = card.paddingBottom = 32;
    card.cornerRadius = 18;
    card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    card.strokes = [{ type: "SOLID", color: { r: 0.91, g: 0.93, b: 0.97 } }];
    card.strokeWeight = 1;
    card.effects = [];
    card.resize(400, 540);
    const badge = figma.createFrame();
    badge.layoutMode = "HORIZONTAL";
    badge.counterAxisSizingMode = "AUTO";
    badge.primaryAxisSizingMode = "AUTO";
    badge.paddingLeft = badge.paddingRight = 12;
    badge.paddingTop = badge.paddingBottom = 4;
    badge.cornerRadius = 8;
    badge.fills = [{ type: "SOLID", color: { r: 0.89, g: 0.94, b: 1 } }];
    badge.name = "Status Badge";
    const badgeText = figma.createText();
    badgeText.fontName = { family: "Figtree", style: "Bold" };
    badgeText.fontSize = 14;
    badgeText.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
    badgeText.textAutoResize = "WIDTH_AND_HEIGHT";
    badgeText.characters = "Active";
    badge.appendChild(badgeText);
    card.appendChild(badge);
    const titleRow = figma.createFrame();
    titleRow.layoutMode = "HORIZONTAL";
    titleRow.counterAxisSizingMode = "AUTO";
    titleRow.primaryAxisSizingMode = "AUTO";
    titleRow.itemSpacing = 0;
    titleRow.fills = [];
    titleRow.strokes = [];
    titleRow.name = "Title Row";
    const titleText = figma.createText();
    titleText.fontName = { family: "Figtree", style: "Bold" };
    titleText.fontSize = 28;
    titleText.fills = [{ type: "SOLID", color: { r: 0.07, g: 0.09, b: 0.16 } }];
    titleText.textAutoResize = "WIDTH_AND_HEIGHT";
    titleText.characters = experimentName;
    titleRow.appendChild(titleText);
    card.appendChild(titleRow);
    const descSection = yield createSection("Description", description || "", true);
    card.appendChild(descSection);
    const hypSection = yield createSection("Hypothesis", "Lorem ipsum", true);
    card.appendChild(hypSection);
    const metricsSection = figma.createFrame();
    metricsSection.layoutMode = "VERTICAL";
    metricsSection.counterAxisSizingMode = "AUTO";
    metricsSection.primaryAxisSizingMode = "AUTO";
    metricsSection.itemSpacing = 8;
    metricsSection.fills = [];
    metricsSection.strokes = [];
    metricsSection.name = "Metrics Section";
    const metricsLabel = figma.createText();
    metricsLabel.fontName = { family: "Figtree", style: getLoadedFigtreeSemibold() };
    metricsLabel.fontSize = 15;
    metricsLabel.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.6, b: 0.67 } }];
    metricsLabel.textAutoResize = "WIDTH_AND_HEIGHT";
    metricsLabel.characters = "Metrics";
    metricsSection.appendChild(metricsLabel);
    metricsSection.appendChild(createMetricRow(1, "Click through rate (CTR)", "--%"));
    metricsSection.appendChild(createMetricRow(2, "Conversion rate (CR)", "--%"));
    metricsSection.appendChild(createMetricRow(3, "Sign ups (SU)", "--%"));
    card.appendChild(metricsSection);
    const linksSection = figma.createFrame();
    linksSection.layoutMode = "VERTICAL";
    linksSection.counterAxisSizingMode = "AUTO";
    linksSection.primaryAxisSizingMode = "AUTO";
    linksSection.itemSpacing = 4;
    linksSection.fills = [];
    linksSection.strokes = [];
    linksSection.name = "Links Section";
    const linksLabel = figma.createText();
    linksLabel.fontName = { family: "Figtree", style: getLoadedFigtreeSemibold() };
    linksLabel.fontSize = 13;
    linksLabel.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
    linksLabel.textAutoResize = "WIDTH_AND_HEIGHT";
    linksLabel.characters = "Links";
    linksSection.appendChild(linksLabel);
    const linksRow = figma.createFrame();
    linksRow.layoutMode = "HORIZONTAL";
    linksRow.counterAxisSizingMode = "AUTO";
    linksRow.primaryAxisSizingMode = "AUTO";
    linksRow.itemSpacing = 8;
    linksRow.fills = [];
    linksRow.strokes = [];
    if (figmaLink) {
      linksRow.appendChild(createLinkChip("Figma", figmaLink));
    }
    if (jiraLink) {
      linksRow.appendChild(createLinkChip("Jira", jiraLink));
    }
    if (miroLink) {
      linksRow.appendChild(createLinkChip("Miro", miroLink));
    }
    linksSection.appendChild(linksRow);
    card.appendChild(linksSection);
    return card;
  });
}
function createSection(label, value, muted = false) {
  return __async(this, null, function* () {
    yield loadFonts();
    const section = figma.createFrame();
    section.layoutMode = "VERTICAL";
    section.counterAxisSizingMode = "AUTO";
    section.primaryAxisSizingMode = "AUTO";
    section.itemSpacing = 2;
    section.fills = [];
    section.strokes = [];
    section.name = `${label} Section`;
    const labelText = figma.createText();
    labelText.fontName = { family: "Figtree", style: getLoadedFigtreeSemibold() };
    labelText.fontSize = 16;
    labelText.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.6, b: 0.67 } }];
    labelText.textAutoResize = "WIDTH_AND_HEIGHT";
    labelText.characters = label;
    section.appendChild(labelText);
    const valueText = figma.createText();
    valueText.fontName = { family: "Figtree", style: "Regular" };
    valueText.fontSize = 17;
    valueText.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.2, b: 0.25 } }];
    valueText.textAutoResize = "WIDTH_AND_HEIGHT";
    valueText.characters = value;
    section.appendChild(valueText);
    return section;
  });
}
function createMetricRow(num, label, value) {
  const row = figma.createFrame();
  row.layoutMode = "HORIZONTAL";
  row.counterAxisSizingMode = "AUTO";
  row.primaryAxisSizingMode = "AUTO";
  row.itemSpacing = 10;
  row.fills = [];
  row.strokes = [];
  const numText = figma.createText();
  numText.fontName = { family: "Figtree", style: "Regular" };
  numText.fontSize = 16;
  numText.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.6, b: 0.67 } }];
  numText.textAutoResize = "WIDTH_AND_HEIGHT";
  numText.characters = `${num}.`;
  row.appendChild(numText);
  const labelText = figma.createText();
  labelText.fontName = { family: "Figtree", style: "Regular" };
  labelText.fontSize = 16;
  labelText.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.2, b: 0.25 } }];
  labelText.textAutoResize = "WIDTH_AND_HEIGHT";
  labelText.characters = label;
  row.appendChild(labelText);
  const pill = figma.createFrame();
  pill.layoutMode = "HORIZONTAL";
  pill.counterAxisSizingMode = "AUTO";
  pill.primaryAxisSizingMode = "AUTO";
  pill.paddingLeft = pill.paddingRight = 10;
  pill.paddingTop = pill.paddingBottom = 2;
  pill.cornerRadius = 8;
  pill.fills = [{ type: "SOLID", color: { r: 0.96, g: 0.97, b: 0.99 } }];
  pill.strokes = [{ type: "SOLID", color: { r: 0.87, g: 0.89, b: 0.93 } }];
  pill.strokeWeight = 1;
  pill.name = "Metric Pill";
  const icon = figma.createText();
  icon.fontName = { family: "Figtree", style: "Regular" };
  icon.fontSize = 15;
  icon.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.6, b: 0.67 } }];
  icon.textAutoResize = "WIDTH_AND_HEIGHT";
  icon.characters = "\u{1F3AF}";
  pill.appendChild(icon);
  const valueText = figma.createText();
  valueText.fontName = { family: "Figtree", style: getLoadedFigtreeSemibold() };
  valueText.fontSize = 15;
  valueText.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.6, b: 0.67 } }];
  valueText.textAutoResize = "WIDTH_AND_HEIGHT";
  valueText.characters = value;
  pill.appendChild(valueText);
  row.appendChild(pill);
  return row;
}
function createLinkChip(label, url) {
  const chip = figma.createFrame();
  chip.layoutMode = "HORIZONTAL";
  chip.counterAxisSizingMode = "AUTO";
  chip.primaryAxisSizingMode = "AUTO";
  chip.paddingLeft = chip.paddingRight = 16;
  chip.paddingTop = chip.paddingBottom = 8;
  chip.cornerRadius = 10;
  chip.fills = [{ type: "SOLID", color: { r: 0.96, g: 0.97, b: 0.99 } }];
  chip.strokes = [{ type: "SOLID", color: { r: 0.87, g: 0.89, b: 0.93 } }];
  chip.strokeWeight = 1;
  chip.name = "Link Chip";
  const icon = figma.createText();
  icon.fontName = { family: "Figtree", style: "Bold" };
  icon.fontSize = 18;
  icon.fills = label === "Figma" ? [{ type: "SOLID", color: { r: 0.98, g: 0.36, b: 0.19 } }] : label === "Jira" ? [{ type: "SOLID", color: { r: 0.13, g: 0.47, b: 0.95 } }] : label === "Miro" ? [{ type: "SOLID", color: { r: 1, g: 0.82, b: 0.09 } }] : [{ type: "SOLID", color: { r: 0.55, g: 0.6, b: 0.67 } }];
  icon.textAutoResize = "WIDTH_AND_HEIGHT";
  icon.characters = label === "Figma" ? "\u{1F7E0}" : label === "Jira" ? "\u{1F7E6}" : label === "Miro" ? "\u{1F7E8}" : "\u{1F517}";
  chip.appendChild(icon);
  const txt = figma.createText();
  txt.fontName = { family: "Figtree", style: getLoadedFigtreeSemibold() };
  txt.fontSize = 16;
  txt.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.2, b: 0.25 } }];
  txt.textAutoResize = "WIDTH_AND_HEIGHT";
  txt.characters = ` ${label} project name`;
  chip.appendChild(txt);
  return chip;
}

// code.ts
var KEEP_OPEN = true;
if (figma.editorType === "figma") {
  let createPill = function(text, fillColor, textColor) {
    const pill = figma.createFrame();
    pill.layoutMode = "HORIZONTAL";
    pill.counterAxisSizingMode = "AUTO";
    pill.primaryAxisSizingMode = "AUTO";
    pill.paddingLeft = pill.paddingRight = 12;
    pill.paddingTop = pill.paddingBottom = 4;
    pill.cornerRadius = 12;
    pill.fills = [{ type: "SOLID", color: fillColor }];
    pill.strokes = [];
    pill.name = "Pill";
    const txt = figma.createText();
    txt.fontName = { family: "Figtree", style: "Bold" };
    txt.fontSize = 13;
    txt.fills = [{ type: "SOLID", color: textColor }];
    txt.textAutoResize = "WIDTH_AND_HEIGHT";
    txt.characters = text;
    pill.appendChild(txt);
    return pill;
  }, createMetricChip = function(label, value) {
    const chip = figma.createFrame();
    chip.layoutMode = "HORIZONTAL";
    chip.counterAxisSizingMode = "AUTO";
    chip.primaryAxisSizingMode = "AUTO";
    chip.paddingLeft = chip.paddingRight = 8;
    chip.paddingTop = chip.paddingBottom = 2;
    chip.cornerRadius = 8;
    chip.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.97, b: 1 } }];
    chip.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.9, b: 1 } }];
    chip.strokeWeight = 1;
    chip.name = "Metric Chip";
    const txt = figma.createText();
    txt.fontSize = 12;
    try {
      txt.fontName = { family: "Figtree", style: "Semibold" };
    } catch (e) {
      txt.fontName = { family: "Figtree", style: "Medium" };
    }
    txt.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
    txt.textAutoResize = "WIDTH_AND_HEIGHT";
    txt.characters = `${label}: ${value}`;
    chip.appendChild(txt);
    return chip;
  }, createVariantCard = function(variant) {
    const card = figma.createFrame();
    card.layoutMode = "VERTICAL";
    card.counterAxisSizingMode = "AUTO";
    card.primaryAxisSizingMode = "AUTO";
    card.paddingLeft = card.paddingRight = 20;
    card.paddingTop = card.paddingBottom = 16;
    card.cornerRadius = 16;
    card.fills = [{ type: "SOLID", color: { r: 0.97, g: 0.98, b: 1 } }];
    card.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.9, b: 1 } }];
    card.strokeWeight = 1;
    card.name = `Variant: ${variant.name}`;
    const topRow = figma.createFrame();
    topRow.layoutMode = "HORIZONTAL";
    topRow.counterAxisSizingMode = "AUTO";
    topRow.primaryAxisSizingMode = "AUTO";
    topRow.itemSpacing = 8;
    topRow.fills = [];
    topRow.strokes = [];
    topRow.name = "Top Row";
    const keyCircle = figma.createEllipse();
    keyCircle.resize(28, 28);
    keyCircle.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
    keyCircle.strokes = [];
    keyCircle.name = "Key Circle";
    const keyText = figma.createText();
    keyText.fontName = { family: "Figtree", style: "Bold" };
    keyText.fontSize = 16;
    keyText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    keyText.textAutoResize = "WIDTH_AND_HEIGHT";
    keyText.characters = variant.key;
    keyText.x = keyCircle.x + keyCircle.width / 2 - 8;
    keyText.y = keyCircle.y + keyCircle.height / 2 - 10;
    topRow.appendChild(keyCircle);
    topRow.appendChild(keyText);
    const nameText = figma.createText();
    nameText.fontName = { family: "Figtree", style: "Bold" };
    nameText.fontSize = 18;
    nameText.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.3 } }];
    nameText.textAutoResize = "WIDTH_AND_HEIGHT";
    nameText.characters = variant.name;
    topRow.appendChild(nameText);
    if (variant.status === "winner" || variant.status === "running") {
      const badgeColor = variant.status === "winner" ? { r: 0.22, g: 0.7, b: 0.36 } : { r: 0.18, g: 0.45, b: 0.85 };
      const badgeLabel = variant.status.charAt(0).toUpperCase() + variant.status.slice(1);
      const badge = createPill(badgeLabel, badgeColor, { r: 1, g: 1, b: 1 });
      badge.name = "Status Badge";
      topRow.appendChild(badge);
    }
    card.appendChild(topRow);
    const thumb = figma.createFrame();
    thumb.resize(240, 140);
    thumb.cornerRadius = 12;
    thumb.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.95, b: 0.99 } }];
    thumb.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.9, b: 1 } }];
    thumb.strokeWeight = 1;
    thumb.name = "Thumbnail";
    card.appendChild(thumb);
    const metricsRow = figma.createFrame();
    metricsRow.layoutMode = "HORIZONTAL";
    metricsRow.counterAxisSizingMode = "AUTO";
    metricsRow.primaryAxisSizingMode = "AUTO";
    metricsRow.itemSpacing = 8;
    metricsRow.fills = [];
    metricsRow.strokes = [];
    metricsRow.name = "Metrics Row";
    metricsRow.appendChild(createMetricChip("CTR", variant.metrics.ctr));
    metricsRow.appendChild(createMetricChip("CR", variant.metrics.cr));
    metricsRow.appendChild(createMetricChip("SU", variant.metrics.su));
    card.appendChild(metricsRow);
    return card;
  }, createNodeCard = function(title, subtitle, trafficLabel) {
    const card = figma.createFrame();
    card.layoutMode = "VERTICAL";
    card.counterAxisSizingMode = "AUTO";
    card.primaryAxisSizingMode = "AUTO";
    card.paddingLeft = card.paddingRight = 20;
    card.paddingTop = card.paddingBottom = 16;
    card.cornerRadius = 16;
    card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
    card.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.9, b: 1 } }];
    card.strokeWeight = 1;
    card.name = `Node: ${title}`;
    const topRow = figma.createFrame();
    topRow.layoutMode = "HORIZONTAL";
    topRow.counterAxisSizingMode = "AUTO";
    topRow.primaryAxisSizingMode = "AUTO";
    topRow.itemSpacing = 8;
    topRow.fills = [];
    topRow.strokes = [];
    topRow.name = "Top Row";
    const titleText = figma.createText();
    titleText.fontName = { family: "Figtree", style: "Bold" };
    titleText.fontSize = 18;
    titleText.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.3 } }];
    titleText.textAutoResize = "WIDTH_AND_HEIGHT";
    titleText.characters = title;
    topRow.appendChild(titleText);
    if (trafficLabel) {
      const chip = createPill(trafficLabel, { r: 0.18, g: 0.45, b: 0.85 }, { r: 1, g: 1, b: 1 });
      chip.name = "Traffic Chip";
      topRow.appendChild(chip);
    }
    card.appendChild(topRow);
    const thumb = figma.createFrame();
    thumb.resize(240, 140);
    thumb.cornerRadius = 12;
    thumb.fills = [{ type: "SOLID", color: { r: 0.93, g: 0.95, b: 0.99 } }];
    thumb.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.9, b: 1 } }];
    thumb.strokeWeight = 1;
    thumb.name = "Thumbnail";
    card.appendChild(thumb);
    if (subtitle) {
      const subtitleText = figma.createText();
      subtitleText.fontName = { family: "Figtree", style: "Regular" };
      subtitleText.fontSize = 14;
      subtitleText.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.5 } }];
      subtitleText.textAutoResize = "WIDTH_AND_HEIGHT";
      subtitleText.characters = subtitle;
      card.appendChild(subtitleText);
    }
    return card;
  }, connectNodes = function(fromNode, toNode, options) {
    var _a;
    const color = (options == null ? void 0 : options.winner) ? { r: 0.22, g: 0.7, b: 0.36 } : { r: 0.18, g: 0.45, b: 0.85 };
    const strokeWeight = (options == null ? void 0 : options.winner) ? 7 : 4;
    const fx = fromNode.absoluteTransform[0][2];
    const fy = fromNode.absoluteTransform[1][2];
    const tx = toNode.absoluteTransform[0][2];
    const ty = toNode.absoluteTransform[1][2];
    const startX = fx + fromNode.width;
    const startY = fy + fromNode.height / 2;
    const endX = tx;
    const endY = ty + toNode.height / 2;
    const index = (_a = options == null ? void 0 : options.index) != null ? _a : 0;
    const midX = startX + 96 + index * 12;
    const pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
    const line = figma.createVector();
    line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
    line.strokes = [{ type: "SOLID", color }];
    line.strokeWeight = strokeWeight;
    line.strokeAlign = "CENTER";
    line.name = "Flow Line";
    figma.currentPage.appendChild(line);
    if (options == null ? void 0 : options.label) {
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
        data: `M ${endX} ${endY} L ${endX - size} ${endY - size / 2} L ${endX - size} ${endY + size / 2} Z`
      }
    ];
    arrow.fills = [{ type: "SOLID", color }];
    arrow.strokes = [];
    arrow.name = "Arrowhead";
    figma.currentPage.appendChild(arrow);
    return line;
  };
  createPill2 = createPill, createMetricChip2 = createMetricChip, createVariantCard2 = createVariantCard, createNodeCard2 = createNodeCard, connectNodes2 = connectNodes;
  figma.showUI(__html__, {
    width: 450,
    height: 720,
    title: "Growthlab Flow Builder",
    themeColors: true
  });
  figma.ui.onmessage = (msg) => __async(null, null, function* () {
    if (msg.type === "create-flow" && msg.payload) {
      let slugify2 = function(str) {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      };
      var slugify = slugify2;
      const {
        experimentName,
        roundNumber,
        entryLabel,
        exitLabel
      } = msg.payload;
      const variants = msg.payload.variants;
      if (!Array.isArray(variants) || variants.length === 0) {
        figma.notify("You must add at least one variant to create a flow.");
        return;
      }
      yield loadFonts2();
      const slug = slugify2(experimentName);
      const flowFrameName = `Experiment Flow \u2014 ${slug} \u2014 Round ${roundNumber}`;
      const infoCardName = `Experiment Info \u2014 ${slug}`;
      const existingFlow = figma.currentPage.findOne((n) => n.type === "FRAME" && n.name === flowFrameName);
      if (existingFlow) existingFlow.remove();
      let infoCard = figma.currentPage.findOne((n) => n.type === "FRAME" && n.name === infoCardName);
      if (infoCard) infoCard.remove();
      infoCard = yield createExperimentInfoCard(
        experimentName,
        msg.payload.experimentDescription || "",
        msg.payload.figmaLink || "",
        msg.payload.jiraLink || "",
        msg.payload.miroLink || ""
      );
      const flowFrame = figma.createFrame();
      flowFrame.name = flowFrameName;
      flowFrame.layoutMode = "HORIZONTAL";
      flowFrame.counterAxisSizingMode = "AUTO";
      flowFrame.primaryAxisSizingMode = "AUTO";
      flowFrame.itemSpacing = 64;
      flowFrame.paddingLeft = 48;
      flowFrame.paddingRight = 48;
      flowFrame.paddingTop = flowFrame.paddingBottom = 32;
      flowFrame.fills = [];
      flowFrame.cornerRadius = 24;
      const roundBadge = createPill(`ROUND #${roundNumber}`, { r: 1, g: 0.97, b: 0.8 }, { r: 0.5, g: 0.45, b: 0.1 });
      roundBadge.name = "Round Badge";
      flowFrame.appendChild(roundBadge);
      const entryCard = createNodeCard(entryLabel, void 0, "100%");
      entryCard.name = "Entry Node";
      const variantsContainer = figma.createFrame();
      variantsContainer.name = "Round 1 Variants";
      variantsContainer.layoutMode = "VERTICAL";
      variantsContainer.primaryAxisSizingMode = "AUTO";
      variantsContainer.counterAxisSizingMode = "AUTO";
      variantsContainer.itemSpacing = 24;
      variantsContainer.paddingTop = 24;
      variantsContainer.paddingBottom = 24;
      variantsContainer.paddingLeft = 24;
      variantsContainer.paddingRight = 24;
      variantsContainer.cornerRadius = 24;
      variantsContainer.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.97, b: 1 } }];
      variantsContainer.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.9, b: 1 } }];
      variantsContainer.strokeWeight = 1;
      const variantNodes = [];
      variants.forEach((variant, index) => {
        const card = createVariantCard(variant);
        variantsContainer.appendChild(card);
        variantNodes.push(card);
        connectNodes(entryCard, card, {
          label: `${variant.traffic}%`,
          winner: variant.status === "winner",
          index
        });
      });
      const exitCard = createNodeCard(exitLabel);
      exitCard.name = "Exit Node";
      flowFrame.appendChild(entryCard);
      flowFrame.appendChild(variantsContainer);
      flowFrame.appendChild(exitCard);
      const center = figma.viewport.center;
      flowFrame.x = center.x - flowFrame.width / 2;
      flowFrame.y = center.y - flowFrame.height / 2;
      figma.currentPage.appendChild(flowFrame);
      infoCard.x = flowFrame.x - infoCard.width - 64;
      infoCard.y = flowFrame.y + entryCard.y + entryCard.height / 2 - infoCard.height / 2;
      if (infoCard.parent == null) figma.currentPage.appendChild(infoCard);
      figma.currentPage.selection = [flowFrame];
      figma.viewport.scrollAndZoomIntoView([flowFrame]);
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(entryCard, variantNodes[i], {
          winner: variants[i].status === "winner",
          label: `${variants[i].traffic}%`,
          index: i
        });
      }
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(variantNodes[i], exitCard, {
          winner: variants[i].status === "winner",
          index: i
        });
      }
      figma.notify("Experiment flow created.");
    } else if (msg.type === "create-from-selection") {
      const selection = figma.currentPage.selection.filter((node) => node.type === "FRAME" || node.type === "GROUP");
      if (selection.length === 0) {
        figma.notify("Select up to 3 frames to use as variant thumbnails.");
        return;
      }
      if (!msg.payload) {
        figma.notify('Please fill the experiment form and click "Create from selection" again.');
        return;
      }
      const { experimentName, roundNumber, entryLabel, exitLabel, variants } = msg.payload;
      yield loadFonts2();
      const flowFrame = figma.createFrame();
      flowFrame.name = `Experiment Flow: ${experimentName}`;
      flowFrame.layoutMode = "HORIZONTAL";
      flowFrame.counterAxisSizingMode = "AUTO";
      flowFrame.primaryAxisSizingMode = "AUTO";
      flowFrame.itemSpacing = 32;
      flowFrame.paddingLeft = flowFrame.paddingRight = 32;
      flowFrame.paddingTop = flowFrame.paddingBottom = 32;
      flowFrame.fills = [];
      flowFrame.cornerRadius = 24;
      const roundBadge = createPill(`ROUND #${roundNumber}`, { r: 1, g: 0.97, b: 0.8 }, { r: 0.5, g: 0.45, b: 0.1 });
      roundBadge.name = "Round Badge";
      flowFrame.appendChild(roundBadge);
      const entryCard = createNodeCard(entryLabel, void 0, "100%");
      entryCard.name = "Entry Node";
      flowFrame.appendChild(entryCard);
      const roundContainer = figma.createFrame();
      roundContainer.name = "Round 1 Variants";
      roundContainer.layoutMode = "VERTICAL";
      roundContainer.counterAxisSizingMode = "AUTO";
      roundContainer.primaryAxisSizingMode = "AUTO";
      roundContainer.itemSpacing = 20;
      roundContainer.paddingLeft = roundContainer.paddingRight = 24;
      roundContainer.paddingTop = roundContainer.paddingBottom = 24;
      roundContainer.cornerRadius = 24;
      roundContainer.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.97, b: 1 } }];
      roundContainer.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.9, b: 1 } }];
      roundContainer.strokeWeight = 1;
      const variantNodes = [];
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const card = createVariantCard(v);
        if (selection[i]) {
          const thumb = selection[i].clone();
          thumb.resize(240, 140);
          if (thumb.type === "FRAME") thumb.cornerRadius = 12;
          thumb.name = "Thumbnail";
          for (const child of Array.from(card.children)) {
            if (child.name === "Thumbnail") child.remove();
          }
          card.insertChild(1, thumb);
        }
        roundContainer.appendChild(card);
        variantNodes.push(card);
      }
      flowFrame.appendChild(roundContainer);
      const exitCard = createNodeCard(exitLabel);
      exitCard.name = "Exit Node";
      flowFrame.appendChild(exitCard);
      const center = figma.viewport.center;
      flowFrame.x = center.x - 600;
      flowFrame.y = center.y - 200;
      figma.currentPage.appendChild(flowFrame);
      figma.currentPage.selection = [flowFrame];
      figma.viewport.scrollAndZoomIntoView([flowFrame]);
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(entryCard, variantNodes[i], {
          winner: variants[i].status === "winner",
          label: `${variants[i].traffic}%`,
          index: i
        });
      }
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(variantNodes[i], exitCard, {
          winner: variants[i].status === "winner",
          index: i
        });
      }
      figma.notify("Experiment flow created from selection.");
    } else if (msg.type === "cancel") {
      if (!KEEP_OPEN) figma.closePlugin("Plugin closed.");
      else figma.notify("Canceled");
      return;
    }
  });
  function loadFonts2() {
    return __async(this, null, function* () {
      yield figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(() => {
      });
      yield figma.loadFontAsync({ family: "Figtree", style: "Regular" }).catch(() => {
      });
      try {
        yield figma.loadFontAsync({ family: "Figtree", style: "Semibold" });
      } catch (e) {
        yield figma.loadFontAsync({ family: "Figtree", style: "Medium" }).catch(() => {
        });
      }
      yield figma.loadFontAsync({ family: "Figtree", style: "Bold" }).catch(() => {
      });
      yield figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(() => {
      });
      yield figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(() => {
      });
    });
  }
}
var createPill2;
var createMetricChip2;
var createVariantCard2;
var createNodeCard2;
var connectNodes2;
//# sourceMappingURL=code.js.map
