/**
 * Connector Utilities for Growthlab Experiment Flow Builder
 * Handles connector creation, styling, and refresh logic
 */

import { TOKENS } from './design-tokens';
import { hexToRgb } from './layout-utils';
import type { ConnectorTypeV2, ConnectorStyleConfig, ConnectorStyleOptions } from './types';

// ===== Cached Colors for Performance =====
const CACHED_CONNECTOR_COLORS = {
  royalBlue600: hexToRgb(TOKENS.royalBlue600),
  malachite600: hexToRgb(TOKENS.malachite600),
  electricViolet600: hexToRgb(TOKENS.electricViolet600),
  textPrimary: hexToRgb(TOKENS.textPrimary),
};

// ===== Environment Detection =====

/**
 * Check if running in FigJam (where native ConnectorNodes are available)
 */
export function isFigJam(): boolean {
  return figma.editorType === 'figjam';
}

/**
 * Check if native connector creation is supported
 */
export function supportsNativeConnectors(): boolean {
  return typeof (figma as any).createConnector === 'function';
}

// ===== Connector Styling =====

/**
 * Get connector style configuration based on type and options
 * Determines visual properties: stroke weight, color, dash pattern, arrowhead
 * 
 * Priority order:
 * 1. Rolled-out (purple, medium thickness, dashed)
 * 2. Winner (green, thick, solid)
 * 3. Default (by type)
 * 
 * @param type - Connector type (PRIMARY_FLOW_LINE, BRANCH_LINE, MERGE_LINE)
 * @param options - Style options (winner, rolledout, variantColor)
 * @returns Style configuration with color, stroke, dash pattern
 */
export function getConnectorStyle(
  type: ConnectorTypeV2,
  options?: ConnectorStyleOptions
): ConnectorStyleConfig {
  // Priority 1: Rollout styling
  if (options?.rolledout) {
    return {
      strokeWeight: 3,
      color: CACHED_CONNECTOR_COLORS.electricViolet600,
      dashPattern: [6, 3],
      arrowhead: true,
    };
  }

  // Priority 2: Winner styling
  if (options?.winner) {
    const weights: Record<ConnectorTypeV2, number> = {
      PRIMARY_FLOW_LINE: 5,
      BRANCH_LINE: 4,
      MERGE_LINE: 3,
    };
    return {
      strokeWeight: weights[type] || 4,
      color: CACHED_CONNECTOR_COLORS.malachite600,
      dashPattern: undefined,
      arrowhead: true,
    };
  }

  // Default styling by type
  const defaultStyles: Record<ConnectorTypeV2, ConnectorStyleConfig> = {
    PRIMARY_FLOW_LINE: {
      strokeWeight: 2,
      color: CACHED_CONNECTOR_COLORS.textPrimary,
      dashPattern: undefined,
      arrowhead: true,
    },
    BRANCH_LINE: {
      strokeWeight: 1,
      color: CACHED_CONNECTOR_COLORS.textPrimary,
      dashPattern: [6, 3],
      arrowhead: false,
    },
    MERGE_LINE: {
      strokeWeight: 1,
      color: CACHED_CONNECTOR_COLORS.textPrimary,
      dashPattern: [6, 3],
      arrowhead: false,
    },
  };

  return defaultStyles[type] || defaultStyles.PRIMARY_FLOW_LINE;
}

// ===== Magnet Position Calculation =====

/**
 * Determines the best magnet positions for connector endpoints
 * Based on relative node positions and connector type
 * 
 * @param fromNode - Source node
 * @param toNode - Target node
 * @param type - Connector type
 * @returns Magnet positions for both endpoints
 */
export function getMagnetPositions(
  fromNode: SceneNode & { width: number; height: number },
  toNode: SceneNode & { width: number; height: number },
  type: ConnectorTypeV2
): { fromMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'; toMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' } {
  // Get absolute positions accounting for parent frames
  function getAbsolutePos(node: SceneNode): { x: number; y: number } {
    let x = node.x;
    let y = node.y;
    let parent = node.parent;
    
    while (parent && parent.type !== 'PAGE') {
      if ('x' in parent && 'y' in parent) {
        x += (parent as any).x || 0;
        y += (parent as any).y || 0;
      }
      parent = parent.parent;
    }
    
    return { x, y };
  }

  const fromAbs = getAbsolutePos(fromNode);
  const toAbs = getAbsolutePos(toNode);
  const dx = toAbs.x - fromAbs.x;
  const dy = toAbs.y - fromAbs.y;

  // Type-specific magnet rules
  if (type === 'PRIMARY_FLOW_LINE' || type === 'MERGE_LINE') {
    // Horizontal flow: RIGHT to LEFT
    return { fromMagnet: 'RIGHT', toMagnet: 'LEFT' };
  }

  if (type === 'BRANCH_LINE') {
    // Vertical branching: BOTTOM to TOP
    return { fromMagnet: 'BOTTOM', toMagnet: 'TOP' };
  }

  // Auto-detect based on distance
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal
    return {
      fromMagnet: dx > 0 ? 'RIGHT' : 'LEFT',
      toMagnet: dx > 0 ? 'LEFT' : 'RIGHT',
    };
  } else {
    // Vertical
    return {
      fromMagnet: dy > 0 ? 'BOTTOM' : 'TOP',
      toMagnet: dy > 0 ? 'TOP' : 'BOTTOM',
    };
  }
}

// ===== Native Connector Creation (FigJam) =====

/**
 * Creates a native ConnectorNode (FigJam only)
 * Native connectors automatically update when nodes move
 * 
 * @param fromNode - Source node
 * @param toNode - Target node
 * @param fromMagnet - Source magnet position
 * @param toMagnet - Target magnet position
 * @param options - Style options (color, strokeWeight, connectorLineType, cornerRadius)
 * @returns ConnectorNode if successful, null if unavailable
 */
export function createMagnetizedConnector(
  fromNode: BaseNode & { id: string },
  toNode: BaseNode & { id: string },
  fromMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' = 'RIGHT',
  toMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' = 'LEFT',
  options?: {
    color?: RGB;
    strokeWeight?: number;
    cornerRadius?: number;
    connectorLineType?: 'ELBOWED' | 'STRAIGHT' | 'CURVED';
  }
): ConnectorNode | null {
  // Only available in FigJam
  if (!isFigJam() || !supportsNativeConnectors()) {
    return null;
  }

  try {
    const connector = (figma as any).createConnector() as ConnectorNode;
    connector.connectorStart = {
      endpointNodeId: fromNode.id,
      magnet: fromMagnet,
    };
    connector.connectorEnd = {
      endpointNodeId: toNode.id,
      magnet: toMagnet,
    };
    connector.connectorLineType = options?.connectorLineType || 'ELBOWED';
    connector.strokeWeight = options?.strokeWeight ?? 4;
    connector.strokeJoin = 'ROUND';
    connector.connectorEndStrokeCap = 'ARROW_LINES';
    connector.strokes = [
      { type: 'SOLID', color: options?.color ?? CACHED_CONNECTOR_COLORS.royalBlue600 },
    ];
    connector.name = 'Connector line';
    return connector;
  } catch (error) {
    console.warn('Failed to create native connector:', error);
    return null;
  }
}

// ===== Connector Metadata =====

/**
 * Connector metadata stored in plugin data
 */
export interface ConnectorMetadata {
  type: ConnectorTypeV2;
  fromNodeId: string;
  toNodeId: string;
  isNative: boolean;
  label?: string;
  variantNodeIds?: string[]; // For BRANCH_TRUNK
}

/**
 * Store connector metadata in plugin data
 */
export function storeConnectorMetadata(connector: SceneNode, metadata: ConnectorMetadata): void {
  try {
    connector.setPluginData('connectorMeta', JSON.stringify(metadata));
  } catch (error) {
    console.warn('Failed to store connector metadata:', error);
  }
}

/**
 * Retrieve connector metadata from plugin data
 */
export function getConnectorMetadata(connector: SceneNode): ConnectorMetadata | null {
  try {
    const metaString = connector.getPluginData('connectorMeta');
    if (!metaString) return null;
    return JSON.parse(metaString) as ConnectorMetadata;
  } catch (error) {
    console.warn('Failed to parse connector metadata:', error);
    return null;
  }
}

/**
 * Check if node is a connector (has connector metadata)
 */
export function isConnector(node: SceneNode): boolean {
  if (node.type === 'CONNECTOR') return true;
  if (node.type === 'VECTOR') {
    const metadata = getConnectorMetadata(node);
    return metadata !== null;
  }
  return false;
}
