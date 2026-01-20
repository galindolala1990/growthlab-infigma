/// <reference types="@figma/plugin-typings" />
import { TOKENS } from "./design-tokens";
import { hexToRgb, getFontStyle, createBadge } from "./layout-utils";
import { loadFonts } from "./load-fonts";

/**
 * Experiment Outcome Card
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
    label: 'Experiment draft',
    bgColor: TOKENS.azure50,
    textColor: TOKENS.azure500,
  },
  running: {
    label: 'Experiment running',
    bgColor: TOKENS.azure100,
    textColor: TOKENS.azure700,
  },
  paused: {
    label: 'Experiment paused',
    bgColor: TOKENS.azure100,
    textColor: TOKENS.azure700,
  },
  completed: {
    label: 'Experiment ended',
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
    label: 'Control',
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

  // Badge row - Card type badge + Status badge
  const badgeRow = figma.createFrame();
  badgeRow.layoutMode = "HORIZONTAL";
  badgeRow.counterAxisSizingMode = "AUTO";
  badgeRow.primaryAxisSizingMode = "AUTO";
  badgeRow.itemSpacing = 8;
  badgeRow.fills = [];
  badgeRow.name = "Badge Row";

  // Card type badge (filled)
  const typeBadge = createBadge('Outcome Report', 'filled', TOKENS.azure100, TOKENS.azure700);
  badgeRow.appendChild(typeBadge);

  // Status badge - filled for rolled_out (yellow), outlined for others
  const statusConfig = EXPERIMENT_STATUS_STYLES[data.status] || EXPERIMENT_STATUS_STYLES.running;
  const statusStyle = data.status === 'rolled_out' ? 'filled' : 'outlined';
  const statusBadge = createBadge(statusConfig.label, statusStyle, statusConfig.bgColor, statusConfig.textColor);
  badgeRow.appendChild(statusBadge);

  section.appendChild(badgeRow);

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

  // Sub-label row (control/rolled out indicator)
  const subRow = figma.createFrame();
  subRow.layoutMode = "HORIZONTAL";
  subRow.counterAxisSizingMode = "AUTO";
  subRow.primaryAxisSizingMode = "AUTO";
  subRow.itemSpacing = 4;
  subRow.fills = [];
  subRow.name = "Sub Labels";

  if (variant.isControl) {
    const controlBadge = createBadge('Control', 'micro', TOKENS.azure200, TOKENS.azure700);
    subRow.appendChild(controlBadge);
  }

  if (variant.isRolledOut) {
    const rolledOutBadge = createBadge('Rolled Out', 'micro', '#FFF420', TOKENS.textPrimary);
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
    const primaryBadge = createBadge('Primary', 'micro', TOKENS.azure100, TOKENS.azure700);
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
    recommendationText.characters = "Experiment is live. Collect more data before making decisions.";
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
    // Has a best performer
    const metricName = primaryMetricDef?.name || 'primary metric';
    const bestMetric = primaryMetricKey ? bestVariant.metrics[primaryMetricKey] : undefined;
    const upliftText = bestMetric?.uplift ? formatUplift(bestMetric.uplift) : '';
    recommendationText.characters = `"${bestVariant.name}" shows ${upliftText} on ${metricName}. Review data and mark as winner to roll out.`;
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
  };

  return createExperimentOutcomeCard(data);
}
