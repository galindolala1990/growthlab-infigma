/// <reference types="@figma/plugin-typings" />
import { TOKENS } from "./design-tokens";
import { hexToRgb } from "./layout-utils";
import { loadFonts, getLoadedFigtreeSemibold } from "./load-fonts";

export interface MetricDefinition {
  id: string;
  name: string;
  abbreviation?: string;
  min?: number;
  max?: number;
}

export async function createExperimentInfoCard(
  experimentName: string,
  description: string = "",
  figmaLink: string = "",
  jiraLink: string = "",
  miroLink: string = "",
  metrics?: MetricDefinition[]
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
  card.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsSurface) }];
  card.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
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
  badge.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.royalBlue100) }];
  badge.name = "Status Badge";
  const badgeText = figma.createText();
  badgeText.fontName = { family: "Figtree", style: "Bold" };
  badgeText.fontSize = TOKENS.fontSizeBodySm;
  badgeText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.royalBlue600) }];
  badgeText.textAutoResize = "WIDTH_AND_HEIGHT";
  badgeText.characters = "Active";
  badge.appendChild(badgeText);
  card.appendChild(badge);

  // Description section with experiment name and description
  const descSection = await createDescriptionSection(experimentName, description || "");
  card.appendChild(descSection);
  // Make Description section fill card width (minus padding)
  descSection.primaryAxisSizingMode = "FIXED";
  descSection.resize(card.width - card.paddingLeft - card.paddingRight, descSection.height);

  // Metrics section
  const metricsSection = figma.createFrame();
  metricsSection.layoutMode = "VERTICAL";
  metricsSection.counterAxisSizingMode = "AUTO";
  metricsSection.primaryAxisSizingMode = "AUTO";
  metricsSection.layoutAlign = 'STRETCH';
  metricsSection.primaryAxisAlignItems = "MIN";
  metricsSection.counterAxisAlignItems = "MIN";
  metricsSection.paddingBottom = 0;
  metricsSection.paddingTop = 0;
  metricsSection.paddingLeft = 0;
  metricsSection.paddingRight = 0;
  metricsSection.itemSpacing = 0;
  metricsSection.fills = [];
  metricsSection.strokes = [];
  metricsSection.name = "Metrics Section";
  // Header row with Metrics Header and Expected Range
  const headerRow = figma.createFrame();
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.counterAxisSizingMode = "AUTO";
  headerRow.primaryAxisSizingMode = "AUTO";
  headerRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  headerRow.counterAxisAlignItems = "MIN";
  headerRow.itemSpacing = 0;
  headerRow.fills = [];
  headerRow.strokes = [];
  headerRow.name = "Metrics Header Row";
  headerRow.layoutAlign = 'STRETCH';
  headerRow.minWidth = 336; // 21rem
  headerRow.maxWidth = 336; // 21rems
  headerRow.paddingBottom = TOKENS.space8;
  headerRow.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  headerRow.strokeWeight = 1.5;
  headerRow.strokeTopWeight = 0;
  headerRow.strokeRightWeight = 0;
  headerRow.strokeLeftWeight = 0;
  const metricsLabel = figma.createText();
  metricsLabel.fontName = { family: "Figtree", style: "Bold" };
  metricsLabel.fontSize = TOKENS.fontSizeLabel;
  metricsLabel.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  metricsLabel.opacity = 0.5;
  metricsLabel.textAutoResize = "WIDTH_AND_HEIGHT";
  metricsLabel.characters = "Metrics Header";
  headerRow.appendChild(metricsLabel);
  const expectedRangeLabel = figma.createText();
  expectedRangeLabel.fontName = { family: "Figtree", style: "Bold" };
  expectedRangeLabel.fontSize = TOKENS.fontSizeLabel;
  expectedRangeLabel.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  expectedRangeLabel.opacity = 0.5;
  expectedRangeLabel.textAutoResize = "WIDTH_AND_HEIGHT";
  expectedRangeLabel.characters = "Expected Range";
  headerRow.appendChild(expectedRangeLabel);
  metricsSection.appendChild(headerRow);
  // Metrics rows
  if (metrics && metrics.length > 0) {
    metrics.forEach((metric, index) => {
      metricsSection.appendChild(createMetricRow(index + 1, metric.name, metric.min, metric.max));
    });
  } else {
    // Fallback to default metrics if none provided
    metricsSection.appendChild(createMetricRow(1, "Click through rate (CTR)", undefined, undefined));
    metricsSection.appendChild(createMetricRow(2, "Conversion rate (CR)", undefined, undefined));
    metricsSection.appendChild(createMetricRow(3, "Sign ups (SU)", undefined, undefined));
  }
  card.appendChild(metricsSection);

  // Links section
  const linksSection = figma.createFrame();
  linksSection.layoutMode = "VERTICAL";
  linksSection.counterAxisSizingMode = "AUTO";
  linksSection.primaryAxisSizingMode = "AUTO";
  linksSection.primaryAxisAlignItems = "MIN";
  linksSection.counterAxisAlignItems = "MIN";
  linksSection.layoutAlign = 'STRETCH';
  linksSection.itemSpacing = 8;
  linksSection.fills = [];
  linksSection.strokes = [];
  linksSection.name = "Links Section";
  const linksLabel = figma.createText();
  linksLabel.fontName = { family: "Figtree", style: "Bold" };
  linksLabel.fontSize = TOKENS.fontSizeLabel;
  linksLabel.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  linksLabel.opacity = 0.5;
  linksLabel.textAutoResize = "WIDTH_AND_HEIGHT";
  linksLabel.characters = "Artifacts";
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

async function createDescriptionSection(experimentName: string, description: string): Promise<FrameNode> {
  await loadFonts();
  const section = figma.createFrame();
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "AUTO";
  section.primaryAxisSizingMode = "AUTO";
  section.primaryAxisAlignItems = "MIN";
  section.counterAxisAlignItems = "MIN";
  section.layoutAlign = 'STRETCH';
  section.itemSpacing = 8;
  section.fills = [];
  section.strokes = [];
  section.name = "Description Section";
  
  // Experiment name
  const titleText = figma.createText();
  titleText.fontName = { family: "Figtree", style: "Bold" };
  titleText.fontSize = 24;
  titleText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  titleText.textAutoResize = "WIDTH_AND_HEIGHT";
  titleText.characters = experimentName && experimentName.length > 0 ? experimentName : 'Experiment name';
  section.appendChild(titleText);
  
  // Description text
  if (description) {
    const valueText = figma.createText();
    valueText.fontName = { family: "Figtree", style: "Regular" };
    valueText.fontSize = 14;
    valueText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
    valueText.textAutoResize = "WIDTH_AND_HEIGHT";
    valueText.layoutAlign = "STRETCH";
    valueText.characters = description;
    section.appendChild(valueText);
  }
  
  return section;
}

async function createSection(label: string, value: string, _muted: boolean = false): Promise<FrameNode> {
  await loadFonts();
  const section = figma.createFrame();
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "AUTO";
  section.primaryAxisSizingMode = "AUTO";
  section.primaryAxisAlignItems = "MIN";
  section.counterAxisAlignItems = "MIN";
  section.layoutAlign = 'STRETCH';
  section.itemSpacing = 8;
  section.fills = [];
  section.strokes = [];
  section.name = `${label} Section`;
  // Skip label text for Description section
  if (label !== "Description") {
    const labelText = figma.createText();
    labelText.fontName = { family: "Figtree", style: getLoadedFigtreeSemibold() };
    labelText.fontSize = 14;
    labelText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textSecondary) }];
    labelText.textAutoResize = "WIDTH_AND_HEIGHT";
    labelText.characters = label;
    section.appendChild(labelText);
  }
  const valueText = figma.createText();
  valueText.fontName = { family: "Figtree", style: "Regular" };
  valueText.fontSize = 14;
  valueText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  valueText.textAutoResize = label === "Description" ? "HEIGHT" : "WIDTH_AND_HEIGHT";
  valueText.characters = value;
  section.appendChild(valueText);
  // If Description, make valueText fill section width
  if (label === "Description") {
    valueText.layoutAlign = "STRETCH";
    // Optionally, still ensure width matches section
    valueText.resizeWithoutConstraints(section.width, valueText.height);
  }
  return section;
}

function createMetricRow(num: number, label: string, min?: number, max?: number): FrameNode {
  const row = figma.createFrame();
  row.layoutMode = "HORIZONTAL";
  row.counterAxisSizingMode = "AUTO";
  row.primaryAxisSizingMode = "AUTO";
  row.layoutAlign = 'STRETCH';
  row.counterAxisAlignItems = 'CENTER'; 
  row.primaryAxisAlignItems = 'SPACE_BETWEEN';
  row.paddingTop = row.paddingBottom = TOKENS.space8;
  row.paddingLeft = 0;
  row.paddingRight = 0;
  row.minWidth = 336; // 21rem
  row.maxWidth = 336; // 21rems
  row.fills = [];
  row.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  row.strokeWeight = 1;
  row.strokeTopWeight = 0;
  row.strokeRightWeight = 0;
  row.strokeLeftWeight = 0;
  row.name = `Metric Row`;
  // Number - hidden for now
  // const numText = figma.createText();
  // numText.fontName = { family: "Figtree", style: "Regular" };
  // numText.fontSize = 14;
  // numText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textSecondary) }];
  // numText.textAutoResize = "WIDTH_AND_HEIGHT";
  // numText.characters = `${num}.`;
  // row.appendChild(numText);
  // Label
  const labelText = figma.createText();
  labelText.fontName = { family: "Figtree", style: "Regular" };
  labelText.fontSize = TOKENS.fontSizeBodySm;
  labelText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  labelText.textAutoResize = "WIDTH_AND_HEIGHT";
  labelText.characters = label;
  labelText.name = "Metric Label";
  row.appendChild(labelText);
  // Icon + value pill
  const pill = figma.createFrame();
  pill.layoutMode = "HORIZONTAL";
  pill.counterAxisSizingMode = "AUTO";
  pill.primaryAxisSizingMode = "AUTO";
  pill.primaryAxisAlignItems = 'CENTER';
  pill.counterAxisAlignItems = 'CENTER';
  pill.itemSpacing = 4;
  pill.paddingLeft = 6;
  pill.paddingRight = 6;
  pill.paddingTop = pill.paddingBottom = 2;
  pill.cornerRadius = 4
  pill.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsBackground) }];
  pill.name = "Metric Pill";
  // Icon (target/goal) - hidden for now
  // const icon = figma.createText();
  // icon.fontName = { family: "Figtree", style: "Bold" };
  // icon.fontSize = TOKENS.fontSizeBodySm;
  // icon.lineHeight = { unit: "PIXELS", value: 14 };
  // icon.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  // icon.opacity = 0.5;
  // icon.textAutoResize = "WIDTH_AND_HEIGHT";
  // icon.characters = "◎";
  // icon.name = "Metric Icon";
  // pill.appendChild(icon);
  // Value - format as min - max
  const valueText = figma.createText();
  valueText.fontName = { family: "Figtree", style: "Regular" };
  valueText.fontSize = TOKENS.fontSizeBodySm;
  valueText.lineHeight = { unit: "PIXELS", value: 14 };
  valueText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  valueText.textAutoResize = "WIDTH_AND_HEIGHT";
  let valueString = "--";
  if (min !== undefined && max !== undefined) {
    valueString = `${min} - ${max}`;
  } else if (min !== undefined) {
    valueString = `${min} - --`;
  } else if (max !== undefined) {
    valueString = `-- - ${max}`;
  }
  valueText.characters = valueString;
  valueText.name = "Metric Value";
  pill.appendChild(valueText);
  row.appendChild(pill);
  return row;
}

function createLinkChip(label: string, url?: string): FrameNode {
  const chip = figma.createFrame();
  chip.layoutMode = "HORIZONTAL";
  chip.counterAxisSizingMode = "AUTO";
  chip.primaryAxisSizingMode = "AUTO";
  chip.primaryAxisAlignItems = 'MIN';
  chip.counterAxisAlignItems = 'MIN';
  chip.layoutAlign = 'STRETCH';
  chip.minWidth = 336; // 6.25rem
  chip.maxWidth = 336; // 6.25rem
  chip.itemSpacing = 4;
  chip.paddingLeft = chip.paddingRight = 8;
  chip.paddingTop = chip.paddingBottom = 6;
  chip.cornerRadius = 4;
  chip.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsSurface) }];
  chip.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  chip.strokeWeight = 1;
  chip.name = "Link Chip";
  // Icon
  const icon = figma.createText();
  icon.fontName = { family: "Figtree", style: "Regular" };
  icon.fontSize = TOKENS.fontSizeBodySm;
  icon.lineHeight = { unit: "PIXELS", value: 14 };
  icon.fills = label === 'Figma' ? [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBrand) }] :
                label === 'Jira' ? [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBrand) }] :
                label === 'Miro' ? [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBrand) }] :
                [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
  icon.textAutoResize = "WIDTH_AND_HEIGHT";
  icon.characters = label === 'Figma' ? '🟠' : label === 'Jira' ? '🟦' : label === 'Miro' ? '🟨' : '🔗';
  chip.appendChild(icon);
  // Label: show the url or label
  const txt = figma.createText();
  txt.fontName = { family: "Figtree", style: "Regular" };
  txt.fontSize = TOKENS.fontSizeBodySm;
  txt.lineHeight = { unit: "PIXELS", value: 14 };
  txt.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  txt.textAutoResize = "WIDTH_AND_HEIGHT";
  txt.layoutAlign = "STRETCH";
  txt.name = "Link Label";
  txt.characters = ` ${label}`;
  if (url) {
    const maxLength = 55; // Adjust as needed
    const displayUrl = url.length > maxLength 
      ? url.substring(0, maxLength) + '...' 
      : url;
  txt.characters = ` ${displayUrl}`;
}
  chip.appendChild(txt);
  // Figma plugin API does not support setting hyperlinks on FrameNode directly.
  // If hyperlink support is added in the future, add it here.
  return chip;
}