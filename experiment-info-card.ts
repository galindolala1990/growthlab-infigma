/// <reference types="@figma/plugin-typings" />
import { TOKENS } from "./design-tokens";
import { hexToRgb } from "./layout-utils";
import { loadFonts, getLoadedFigtreeSemibold } from "./load-fonts";

// Brand icon SVG markup (complete SVGs for figma.createNodeFromSvg)
const BRAND_SVGS: Record<string, string> = {
  // Official Figma multi-color logo
  figma: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83"/>
    <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF"/>
    <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E"/>
    <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262"/>
    <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE"/>
  </svg>`,
  // Miro logo (yellow)
  miro: `<svg viewBox="0 0 24 24" width="24" height="24" fill="#FFDD00">
    <path d="M17.392 0H13.9L17 4.808 10.444 0H6.949l3.102 6.3L3.494 0H0l3.05 8.131L0 24h3.494L10.05 6.985 6.949 24h3.494L17 5.494 13.899 24h3.493L24 3.672 17.392 0z"/>
  </svg>`,
  // Jira logo (blue)
  jira: `<svg viewBox="0 0 24 24" width="24" height="24" fill="#0052CC">
    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z"/>
  </svg>`,
  // Generic link icon
  generic: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>`
};

/**
 * Create a brand icon as a Figma frame from SVG
 * @param brand - Brand name (figma, miro, jira, generic)
 * @param size - Icon size in pixels (default 14)
 * @returns FrameNode containing the vector icon
 */
function createBrandIconVector(brand: string, size: number = 14): FrameNode {
  const brandLower = brand.toLowerCase();
  const svgMarkup = BRAND_SVGS[brandLower] || BRAND_SVGS.generic;
  
  try {
    // Create node from SVG - this returns a FrameNode with vectors inside
    const svgNode = figma.createNodeFromSvg(svgMarkup);
    svgNode.name = `${brand} Icon`;
    
    // Scale to target size (SVG is 24x24)
    const scale = size / 16;
    svgNode.resize(size, size);
    
    // Flatten to clean up the structure
    svgNode.fills = [];
    
    return svgNode;
  } catch (e) {
    console.error(`Failed to create SVG icon for ${brand}:`, e);
    
    // Fallback: create empty frame
    const fallback = figma.createFrame();
    fallback.name = `${brand} Icon (fallback)`;
    fallback.resize(size, size);
    fallback.fills = [];
    return fallback;
  }
}

export interface MetricDefinition {
  id: string;
  name: string;
  abbreviation?: string;
  min?: number;
  max?: number;
}

// Status configuration matching the plugin UI dropdown
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

const STATUS_STYLES: Record<ExperimentStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    bgColor: TOKENS.yellow100, // yellow-100
    textColor: TOKENS.yellow600, // yellow-600
  },
  running: {
    label: 'Running',
    bgColor: TOKENS.royalBlue100,
    textColor: TOKENS.royalBlue600,
  },
  paused: {
    label: 'Paused',
    bgColor: TOKENS.coralRed100, // red-100
    textColor: TOKENS.coralRed600, // red-600
  },
  completed: {
    label: 'Completed',
    bgColor: TOKENS.malachite100,
    textColor: TOKENS.malachite800,
  },
};

export async function createExperimentInfoCard(
  experimentName: string,
  description: string = "",
  figmaLink: string = "",
  jiraLink: string = "",
  miroLink: string = "",
  metrics?: MetricDefinition[],
  status: ExperimentStatus = 'running'
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

  // Status badge - uses status from plugin's experiment status field
  const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.running;
  const badge = figma.createFrame();
  badge.layoutMode = "HORIZONTAL";
  badge.counterAxisSizingMode = "AUTO";
  badge.primaryAxisSizingMode = "AUTO";
  badge.paddingLeft = badge.paddingRight = 6;
  badge.paddingTop = badge.paddingBottom = 2;
  badge.cornerRadius = 4;
  badge.fills = [{ type: "SOLID", color: hexToRgb(statusConfig.bgColor) }];
  badge.name = "Status Badge";
  const badgeText = figma.createText();
  badgeText.fontName = { family: "Figtree", style: "Medium" };
  badgeText.fontSize = TOKENS.fontSizeBodySm;
  badgeText.lineHeight = { unit: "PIXELS", value: 13 };
  badgeText.fills = [{ type: "SOLID", color: hexToRgb(statusConfig.textColor) }];
  badgeText.textAutoResize = "WIDTH_AND_HEIGHT";
  badgeText.characters = statusConfig.label;
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
  
  // Links container - vertical stack for multiple links
  const linksContainer = figma.createFrame();
  linksContainer.layoutMode = "VERTICAL";
  linksContainer.counterAxisSizingMode = "AUTO";
  linksContainer.primaryAxisSizingMode = "AUTO";
  linksContainer.primaryAxisAlignItems = "MIN";
  linksContainer.counterAxisAlignItems = "MIN";
  linksContainer.layoutAlign = 'STRETCH';
  linksContainer.itemSpacing = 8;
  linksContainer.fills = [];
  linksContainer.strokes = [];
  linksContainer.name = "Links";
  
  // Add Figma link
  if (figmaLink) {
    linksContainer.appendChild(createLinkChip("Figma", figmaLink));
  }
  // Add Jira link
  if (jiraLink) {
    linksContainer.appendChild(createLinkChip("Jira", jiraLink));
  }
  // Add Miro link
  if (miroLink) {
    linksContainer.appendChild(createLinkChip("Miro", miroLink));
  }
  linksSection.appendChild(linksContainer);
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
  section.resizeWithoutConstraints(section.width, section.height);
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
  chip.primaryAxisAlignItems = "MIN";
  chip.counterAxisAlignItems = "CENTER";
  chip.layoutAlign = 'STRETCH';
  chip.minWidth = 336; // 21rem
  chip.maxWidth = 336; // 21rem
  chip.itemSpacing = 8;
  chip.paddingLeft = chip.paddingRight = 12;
  chip.paddingTop = chip.paddingBottom = 8;
  chip.cornerRadius = 8;
  chip.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsSurface) }];
  chip.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  chip.strokeWeight = 1;
  chip.name = "Link Chip";
  
  // Brand icon (vector) - larger size for this layout
  const icon = createBrandIconVector(label, 16);
  chip.appendChild(icon);
  
  // Text container (vertical stack for title + URL)
  const textContainer = figma.createFrame();
  textContainer.layoutMode = "VERTICAL";
  textContainer.counterAxisSizingMode = "AUTO";
  textContainer.primaryAxisSizingMode = "AUTO";
  textContainer.itemSpacing = 0;
  textContainer.fills = [];
  textContainer.name = "Link Text";
  
  // Title (brand name) - Medium weight
  const title = figma.createText();
  title.fontName = { family: "Figtree", style: "Bold" };
  title.fontSize = TOKENS.fontSizeBodySm;
  title.lineHeight = { unit: "PIXELS", value: 12 };
  title.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  title.textAutoResize = "WIDTH_AND_HEIGHT";
  title.name = "Link Title";
  title.characters = `${label}`;
  textContainer.appendChild(title);
  
  // URL - smaller, secondary color
  if (url) {
    const urlText = figma.createText();
    urlText.fontName = { family: "Figtree", style: "Regular" };
    urlText.fontSize = TOKENS.fontSizeBodySm;
    urlText.lineHeight = { unit: "PIXELS", value: 12 };
    urlText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textSecondary) }];
    urlText.textAutoResize = "WIDTH_AND_HEIGHT";
    urlText.name = "Link URL";
    // Truncate long URLs
    const maxLength = 50;
    const displayUrl = url.length > maxLength 
      ? url.substring(0, maxLength) + '...' 
      : url;
    urlText.characters = url.length > maxLength 
      ? url.substring(0, maxLength) + '...' 
      : url;
    textContainer.appendChild(urlText);
  }
  
  chip.appendChild(textContainer);
  // Figma plugin API does not support setting hyperlinks on FrameNode directly.
  // If hyperlink support is added in the future, add it here.
  return chip;
}