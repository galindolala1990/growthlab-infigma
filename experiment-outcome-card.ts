/// <reference types="@figma/plugin-typings" />
import { TOKENS } from "./design-tokens";
import { hexToRgb, getFontStyle, createBadge } from "./layout-utils";
import { loadFonts } from "./load-fonts";

// Baseline label constant - only used when variant is explicitly marked as control
const BASELINE_LABEL = "(Baseline)";

// Lucide star-filled icon SVG markup (complete SVG for figma.createNodeFromSvg)
const LUCIDE_STAR_FILLED_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>
</svg>`;

/**
 * Create lucide-star-filled icon as a Figma frame from SVG
 * @param size - Icon size in pixels (default 12)
 * @param color - RGB color for the icon (default azure700)
 * @returns FrameNode containing the vector icon
 */
function createLucideStarFilledIcon(size: number = 12, color: RGB = hexToRgb(TOKENS.azure700)): FrameNode {
  try {
    // Create node from SVG - this returns a FrameNode with vectors inside
    const svgNode = figma.createNodeFromSvg(LUCIDE_STAR_FILLED_SVG);
    svgNode.name = 'Star Icon';
    
    // Update fill color to match the desired color
    function updateFillColors(node: SceneNode) {
      if (node.type === 'VECTOR' || node.type === 'ELLIPSE' || node.type === 'POLYGON' || node.type === 'STAR' || node.type === 'RECTANGLE') {
        const fills = (node as any).fills;
        if (Array.isArray(fills) && fills.length > 0) {
          (node as any).fills = [{ type: 'SOLID', color }];
        }
      } else if ('children' in node) {
        for (const child of node.children) {
          updateFillColors(child);
        }
      }
    }
    updateFillColors(svgNode);
    
    // Scale to target size (SVG viewBox is 24x24)
    svgNode.resize(size, size);
    
    // Flatten to clean up the structure
    svgNode.fills = [];
    
    return svgNode;
  } catch (e) {
    console.error('Failed to create star icon:', e);
    
    // Fallback: create empty frame
    const fallback = figma.createFrame();
    fallback.name = 'Star Icon (fallback)';
    fallback.resize(size, size);
    fallback.fills = [];
    return fallback;
  }
}

/**
 * Experiment Metrics Card
 * 
 * Displays experiment metrics outcomes in a table format following growth experiment best practices:
 * - Clear comparison of variants against control
 * - Uplift/change percentages
 * - Primary metric highlighting
 * - Rolled out variant indicator
 */

export interface MetricDefinition {
  id: string;
  name: string;
  abbreviation?: string;
  direction?: "increase" | "decrease";
  thresholdPct?: number;
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
    };
  };
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
  status: 'running' | 'completed' | 'paused' | 'draft' | 'rolled_out';
  primaryMetric?: string;  // Key of the primary decision metric
  metrics: MetricDefinition[];
  variants: VariantOutcome[];
  dateCreated?: string; // Date when experiment was created (ISO format, auto-populated if not provided)
}

// Format date for display (e.g., "Jan 15, 2024")
function formatDateForDisplay(dateString?: string): string {
  if (!dateString) {
    // Use current date if not provided
    dateString = new Date().toISOString().split('T')[0];
  }
  try {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  } catch {
    return dateString; // Return original string if parsing fails
  }
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
    bgColor: TOKENS.azure50,
    textColor: TOKENS.azure500,
  },
  running: {
    label: 'Running',
    bgColor: TOKENS.azure100,
    textColor: TOKENS.azure700,
  },
  paused: {
    label: 'Paused',
    bgColor: TOKENS.azure100,
    textColor: TOKENS.azure700,
  },
  completed: {
    label: 'Concluded',
    bgColor: TOKENS.azure100,
    textColor: TOKENS.azure700,
  },
  rolled_out: {
    label: 'Rolled out',
    bgColor: '#FFF420',
    textColor: TOKENS.textPrimary,
  },
};

// Variant outcome styles (for table rows, not header)
const VARIANT_OUTCOME_STYLES: Record<string, OutcomeStatusConfig> = {
  control: {
    label: 'Baseline',
    bgColor: TOKENS.azure100,
    textColor: TOKENS.azure700,
  },
  rolledOut: {
    label: 'Rolled Out',
    bgColor: '#FFF420',
    textColor: TOKENS.textPrimary,
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
 * Format metric value with appropriate precision (always decimal)
 */
function formatMetricValue(value: number | undefined): string {
  if (value === undefined || value === null) return '--';
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  // Always show as decimal with 2 decimal places
  return value.toFixed(2);
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
  card.name = `Experiment Metrics — ${data.experimentName}`;
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
  card.minWidth = 792;
  card.minHeight = 612;

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

  // Date created label - auto-populated (above badge row)
  const dateCreated = data.dateCreated || new Date().toISOString().split('T')[0];
  const dateFormatted = formatDateForDisplay(dateCreated);
  const dateLabel = figma.createText();
  dateLabel.fontName = { family: "Figtree", style: "Regular" };
  dateLabel.fontSize = TOKENS.fontSizeLabel;
  dateLabel.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary), opacity: 0.5 }];
  dateLabel.textAutoResize = "WIDTH_AND_HEIGHT";
  dateLabel.characters = dateFormatted;
  dateLabel.name = "Date Created Label";
  section.appendChild(dateLabel);

  // Status badge - filled for rolled_out (yellow), outlined for others
  const statusConfig = EXPERIMENT_STATUS_STYLES[data.status] || EXPERIMENT_STATUS_STYLES.running;
  const statusStyle = data.status === 'rolled_out' ? 'filled' : 'outlined';
  // For outlined badges, use textColor for stroke to match info-card; for filled, use bgColor
  const strokeOrFillColor = statusStyle === 'outlined' ? statusConfig.textColor : statusConfig.bgColor;
  const statusBadge = createBadge(statusConfig.label, statusStyle, strokeOrFillColor, statusConfig.textColor);
  section.appendChild(statusBadge);

  // Experiment name (Bold, 24px)
  const titleText = figma.createText();
  titleText.fontName = getFontStyle("Bold");
  titleText.fontSize = 24;
  titleText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  titleText.textAutoResize = "WIDTH_AND_HEIGHT";
  titleText.characters = data.experimentName || 'Untitled Experiment';
  section.appendChild(titleText);

  // Context row: Timeline + Audience + Sample Size (compact metadata line)
  const contextParts: string[] = [];
  
  // Add experiment type
  if (data.experimentType) {
    contextParts.push(getExperimentTypeLabel(data.experimentType));
  }
  
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
    contextParts.push(`${data.totalSampleSize.toLocaleString()} users`);
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
 * Create table header row with Goal and variant names (in variant order)
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
  row.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.azure50) }];
  row.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  row.strokeWeight = 1;
  row.strokeTopWeight = 0;
  row.strokeLeftWeight = 0;
  row.strokeRightWeight = 0;
  row.name = "Header Row";

  // First column: Metric label (fixed width)
  const metricHeader = createTableCell('Metric', 140, true, false);
  metricHeader.layoutGrow = 0; // Don't grow
  metricHeader.minWidth = 200;
  row.appendChild(metricHeader);

  // Second column: Goal label (fixed width)
  const goalHeader = createTableCell('Goal', 100, true, true);
  goalHeader.layoutGrow = 0; // Don't grow
  goalHeader.minWidth = 100;
  row.appendChild(goalHeader);

  // Variant headers: render in the SAME order as provided (do not move columns around).
  // If a variant is explicitly marked as baseline/control, it will show the badge in its own header.
  if (data.variants.length > 0) {
    for (const variant of data.variants) {
      const variantHeader = createVariantHeaderCell(variant);
      variantHeader.layoutGrow = 1; // Grow to fill available space
      variantHeader.minWidth = 80;
      row.appendChild(variantHeader);
    }
  } else {
    // No variants at all - show a generic "Variant" column name
    const variantHeader = createTableCell('Variant', 100, true, true);
    variantHeader.layoutGrow = 1; // Grow to fill available space (flexible)
    variantHeader.minWidth = 80;
    row.appendChild(variantHeader);
  }

  return row;
}

/**
 * Create a variant header cell with name and optional badges
 */
function createVariantHeaderCell(variant: VariantOutcome): FrameNode {
  const variantName = variant.name || `Variant ${variant.key}`;
  // STRICT CHECK: Only show badge if isControl is explicitly boolean true (checkbox checked)
  // Must be boolean true, not just truthy
  const isExplicitlyControl = variant.isControl === true && typeof variant.isControl === 'boolean';

  const cell = figma.createFrame();
  cell.layoutMode = "HORIZONTAL";
  cell.counterAxisSizingMode = "FIXED"; // Fixed height
  cell.primaryAxisSizingMode = "FIXED"; // Fixed width (will be overridden by layoutGrow)
  cell.layoutAlign = "STRETCH";
  cell.minWidth = 80;
  cell.resize(100, 40);
  cell.counterAxisAlignItems = "CENTER";
  cell.primaryAxisAlignItems = "CENTER";
  cell.itemSpacing = 6;
  cell.paddingLeft = 12;
  cell.paddingRight = 8;
  cell.fills = [];
  cell.name = `Variant Header: ${variantName}`;

  // Variant name
  const nameText = figma.createText();
  nameText.fontName = getFontStyle("Medium");
  nameText.fontSize = TOKENS.fontSizeBodySm;
  nameText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textSecondary) }];
  nameText.textAutoResize = "WIDTH_AND_HEIGHT";
  nameText.characters = variantName;
  cell.appendChild(nameText);

  if (isExplicitlyControl) {
    const controlBadge = createBadge('Baseline', 'micro', TOKENS.azure100, TOKENS.azure700);
    cell.appendChild(controlBadge);
  }

  if (variant.isRolledOut) {
    const rolledOutBadge = createBadge('Rolled Out', 'micro', '#FFF420', TOKENS.textPrimary);
    cell.appendChild(rolledOutBadge);
  }

  return cell;
}

/**
 * Create a goal cell showing the target percent (preferred) or legacy range (min-max)
 */
function createGoalCell(metric: MetricDefinition, isPrimary: boolean = false): FrameNode {
  const cell = figma.createFrame();
  cell.layoutMode = "VERTICAL";
  cell.counterAxisSizingMode = "FIXED"; // Fixed height
  cell.primaryAxisSizingMode = "FIXED"; // Fixed width
  cell.layoutAlign = "STRETCH";
  cell.minWidth = 80; 
  cell.resize(100, 48);
  cell.counterAxisAlignItems = "CENTER";
  cell.primaryAxisAlignItems = "CENTER";
  cell.itemSpacing = 2;
  cell.paddingLeft = cell.paddingRight = 8;
  cell.fills = [];
  cell.name = "Goal Cell";

  if (typeof metric.thresholdPct === 'number' && Number.isFinite(metric.thresholdPct)) {
    const goalText = figma.createText();
    goalText.fontName = getFontStyle(isPrimary ? "Bold" : "Medium");
    goalText.fontSize = TOKENS.fontSizeBodyMd;
    goalText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
    goalText.textAutoResize = "WIDTH_AND_HEIGHT";
    goalText.textAlignHorizontal = "CENTER";
    goalText.characters = `${metric.direction === 'decrease' ? '≤' : '≥'} ${metric.thresholdPct}%`;
    cell.appendChild(goalText);
  } else if (metric.min !== undefined && metric.max !== undefined) {
    const goalText = figma.createText();
    goalText.fontName = getFontStyle(isPrimary ? "Bold" : "Medium");
    goalText.fontSize = TOKENS.fontSizeBodyMd;
    goalText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
    goalText.textAutoResize = "WIDTH_AND_HEIGHT";
    goalText.textAlignHorizontal = "CENTER";
    goalText.characters = `${metric.min} - ${metric.max}`;
    cell.appendChild(goalText);
  } else {
    const noGoalText = figma.createText();
    noGoalText.fontName = getFontStyle("Regular");
    noGoalText.fontSize = TOKENS.fontSizeLabel;
    noGoalText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textTertiary) }];
    noGoalText.textAutoResize = "WIDTH_AND_HEIGHT";
    noGoalText.textAlignHorizontal = "CENTER";
    noGoalText.characters = '--';
    cell.appendChild(noGoalText);
  }

  return cell;
}

/**
 * Create a baseline cell showing just the control variant value
 * (Name and badge are shown in the header, so we don't repeat them here)
 */
function createBaselineCell(
  metricData: VariantOutcome['metrics'][string] | undefined,
  variant: VariantOutcome,
  isPrimary: boolean = false
): FrameNode {
  const cell = figma.createFrame();
  cell.layoutMode = "VERTICAL";
  cell.counterAxisSizingMode = "FIXED"; // Fixed height
  cell.primaryAxisSizingMode = "FIXED"; // Fixed width
  cell.layoutAlign = "STRETCH";
  cell.minWidth = 80;
  cell.resize(100, 48);
  cell.counterAxisAlignItems = "CENTER";
  cell.primaryAxisAlignItems = "CENTER";
  cell.itemSpacing = 2;
  cell.paddingLeft = cell.paddingRight = 8;
  cell.fills = [];
  cell.name = "Baseline Cell";

  // Main value only (name and badge are in header)
  const valueText = figma.createText();
  valueText.fontName = getFontStyle(isPrimary ? "Bold" : "Medium");
  valueText.fontSize = TOKENS.fontSizeBodyMd;
  valueText.textAutoResize = "WIDTH_AND_HEIGHT";
  valueText.textAlignHorizontal = "CENTER";
  
  const value = metricData?.value;
  valueText.characters = formatMetricValue(value);
  valueText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  cell.appendChild(valueText);

  return cell;
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

  // Goal cell (fixed width) - shows min-max range
  const goalCell = createGoalCell(metric, isPrimary);
  goalCell.layoutGrow = 0; // Don't grow
  row.appendChild(goalCell);

  // Render variant value cells in the SAME order as provided.
  // Treat the comparison variant (explicit baseline/control if set, otherwise first variant)
  // as the "no-uplift" column, but do NOT move it.
  const comparisonVariant = variants.find(v => v.isControl === true) || variants[0];

  if (variants.length > 0) {
    for (const variant of variants) {
      const metricData = variant.metrics[metricKey];
      const isComparison = !!comparisonVariant && variant.id === comparisonVariant.id;
      const valueCell = createMetricValueCell(metricData, isComparison, isPrimary, metric);
      valueCell.layoutGrow = 1; // Grow to fill available space
      row.appendChild(valueCell);
    }
  } else {
    // No variants at all - still render one placeholder value cell to match header.
    const emptyValueCell = createMetricValueCell(undefined, true, isPrimary, metric);
    emptyValueCell.layoutGrow = 1;
    row.appendChild(emptyValueCell);
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
  cell.layoutAlign = "STRETCH";
  cell.minWidth = 200;
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
    // Match info-card behavior: star icon only (no "Primary" pill badge)
    const starIcon = createLucideStarFilledIcon(12, hexToRgb(TOKENS.azure700));
    nameRow.appendChild(starIcon);
  }

  cell.appendChild(nameRow);

  // Sub-info row: abbreviation only (range moved to value cell)
  const hasAbbrev = metric.abbreviation && metric.abbreviation !== metric.name;
  
  if (hasAbbrev) {
    const subText = figma.createText();
    subText.fontName = getFontStyle("Regular");
    subText.fontSize = TOKENS.fontSizeLabel;
    subText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textTertiary) }];
    subText.textAutoResize = "WIDTH_AND_HEIGHT";
    subText.characters = metric.abbreviation!;
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
  isPrimary: boolean = false,
  metric?: MetricDefinition
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
  
  // Add light background color based on uplift direction (only for non-control)
  if (!isControl && metricData?.uplift !== undefined) {
    const isPositive = metricData.uplift >= 0;
    cell.fills = [{ type: "SOLID", color: hexToRgb(isPositive ? TOKENS.malachite50 : TOKENS.coralRed50) }];
  } else {
    cell.fills = [];
  }
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

    cell.appendChild(upliftRow);
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
  section.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.azure50) }];
  section.name = "Summary Section";
  section.layoutAlign = "STRETCH";

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

  if (data.status === 'running') {
    recommendationText.characters = "Experiment is running. Continue collecting data before making decisions.";
  } else if (data.status === 'paused') {
    recommendationText.characters = "Experiment is paused. Resume to collect more data, or analyze current results.";
  } else if (data.status === 'rolled_out') {
    // Find the rolled out variant
    const rolledOutVariant = data.variants.find(v => v.isRolledOut);
    if (rolledOutVariant) {
      const metricName = primaryMetricDef?.name || 'primary metric';
      const rolledOutMetric = primaryMetricKey ? rolledOutVariant.metrics[primaryMetricKey] : undefined;
      const upliftText = rolledOutMetric?.uplift ? ` with ${formatUplift(rolledOutMetric.uplift)} on ${metricName}` : '';
      recommendationText.characters = `"${rolledOutVariant.name}" is now live for all users${upliftText}. Monitor for regressions.`;
    } else {
      recommendationText.characters = "A variant is now live for all users. Monitor for regressions.";
    }
  } else if (bestVariant) {
    // Has a best performer (concluded/completed status)
    const metricName = primaryMetricDef?.name || 'primary metric';
    const bestMetric = primaryMetricKey ? bestVariant.metrics[primaryMetricKey] : undefined;
    const upliftText = bestMetric?.uplift ? formatUplift(bestMetric.uplift) : '';
    recommendationText.characters = `"${bestVariant.name}" shows ${upliftText} on ${metricName}. Consider rolling out this variant.`;
  } else {
    recommendationText.characters = "No clear winner yet. Consider extending the experiment or revising the hypothesis.";
  }
  
  section.appendChild(recommendationText);

  return section;
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
    isRolledOut?: boolean;
  }>,
  options?: {
    hypothesis?: string;
    experimentType?: string;
    startDate?: string;
    endDate?: string;
    audience?: string;
    totalSampleSize?: number;
    status?: 'running' | 'completed' | 'paused' | 'draft' | 'rolled_out';
    primaryMetric?: string;
    dateCreated?: string;
  }
): Promise<FrameNode> {
  // Find control variant (only if explicitly marked as control, otherwise use first variant for comparison)
  const trueControlVariant = variants.find(v => v.isControl === true);
  const controlVariant = trueControlVariant || variants[0];
  
  // Convert variants to outcome format with uplift calculations
  const variantOutcomes: VariantOutcome[] = variants.map((v, index) => {
    // Only set isControl to true if explicitly marked as control (isControl === true)
    // Don't set it to true just because it's the first variant
    const isControl = v.isControl === true;
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
      };
    }

    return {
      id: v.id || `variant-${index}`,
      key: v.key,
      name: v.name || `Variant ${v.key}`,
      isControl,
      traffic: v.traffic,
      metrics: outcomeMetrics,
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
    status: options?.status || 'running',
    primaryMetric: options?.primaryMetric,
    metrics,
    variants: variantOutcomes,
    dateCreated: options?.dateCreated,
  };

  return createExperimentOutcomeCard(data);
}
