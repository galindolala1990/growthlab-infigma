/// <reference types="@figma/plugin-typings" />
import { TOKENS } from "./design-tokens";
import { hexToRgb, getFontStyle } from "./layout-utils";
import { loadFonts } from "./load-fonts";

/**
 * Experiment Outcome Card
 * 
 * Displays experiment metrics outcomes in a table format following growth experiment best practices:
 * - Clear comparison of variants against control
 * - Statistical significance indicators
 * - Uplift/change percentages
 * - Winner recommendation based on primary metric
 * - Confidence intervals (when available)
 */

export interface MetricDefinition {
  id: string;
  name: string;
  abbreviation?: string;
  min?: number;
  max?: number;
  isPrimary?: boolean; // Primary metric for decision making
}

export interface VariantOutcome {
  id: string;
  key: string;           // "A", "B", "C"
  name: string;          // "Control", "Variation A"
  isControl?: boolean;   // Is this the control/baseline variant
  traffic: number;       // Traffic allocation percentage
  sampleSize?: number;   // Number of users in this variant
  metrics: {
    [metricKey: string]: {
      value: number;
      uplift?: number;           // % change vs control (null for control)
      isStatSig?: boolean;       // Statistical significance reached
      confidenceLevel?: number;  // e.g., 95, 99
      confidenceInterval?: {
        lower: number;
        upper: number;
      };
    };
  };
  isWinner?: boolean;    // Recommended winner based on primary metric
  isRolledOut?: boolean; // Has been rolled out to production
}

export interface ExperimentOutcomeData {
  experimentName: string;
  experimentType?: string;   // 'ab_test', 'multivariate', etc.
  hypothesis?: string;
  startDate?: string;
  endDate?: string;
  audience?: string;        // Target audience for the experiment
  totalSampleSize?: number;
  confidenceLevel?: number;  // e.g., 95, 99
  status: 'running' | 'completed' | 'paused' | 'draft' | 'rolled_out';
  primaryMetric?: string;  // Key of the primary decision metric
  metrics: MetricDefinition[];
  variants: VariantOutcome[];
}

// Outcome status configuration
interface OutcomeStatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

// Experiment status styles - consistent with Info Card and Plugin UI
const EXPERIMENT_STATUS_STYLES: Record<string, OutcomeStatusConfig> = {
  draft: {
    label: 'Draft',
    bgColor: TOKENS.yellow100,
    textColor: TOKENS.yellow600,
  },
  running: {
    label: 'Live',
    bgColor: TOKENS.royalBlue100,
    textColor: TOKENS.royalBlue600,
  },
  paused: {
    label: 'Paused',
    bgColor: TOKENS.coralRed100,
    textColor: TOKENS.coralRed600,
  },
  completed: {
    label: 'Ended',
    bgColor: TOKENS.malachite100,
    textColor: TOKENS.malachite800,
  },
  rolled_out: {
    label: 'Rolled out',
    bgColor: TOKENS.electricViolet100,
    textColor: TOKENS.electricViolet600,
  },
};

// Variant outcome styles (for table rows, not header)
const VARIANT_OUTCOME_STYLES: Record<string, OutcomeStatusConfig> = {
  winner: {
    label: 'Winner',
    bgColor: TOKENS.malachite100,
    textColor: TOKENS.malachite800,
  },
  loser: {
    label: 'Underperforming',
    bgColor: TOKENS.coralRed100,
    textColor: TOKENS.coralRed600,
  },
  inconclusive: {
    label: 'Inconclusive',
    bgColor: TOKENS.yellow100,
    textColor: TOKENS.yellow600,
  },
  control: {
    label: 'Control',
    bgColor: TOKENS.azure100,
    textColor: TOKENS.azure700,
  },
  rolledOut: {
    label: 'Rolled Out',
    bgColor: TOKENS.electricViolet100,
    textColor: TOKENS.electricViolet600,
  },
};

// Experiment type labels
function getExperimentTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    'ab_test': 'A/B Test',
    'multivariate': 'Multivariate',
    'feature_flag': 'Feature Flag',
    'holdout': 'Holdout',
    'rollout': 'Rollout',
  };
  return labels[type] || type;
}

/**
 * Format metric value with appropriate precision
 */
function formatMetricValue(value: number | undefined): string {
  if (value === undefined || value === null) return '--';
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  if (Math.abs(value) >= 1) {
    return value.toFixed(2);
  }
  // For small decimals (like rates), show as percentage
  return (value * 100).toFixed(2) + '%';
}

/**
 * Format uplift value with + or - sign
 */
function formatUplift(uplift: number | undefined): string {
  if (uplift === undefined || uplift === null) return '--';
  const sign = uplift >= 0 ? '+' : '';
  return `${sign}${uplift.toFixed(2)}%`;
}

/**
 * Get metric key from metric definition
 */
function getMetricKey(metric: MetricDefinition): string {
  if (metric.abbreviation) {
    return metric.abbreviation.toLowerCase();
  }
  return metric.name.replace(/\s+/g, '_').toLowerCase();
}

/**
 * Create the experiment outcome card with metrics table
 */
export async function createExperimentOutcomeCard(
  data: ExperimentOutcomeData
): Promise<FrameNode> {
  await loadFonts();

  const card = figma.createFrame();
  card.name = `Experiment Outcome — ${data.experimentName}`;
  card.layoutMode = "VERTICAL";
  card.counterAxisSizingMode = "AUTO";
  card.primaryAxisSizingMode = "AUTO";
  card.itemSpacing = 24;
  card.paddingLeft = card.paddingRight = 32;
  card.paddingTop = card.paddingBottom = 32;
  card.cornerRadius = 24;
  card.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsSurface) }];
  card.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  card.strokeWeight = 1;
  card.minWidth = 480;

  // Header section
  const headerSection = await createHeaderSection(data);
  card.appendChild(headerSection);

  // Metrics table
  const metricsTable = await createMetricsTable(data);
  card.appendChild(metricsTable);

  // Summary section (recommendation)
  const summarySection = await createSummarySection(data);
  card.appendChild(summarySection);

  return card;
}

/**
 * Create header section with experiment name, status, and key metrics context
 * Note: Hypothesis is shown in Info Card, not duplicated here
 */
async function createHeaderSection(data: ExperimentOutcomeData): Promise<FrameNode> {
  const section = figma.createFrame();
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "AUTO";
  section.primaryAxisSizingMode = "AUTO";
  section.itemSpacing = 8;
  section.fills = [];
  section.name = "Header Section";

  // Badge row - combined type badge and status badge
  const badgeRow = figma.createFrame();
  badgeRow.layoutMode = "HORIZONTAL";
  badgeRow.counterAxisSizingMode = "AUTO";
  badgeRow.primaryAxisSizingMode = "AUTO";
  badgeRow.itemSpacing = 8;
  badgeRow.fills = [];
  badgeRow.name = "Badge Row";

  // Combined type badge: "A/B Test • Outcome Report" or just "Outcome Report"
  const typeLabel = data.experimentType ? getExperimentTypeLabel(data.experimentType) : '';
  const combinedLabel = typeLabel ? `${typeLabel} • Outcome Report` : 'Outcome Report';
  const typeBadge = createBadge(combinedLabel, TOKENS.azure100, TOKENS.azure700);
  badgeRow.appendChild(typeBadge);

  // Experiment status badge (outlined for softer visual hierarchy)
  const statusConfig = EXPERIMENT_STATUS_STYLES[data.status] || EXPERIMENT_STATUS_STYLES.running;
  const statusBadge = createOutlinedBadge(statusConfig.label, statusConfig.textColor, statusConfig.textColor);
  badgeRow.appendChild(statusBadge);

  section.appendChild(badgeRow);

  // Experiment name (Bold, 20px - consistent with Info Card)
  const titleText = figma.createText();
  titleText.fontName = getFontStyle("Bold");
  titleText.fontSize = 20;
  titleText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  titleText.textAutoResize = "WIDTH_AND_HEIGHT";
  titleText.characters = data.experimentName || 'Untitled Experiment';
  section.appendChild(titleText);

  // Context row: Timeline + Audience + Sample Size (compact metadata line)
  const contextParts: string[] = [];
  
  // Add timeline
  if (data.startDate || data.endDate) {
    const dateRange = [data.startDate, data.endDate].filter(Boolean).join(' → ');
    contextParts.push(dateRange);
  }
  
  // Add audience
  if (data.audience) {
    contextParts.push(data.audience);
  }
  
  // Add sample size
  if (data.totalSampleSize) {
    contextParts.push(`n=${data.totalSampleSize.toLocaleString()}`);
  }
  
  // Render context line if we have any parts
  if (contextParts.length > 0) {
    const contextText = figma.createText();
    contextText.fontName = getFontStyle("Regular");
    contextText.fontSize = TOKENS.fontSizeBodySm;
    contextText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textTertiary) }];
    contextText.textAutoResize = "WIDTH_AND_HEIGHT";
    contextText.characters = contextParts.join('  •  ');
    section.appendChild(contextText);
  }

  return section;
}

/**
 * Create a filled badge (for primary badges like Card Type)
 */
function createBadge(label: string, bgColor: string, textColor: string): FrameNode {
  const badge = figma.createFrame();
  badge.layoutMode = "HORIZONTAL";
  badge.counterAxisSizingMode = "AUTO";
  badge.primaryAxisSizingMode = "AUTO";
  badge.paddingLeft = badge.paddingRight = 8;
  badge.paddingTop = badge.paddingBottom = 4;
  badge.cornerRadius = 4;
  badge.fills = [{ type: "SOLID", color: hexToRgb(bgColor) }];
  badge.name = `${label} Badge`;

  const text = figma.createText();
  text.fontName = getFontStyle("Medium");
  text.fontSize = TOKENS.fontSizeBodySm;
  text.lineHeight = { unit: "PIXELS", value: 13 };
  text.fills = [{ type: "SOLID", color: hexToRgb(textColor) }];
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  text.characters = label;
  badge.appendChild(text);

  return badge;
}

/**
 * Create an outlined badge (for status badges - softer visual hierarchy)
 */
function createOutlinedBadge(label: string, borderColor: string, textColor: string): FrameNode {
  const badge = figma.createFrame();
  badge.layoutMode = "HORIZONTAL";
  badge.counterAxisSizingMode = "AUTO";
  badge.primaryAxisSizingMode = "AUTO";
  badge.paddingLeft = badge.paddingRight = 8;
  badge.paddingTop = badge.paddingBottom = 4;
  badge.cornerRadius = 4;
  badge.fills = []; // Transparent background
  badge.strokes = [{ type: "SOLID", color: hexToRgb(borderColor) }];
  badge.strokeWeight = 1;
  badge.name = `${label} Status Badge`;

  const text = figma.createText();
  text.fontName = getFontStyle("Medium");
  text.fontSize = TOKENS.fontSizeBodySm;
  text.lineHeight = { unit: "PIXELS", value: 13 };
  text.fills = [{ type: "SOLID", color: hexToRgb(textColor) }];
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  text.characters = label;
  badge.appendChild(text);

  return badge;
}

/**
 * Create the metrics comparison table
 */
async function createMetricsTable(data: ExperimentOutcomeData): Promise<FrameNode> {
  const table = figma.createFrame();
  table.layoutMode = "VERTICAL";
  table.counterAxisSizingMode = "FIXED"; // Fixed width to allow stretch
  table.primaryAxisSizingMode = "AUTO"; // Hug height
  table.layoutAlign = "STRETCH"; // Stretch to parent width
  table.itemSpacing = 0;
  table.fills = [];
  table.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  table.strokeWeight = 1;
  table.cornerRadius = 8;
  table.name = "Metrics Table";

  // Table header row
  const headerRow = await createTableHeaderRow(data, data.variants.length);
  table.appendChild(headerRow);

  // Metric rows - one for each metric
  for (let i = 0; i < data.metrics.length; i++) {
    const metric = data.metrics[i];
    const isLast = i === data.metrics.length - 1;
    const metricRow = await createMetricRow(metric, data.variants, data.primaryMetric, isLast);
    table.appendChild(metricRow);
  }

  return table;
}

/**
 * Create table header row with variant names
 */
async function createTableHeaderRow(data: ExperimentOutcomeData, variantCount: number): Promise<FrameNode> {
  const row = figma.createFrame();
  row.layoutMode = "HORIZONTAL";
  row.counterAxisSizingMode = "FIXED"; // Fixed height
  row.primaryAxisSizingMode = "FIXED"; // Fixed width to stretch
  row.layoutAlign = "STRETCH"; // Stretch to parent width
  row.counterAxisAlignItems = "CENTER";
  row.minHeight = 40;
  row.resize(row.width, 40);
  row.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsBackground) }];
  row.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  row.strokeWeight = 1;
  row.strokeTopWeight = 0;
  row.strokeLeftWeight = 0;
  row.strokeRightWeight = 0;
  row.name = "Header Row";

  // First column: Metric label (fixed width)
  const metricHeader = createTableCell('Metric', 140, true, false);
  metricHeader.layoutGrow = 0; // Don't grow
  metricHeader.minWidth = 140;
  row.appendChild(metricHeader);

  // Each variant header: grows to fill space
  for (const variant of data.variants) {
    const variantHeader = createVariantHeaderCell(variant);
    variantHeader.layoutGrow = 1; // Grow to fill available space
    variantHeader.minWidth = 80;
    row.appendChild(variantHeader);
  }

  return row;
}

/**
 * Create a variant header cell with name and optional badges
 */
function createVariantHeaderCell(variant: VariantOutcome): FrameNode {
  const cell = figma.createFrame();
  cell.layoutMode = "VERTICAL";
  cell.counterAxisSizingMode = "FIXED"; // Fixed height
  cell.primaryAxisSizingMode = "FIXED"; // Fixed width (will be overridden by layoutGrow)
  cell.layoutAlign = "STRETCH";
  cell.minWidth = 80;
  cell.resize(100, 40);
  cell.counterAxisAlignItems = "CENTER";
  cell.primaryAxisAlignItems = "CENTER";
  cell.itemSpacing = 2;
  cell.paddingLeft = cell.paddingRight = 8;
  cell.fills = [];
  cell.name = `Header: ${variant.name}`;

  // Variant name
  const nameText = figma.createText();
  nameText.fontName = getFontStyle("Medium");
  nameText.fontSize = TOKENS.fontSizeBodySm;
  nameText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  nameText.textAutoResize = "WIDTH_AND_HEIGHT";
  nameText.textAlignHorizontal = "CENTER";
  nameText.characters = variant.name || `Variant ${variant.key}`;
  cell.appendChild(nameText);

  // Sub-label row (control/winner indicator)
  const subRow = figma.createFrame();
  subRow.layoutMode = "HORIZONTAL";
  subRow.counterAxisSizingMode = "AUTO";
  subRow.primaryAxisSizingMode = "AUTO";
  subRow.itemSpacing = 4;
  subRow.fills = [];
  subRow.name = "Sub Labels";

  if (variant.isControl) {
    const controlBadge = createMicroBadge('Control', TOKENS.azure200, TOKENS.azure700);
    subRow.appendChild(controlBadge);
  }

  if (variant.isWinner) {
    const winnerBadge = createMicroBadge('Winner', TOKENS.malachite200, TOKENS.malachite800);
    subRow.appendChild(winnerBadge);
  }

  if (variant.isRolledOut) {
    const rolledOutBadge = createMicroBadge('Rolled Out', TOKENS.electricViolet200, TOKENS.electricViolet700);
    subRow.appendChild(rolledOutBadge);
  }

  if (subRow.children.length > 0) {
    cell.appendChild(subRow);
  } else {
    // Remove unused frame to prevent floating empty frames
    subRow.remove();
  }

  return cell;
}

/**
 * Create a micro badge for table cells
 */
function createMicroBadge(label: string, bgColor: string, textColor: string): FrameNode {
  const badge = figma.createFrame();
  badge.layoutMode = "HORIZONTAL";
  badge.counterAxisSizingMode = "AUTO";
  badge.primaryAxisSizingMode = "AUTO";
  badge.paddingLeft = badge.paddingRight = 4;
  badge.paddingTop = badge.paddingBottom = 2;
  badge.cornerRadius = 3;
  badge.fills = [{ type: "SOLID", color: hexToRgb(bgColor) }];
  badge.name = `${label} Micro Badge`;

  const text = figma.createText();
  text.fontName = getFontStyle("Medium");
  text.fontSize = TOKENS.fontSizeLabel;
  text.lineHeight = { unit: "PIXELS", value: 10 };
  text.fills = [{ type: "SOLID", color: hexToRgb(textColor) }];
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  text.characters = label;
  badge.appendChild(text);

  return badge;
}

/**
 * Create a metric row with values for all variants
 */
async function createMetricRow(
  metric: MetricDefinition,
  variants: VariantOutcome[],
  primaryMetric?: string,
  isLast: boolean = false
): Promise<FrameNode> {
  const row = figma.createFrame();
  row.layoutMode = "HORIZONTAL";
  row.counterAxisSizingMode = "FIXED"; // Fixed height
  row.primaryAxisSizingMode = "FIXED"; // Fixed width to stretch
  row.layoutAlign = "STRETCH"; // Stretch to parent width
  row.counterAxisAlignItems = "CENTER";
  row.minHeight = 48;
  row.resize(row.width, 48);
  row.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsSurface) }];
  
  if (!isLast) {
    row.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
    row.strokeWeight = 1;
    row.strokeTopWeight = 0;
    row.strokeLeftWeight = 0;
    row.strokeRightWeight = 0;
  }
  
  row.name = `Row: ${metric.name}`;

  const metricKey = getMetricKey(metric);
  const isPrimary = primaryMetric === metricKey || metric.isPrimary === true;

  // Metric name cell (fixed width)
  const metricCell = createMetricNameCell(metric, isPrimary);
  metricCell.layoutGrow = 0; // Don't grow
  row.appendChild(metricCell);

  // Find control variant for comparison
  const controlVariant = variants.find(v => v.isControl);

  // Value cells for each variant (grow to fill space)
  for (const variant of variants) {
    const metricData = variant.metrics[metricKey];
    const valueCell = createMetricValueCell(metricData, variant.isControl === true, isPrimary);
    valueCell.layoutGrow = 1; // Grow to fill available space
    row.appendChild(valueCell);
  }

  return row;
}

/**
 * Create the metric name cell
 */
function createMetricNameCell(metric: MetricDefinition, isPrimary: boolean): FrameNode {
  const cell = figma.createFrame();
  cell.layoutMode = "VERTICAL";
  cell.counterAxisSizingMode = "FIXED"; // Fixed width
  cell.primaryAxisSizingMode = "FIXED"; // Fixed height
  cell.minWidth = 140;
  cell.resize(140, 48);
  cell.counterAxisAlignItems = "MIN";
  cell.primaryAxisAlignItems = "CENTER";
  cell.itemSpacing = 2;
  cell.paddingLeft = 12;
  cell.paddingRight = 8;
  cell.fills = [];
  cell.name = `Metric Cell`;

  // Metric name with optional primary indicator
  const nameRow = figma.createFrame();
  nameRow.layoutMode = "HORIZONTAL";
  nameRow.counterAxisSizingMode = "AUTO";
  nameRow.primaryAxisSizingMode = "AUTO";
  nameRow.itemSpacing = 4;
  nameRow.counterAxisAlignItems = "CENTER";
  nameRow.fills = [];
  nameRow.name = "Name Row";

  const nameText = figma.createText();
  nameText.fontName = getFontStyle(isPrimary ? "Bold" : "Regular");
  nameText.fontSize = TOKENS.fontSizeBodySm;
  nameText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  nameText.textAutoResize = "WIDTH_AND_HEIGHT";
  nameText.characters = metric.name;
  nameRow.appendChild(nameText);

  if (isPrimary) {
    const primaryBadge = createMicroBadge('Primary', TOKENS.electricViolet100, TOKENS.electricViolet600);
    nameRow.appendChild(primaryBadge);
  }

  cell.appendChild(nameRow);

  // Sub-info row: abbreviation and/or expected range
  const hasAbbrev = metric.abbreviation && metric.abbreviation !== metric.name;
  const hasRange = metric.min !== undefined && metric.max !== undefined;
  
  if (hasAbbrev || hasRange) {
    const subText = figma.createText();
    subText.fontName = getFontStyle("Regular");
    subText.fontSize = TOKENS.fontSizeLabel;
    subText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textTertiary) }];
    subText.textAutoResize = "WIDTH_AND_HEIGHT";
    
    // Build sub-info string
    let subInfo = '';
    if (hasAbbrev) {
      subInfo = metric.abbreviation!;
    }
    if (hasRange) {
      const rangeStr = `${metric.min} - ${metric.max}`;
      subInfo = subInfo ? `${subInfo} · ${rangeStr}` : rangeStr;
    }
    subText.characters = subInfo;
    cell.appendChild(subText);
  }

  return cell;
}

/**
 * Create a metric value cell with uplift indicator
 */
function createMetricValueCell(
  metricData: VariantOutcome['metrics'][string] | undefined,
  isControl: boolean = false,
  isPrimary: boolean = false
): FrameNode {
  const cell = figma.createFrame();
  cell.layoutMode = "VERTICAL";
  cell.counterAxisSizingMode = "FIXED"; // Fixed height
  cell.primaryAxisSizingMode = "FIXED"; // Fixed width (will be overridden by layoutGrow)
  cell.layoutAlign = "STRETCH";
  cell.minWidth = 80;
  cell.resize(100, 48);
  cell.counterAxisAlignItems = "CENTER";
  cell.primaryAxisAlignItems = "CENTER";
  cell.itemSpacing = 2;
  cell.paddingLeft = cell.paddingRight = 8;
  cell.fills = [];
  cell.name = "Value Cell";

  // Main value
  const valueText = figma.createText();
  valueText.fontName = getFontStyle(isPrimary ? "Bold" : "Medium");
  valueText.fontSize = TOKENS.fontSizeBodyMd;
  valueText.textAutoResize = "WIDTH_AND_HEIGHT";
  valueText.textAlignHorizontal = "CENTER";
  
  const value = metricData?.value;
  valueText.characters = formatMetricValue(value);
  valueText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  cell.appendChild(valueText);

  // Uplift row (only for non-control variants)
  if (!isControl && metricData?.uplift !== undefined) {
    const upliftRow = figma.createFrame();
    upliftRow.layoutMode = "HORIZONTAL";
    upliftRow.counterAxisSizingMode = "AUTO";
    upliftRow.primaryAxisSizingMode = "AUTO";
    upliftRow.itemSpacing = 4;
    upliftRow.counterAxisAlignItems = "CENTER";
    upliftRow.fills = [];
    upliftRow.name = "Uplift Row";

    // Uplift value with color based on direction
    const uplift = metricData.uplift;
    const isPositive = uplift >= 0;
    const upliftColor = isPositive ? TOKENS.malachite600 : TOKENS.coralRed500;
    
    const upliftText = figma.createText();
    upliftText.fontName = getFontStyle("Medium");
    upliftText.fontSize = TOKENS.fontSizeLabel;
    upliftText.fills = [{ type: "SOLID", color: hexToRgb(upliftColor) }];
    upliftText.textAutoResize = "WIDTH_AND_HEIGHT";
    upliftText.characters = formatUplift(uplift);
    upliftRow.appendChild(upliftText);

    // Statistical significance indicator
    if (metricData.isStatSig !== undefined) {
      const sigBadge = figma.createFrame();
      sigBadge.layoutMode = "HORIZONTAL";
      sigBadge.counterAxisSizingMode = "AUTO";
      sigBadge.primaryAxisSizingMode = "AUTO";
      sigBadge.paddingLeft = sigBadge.paddingRight = 4;
      sigBadge.paddingTop = sigBadge.paddingBottom = 2;
      sigBadge.cornerRadius = 3;
      sigBadge.counterAxisAlignItems = "CENTER";
      
      if (metricData.isStatSig) {
        sigBadge.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.malachite100) }];
      } else {
        sigBadge.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.yellow100) }];
      }
      sigBadge.name = "Sig Badge";

      const sigText = figma.createText();
      sigText.fontName = getFontStyle("Medium");
      sigText.fontSize = TOKENS.fontSizeLabel; // 9px - more visible
      sigText.lineHeight = { unit: "PIXELS", value: 10 };
      
      if (metricData.isStatSig) {
        sigText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.malachite800) }];
        sigText.characters = metricData.confidenceLevel ? `${metricData.confidenceLevel}%` : 'Sig';
      } else {
        sigText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.yellow600) }];
        sigText.characters = 'NS';
      }
      sigText.textAutoResize = "WIDTH_AND_HEIGHT";
      sigBadge.appendChild(sigText);
      upliftRow.appendChild(sigBadge);
    }

    cell.appendChild(upliftRow);
  }

  // Baseline indicator for control
  if (isControl) {
    const baselineText = figma.createText();
    baselineText.fontName = getFontStyle("Regular");
    baselineText.fontSize = TOKENS.fontSizeLabel;
    baselineText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textTertiary) }];
    baselineText.textAutoResize = "WIDTH_AND_HEIGHT";
    baselineText.textAlignHorizontal = "CENTER";
    baselineText.characters = 'baseline';
    cell.appendChild(baselineText);
  }

  return cell;
}

/**
 * Create a simple table cell
 */
function createTableCell(
  content: string,
  width: number,
  isHeader: boolean = false,
  alignCenter: boolean = true
): FrameNode {
  const cell = figma.createFrame();
  cell.layoutMode = "HORIZONTAL";
  cell.counterAxisSizingMode = "FIXED"; // Fixed height
  cell.primaryAxisSizingMode = "FIXED"; // Fixed width
  cell.resize(width, 40);
  cell.minWidth = width;
  cell.counterAxisAlignItems = "CENTER";
  cell.primaryAxisAlignItems = alignCenter ? "CENTER" : "MIN";
  cell.paddingLeft = 12;
  cell.paddingRight = 8;
  cell.fills = [];
  cell.name = `Cell: ${content}`;

  const text = figma.createText();
  text.fontName = getFontStyle(isHeader ? "Medium" : "Regular");
  text.fontSize = TOKENS.fontSizeBodySm;
  text.fills = [{ type: "SOLID", color: hexToRgb(isHeader ? TOKENS.textSecondary : TOKENS.textPrimary) }];
  text.textAutoResize = "WIDTH_AND_HEIGHT";
  text.characters = content;
  cell.appendChild(text);

  return cell;
}

/**
 * Create summary/recommendation section
 */
async function createSummarySection(data: ExperimentOutcomeData): Promise<FrameNode> {
  const section = figma.createFrame();
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "AUTO";
  section.primaryAxisSizingMode = "AUTO";
  section.itemSpacing = 8;
  section.paddingTop = section.paddingBottom = 12;
  section.paddingLeft = section.paddingRight = 12;
  section.cornerRadius = 8;
  section.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsBackground) }];
  section.name = "Summary Section";
  section.layoutAlign = "STRETCH";

  // Find winner variant
  const winner = data.variants.find(v => v.isWinner);
  const primaryMetricDef = data.metrics.find(m => 
    getMetricKey(m) === data.primaryMetric || m.isPrimary
  );

  // Header (styled same as section labels)
  const headerText = figma.createText();
  headerText.fontName = getFontStyle("Medium");
  headerText.fontSize = TOKENS.fontSizeLabel;
  headerText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  headerText.opacity = 0.5;
  headerText.textAutoResize = "WIDTH_AND_HEIGHT";
  headerText.characters = "Next Steps";
  section.appendChild(headerText);

  // Recommendation text
  const recommendationText = figma.createText();
  recommendationText.fontName = getFontStyle("Regular");
  recommendationText.fontSize = TOKENS.fontSizeBodyMd;
  recommendationText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  recommendationText.textAutoResize = "WIDTH_AND_HEIGHT";

  // Check if any non-control variant has statistical significance
  const hasAnySignificance = data.variants.some(v => 
    !v.isControl && Object.values(v.metrics).some(m => m.isStatSig === true)
  );
  
  // Find the best performing variant (highest uplift on primary metric)
  const primaryMetricKey = data.primaryMetric || (primaryMetricDef ? getMetricKey(primaryMetricDef) : null);
  let bestVariant: typeof data.variants[0] | undefined;
  let bestUplift = -Infinity;
  
  for (const v of data.variants) {
    if (v.isControl) continue;
    const metricData = primaryMetricKey ? v.metrics[primaryMetricKey] : undefined;
    if (metricData?.uplift !== undefined && metricData.uplift > bestUplift) {
      bestUplift = metricData.uplift;
      bestVariant = v;
    }
  }

  if (winner) {
    // Explicit winner declared
    const metricName = primaryMetricDef?.name || 'primary metric';
    const winnerMetric = winner.metrics[primaryMetricKey || ''];
    const upliftText = winnerMetric?.uplift ? formatUplift(winnerMetric.uplift) : '';
    
    if (winnerMetric?.isStatSig === true) {
      recommendationText.characters = `Roll out "${winner.name}" — ${upliftText} lift on ${metricName} with statistical significance.`;
    } else if (winnerMetric?.isStatSig === false) {
      recommendationText.characters = `"${winner.name}" shows ${upliftText} on ${metricName} but lacks statistical significance. Extend the test or increase sample size.`;
    } else {
      recommendationText.characters = `"${winner.name}" is the recommended winner${upliftText ? ` (${upliftText} on ${metricName})` : ''}. Review data before rolling out.`;
    }
  } else if (bestVariant && hasAnySignificance) {
    // No explicit winner, but we have a best performer with significance
    const metricName = primaryMetricDef?.name || 'primary metric';
    const bestMetric = primaryMetricKey ? bestVariant.metrics[primaryMetricKey] : undefined;
    const upliftText = bestMetric?.uplift ? formatUplift(bestMetric.uplift) : '';
    
    if (bestMetric?.isStatSig === true) {
      recommendationText.characters = `"${bestVariant.name}" leads with ${upliftText} on ${metricName} (significant). Mark as winner to roll out.`;
    } else {
      recommendationText.characters = `"${bestVariant.name}" shows ${upliftText} on ${metricName} but results are not yet significant. Continue the experiment.`;
    }
  } else if (data.status === 'running') {
    recommendationText.characters = "Experiment is live. Collect more data to reach statistical significance before making decisions.";
  } else if (data.status === 'paused') {
    recommendationText.characters = "Experiment is paused. Resume data collection or analyze current results to determine next steps.";
  } else if (data.status === 'rolled_out') {
    // Find the rolled out variant
    const rolledOutVariant = data.variants.find(v => v.isRolledOut);
    if (rolledOutVariant) {
      recommendationText.characters = `"${rolledOutVariant.name}" has been rolled out to all users. Monitor production metrics for any regressions.`;
    } else {
      recommendationText.characters = "A variant has been rolled out. Monitor production metrics for any regressions.";
    }
  } else if (bestVariant) {
    // Has a best performer but no significance data
    const metricName = primaryMetricDef?.name || 'primary metric';
    const bestMetric = primaryMetricKey ? bestVariant.metrics[primaryMetricKey] : undefined;
    const upliftText = bestMetric?.uplift ? formatUplift(bestMetric.uplift) : '';
    recommendationText.characters = `"${bestVariant.name}" shows ${upliftText} on ${metricName}. Confirm statistical significance before rolling out.`;
  } else {
    recommendationText.characters = "No clear winner. Consider extending the experiment, increasing sample size, or revising the hypothesis.";
  }
  
  section.appendChild(recommendationText);

  // Check if any variant has statistical significance data
  const hasSignificanceData = data.variants.some(v => 
    Object.values(v.metrics).some(m => m.isStatSig !== undefined)
  );

  // Only show legend if significance data is present
  if (hasSignificanceData) {
    const legendRow = figma.createFrame();
    legendRow.layoutMode = "HORIZONTAL";
    legendRow.counterAxisSizingMode = "AUTO";
    legendRow.primaryAxisSizingMode = "AUTO";
    legendRow.itemSpacing = 16;
    legendRow.paddingTop = 8;
    legendRow.fills = [];
    legendRow.name = "Legend Row";

    // Sig legend item
    const sigLegend = createLegendItem('Sig', 'Statistically significant', TOKENS.malachite100, TOKENS.malachite800);
    legendRow.appendChild(sigLegend);

    // NS legend item
    const nsLegend = createLegendItem('NS', 'Not significant', TOKENS.yellow100, TOKENS.yellow600);
    legendRow.appendChild(nsLegend);

    // Confidence level indicator (if provided)
    if (data.confidenceLevel && data.confidenceLevel > 0) {
      const confidenceText = figma.createText();
      confidenceText.fontName = getFontStyle("Regular");
      confidenceText.fontSize = TOKENS.fontSizeLabel;
      confidenceText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textTertiary) }];
      confidenceText.textAutoResize = "WIDTH_AND_HEIGHT";
      confidenceText.characters = `@ ${data.confidenceLevel}% confidence`;
      legendRow.appendChild(confidenceText);
    }

    section.appendChild(legendRow);
  }

  return section;
}

/**
 * Create a legend item
 */
function createLegendItem(badge: string, label: string, bgColor: string, textColor: string): FrameNode {
  const item = figma.createFrame();
  item.layoutMode = "HORIZONTAL";
  item.counterAxisSizingMode = "AUTO";
  item.primaryAxisSizingMode = "AUTO";
  item.itemSpacing = 4;
  item.counterAxisAlignItems = "CENTER";
  item.fills = [];
  item.name = `Legend: ${badge}`;

  // Badge
  const badgeFrame = figma.createFrame();
  badgeFrame.layoutMode = "HORIZONTAL";
  badgeFrame.counterAxisSizingMode = "AUTO";
  badgeFrame.primaryAxisSizingMode = "AUTO";
  badgeFrame.paddingLeft = badgeFrame.paddingRight = 3;
  badgeFrame.paddingTop = badgeFrame.paddingBottom = 1;
  badgeFrame.cornerRadius = 2;
  badgeFrame.fills = [{ type: "SOLID", color: hexToRgb(bgColor) }];

  const badgeText = figma.createText();
  badgeText.fontName = getFontStyle("Medium");
  badgeText.fontSize = 7;
  badgeText.lineHeight = { unit: "PIXELS", value: 8 };
  badgeText.fills = [{ type: "SOLID", color: hexToRgb(textColor) }];
  badgeText.textAutoResize = "WIDTH_AND_HEIGHT";
  badgeText.characters = badge;
  badgeFrame.appendChild(badgeText);
  item.appendChild(badgeFrame);

  // Label
  const labelText = figma.createText();
  labelText.fontName = getFontStyle("Regular");
  labelText.fontSize = TOKENS.fontSizeLabel;
  labelText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textTertiary) }];
  labelText.textAutoResize = "WIDTH_AND_HEIGHT";
  labelText.characters = label;
  item.appendChild(labelText);

  return item;
}

/**
 * Convenience function to create an outcome card from experiment info card data
 * This bridges the experiment-info-card data with the outcome card format
 */
export async function createOutcomeCardFromExperimentData(
  experimentName: string,
  metrics: MetricDefinition[],
  variants: Array<{
    id?: string;
    key: string;
    name: string;
    isControl?: boolean;
    traffic: number;
    status?: string;
    metrics?: { [key: string]: number };
    isWinner?: boolean;
    isRolledOut?: boolean;
    isStatSig?: boolean; // Variant-level statistical significance
  }>,
  options?: {
    hypothesis?: string;
    experimentType?: string;
    startDate?: string;
    endDate?: string;
    audience?: string;
    totalSampleSize?: number;
    confidenceLevel?: number;
    status?: 'running' | 'completed' | 'paused' | 'draft' | 'rolled_out';
    primaryMetric?: string;
  }
): Promise<FrameNode> {
  // Find control variant (first variant or one marked as control)
  const controlVariant = variants.find(v => v.isControl) || variants[0];
  
  // Convert variants to outcome format with uplift calculations
  const variantOutcomes: VariantOutcome[] = variants.map((v, index) => {
    const isControl = v === controlVariant || v.isControl;
    const outcomeMetrics: VariantOutcome['metrics'] = {};

    for (const metric of metrics) {
      const metricKey = getMetricKey(metric);
      const value = v.metrics?.[metricKey] ?? 0;
      const controlValue = controlVariant?.metrics?.[metricKey] ?? 0;
      
      // Calculate uplift vs control
      let uplift: number | undefined;
      if (!isControl && controlValue > 0) {
        uplift = ((value - controlValue) / controlValue) * 100;
      }

      outcomeMetrics[metricKey] = {
        value,
        uplift,
        // Use variant-level isStatSig for all metrics of this variant
        // Control variants don't show significance (they're the baseline)
        isStatSig: isControl ? undefined : v.isStatSig,
        confidenceLevel: undefined,
      };
    }

    return {
      id: v.id || `variant-${index}`,
      key: v.key,
      name: v.name || `Variant ${v.key}`,
      isControl,
      traffic: v.traffic,
      metrics: outcomeMetrics,
      isWinner: v.isWinner,
      isRolledOut: v.isRolledOut,
    };
  });

  const data: ExperimentOutcomeData = {
    experimentName,
    experimentType: options?.experimentType,
    hypothesis: options?.hypothesis,
    startDate: options?.startDate,
    endDate: options?.endDate,
    audience: options?.audience,
    totalSampleSize: options?.totalSampleSize,
    confidenceLevel: options?.confidenceLevel,
    status: options?.status || 'running',
    primaryMetric: options?.primaryMetric,
    metrics,
    variants: variantOutcomes,
  };

  return createExperimentOutcomeCard(data);
}
