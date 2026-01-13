// ...existing code...
import { createExperimentInfoCard } from './experiment-info-card';
// ...existing code...

// --- Utility: Create a native Figma connector between two nodes, magnetized to edges ---
/**
 * Creates a Figma ConnectorNode between two nodes, magnetized to specified edges.
 * @param fromNode The node to start from
 * @param toNode The node to end at
 * @param fromMagnet 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'
 * @param toMagnet 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'
 * @param options Optional styling (color, strokeWeight, etc)
 * @returns The created ConnectorNode
 */
function createMagnetizedConnector(
  fromNode: BaseNode & { id: string },
  toNode: BaseNode & { id: string },
  fromMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' = 'RIGHT',
  toMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' = 'LEFT',
  options?: {
    color?: RGB;
    strokeWeight?: number;
    cornerRadius?: number;
    connectorLineType?: 'ELBOWED' | 'STRAIGHT';
  }
): ConnectorNode {
  const connector = figma.createConnector();
  connector.connectorStart = {
    endpointNodeId: fromNode.id,
    magnet: fromMagnet
  };
  connector.connectorEnd = {
    endpointNodeId: toNode.id,
    magnet: toMagnet
  };
  connector.connectorLineType = options?.connectorLineType || 'ELBOWED';
  connector.strokeWeight = options?.strokeWeight ?? 4;
  // connector.cornerRadius = options?.cornerRadius ?? 24; // Not allowed on ConnectorNode
  connector.strokeJoin = 'BEVEL';
  // connector.strokeCap = 'NONE'; // Not allowed on ConnectorNode
  connector.connectorEndStrokeCap = 'ARROW_LINES';
  connector.strokes = [{ type: 'SOLID', color: options?.color ?? hexToRgb(TOKENS.royalBlue600) }];
  connector.name = 'Connector line';
  // Don't append here - let the caller decide where to append
  return connector;
}

/**
 * Simple connector creation function - clean start
 * Uses the exact pattern from the working connectNodes function
 */
function createConnectorV2(
  fromNode: SceneNode & { width: number; height: number },
  toNode: SceneNode & { width: number; height: number },
  type: ConnectorTypeV2,
  flowFrame?: FrameNode,
  options?: {
    label?: string;
    winner?: boolean;
    variantColor?: string;
    index?: number;
  }
): SceneNode {
  const style = getConnectorStyle(type, { winner: options?.winner, variantColor: options?.variantColor });
  const color = style.color;
  const strokeWeight = style.strokeWeight;
  
  // Helper to get absolute position (like connectNodes)
  function getAbsolutePos(node: SceneNode): { x: number; y: number } {
    let x = node.x, y = node.y;
    let parent = node.parent;
    while (parent && parent.type !== 'PAGE') {
      if ('x' in parent && 'y' in parent) {
        x += (parent as any).x;
        y += (parent as any).y;
      }
      parent = parent.parent;
    }
    return { x, y };
  }
  
  // Get edge points (like connectNodes)
  function getEdgePoints(
    from: SceneNode & { width: number; height: number },
    to: SceneNode & { width: number; height: number }
  ): { from: { x: number; y: number }; to: { x: number; y: number } } {
    const fromAbs = getAbsolutePos(from);
    const toAbs = getAbsolutePos(to);
    const dx = toAbs.x - fromAbs.x;
    const dy = toAbs.y - fromAbs.y;
    
    let fromPoint, toPoint;
    if (type === 'PRIMARY_FLOW_LINE' || type === 'MERGE_LINE') {
      // Horizontal connections (left-right)
      fromPoint = { x: dx > 0 ? fromAbs.x + from.width : fromAbs.x, y: fromAbs.y + from.height / 2 };
      toPoint = { x: dx > 0 ? toAbs.x : toAbs.x + to.width, y: toAbs.y + to.height / 2 };
    } else if (type === 'BRANCH_LINE') {
      // Vertical connections (event to variant: bottom to top)
      fromPoint = { x: fromAbs.x + from.width / 2, y: fromAbs.y + from.height };
      toPoint = { x: toAbs.x + to.width / 2, y: toAbs.y };
    } else {
      // Auto-detect based on distance
      if (Math.abs(dx) > Math.abs(dy)) {
        fromPoint = { x: dx > 0 ? fromAbs.x + from.width : fromAbs.x, y: fromAbs.y + from.height / 2 };
        toPoint = { x: dx > 0 ? toAbs.x : toAbs.x + to.width, y: toAbs.y + to.height / 2 };
      } else {
        fromPoint = { x: fromAbs.x + from.width / 2, y: dy > 0 ? fromAbs.y + from.height : fromAbs.y };
        toPoint = { x: toAbs.x + to.width / 2, y: dy > 0 ? toAbs.y : toAbs.y + to.height };
      }
    }
    return { from: fromPoint, to: toPoint };
  }
  
  const { from: startAbs, to: endAbs } = getEdgePoints(fromNode, toNode);
  let start = { ...startAbs }, end = { ...endAbs };
  
  // Convert to flowFrame-local if provided
  if (flowFrame) {
    const frameAbs = getAbsolutePos(flowFrame);
    start.x = startAbs.x - frameAbs.x;
    start.y = startAbs.y - frameAbs.y;
    end.x = endAbs.x - frameAbs.x;
    end.y = endAbs.y - frameAbs.y;
  }
  
  const index = options?.index ?? 0;
  let midX, midY;
  let line: VectorNode, arrow: VectorNode | null = null;
  
  if (Math.abs(start.x - end.x) > Math.abs(start.y - end.y)) {
    // Horizontal
    midX = start.x + (end.x - start.x) * 0.5 + index * 12;
    midY = start.y;
    const pathData = `M ${start.x} ${start.y} L ${midX} ${midY} L ${midX} ${end.y} L ${end.x} ${end.y}`;
    line = figma.createVector();
    line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
    line.strokes = [{ type: "SOLID", color }];
    line.strokeWeight = strokeWeight;
    line.strokeAlign = "CENTER";
    if (style.dashPattern) line.dashPattern = style.dashPattern;
    line.name = `${type} Line`;
    figma.currentPage.appendChild(line);
    
    // Arrowhead
    if (style.arrowhead) {
      const size = 10;
      arrow = figma.createVector();
      arrow.vectorPaths = [{
        windingRule: "NONZERO",
        data: `M ${end.x} ${end.y} L ${end.x - size * Math.sign(end.x - start.x)} ${end.y - size / 2} L ${end.x - size * Math.sign(end.x - start.x)} ${end.y + size / 2} Z`,
      }];
      arrow.fills = [{ type: "SOLID", color }];
      arrow.strokes = [];
      arrow.name = "Arrowhead";
      figma.currentPage.appendChild(arrow);
    }
  } else {
    // Vertical
    midX = start.x;
    midY = start.y + (end.y - start.y) * 0.5 + index * 12;
    const pathData = `M ${start.x} ${start.y} L ${midX} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
    line = figma.createVector();
    line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
    line.strokes = [{ type: "SOLID", color }];
    line.strokeWeight = strokeWeight;
    line.strokeAlign = "CENTER";
    if (style.dashPattern) line.dashPattern = style.dashPattern;
    line.name = `${type} Line`;
    figma.currentPage.appendChild(line);
    
    // Arrowhead
    if (style.arrowhead) {
      const size = 10;
      arrow = figma.createVector();
      arrow.vectorPaths = [{
        windingRule: "NONZERO",
        data: `M ${end.x} ${end.y} L ${end.x - size / 2} ${end.y - size * Math.sign(end.y - start.y)} L ${end.x + size / 2} ${end.y - size * Math.sign(end.y - start.y)} Z`,
      }];
      arrow.fills = [{ type: "SOLID", color }];
      arrow.strokes = [];
      arrow.name = "Arrowhead";
      figma.currentPage.appendChild(arrow);
    }
  }
  
  return line;
}
// ...existing code...

  // Delete frames named 'Sample Experiment Flow' or matching 'Experiment Flow' patterns
  function deleteExperimentFlowFrames() {
    const pattern = /Sample Experiment Flow|Experiment Flow.*|undefined/i;
    const frames = figma.currentPage.findAll(node =>
      node.type === "FRAME" && pattern.test(node.name)
    );
    for (const frame of frames) {
      frame.remove();
    }
  }
  // Utility: Convert hex color to RGB
  // ...existing code...

  // Create an Event Card styled similarly to Variant Card -- ACTUAL CARD
  // ...existing code...

// --- V2 Experiment Flow Types ---
export interface ExperimentV2 {
  id: string;
  name: string;
  roundNumber: number;
  description?: string;
  links?: {
    figma?: string;
    jira?: string;
    miro?: string;
  };
  outcomes?: {
    winningPaths?: Array<{ eventId: string; variantId: string }>;
    notes?: string;
  };
}

export interface EntryNodeV2 {
  id: string;
  label: string;
  note?: string;
  nodeType: 'ENTRY_NODE';
}

export interface ExitNodeV2 {
  id: string;
  label: string;
  nodeType: 'EXIT_NODE';
}

export interface VariantV2 {
  id: string;
  parentEventId: string;
  key: string;
  name: string;
  description?: string;
  traffic: number;
  metrics?: VariantMetrics;
  style?: {
    variantColor?: string;
  };
}

export interface EventNodeV2 {
  id: string;
  name: string;
  nodeType: 'EVENT_NODE';
  entryNote?: EntryNoteV2;
  variants?: VariantV2[];
}

export interface EntryNoteV2 {
  id: string;
  text: string;
  attachTo: {
    target: 'EVENT_NODE' | 'PRIMARY_FLOW_LINE';
    targetId?: string;
    fromId?: string;
    toId?: string;
    anchor?: string;
  };
}

export type ConnectorTypeV2 = 'PRIMARY_FLOW_LINE' | 'BRANCH_LINE' | 'MERGE_LINE';

export interface ConnectorV2 {
  id: string;
  type: ConnectorTypeV2;
  from: { nodeType: string; id: string };
  to: { nodeType: string; id: string };
  label?: string;
  arrowhead?: boolean;
  style?: Record<string, any>;
}

/**
 * Connector style configuration based on type
 */
interface ConnectorStyleConfig {
  strokeWeight: number;
  color: RGB;
  dashPattern?: number[];
  arrowhead: boolean;
}

/**
 * Get connector style configuration based on type
 */
function getConnectorStyle(type: ConnectorTypeV2, options?: { winner?: boolean; variantColor?: string }): ConnectorStyleConfig {
  switch (type) {
    case 'PRIMARY_FLOW_LINE':
      return {
        strokeWeight: 1,
        color: hexToRgb(TOKENS.azure300),
        arrowhead: true,
      };
    case 'BRANCH_LINE':
      return {
        strokeWeight: 1,
        color: hexToRgb(TOKENS.azure300),
        dashPattern: [6, 4], // Dashed pattern
        arrowhead: true,
      };
    case 'MERGE_LINE':
      return {
        strokeWeight: 1,
        color: hexToRgb(TOKENS.azure300),
        dashPattern: [6, 4], // Dashed pattern
        arrowhead: true,
      };
    default:
      return {
        strokeWeight: 4,
        color: hexToRgb(TOKENS.azure300),
        arrowhead: true,
      };
  }
}

export interface FlowLayoutV2 {
  direction?: 'HORIZONTAL' | 'VERTICAL';
  eventSpacing?: number;
  variantSpacing?: number;
  branchDepth?: number;
}

export interface FlowV2 {
  id: string;
  layout?: FlowLayoutV2;
  entry: EntryNodeV2;
  events: EventNodeV2[];
  exit: ExitNodeV2;
  connectors: ConnectorV2[];
}
let selectedEventIndex = 0; // Default to first event selected

export interface CreateFlowV2Payload {
  experiment: ExperimentV2;
  flow: FlowV2;
}

export interface PluginMessageV2 {
  type: 'create-flow-v2';
  payload: CreateFlowV2Payload;
}

interface PluginMessage {
  type: string;
  payload?: CreateFlowV2Payload;
}
/// <reference types="@figma/plugin-typings" />
/* eslint-disable no-inner-declarations */

type VariantStatus = "running" | "winner" | "none";

type VariantMetrics = {
  ctr: number;
  cr: number;
  su: number;
};

export type Variant = {
  key: string;        // "A", "B", "C"
  name: string;       // "Black btn"
  traffic: number;    // 50, 25, etc
  status: VariantStatus;
  metrics: VariantMetrics;
};

const KEEP_OPEN = true;


import { TOKENS } from './design-tokens';
import { hexToRgb, getFontStyle } from './layout-utils';
import { createEventCard, createVariantCard, createMetricChip } from './experiment-node';
import { loadFonts } from './load-fonts';

if (figma.editorType === 'figma') {

  // --- SAMPLE DATA (mirrors UI sample) ---
  const sampleEvents = [
    {
      id: 'event-0', // THIS IS AN EVENT ID IN AN EVENT CARD
      name: 'Landing page', // THIS IS THE EVENT NAME IN AN EVENT CARD
      hasVariants: false, // THIS IS AN EVENT WITHOUT VARIANTS  
      variants: [] // THIS IS AN EMPTY VARIANTS ARRAY FOR AN EVENT WITHOUT VARIANTS
    },
    {
      id: 'event-1', // THIS IS AN EVENT ID IN AN EVENT CARD
      name: 'Conversion button', // THIS IS THE EVENT NAME IN AN EVENT CARD
      hasVariants: true, // THIS IS AN EVENT WITH VARIANTS
      variants: [
        {
          key: 'A', // THIS IS A VARIANT KEY IN AN VARIANT CARD, RELATED TO AN EVENT
          name: 'Control', // THIS IS A VARIANT NAME IN AN VARIANT CARD, RELATED TO AN EVENT
          description: 'Original version without changes', // THIS IS A VARIANT DESCRIPTION IN AN VARIANT CARD, RELATED TO AN EVENT
          color: TOKENS.royalBlue600, // THIS IS THE COLOR FOR THIS VARIANT IN AN EVENT CARD
          traffic: 50, // THIS IS THE TRAFFIC PERCENTAGE FOR THIS VARIANT IN AN EVENT CARD
          status: 'none' as VariantStatus, // THIS IS THE STATUS FOR THIS VARIANT IN AN EVENT CARD
          metrics: { ctr: 0.695, cr: 0.425, su: 0.0 } // THIS IS THE METRICS FOR THIS VARIANT IN AN EVENT CARD
        },
        {
          key: 'B', // THIS IS A VARIANT KEY IN AN VARIANT CARD, RELATED TO AN EVENT
          name: 'Variation A',  // THIS IS A VARIANT NAME IN AN VARIANT CARD, RELATED TO AN EVENT
          description: 'New CTA button design', // THIS IS A VARIANT DESCRIPTION IN AN VARIANT CARD, RELATED TO AN EVENT  
          color: TOKENS.malachite600, // THIS IS THE COLOR FOR THIS VARIANT IN AN EVENT CARD
          traffic: 30, // THIS IS THE TRAFFIC PERCENTAGE FOR THIS VARIANT IN AN EVENT CARD  
          status: 'running' as VariantStatus, // THIS IS THE STATUS FOR THIS VARIANT IN AN EVENT CARD
          metrics: { ctr: 0.725, cr: 0.480, su: 0.0 } // THIS IS THE METRICS FOR THIS VARIANT IN AN EVENT CARD
        },
        {
          key: 'C', // THIS IS A VARIANT KEY IN AN VARIANT CARD, RELATED TO AN EVENT
          name: 'Variation B', // THIS IS A VARIANT NAME IN AN VARIANT CARD, RELATED TO AN EVENT
          description: 'CTA with icon', // THIS IS A VARIANT DESCRIPTION IN AN VARIANT CARD, RELATED TO AN EVENT
          color: TOKENS.yellow600, // THIS IS THE COLOR FOR THIS VARIANT IN AN EVENT CARD
          traffic: 20, // THIS IS THE TRAFFIC PERCENTAGE FOR THIS VARIANT IN AN EVENT CARD
          status: 'winner' as VariantStatus, // THIS IS THE STATUS FOR THIS VARIANT IN AN EVENT CARD
          metrics: { ctr: 0.755, cr: 0.510, su: 0.0 } // THIS IS THE METRICS FOR THIS VARIANT IN AN EVENT CARD
        }
      ]
    },
    {
      id: 'event-2', // THIS IS AN EVENT ID IN AN EVENT CARD
      name: 'Checkout page', // THIS IS THE EVENT NAME IN AN EVENT CARD
      hasVariants: false, // THIS IS AN EVENT WITHOUT VARIANTS    
      variants: [] // THIS IS AN EMPTY VARIANTS ARRAY FOR AN EVENT WITHOUT VARIANTS
    },
  ];

  // --- DEMO: Create node cards for each event and its variants ---
  /**
   * Creates a connector with an arrowhead between two points in Figma.
   * @param x1 Start X
   * @param y1 Start Y
   * @param x2 End X
   * @param y2 End Y
   * @param options Optional styling (color, strokeWeight, arrowSize)
   * @returns The created VECTOR node
   */
  function createConnectorWithArrow(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options?: {
      color?: RGB;
      strokeWeight?: number;
      arrowSize?: number;
      dashPattern?: number[];
    }
  ): VectorNode {
    // Subtle blue/gray, dashed
    const color = options?.color ?? hexToRgb(TOKENS.royalBlue400);
    const strokeWeight = options?.strokeWeight ?? 2;
    const arrowSize = options?.arrowSize ?? 16;
    const dashPattern = options?.dashPattern ?? [6, 4];

    // Elbow (right-angle) connector: horizontal, then vertical
    const midX = x1 + (x2 - x1) * 0.5;

    // Arrowhead at end
    const dx = x2 - midX;
    const dy = y2 - y1;
    const angle = Math.atan2(y2 - y1, x2 - midX);
    const arrowAngle = Math.PI / 6;
    const arrowX1 = x2 - arrowSize * Math.cos(angle - arrowAngle);
    const arrowY1 = y2 - arrowSize * Math.sin(angle - arrowAngle);
    const arrowX2 = x2 - arrowSize * Math.cos(angle + arrowAngle);
    const arrowY2 = y2 - arrowSize * Math.sin(angle + arrowAngle);

    // Find bounding box
    const points = [
      { x: x1, y: y1 },
      { x: midX, y: y1 },
      { x: midX, y: y2 },
      { x: x2, y: y2 },
      { x: arrowX1, y: arrowY1 },
      { x: arrowX2, y: arrowY2 },
    ];
    const minX = Math.min(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxX = Math.max(...points.map(p => p.x));
    const maxY = Math.max(...points.map(p => p.y));
    const width = maxX - minX;
    const height = maxY - minY;

    // Path relative to (0,0) in the vector node
    const rel = (x: number, y: number) => `${x - minX} ${y - minY}`;
    const path = [
      `M ${rel(x1, y1)} L ${rel(midX, y1)} L ${rel(midX, y2)} L ${rel(x2, y2)}`,
      `M ${rel(x2, y2)} L ${rel(arrowX1, arrowY1)}`,
      `M ${rel(x2, y2)} L ${rel(arrowX2, arrowY2)}`,
    ].join(' ');

    const vector = figma.createVector();
    vector.vectorPaths = [{ data: path, windingRule: "NONZERO" }];
    vector.strokes = [{ type: 'SOLID', color }];
    vector.strokeWeight = strokeWeight;
    vector.strokeCap = 'ROUND';
    vector.strokeJoin = 'ROUND';
    vector.dashPattern = dashPattern;
    vector.x = minX;
    vector.y = minY;
    vector.resizeWithoutConstraints(width || 1, height || 1);
    return vector;
  }

  // --- Sample Flow (Unified V2 Schema) ---
  // Converts sample data to v2 format and uses the unified flow creation function
  async function createSampleFlowFromData() {
    const experimentId = 'sample-experiment';
    
    // Convert sample data to v2 format
    const experiment: ExperimentV2 = {
      id: experimentId,
      name: 'Sample Experiment',
      roundNumber: 1,
      description: 'This is a sample experiment info card.',
    };

    // Convert events to v2 format
    const events: EventNodeV2[] = sampleEvents.map((event, eventIdx) => {
      const variants: VariantV2[] = (event.variants || []).map((variant, vIdx) => ({
        id: `variant-${event.id}-${vIdx}`,
        parentEventId: event.id,
        key: variant.key || String.fromCharCode(65 + vIdx),
        name: variant.name,
        description: variant.description,
        traffic: variant.traffic,
        metrics: variant.metrics,
        style: variant.color ? { variantColor: variant.color } : undefined,
        status: (variant as any).status, // Preserve status for card rendering
        color: variant.color, // Preserve color for card rendering
      } as VariantV2 & { status?: VariantStatus; color?: string }));
      
      return {
        id: event.id,
        name: event.name,
        nodeType: 'EVENT_NODE' as const,
        variants: variants.length > 0 ? variants : undefined,
      };
    });

    // Create entry and exit nodes
    const entry: EntryNodeV2 = {
      id: `entry-${experimentId}`,
      label: 'Entry',
      nodeType: 'ENTRY_NODE',
    };

    const exit: ExitNodeV2 = {
      id: `exit-${experimentId}`,
      label: 'Exit',
      nodeType: 'EXIT_NODE',
    };

    // Build connectors array (auto-generated if not provided)
    const connectors: ConnectorV2[] = [];
    
    // Entry to first event
    if (events.length > 0) {
      connectors.push({
        id: `conn-entry-${Date.now()}`,
        type: 'PRIMARY_FLOW_LINE',
        from: { nodeType: 'ENTRY_NODE', id: entry.id },
        to: { nodeType: 'EVENT_NODE', id: events[0].id },
        arrowhead: true,
      });
    }
    
    // Event to event
    for (let i = 0; i < events.length - 1; i++) {
      connectors.push({
        id: `conn-event-${i}-${i+1}-${Date.now()}`,
        type: 'PRIMARY_FLOW_LINE',
        from: { nodeType: 'EVENT_NODE', id: events[i].id },
        to: { nodeType: 'EVENT_NODE', id: events[i+1].id },
        arrowhead: true,
      });
    }
    
    // Last event to exit
    if (events.length > 0) {
      connectors.push({
        id: `conn-exit-${Date.now()}`,
        type: 'PRIMARY_FLOW_LINE',
        from: { nodeType: 'EVENT_NODE', id: events[events.length-1].id },
        to: { nodeType: 'EXIT_NODE', id: exit.id },
        arrowhead: true,
      });
    }
    
    // Event to variants (branch lines)
    for (const event of events) {
      if (event.variants && event.variants.length > 0) {
        for (const variant of event.variants) {
          connectors.push({
            id: `conn-branch-${event.id}-${variant.id}-${Date.now()}`,
            type: 'BRANCH_LINE',
            from: { nodeType: 'EVENT_NODE', id: event.id },
            to: { nodeType: 'VARIANT_NODE', id: variant.id },
            label: variant.traffic ? `${variant.traffic}%` : undefined,
            arrowhead: true,
          });
        }
      }
    }
    
    // Variants to next event (merge lines)
    for (let i = 0; i < events.length - 1; i++) {
      const currentEvent = events[i];
      const nextEvent = events[i + 1];
      if (currentEvent.variants && currentEvent.variants.length > 0) {
        for (const variant of currentEvent.variants) {
          connectors.push({
            id: `conn-merge-${variant.id}-${nextEvent.id}-${Date.now()}`,
            type: 'MERGE_LINE',
            from: { nodeType: 'VARIANT_NODE', id: variant.id },
            to: { nodeType: 'EVENT_NODE', id: nextEvent.id },
            arrowhead: true,
          });
        }
      }
    }
    
    // Variants to exit (if last event has variants)
    if (events.length > 0) {
      const lastEvent = events[events.length - 1];
      if (lastEvent.variants && lastEvent.variants.length > 0) {
        for (const variant of lastEvent.variants) {
          connectors.push({
            id: `conn-merge-${variant.id}-exit-${Date.now()}`,
            type: 'MERGE_LINE',
            from: { nodeType: 'VARIANT_NODE', id: variant.id },
            to: { nodeType: 'EXIT_NODE', id: exit.id },
            arrowhead: true,
          });
        }
      }
    }

    const flow: FlowV2 = {
      id: `flow-${experimentId}`,
      layout: { direction: 'HORIZONTAL', eventSpacing: 160, variantSpacing: 24 },
      entry,
      events,
      exit,
      connectors,
    };

    // Use unified flow creation function
    await createFlowV2FromData(experiment, flow);
  }

  // Sample flow now uses v2 schema - see createSampleFlowV2 function below
  // createSampleFlowFromData(); // OLD - commented out for merge

  // ...existing code...


  figma.showUI(__html__, {
    width: 400,
    height: 720,
    title: 'Growthlab Builder',
    themeColors: true,
  });

  // ...existing code...

    // Old Experiment Flow Row Card -- ACTUAL Variant Card
  // ...existing code...

  function createNodeCard(title: string, subtitle?: string, trafficLabel?: string, note?: string): FrameNode {
    const card = figma.createFrame();
    card.layoutMode = 'VERTICAL';
    card.counterAxisSizingMode = 'AUTO';
    card.primaryAxisSizingMode = 'AUTO';
    card.paddingLeft = card.paddingRight = TOKENS.space16;
    card.paddingTop = card.paddingBottom = TOKENS.space16;
    card.cornerRadius = TOKENS.radiusLG;
    card.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsSurface) }];
    card.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
    card.strokeWeight = 1;
    card.name = title ? `Node: ${title}` : 'Node';
    card.itemSpacing = TOKENS.space8;

    const topRow = figma.createFrame();
    topRow.layoutMode = 'HORIZONTAL';
    topRow.counterAxisSizingMode = 'AUTO';
    topRow.primaryAxisSizingMode = 'AUTO';
    topRow.itemSpacing = TOKENS.space4;
    topRow.fills = [];
    topRow.strokes = [];
    topRow.name = 'Top Row';

    const titleText = figma.createText();
    titleText.fontName = { family: "Figtree", style: "Bold" };
    titleText.fontSize = TOKENS.fontSizeBodyLg;
    titleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textPrimary) }];
    titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    titleText.characters = title && title.length > 0 ? title : '';
    topRow.appendChild(titleText);

    if (trafficLabel) {
      // Removed Pill: traffic chip
    }
    card.appendChild(topRow);

    // Subtitle (if provided)
    if (subtitle && subtitle.length > 0) {
      const subtitleText = figma.createText();
      subtitleText.fontName = { family: "Figtree", style: "Regular" };
      subtitleText.fontSize = TOKENS.fontSizeBodyMd;
      subtitleText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textSecondary) }];
      subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
      subtitleText.characters = subtitle;
      subtitleText.name = 'Subtitle';
      card.appendChild(subtitleText);
    }

    // Note/Description (if provided)
    if (note && note.length > 0) {
      const noteContainer = figma.createFrame();
      noteContainer.layoutMode = 'VERTICAL';
      noteContainer.counterAxisSizingMode = 'AUTO';
      noteContainer.primaryAxisSizingMode = 'AUTO';
      noteContainer.paddingLeft = noteContainer.paddingRight = TOKENS.space12;
      noteContainer.paddingTop = noteContainer.paddingBottom = TOKENS.space8;
      noteContainer.cornerRadius = TOKENS.radiusSM;
      noteContainer.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.azure50) }];
      noteContainer.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.border) }];
      noteContainer.strokeWeight = 1;
      noteContainer.name = 'Note Container';
      // Set a reasonable fixed width for note container (will be constrained by card)
      noteContainer.resize(200, noteContainer.height);
      
      const noteText = figma.createText();
      noteText.fontName = { family: "Figtree", style: "Regular" };
      noteText.fontSize = TOKENS.fontSizeBodySm;
      noteText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.textTertiary) }];
      noteText.textAutoResize = 'HEIGHT'; // Allow wrapping
      noteText.characters = note;
      noteText.name = 'Note Text';
      // Set width to fill container (accounting for container padding)
      const textWidth = noteContainer.width - (TOKENS.space12 * 2);
      noteText.resize(textWidth > 0 ? textWidth : 176, noteText.height);
      noteContainer.appendChild(noteText);
      
      card.appendChild(noteContainer);
    }

    return card;
  }

  // --- Unified V2 Flow Creation Function ---
  // Extracted from message handler for reuse by both UI messages and sample flows
  async function createFlowV2FromData(experiment: ExperimentV2, flow: FlowV2): Promise<void> {
    await loadFonts();

    // Remove any existing flow frames with the same name/id
    const flowFrameName = `Experiment Flow — ${experiment.name}`;
    const infoCardName = `Experiment Info — ${experiment.name}`;
    const existingFlow = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === flowFrameName);
    if (existingFlow) existingFlow.remove();
    let infoCard = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === infoCardName) as FrameNode | undefined;
    if (infoCard) infoCard.remove();

    // Create experiment info card (optional, for context)
    infoCard = await createExperimentInfoCard(
      experiment.name,
      experiment.description || 'e.g., Testing if new CTA increases conversions.',
      experiment.links?.figma || '',
      experiment.links?.jira || '',
      experiment.links?.miro || ''
    );
    attachNodeMeta(infoCard, {
      name: infoCardName,
      type: 'frame' as CanvasNodeType,
      description: experiment.description || 'e.g., Testing if new CTA increases conversions.',
      extra: { experimentId: experiment.id, role: 'experiment-info' },
    });

    // Manual positioning for magnetized connectors
    // All nodes will be placed directly on the page (not in a container frame)
    // This allows ConnectorNodes to work with magnetized anchors
    const center = figma.viewport.center;
    const eventSpacing = flow.layout?.eventSpacing ?? 200;
    const variantSpacing = flow.layout?.variantSpacing ?? 100;
    const baseX = infoCard ? infoCard.x + infoCard.width + 200 : 600; // Start after info card
    const baseY = infoCard ? infoCard.y : center.y;
    
    // Track all created nodes for positioning
    const allNodes: {node: SceneNode & {width: number; height: number}, id: string, type: string}[] = [];

    // --- Entry Node ---
    const entry = flow.entry;
    const entryCard = createNodeCard(entry.label, undefined, undefined, entry.note);
    entryCard.name = 'Entry Node';
    attachNodeMeta(entryCard, {
      name: entry.label,
      type: 'frame' as CanvasNodeType,
      description: entry.note || '',
      extra: {
        role: 'entry',
        entryId: entry.id,
        experimentId: experiment.id,
        nodeType: 'ENTRY_NODE',
      },
    });
    // Position and add to page directly
    entryCard.x = baseX;
    entryCard.y = baseY;
    figma.currentPage.appendChild(entryCard);
    allNodes.push({node: entryCard as SceneNode & {width: number; height: number}, id: entry.id, type: 'ENTRY_NODE'});

    // --- Event Nodes ---
    // Place event nodes directly on page with manual positioning for magnetized connectors
    let currentX = baseX + entryCard.width + eventSpacing;
    let maxEventHeight = 0;
    
    // Store event positions for variant placement
    const eventPositions: {event: any, eventCard: any, x: number, y: number}[] = [];
    
    for (const [eventIdx, event] of flow.events.entries()) {
      const safeEventName = typeof event.name === 'string' && event.name.trim().length > 0
        ? event.name
        : `Event ${eventIdx + 1}`;
      
      // Create event card
      const eventCard = createEventCard(safeEventName, event.variants?.length ?? 0);
      eventCard.name = `Event: ${safeEventName}`;
      attachNodeMeta(eventCard, {
        name: safeEventName,
        type: 'frame' as CanvasNodeType,
        description: event.entryNote?.text || '',
        extra: {
          role: 'event',
          eventId: event.id,
          experimentId: experiment.id,
          hasVariants: !!event.variants?.length,
          nodeType: 'EVENT_NODE',
          entryNoteId: event.entryNote?.id,
        },
      });
      
      // Position event card on page
      eventCard.x = currentX;
      eventCard.y = baseY;
      figma.currentPage.appendChild(eventCard);
      allNodes.push({node: eventCard as SceneNode & {width: number; height: number}, id: event.id, type: 'EVENT_NODE'});
      
      // Store position for variant placement
      eventPositions.push({event, eventCard, x: currentX, y: baseY});
      
      // Track max height for variant row positioning
      maxEventHeight = Math.max(maxEventHeight, eventCard.height);
      
      // Move to next event position
      currentX += eventCard.width + eventSpacing;
    }

    // --- Variants ---
    // Create variants for each event, horizontally aligned below that event
    for (const {event, eventCard, x: eventX, y: eventY} of eventPositions) {
      if (event.variants && event.variants.length > 0) {
        let variantX = eventX;
        const variantY = eventY + eventCard.height + variantSpacing;
        
        for (const [vIdx, variant] of event.variants.entries()) {
          const safeVariantName = typeof variant.name === 'string' && variant.name.trim().length > 0
            ? variant.name
            : `Variant ${String.fromCharCode(65 + vIdx)}`;
          
          const variantColor = (variant as any).color || variant.style?.variantColor;
          
          // Normalize metrics
          const normalizeMetrics = (metrics: any) => {
            if (!metrics) return { ctr: 0, cr: 0, su: 0 };
            return {
              ctr: metrics.ctr !== undefined && metrics.ctr !== '' && metrics.ctr !== null 
                ? (typeof metrics.ctr === 'number' ? metrics.ctr : parseFloat(String(metrics.ctr)) || 0)
                : 0,
              cr: metrics.cr !== undefined && metrics.cr !== '' && metrics.cr !== null
                ? (typeof metrics.cr === 'number' ? metrics.cr : parseFloat(String(metrics.cr)) || 0)
                : 0,
              su: metrics.su !== undefined && metrics.su !== '' && metrics.su !== null
                ? (typeof metrics.su === 'number' ? metrics.su : parseFloat(String(metrics.su)) || 0)
                : 0,
            };
          };
          
          const variantForCard = {
            ...variant,
            name: safeVariantName,
            status: (variant as any).status || 'none',
            metrics: normalizeMetrics(variant.metrics),
            color: variantColor,
          };
          
          const variantCard = createVariantCard(variantForCard, vIdx);
          variantCard.name = `Variant: ${safeVariantName}`;
          attachNodeMeta(variantCard, {
            name: safeVariantName,
            type: 'frame' as CanvasNodeType,
            description: variant.description || '',
            extra: {
              role: 'variant',
              eventId: event.id,
              variantId: variant.id,
              experimentId: experiment.id,
              variantIndex: vIdx,
              traffic: variant.traffic,
              nodeType: 'VARIANT_NODE',
              parentEventId: variant.parentEventId,
            },
          });
          
          // Position variant in horizontal row below event
          variantCard.x = variantX;
          variantCard.y = variantY;
          figma.currentPage.appendChild(variantCard);
          allNodes.push({node: variantCard as SceneNode & {width: number; height: number}, id: variant.id, type: 'VARIANT_NODE'});
          
          variantX += variantCard.width + variantSpacing;
        }
      }
    }

    // --- Exit Node ---
    const exit = flow.exit;
    const exitCard = createNodeCard(exit.label);
    exitCard.name = 'Exit Node';
    attachNodeMeta(exitCard, {
      name: exit.label,
      type: 'frame' as CanvasNodeType,
      description: '',
      extra: {
        role: 'exit',
        exitId: exit.id,
        experimentId: experiment.id,
        nodeType: 'EXIT_NODE',
      },
    });
    // Position exit at the end
    exitCard.x = currentX;
    exitCard.y = baseY;
    figma.currentPage.appendChild(exitCard);
    allNodes.push({node: exitCard as SceneNode & {width: number; height: number}, id: exit.id, type: 'EXIT_NODE'});

    // --- Build node map for connector rendering ---
    // Nodes are already on the page, just build the map
    const nodeMap: Record<string, SceneNode & { width: number; height: number }> = {};
    for (const {node, id} of allNodes) {
      nodeMap[id] = node;
    }
    
    // InfoCard positioning (if it exists)
    if (infoCard && infoCard.parent === null) {
      infoCard.x = 100;
      infoCard.y = center.y;
      figma.currentPage.appendChild(infoCard);
    }
    
    // Wait for layout to settle before drawing connectors
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // --- Render Vector-Based Connectors ---
    // Note: figma.createConnector is only available in FigJam, not regular Figma
    // Using vector-based connectors instead (they won't auto-update on node drag)
    const createdConnectors: SceneNode[] = [];
    
    console.log('=== CONNECTOR RENDERING ===');
    console.log('Flow has connectors:', flow.connectors?.length || 0);
    console.log('NodeMap keys:', Object.keys(nodeMap));
    
    if (flow.connectors && Array.isArray(flow.connectors) && flow.connectors.length > 0) {
      for (const connector of flow.connectors) {
        console.log(`Processing connector: ${connector.type} from ${connector.from.id} to ${connector.to.id}`);
        
        const fromNode = nodeMap[connector.from.id];
        const toNode = nodeMap[connector.to.id];
        
        console.log('From node found:', !!fromNode, fromNode?.name);
        console.log('To node found:', !!toNode, toNode?.name);
        
        if (fromNode && toNode) {
          try {
            // Determine magnets based on connector type
            let fromMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';
            let toMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM';
            
            if (connector.type === 'PRIMARY_FLOW_LINE') {
              // Horizontal: Event → Event or Entry → Event or Event → Exit
              fromMagnet = 'RIGHT';
              toMagnet = 'LEFT';
            } else if (connector.type === 'BRANCH_LINE') {
              // Vertical: Event → Variant (downward)
              fromMagnet = 'BOTTOM';
              toMagnet = 'TOP';
            } else if (connector.type === 'MERGE_LINE') {
              // Variant → Next Event (merging back to spine)
              fromMagnet = 'RIGHT';
              toMagnet = 'LEFT';
            } else {
              // Default: horizontal
              fromMagnet = 'RIGHT';
              toMagnet = 'LEFT';
            }
            
            // Get connector style
            const style = getConnectorStyle(connector.type, {
              winner: false,
              variantColor: undefined
            });
            
            // Create vector-based connector (works in regular Figma)
            const connectorNode = createConnectorV2(
              fromNode,
              toNode,
              connector.type,
              undefined, // No parent frame - render on page
              {
                label: connector.label,
                winner: false,
                variantColor: undefined,
                index: 0,
              }
            );
            
            if (connectorNode) {
              // Store metadata on the connector
              connectorNode.setPluginData('connectorMeta', JSON.stringify({
                connectorId: connector.id,
                type: connector.type,
                fromNodeId: connector.from.id,
                toNodeId: connector.to.id,
                fromNodeType: connector.from.nodeType,
                toNodeType: connector.to.nodeType,
                experimentId: experiment.id,
                label: connector.label
              }));
              
              // Name the connector for easy identification
              connectorNode.name = `${connector.type}: ${connector.from.nodeType} → ${connector.to.nodeType}`;
              
              console.log('✓ Connector created:', connectorNode.name);
              
              createdConnectors.push(connectorNode);
            }
          } catch (error) {
            console.error('ERROR creating connector:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            console.error('Error details:', {
              message: errorMessage,
              stack: errorStack,
              fromNodeId: fromNode.id,
              toNodeId: toNode.id,
              fromNodeType: fromNode.type,
              toNodeType: toNode.type
            });
          }
        } else {
          console.warn('✗ Skipping connector - missing nodes:', {
            fromId: connector.from.id,
            toId: connector.to.id,
            fromFound: !!fromNode,
            toFound: !!toNode
          });
        }
      }
    } else {
      console.warn('No connectors in flow.connectors array');
    }
    
    // Notify user
    console.log('=== CONNECTOR SUMMARY ===');
    console.log('Total connectors created:', createdConnectors.length);
    
    if (createdConnectors.length > 0) {
      figma.notify(`Created ${createdConnectors.length} connectors`);
    } else {
      figma.notify('⚠️ No connectors were created - check console');
    }
    
    // Select info card and zoom to view all nodes
    if (infoCard) {
      const allPageNodes = allNodes.map(n => n.node);
      figma.viewport.scrollAndZoomIntoView([infoCard, ...allPageNodes]);
    }

    // --- Entry Notes Rendering ---
    // In v2 schema, entry notes may be on flow.entryNotes or experiment.flow.entryNotes or not present
    const entryNotesV2 = (flow as any).entryNotes || (experiment as any).entryNotes || [];
    // Reuse nodeMap for anchor lookup (already built above for connectors)
    // nodeMap is already populated with all nodes from connector rendering
    if (Array.isArray(entryNotesV2)) {
      for (const note of entryNotesV2) {
        // Create a sticky note frame
        const noteFrame = figma.createFrame();
        noteFrame.layoutMode = 'VERTICAL';
        noteFrame.counterAxisSizingMode = 'AUTO';
        noteFrame.primaryAxisSizingMode = 'AUTO';
        noteFrame.paddingLeft = noteFrame.paddingRight = TOKENS.space12;
        noteFrame.paddingTop = noteFrame.paddingBottom = TOKENS.space8;
        noteFrame.cornerRadius = TOKENS.radiusSM;
        noteFrame.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.yellow50) }];
        noteFrame.strokes = [{ type: 'SOLID', color: hexToRgb(TOKENS.yellow300) }];
        noteFrame.strokeWeight = 1;
        noteFrame.name = `EntryNote: ${note.text}`;

        const noteText = figma.createText();
        noteText.fontName = { family: 'Figtree', style: 'Regular' };
        noteText.fontSize = TOKENS.fontSizeBodySm;
        noteText.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.yellow900) }];
        noteText.characters = note.text;
        noteText.textAutoResize = 'WIDTH_AND_HEIGHT';
        noteFrame.appendChild(noteText);

        attachNodeMeta(noteFrame, {
          name: note.text,
          type: 'frame',
          description: 'Entry Note',
          extra: {
            role: 'entry-note',
            entryNoteId: note.id,
            anchor: note.attachTo,
            experimentId: experiment.id,
          },
        });

        // Position note based on attachTo
        let anchorNode: SceneNode | undefined = undefined;
        let anchorType = note.attachTo?.target;
        let anchorId = note.attachTo?.targetId;
        if (anchorType === 'EVENT_NODE' && anchorId) {
          anchorNode = nodeMap[anchorId] as SceneNode;
        }
        if (anchorNode) {
          // Place note above or to the left of anchor node, depending on layout
          // For horizontal spine, place above; for vertical, place left
          if (flow.layout?.direction === 'VERTICAL') {
            noteFrame.x = (anchorNode?.x ?? 0) - noteFrame.width - 24;
            noteFrame.y = (anchorNode?.y ?? 0) + (anchorNode?.height ?? 0) / 2 - noteFrame.height / 2;
          } else {
            noteFrame.x = (anchorNode?.x ?? 0) + (anchorNode?.width ?? 0) / 2 - noteFrame.width / 2;
            noteFrame.y = (anchorNode?.y ?? 0) - noteFrame.height - 24;
          }
        } else {
          // Default: place near first event
          const firstNode = allNodes[0];
          if (firstNode) {
            noteFrame.x = firstNode.node.x - noteFrame.width - 24;
            noteFrame.y = firstNode.node.y;
          } else {
            noteFrame.x = baseX - 60;
            noteFrame.y = baseY - 60;
          }
        }
        figma.currentPage.appendChild(noteFrame);
      }
    }

    // --- Outcome Annotation Rendering ---
    if (experiment.outcomes && typeof experiment.outcomes.notes === 'string') {
      const outcomeFrame = figma.createFrame();
      outcomeFrame.layoutMode = 'VERTICAL';
      outcomeFrame.counterAxisSizingMode = 'AUTO';
      outcomeFrame.primaryAxisSizingMode = 'AUTO';
      outcomeFrame.paddingLeft = outcomeFrame.paddingRight = 16;
      outcomeFrame.paddingTop = outcomeFrame.paddingBottom = 10;
      outcomeFrame.cornerRadius = 10;
      outcomeFrame.fills = [{ type: 'SOLID', color: { r: 0.9, g: 1, b: 0.9 } }];
      outcomeFrame.strokes = [{ type: 'SOLID', color: { r: 0.3, g: 0.7, b: 0.3 } }];
      outcomeFrame.strokeWeight = 1;
      outcomeFrame.name = 'Outcome Note';

      const outcomeText = figma.createText();
      outcomeText.fontName = { family: 'Figtree', style: 'Regular' };
      outcomeText.fontSize = 14;
      outcomeText.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.3, b: 0.1 } }];
      outcomeText.characters = experiment.outcomes.notes || '';
      outcomeText.textAutoResize = 'WIDTH_AND_HEIGHT';
      outcomeFrame.appendChild(outcomeText);

      attachNodeMeta(outcomeFrame, {
        name: 'Outcome Note',
        type: 'frame',
        description: 'Outcome annotation',
        extra: {
          role: 'outcome-note',
          experimentId: experiment.id,
        },
      });

      // Place outcome note above the first node
      const firstNode = allNodes[0];
      if (firstNode) {
        outcomeFrame.x = firstNode.node.x;
        outcomeFrame.y = firstNode.node.y - 100;
      } else {
        outcomeFrame.x = baseX;
        outcomeFrame.y = baseY - 100;
      }
      figma.currentPage.appendChild(outcomeFrame);
    }

    figma.notify('Experiment flow v2: nodes, connectors, entry notes, and outcomes created.');
  }

  figma.ui.onmessage = async (msg: PluginMessage | PluginMessageV2) => {
    if (msg.type === 'refresh-connectors') {
      const page = figma.currentPage;
      
      // STEP 1: Find all connectors and save their metadata BEFORE deleting
      const connectorMetaList: Array<{
        fromNodeId: string;
        toNodeId: string;
        type: ConnectorTypeV2;
        experimentId: string;
        fromNodeType?: string;
        toNodeType?: string;
        label?: string;
        node: SceneNode;
      }> = [];
      
      const allConnectors = page.findAll(node => {
        const meta = node.getPluginData('connectorMeta');
        if (meta) return true;
        // Also find by name patterns (in case metadata is missing)
        if (node.name.includes('PRIMARY_FLOW_LINE') || 
            node.name.includes('BRANCH_LINE') || 
            node.name.includes('MERGE_LINE') ||
            node.name.includes('Arrowhead')) {
          return true;
        }
        return false;
      });
      
      console.log(`Found ${allConnectors.length} connector elements`);
      
      // Extract and save metadata from connectors
      const seenConnections = new Set<string>();
      for (const connector of allConnectors) {
        const metaStr = connector.getPluginData('connectorMeta');
        if (metaStr) {
          try {
            const meta = JSON.parse(metaStr);
            // Create unique key to avoid duplicates (line + arrowhead)
            const key = `${meta.fromNodeId}-${meta.toNodeId}-${meta.type}`;
            if (!seenConnections.has(key)) {
              connectorMetaList.push({ ...meta, node: connector });
              seenConnections.add(key);
            }
          } catch (error) {
            console.error('Error parsing connector metadata:', error);
          }
        }
      }
      
      console.log(`Saved metadata for ${connectorMetaList.length} unique connectors`);
      
      // STEP 2: Find all experiment nodes and build node map
      const experimentNodes = page.findAll(node => {
        const meta = node.getPluginData('meta');
        if (!meta) return false;
        try {
          const parsed = JSON.parse(meta);
          return parsed.extra?.experimentId !== undefined;
        } catch {
          return false;
        }
      });
      
      console.log(`Found ${experimentNodes.length} experiment nodes`);
      
      // Build comprehensive node map
      const nodeMap: Record<string, SceneNode & { width: number; height: number }> = {};
      for (const node of experimentNodes) {
        try {
          const meta = JSON.parse(node.getPluginData('meta'));
          const extra = meta.extra;
          if (extra.entryId) nodeMap[extra.entryId] = node as any;
          if (extra.eventId) nodeMap[extra.eventId] = node as any;
          if (extra.variantId) nodeMap[extra.variantId] = node as any;
          if (extra.exitId) nodeMap[extra.exitId] = node as any;
        } catch (error) {
          console.error('Error parsing node metadata:', error);
        }
      }
      
      console.log(`Node map has ${Object.keys(nodeMap).length} entries: ${Object.keys(nodeMap).join(', ')}`);
      
      // STEP 3: Delete all old connector visuals
      for (const connector of allConnectors) {
        connector.remove();
      }
      console.log('Deleted all old connectors');
      
      // STEP 4: Recreate connectors based on saved metadata
      let recreatedCount = 0;
      for (const connMeta of connectorMetaList) {
        try {
          const fromNode = nodeMap[connMeta.fromNodeId];
          const toNode = nodeMap[connMeta.toNodeId];
          
          console.log(`Attempting to recreate: ${connMeta.type} from ${connMeta.fromNodeId} to ${connMeta.toNodeId}`);
          console.log(`  - From node found: ${!!fromNode}, To node found: ${!!toNode}`);
          
          if (fromNode && toNode) {
            const newConnector = createConnectorV2(
              fromNode,
              toNode,
              connMeta.type,
              undefined,
              {
                label: connMeta.label,
                winner: false,
                variantColor: undefined,
                index: 0,
              }
            );
            
            if (newConnector) {
              // Restore metadata
              newConnector.setPluginData('connectorMeta', JSON.stringify(connMeta));
              newConnector.name = `${connMeta.type}: ${connMeta.fromNodeType || '?'} → ${connMeta.toNodeType || '?'}`;
              recreatedCount++;
              console.log(`  ✓ Recreated connector: ${newConnector.name}`);
            }
          } else {
            console.warn(`  ✗ Missing nodes - from: ${connMeta.fromNodeId}, to: ${connMeta.toNodeId}`);
          }
        } catch (error) {
          console.error('Error refreshing connector:', error);
        }
      }
      
      figma.notify(`✓ Refreshed ${recreatedCount} connectors!`);
      console.log(`Successfully recreated ${recreatedCount} out of ${connectorMetaList.length} connectors`);
      return;
    }
    
    if (msg.type === 'create-flow-v2' && msg.payload) {
      figma.notify('Handler: create-flow-v2 (NEW SCHEMA)');
      console.log('Handler: create-flow-v2 (NEW SCHEMA)');
      // --- NEW V2 FLOW HANDLER ---
      const { experiment, flow } = msg.payload as CreateFlowV2Payload;
      await createFlowV2FromData(experiment, flow);
    }

    // --- OLD HANDLERS BELOW ---
    if (msg.type === 'delete-experiment-flows') {
      deleteExperimentFlowFrames();
      figma.notify('Experiment Flow frames deleted (if any were found).');
      return;
    }


    if (msg.type === 'create-flow' && msg.payload) {
      figma.notify('Handler: create-flow (OLD SCHEMA)');
      console.log('Handler: create-flow (OLD SCHEMA)');
      const {
        experimentName,
        roundNumber,
        entryLabel,
        exitLabel,
        variants,
        experimentDescription,
        figmaLink,
        jiraLink,
        miroLink
      } = msg.payload as any;

      if (!Array.isArray(variants) || variants.length === 0) {
        figma.notify('You must add at least one variant to create a flow.');
        return;
      }
      // The old handler logic is deprecated and replaced by the sample/demo flow and v2 handler.
      figma.notify('This flow type is deprecated. Please use the updated flow builder.');
    } else if (msg.type === 'create-from-selection') {
      const selection = figma.currentPage.selection.filter(node => node.type === 'FRAME' || node.type === 'GROUP');
      if (selection.length === 0) {
        figma.notify('Select up to 3 frames to use as variant thumbnails.');
        return;
      }
      if (!msg.payload) {
        figma.notify('Please fill the experiment form and click \"Create from selection\" again.');
        return;
      }
      const { experimentName, roundNumber, entryLabel, exitLabel, variants } = msg.payload as any;

      await loadFonts();
      const flowFrame = figma.createFrame();
      flowFrame.name = `Experiment Flow: ${experimentName}`;
      flowFrame.layoutMode = 'HORIZONTAL';
      flowFrame.counterAxisSizingMode = 'AUTO'; // Hug content vertically
      flowFrame.primaryAxisSizingMode = 'AUTO'; // Hug content horizontally
      flowFrame.itemSpacing = 32;
      flowFrame.paddingLeft = flowFrame.paddingRight = 32;
      flowFrame.paddingTop = flowFrame.paddingBottom = 32;
      flowFrame.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.royalBlue600) }];
      flowFrame.cornerRadius = 24;

      // Removed Pill: roundBadge

      // Detect if entryLabel matches a variant name
      let entryCard: FrameNode;
      const matchingVariant = variants.find((v: any) => v.name === entryLabel);
      if (matchingVariant) {
        entryCard = createVariantCard(matchingVariant);
        entryCard.name = 'Entry Variant Node';
      } else {
        entryCard = createEventCard(entryLabel, 0);
        entryCard.name = 'Entry Event Node';
      }
      flowFrame.appendChild(entryCard);

      const roundContainer = figma.createFrame();
      roundContainer.name = 'Round 1 Variants';
      roundContainer.layoutMode = 'VERTICAL';
      roundContainer.counterAxisSizingMode = 'AUTO';
      roundContainer.primaryAxisSizingMode = 'AUTO';
      roundContainer.itemSpacing = 20;
      roundContainer.paddingLeft = roundContainer.paddingRight = 24;
      roundContainer.paddingTop = roundContainer.paddingBottom = 24;
      roundContainer.cornerRadius = 24;
      roundContainer.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.royalBlue600) }];
      roundContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
      roundContainer.strokeWeight = 1;

      const variantNodes: FrameNode[] = [];
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const card = createVariantCard(v);
        if (selection[i]) {
          const thumb = selection[i].clone();
          thumb.resize(240, 140);
          if (thumb.type === 'FRAME') thumb.cornerRadius = TOKENS.radiusSM;
          thumb.name = 'Thumbnail';
          for (const child of Array.from(card.children)) {
            if (child.name === 'Thumbnail') child.remove();
          }
          card.insertChild(1, thumb);
        }
        roundContainer.appendChild(card);
        variantNodes.push(card);
      }
      flowFrame.appendChild(roundContainer);

      const exitCard = createNodeCard(exitLabel);
      exitCard.name = 'Exit Node';
      flowFrame.appendChild(exitCard);

      const center = figma.viewport.center;
      flowFrame.x = center.x - 600;
      flowFrame.y = center.y - 200;
      figma.currentPage.appendChild(flowFrame);
      figma.currentPage.selection = [flowFrame];
      figma.viewport.scrollAndZoomIntoView([flowFrame]);

      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(entryCard, variantNodes[i], flowFrame, {
          winner: variants[i].status === 'winner',
          label: `${variants[i].traffic}%`,
          index: i
        });
      }
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(variantNodes[i], exitCard, flowFrame, {
          winner: variants[i].status === 'winner',
          index: i
        });
      }

      figma.notify('Experiment flow created from selection.');
    } else if (msg.type === 'cancel') {
      if (!KEEP_OPEN) figma.closePlugin('Plugin closed.');
      else figma.notify('Canceled');
      return;
    }
  };


  function connectNodes(
    fromNode: SceneNode & { width: number; height: number },
    toNode: SceneNode & { width: number; height: number },
    flowFrame?: FrameNode,
    options?: {
      winner?: boolean;
      label?: string;
      index?: number;
    }
  ): SceneNode | null {
    const color = options?.winner
      ? hexToRgb(TOKENS.malachite600)
      : hexToRgb(TOKENS.royalBlue600);
    const strokeWeight = options?.winner ? 7 : 4;

    // Utility: Get best edge-to-edge connection points between two rectangles
    function getEdgeToEdgePoints(
      from: SceneNode & { width: number; height: number },
      to: SceneNode & { width: number; height: number },
      fromMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | undefined = undefined,
      toMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' | undefined = undefined
    ): { from: { x: number; y: number }; to: { x: number; y: number } } {
      const fx = from.absoluteTransform[0][2];
      const fy = from.absoluteTransform[1][2];
      const tx = to.absoluteTransform[0][2];
      const ty = to.absoluteTransform[1][2];
      // Helper to get edge point
      function getMagnetPoint(node: SceneNode & { width: number; height: number }, x: number, y: number, magnet: string | undefined) {
        switch (magnet) {
          case 'LEFT': return { x, y: y + node.height / 2 };
          case 'RIGHT': return { x: x + node.width, y: y + node.height / 2 };
          case 'TOP': return { x: x + node.width / 2, y };
          case 'BOTTOM': return { x: x + node.width / 2, y: y + node.height };
          default: return { x: x + node.width / 2, y: y + node.height / 2 };
        }
      }
      let fromPoint = getMagnetPoint(from, fx, fy, fromMagnet);
      let toPoint = getMagnetPoint(to, tx, ty, toMagnet);
      return { from: fromPoint, to: toPoint };
    }

    // Support explicit magnet endpoints via options
    // const fromMagnet = options?.fromMagnet as ('LEFT'|'RIGHT'|'TOP'|'BOTTOM'|undefined);
    // const toMagnet = options?.toMagnet as ('LEFT'|'RIGHT'|'TOP'|'BOTTOM'|undefined);
    // Helper to get absolute position of a node
    function getAbsolutePos(node: SceneNode): { x: number; y: number } {
      let x = node.x, y = node.y;
      let parent = node.parent;
      while (parent && parent.type !== 'PAGE') {
        if ('x' in parent && 'y' in parent) {
          x += (parent as any).x;
          y += (parent as any).y;
        }
        parent = parent.parent;
      }
      return { x, y };
    }
    // Get edge-to-edge points using absolute positions
    function getEdgeToEdgePointsAbs(
      from: SceneNode & { width: number; height: number },
      to: SceneNode & { width: number; height: number }
    ): { from: { x: number; y: number }; to: { x: number; y: number } } {
      const fromAbs = getAbsolutePos(from);
      const toAbs = getAbsolutePos(to);
      // Center points
      const fromCenter = { x: fromAbs.x + from.width / 2, y: fromAbs.y + from.height / 2 };
      const toCenter = { x: toAbs.x + to.width / 2, y: toAbs.y + to.height / 2 };
      // Direction vector
      const dx = toCenter.x - fromCenter.x;
      const dy = toCenter.y - fromCenter.y;
      let fromPoint, toPoint;
      if (Math.abs(dx) > Math.abs(dy)) {
        fromPoint = {
          x: dx > 0 ? fromAbs.x + from.width : fromAbs.x,
          y: fromAbs.y + from.height / 2
        };
        toPoint = {
          x: dx > 0 ? toAbs.x : toAbs.x + to.width,
          y: toAbs.y + to.height / 2
        };
      } else {
        fromPoint = {
          x: fromAbs.x + from.width / 2,
          y: dy > 0 ? fromAbs.y + from.height : fromAbs.y
        };
        toPoint = {
          x: toAbs.x + to.width / 2,
          y: dy > 0 ? toAbs.y : toAbs.y + to.height
        };
      }
      return { from: fromPoint, to: toPoint };
    }
    const { from: startAbs, to: endAbs } = getEdgeToEdgePointsAbs(fromNode, toNode);
    // Convert to flowFrame-local coordinates
    let start = { ...startAbs }, end = { ...endAbs };
    if (flowFrame) {
      const frameAbs = getAbsolutePos(flowFrame);
      start.x = startAbs.x - frameAbs.x;
      start.y = startAbs.y - frameAbs.y;
      end.x = endAbs.x - frameAbs.x;
      end.y = endAbs.y - frameAbs.y;
    }
    const index = options?.index ?? 0;
    // Add a small offset for parallel lines if needed
    let midX, midY;
    let line, arrow;
    if (Math.abs(start.x - end.x) > Math.abs(start.y - end.y)) {
      // Horizontal: elbow in X
      midX = start.x + (end.x - start.x) * 0.5 + index * 12;
      midY = start.y;
      const pathData = `M ${start.x} ${start.y} L ${midX} ${midY} L ${midX} ${end.y} L ${end.x} ${end.y}`;
      line = figma.createVector();
      line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
      line.strokes = [{ type: "SOLID", color }];
      line.strokeWeight = strokeWeight;
      line.strokeAlign = "CENTER";
      line.name = "Flow Line";
      if (flowFrame) flowFrame.appendChild(line); else figma.currentPage.appendChild(line);
      if (options?.label) {
        // Removed Pill: label chip
      }
      // Arrowhead
      arrow = figma.createVector();
      const size = 10;
      arrow.vectorPaths = [
        {
          windingRule: "NONZERO",
          data: `M ${end.x} ${end.y} L ${end.x - size * Math.sign(end.x - start.x)} ${end.y - size / 2} L ${end.x - size * Math.sign(end.x - start.x)} ${end.y + size / 2} Z`,
        },
      ];
      arrow.fills = [{ type: "SOLID", color }];
      arrow.strokes = [];
      arrow.name = "Arrowhead";
      if (flowFrame) flowFrame.appendChild(arrow); else figma.currentPage.appendChild(arrow);
      return line;
    } else {
      // Vertical: elbow in Y
      midX = start.x;
      midY = start.y + (end.y - start.y) * 0.5 + index * 12;
      const pathData = `M ${start.x} ${start.y} L ${midX} ${midY} L ${end.x} ${midY} L ${end.x} ${end.y}`;
      line = figma.createVector();
      line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
      line.strokes = [{ type: "SOLID", color }];
      line.strokeWeight = strokeWeight;
      line.strokeAlign = "CENTER";
      line.name = "Flow Line";
      if (flowFrame) flowFrame.appendChild(line); else figma.currentPage.appendChild(line);
      if (options?.label) {
        // Removed Pill: label chip
      }
      // Arrowhead
      arrow = figma.createVector();
      const size = 10;
      arrow.vectorPaths = [
        {
          windingRule: "NONZERO",
          data: `M ${end.x} ${end.y} L ${end.x - size / 2} ${end.y - size * Math.sign(end.y - start.y)} L ${end.x + size / 2} ${end.y - size * Math.sign(end.y - start.y)} Z`,
        },
      ];
      arrow.fills = [{ type: "SOLID", color }];
      arrow.strokes = [];
      arrow.name = "Arrowhead";
      if (flowFrame) flowFrame.appendChild(arrow); else figma.currentPage.appendChild(arrow);
      return line;
    }
  }

  async function loadFonts() {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" }).catch(()=>{});
    await figma.loadFontAsync({ family: "Figtree", style: "Regular" }).catch(()=>{});
    try {
      await figma.loadFontAsync({ family: "Figtree", style: "Semibold" });
    } catch {
      await figma.loadFontAsync({ family: "Figtree", style: "Medium" }).catch(()=>{});
    }
    await figma.loadFontAsync({ family: "Figtree", style: "Bold" }).catch(()=>{});
    await figma.loadFontAsync({ family: "Roboto", style: "Regular" }).catch(()=>{});
    await figma.loadFontAsync({ family: "Roboto", style: "Bold" }).catch(()=>{});
  }
}

// --- Canvas Node Framework ---

export type CanvasNodeType = 'frame' | 'component' | 'group' | 'text' | 'shape';

// Removed duplicate CanvasNodeType

export interface CanvasNodeMeta {
  id?: string;
  name: string;
  type: CanvasNodeType;
  description?: string;
  tags?: string[];
  extra?: Record<string, unknown>;
}

export interface CanvasNodeOptions {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  fills?: Paint[];
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  padding?: number;
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  cornerRadius?: number;
  extra?: Record<string, unknown>;
}

export function attachNodeMeta(node: BaseNode, meta: CanvasNodeMeta) {
  node.setPluginData('meta', JSON.stringify(meta));
}

 //OLD EXPERIMENT FLOW ROW FRAME THAT HOLDS OLD FLOW
export function createFrame(meta: CanvasNodeMeta, options: CanvasNodeOptions = {}): FrameNode {
  const frame = figma.createFrame();
  frame.name = meta.name;
  // Set axis sizing modes if provided in extra
  if (options.extra) {
    if ('primaryAxisSizingMode' in options.extra && typeof options.extra.primaryAxisSizingMode === 'string') {
      frame.primaryAxisSizingMode = options.extra.primaryAxisSizingMode === 'AUTO' ? 'AUTO' : 'FIXED';
    }
    if ('counterAxisSizingMode' in options.extra && typeof options.extra.counterAxisSizingMode === 'string') {
      frame.counterAxisSizingMode = options.extra.counterAxisSizingMode === 'AUTO' ? 'AUTO' : 'FIXED';
    }
  }
  frame.name = meta.name;
  // Hug content logic for auto layout
  if (options.width && options.height) {
    frame.resizeWithoutConstraints(options.width, options.height);
  } else if (options.width) {
    frame.resizeWithoutConstraints(options.width, frame.height);
  } else if (options.height) {
    frame.resizeWithoutConstraints(frame.width, options.height);
  }

  if (options.x !== undefined && options.y !== undefined) {
    frame.x = options.x;
    frame.y = options.y;
  }
  if (options.fills) frame.fills = options.fills;
  if (options.layoutMode) frame.layoutMode = options.layoutMode;
  if (options.padding !== undefined) {
    frame.paddingLeft = frame.paddingRight = frame.paddingTop = frame.paddingBottom = options.padding;
  }
  if (options.paddingLeft !== undefined) frame.paddingLeft = options.paddingLeft;
  if (options.paddingRight !== undefined) frame.paddingRight = options.paddingRight;
  if (options.paddingTop !== undefined) frame.paddingTop = options.paddingTop;
  if (options.paddingBottom !== undefined) frame.paddingBottom = options.paddingBottom;
  if (options.itemSpacing !== undefined) frame.itemSpacing = options.itemSpacing;
  if (options.cornerRadius !== undefined) frame.cornerRadius = options.cornerRadius;

  attachNodeMeta(frame, meta);
  return frame;
}

export function createComponent(meta: CanvasNodeMeta, options: CanvasNodeOptions = {}): ComponentNode {
  const component = figma.createComponent();
  component.name = meta.name;
  if (options.width) component.resizeWithoutConstraints(options.width, options.height || 100);
  if (options.x !== undefined && options.y !== undefined) {
    component.x = options.x;
    component.y = options.y;
  }
  if (options.fills) component.fills = options.fills;
  if (options.layoutMode) component.layoutMode = options.layoutMode;
  if (options.padding !== undefined) {
    component.paddingLeft = component.paddingRight = component.paddingTop = component.paddingBottom = options.padding;
  }
  if (options.itemSpacing !== undefined) component.itemSpacing = options.itemSpacing;
  attachNodeMeta(component, meta);
  return component;
}

export function getNodeMeta(node: BaseNode): CanvasNodeMeta | null {
  const data = node.getPluginData('meta');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// --- Visual QA Helper ---
export type SerializeNode = {
  id: string;
  type: string;
  name: string;
  layoutMode?: string;
  fills?: Paint[];
  fontName?: FontName;
  characters?: string;
  children?: SerializeNode[];
  width: number;
  height: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  cornerRadius?: number;
};

function serializeNode(node: SceneNode): SerializeNode {
  return {
    id: node.id,
    type: node.type,
    name: node.name,
    layoutMode: 'layoutMode' in node ? node.layoutMode : undefined,
    fills: Array.isArray((node as any).fills) ? (node as any).fills as Paint[] : undefined,
    fontName: typeof (node as any).fontName === 'object' ? (node as any).fontName as FontName : undefined,
    characters: 'characters' in node ? node.characters : undefined,
    children: 'children' in node ? node.children.map(child => serializeNode(child)) : undefined,
    width: node.width,
    height: node.height,
    paddingLeft: 'paddingLeft' in node ? node.paddingLeft : undefined,
    paddingRight: 'paddingRight' in node ? node.paddingRight : undefined,
    paddingTop: 'paddingTop' in node ? node.paddingTop : undefined,
    paddingBottom: 'paddingBottom' in node ? node.paddingBottom : undefined,
    itemSpacing: 'itemSpacing' in node ? node.itemSpacing : undefined,
    cornerRadius: typeof (node as any).cornerRadius === 'number' ? (node as any).cornerRadius : undefined,
  };
}

// Example usage (to be replaced with actual plugin logic):
// const frame = createFrame({ name: 'Experiment Frame', type: 'frame' as const }, { width: 400, height: 300 });
// figma.currentPage.appendChild(frame);
// const meta = getNodeMeta(frame);
// console.log(meta);