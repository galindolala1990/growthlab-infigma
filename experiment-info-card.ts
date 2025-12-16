import { loadFonts, getLoadedFigtreeSemibold } from "./load-fonts";

export async function createExperimentInfoCard(
  experimentName: string,
  description: string = "",
  figmaLink: string = "",
  jiraLink: string = "",
  miroLink: string = ""
): Promise<FrameNode> {
  // Ensure all fonts are loaded before creating any text nodes
  await loadFonts();
  // Container
  const card = figma.createFrame();
  card.name = `Experiment Info — ${experimentName}`;
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

  // Status badge (Active)
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

  // Title row with flask icon and bold name
  const titleRow = figma.createFrame();
  titleRow.layoutMode = "HORIZONTAL";
  titleRow.counterAxisSizingMode = "AUTO";
  titleRow.primaryAxisSizingMode = "AUTO";
  titleRow.itemSpacing = 12;
  titleRow.fills = [];
  titleRow.strokes = [];
  titleRow.name = "Title Row";
  // Flask icon (SVG-like, use emoji for now)
  const flaskText = figma.createText();
  flaskText.fontName = { family: "Figtree", style: "Bold" };
  flaskText.fontSize = 28;
  flaskText.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
  flaskText.textAutoResize = "WIDTH_AND_HEIGHT";
  flaskText.characters = "\u2697\uFE0F"; // ⚗️
  titleRow.appendChild(flaskText);
  // Experiment name
  const titleText = figma.createText();
  titleText.fontName = { family: "Figtree", style: "Bold" };
  titleText.fontSize = 28;
  titleText.fills = [{ type: "SOLID", color: { r: 0.07, g: 0.09, b: 0.16 } }];
  titleText.textAutoResize = "WIDTH_AND_HEIGHT";
  titleText.characters = experimentName;
  titleRow.appendChild(titleText);
  card.appendChild(titleRow);

  // Description section
  const descSection = await createSection("Description", description || "", true);
  card.appendChild(descSection);
  // Hypothesis section
  const hypSection = await createSection("Hypothesis", "Lorem ipsum", true);
  card.appendChild(hypSection);

  // Metrics section
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
  metricsLabel.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.60, b: 0.67 } }];
  metricsLabel.textAutoResize = "WIDTH_AND_HEIGHT";
  metricsLabel.characters = "Metrics";
  metricsSection.appendChild(metricsLabel);
  // Metrics rows
  metricsSection.appendChild(createMetricRow(1, "Click through rate (CTR)", "--%"));
  metricsSection.appendChild(createMetricRow(2, "Conversion rate (CR)", "--%"));
  metricsSection.appendChild(createMetricRow(3, "Sign ups (SU)", "--%"));
  card.appendChild(metricsSection);

  // Links section
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
  // Add Figma link
  if (figmaLink) {
    linksRow.appendChild(createLinkChip("Figma", figmaLink));
  }
  // Add Jira link
  if (jiraLink) {
    linksRow.appendChild(createLinkChip("Jira", jiraLink));
  }
  // Add Miro link
  if (miroLink) {
    linksRow.appendChild(createLinkChip("Miro", miroLink));
  }
  linksSection.appendChild(linksRow);
  card.appendChild(linksSection);

  return card;
}

async function createSection(label: string, value: string, muted: boolean = false): Promise<FrameNode> {
  await loadFonts();
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
  labelText.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.60, b: 0.67 } }];
  labelText.textAutoResize = "WIDTH_AND_HEIGHT";
  labelText.characters = label;
  section.appendChild(labelText);
  const valueText = figma.createText();
  valueText.fontName = { family: "Figtree", style: "Regular" };
  valueText.fontSize = 17;
  valueText.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.20, b: 0.25 } }];
  valueText.textAutoResize = "WIDTH_AND_HEIGHT";
  valueText.characters = value;
  section.appendChild(valueText);
  return section;
}

function createMetricRow(num: number, label: string, value: string): FrameNode {
  const row = figma.createFrame();
  row.layoutMode = "HORIZONTAL";
  row.counterAxisSizingMode = "AUTO";
  row.primaryAxisSizingMode = "AUTO";
  row.itemSpacing = 10;
  row.fills = [];
  row.strokes = [];
  // Number
  const numText = figma.createText();
  numText.fontName = { family: "Figtree", style: "Regular" };
  numText.fontSize = 16;
  numText.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.60, b: 0.67 } }];
  numText.textAutoResize = "WIDTH_AND_HEIGHT";
  numText.characters = `${num}.`;
  row.appendChild(numText);
  // Label
  const labelText = figma.createText();
  labelText.fontName = { family: "Figtree", style: "Regular" };
  labelText.fontSize = 16;
  labelText.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.20, b: 0.25 } }];
  labelText.textAutoResize = "WIDTH_AND_HEIGHT";
  labelText.characters = label;
  row.appendChild(labelText);
  // Icon + value pill
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
  // Icon (target/goal)
  const icon = figma.createText();
  icon.fontName = { family: "Figtree", style: "Regular" };
  icon.fontSize = 15;
  icon.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.60, b: 0.67 } }];
  icon.textAutoResize = "WIDTH_AND_HEIGHT";
  icon.characters = "🎯";
  pill.appendChild(icon);
  // Value
  const valueText = figma.createText();
  valueText.fontName = { family: "Figtree", style: getLoadedFigtreeSemibold() };
  valueText.fontSize = 15;
  valueText.fills = [{ type: "SOLID", color: { r: 0.55, g: 0.60, b: 0.67 } }];
  valueText.textAutoResize = "WIDTH_AND_HEIGHT";
  valueText.characters = value;
  pill.appendChild(valueText);
  row.appendChild(pill);
  return row;
}

function createLinkChip(label: string, url?: string): FrameNode {
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
  // Icon
  const icon = figma.createText();
  icon.fontName = { family: "Figtree", style: "Bold" };
  icon.fontSize = 18;
  icon.fills = label === 'Figma' ? [{ type: 'SOLID', color: { r: 0.98, g: 0.36, b: 0.19 } }] :
                label === 'Jira' ? [{ type: 'SOLID', color: { r: 0.13, g: 0.47, b: 0.95 } }] :
                label === 'Miro' ? [{ type: 'SOLID', color: { r: 1, g: 0.82, b: 0.09 } }] :
                [{ type: 'SOLID', color: { r: 0.55, g: 0.60, b: 0.67 } }];
  icon.textAutoResize = "WIDTH_AND_HEIGHT";
  icon.characters = label === 'Figma' ? '🟠' : label === 'Jira' ? '🟦' : label === 'Miro' ? '🟨' : '🔗';
  chip.appendChild(icon);
  // Label
  const txt = figma.createText();
  txt.fontName = { family: "Figtree", style: getLoadedFigtreeSemibold() };
  txt.fontSize = 16;
  txt.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.20, b: 0.25 } }];
  txt.textAutoResize = "WIDTH_AND_HEIGHT";
  txt.characters = ` ${label} project name`;
  chip.appendChild(txt);
  // Figma plugin API does not support setting hyperlinks on FrameNode directly.
  // If hyperlink support is added in the future, add it here.
  return chip;
}