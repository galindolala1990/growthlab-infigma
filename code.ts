// ...existing code...
import { createExperimentInfoCard } from './experiment-info-card';
// ...existing code...

// --- Utility: Create a native Figma connector between two nodes, magnetized to edges ---
/**
 * Creates a Figma ConnectorNode between two nodes, magnetized to specified edges.
 * These connectors automatically update when nodes are moved!
 * @param fromNode The node to start from
 * @param toNode The node to end at
 * @param fromMagnet 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'
 * @param toMagnet 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'
 * @param options Optional styling (color, strokeWeight, etc)
 * @returns The created ConnectorNode
 */
/**
 * Check if we're running in FigJam (where ConnectorNode is available)
 * vs regular Figma (where it's not)
 */
function isFigJam(): boolean {
  try {
    // Check if createConnector is available
    if (typeof (figma as any).createConnector === 'function') {
      // Try to create a test connector to see if it actually works
      // But we can't do that without side effects, so check editorType instead
      return figma.editorType === 'figjam';
    }
    return false;
  } catch {
    return false;
  }
}

function createMagnetizedConnector(
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
  // Only try native connectors in FigJam
  if (!isFigJam()) {
    console.log('Native ConnectorNode only available in FigJam, using VectorNode fallback');
    return null;
  }
  
  try {
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
    connector.strokeJoin = 'ROUND';
    connector.connectorEndStrokeCap = 'ARROW_LINES';
    connector.strokes = [{ type: 'SOLID', color: options?.color ?? hexToRgb(TOKENS.royalBlue600) }];
    connector.name = 'Connector line';
    return connector;
  } catch (error) {
    console.warn('Native ConnectorNode creation failed:', error);
    return null;
  }
}

/**
 * Determines the best magnet position for a connector based on node positions and connector type
 */
function getMagnetPositions(
  fromNode: SceneNode & { width: number; height: number },
  toNode: SceneNode & { width: number; height: number },
  type: ConnectorTypeV2
): { fromMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM'; toMagnet: 'LEFT' | 'RIGHT' | 'TOP' | 'BOTTOM' } {
  // Helper to get absolute position
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
  
  const fromAbs = getAbsolutePos(fromNode);
  const toAbs = getAbsolutePos(toNode);
  const dx = toAbs.x - fromAbs.x;
  const dy = toAbs.y - fromAbs.y;
  
  if (type === 'PRIMARY_FLOW_LINE' || type === 'MERGE_LINE') {
    // Horizontal connections: RIGHT to LEFT
    return { fromMagnet: 'RIGHT', toMagnet: 'LEFT' };
  } else if (type === 'BRANCH_LINE') {
    // Vertical connections: BOTTOM to TOP
    return { fromMagnet: 'BOTTOM', toMagnet: 'TOP' };
  } else {
    // Auto-detect based on distance
    if (Math.abs(dx) > Math.abs(dy)) {
      return { fromMagnet: dx > 0 ? 'RIGHT' : 'LEFT', toMagnet: dx > 0 ? 'LEFT' : 'RIGHT' };
    } else {
      return { fromMagnet: dy > 0 ? 'BOTTOM' : 'TOP', toMagnet: dy > 0 ? 'TOP' : 'BOTTOM' };
    }
  }
}

/**
 * Creates a dynamic connector that automatically updates when nodes move.
 * Tries native ConnectorNode first (best option), falls back to VectorNode with refresh capability.
 * @param fromNode The source node
 * @param toNode The destination node
 * @param type The connector type
 * @param options Optional styling and metadata
 * @returns The created connector node (ConnectorNode or VectorNode)
 */
function createDynamicConnector(
  fromNode: SceneNode & { width: number; height: number; id: string },
  toNode: SceneNode & { width: number; height: number; id: string },
  type: ConnectorTypeV2,
  options?: {
    label?: string;
    winner?: boolean;
    variantColor?: string;
    index?: number;
    rolledout?: boolean;  // NEW
    useNativeConnector?: boolean; // Force native connector if available
  }
): SceneNode {
  const useNative = options?.useNativeConnector !== false; // Default to true
  
  if (useNative) {
    // Try native ConnectorNode first (automatically updates when nodes move!)
    const { fromMagnet, toMagnet } = getMagnetPositions(fromNode, toNode, type);
    const style = getConnectorStyle(type, { 
      winner: options?.winner, 
      variantColor: options?.variantColor,
      rolledout: options?.rolledout  // NEW
    });
    
    const nativeConnector = createMagnetizedConnector(
      fromNode,
      toNode,
      fromMagnet,
      toMagnet,
      {
        color: style.color,
        strokeWeight: style.strokeWeight,
        connectorLineType: type === 'PRIMARY_FLOW_LINE' ? 'STRAIGHT' : 'ELBOWED',
      }
    );
    
    if (nativeConnector) {
      // Store metadata for identification
      nativeConnector.setPluginData('connectorMeta', JSON.stringify({
        type,
        fromNodeId: fromNode.id,
        toNodeId: toNode.id,
        isNative: true,
        label: options?.label,
      }));
      nativeConnector.name = `${type} (Dynamic): ${fromNode.name} → ${toNode.name}`;
      return nativeConnector;
    }
  }
  
  // Fallback to VectorNode (static, but can be refreshed)
  const vectorConnector = createConnectorV2(fromNode, toNode, type, undefined, options);
  if (vectorConnector) {
    // Store metadata including node IDs for refresh capability
    vectorConnector.setPluginData('connectorMeta', JSON.stringify({
      type,
      fromNodeId: fromNode.id,
      toNodeId: toNode.id,
      isNative: false,
      label: options?.label,
    }));
    vectorConnector.name = `${type} (Static): ${fromNode.name} → ${toNode.name}`;
  }
  return vectorConnector;
}

/**
 * Refreshes all VectorNode-based connectors on the current page.
 * This updates their positions based on current node positions.
 * Native ConnectorNodes don't need refreshing - they update automatically!
 * 
 * Usage:
 * - Call directly: await refreshConnectors()
 * - Or send message from UI: figma.ui.postMessage({ type: 'refresh-connectors' })
 * - Or add to menu/command handler
 */
let refreshDebounceTimer: number | null = null;
let isRefreshing = false;

async function refreshConnectors(): Promise<void> {
  // Prevent concurrent refreshes
  if (isRefreshing) {
    console.log('Refresh already in progress, skipping...');
    return;
  }
  
  console.log('Starting connector refresh...');
  isRefreshing = true;
  const connectors: VectorNode[] = [];
  
  // Find all connector nodes with metadata
  function findConnectors(node: SceneNode): void {
    // Skip if node is removed
    if ('removed' in node && node.removed) {
      return;
    }
    
    if (node.type === 'VECTOR') {
      try {
        // Check if node still exists before accessing plugin data
        const meta = node.getPluginData('connectorMeta');
        if (meta) {
          try {
            const parsed = JSON.parse(meta);
            // Track connectors that need refreshing:
            // 1. Non-native connectors with fromNodeId and toNodeId
            // 2. Branch trunks (BRANCH_TRUNK) that need to update when variants move
            if (parsed.type === 'BRANCH_TRUNK' || 
                (parsed.isNative === false || (parsed.isNative === undefined && parsed.fromNodeId && parsed.toNodeId))) {
              connectors.push(node as VectorNode);
            }
          } catch (e) {
            // Invalid metadata, skip
            console.warn('Invalid connector metadata:', e);
          }
        }
      } catch (metaError) {
        // Node might have been deleted or doesn't have metadata
        // Skip silently - this is expected for orphaned connectors
        // Don't log to avoid console spam
      }
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        findConnectors(child);
      }
    }
  }
  
  findConnectors(figma.currentPage as unknown as SceneNode);
  
  console.log(`Found ${connectors.length} connectors to refresh`);
  
  if (connectors.length === 0) {
    figma.notify('No connectors found to refresh.');
    isRefreshing = false;
    return;
  }
  
  let refreshed = 0;
  let errors = 0;
  
  // Use Promise.all to fetch all nodes asynchronously
  const refreshPromises = connectors.map(async (connector) => {
    try {
      // First check if the connector node itself still exists
      if (!connector || connector.removed) {
        return { success: false, error: 'connector_removed' };
      }
      
      // Try to get metadata - if connector was deleted, this will fail
      let meta;
      try {
        const metaString = connector.getPluginData('connectorMeta');
        if (!metaString) {
          return { success: false, error: 'no_metadata' };
        }
        meta = JSON.parse(metaString);
      } catch (metaError) {
        console.warn('Could not read connector metadata, connector may have been deleted:', metaError);
        return { success: false, error: 'metadata_error' };
      }
      
      if (!meta.fromNodeId || !meta.toNodeId) {
        return { success: false, error: 'invalid_metadata' };
      }
      
      // Try to fetch nodes - handle cases where nodes don't exist
      let fromNode: SceneNode & { width: number; height: number } | null = null;
      let toNode: SceneNode & { width: number; height: number } | null = null;
      
      try {
        fromNode = await figma.getNodeByIdAsync(meta.fromNodeId) as SceneNode & { width: number; height: number } | null;
      } catch (err) {
        console.warn(`From node ${meta.fromNodeId} does not exist:`, err);
      }
      
      try {
        toNode = await figma.getNodeByIdAsync(meta.toNodeId) as SceneNode & { width: number; height: number } | null;
      } catch (err) {
        console.warn(`To node ${meta.toNodeId} does not exist:`, err);
      }
      
      if (!fromNode || !toNode) {
        // If nodes don't exist, remove the orphaned connector
        try {
          if (connector && !connector.removed) {
            connector.remove();
          }
        } catch (removeErr) {
          // Connector already removed, ignore
        }
        return { success: false, error: 'missing_nodes' };
      }
      
      // Remove old connector and its arrowhead (if any)
      const parent = connector.parent;
      
      // Find and remove arrowhead sibling (arrowheads are created as separate VectorNodes)
      if (parent && 'children' in parent && !parent.removed) {
        try {
          const siblings = parent.children;
          const arrowhead = siblings.find(
            child => child.type === 'VECTOR' && 
            (child.name === 'Arrowhead' || child.name.includes('Arrowhead')) &&
            child !== connector &&
            !child.removed
          );
          if (arrowhead) {
            arrowhead.remove();
          }
        } catch (arrowErr) {
          // Arrowhead already removed or parent changed, continue
        }
      }
      
      // Remove the old connector
      try {
        if (connector && !connector.removed) {
          connector.remove();
        }
      } catch (removeErr) {
        // Connector already removed, continue
      }
      
      // Handle BRANCH_TRUNK specially - recreate the entire branching tree
      if (meta.type === 'BRANCH_TRUNK') {
        // Find the event node and all variant nodes
        try {
          const eventNode = await figma.getNodeByIdAsync(meta.fromNodeId) as SceneNode & { width: number; height: number } | null;
          if (!eventNode) {
            connector.remove();
            return { success: false, error: 'event_node_missing' };
          }
          
          // Get all variant nodes
          const variantNodeIds = meta.variantNodeIds || [];
          const variantNodes: Array<{ connector: ConnectorV2; node: SceneNode & { width: number; height: number } }> = [];
          for (const variantId of variantNodeIds) {
            try {
              const variantNode = await figma.getNodeByIdAsync(variantId) as SceneNode & { width: number; height: number } | null;
              if (variantNode) {
                variantNodes.push({
                  connector: { 
                    id: `branch-${variantId}`, 
                    type: 'BRANCH_LINE' as ConnectorTypeV2,
                    from: { nodeType: 'EVENT_NODE', id: meta.fromNodeId },
                    to: { nodeType: 'VARIANT_NODE', id: variantId }
                  },
                  node: variantNode
                });
              }
            } catch (err) {
              // Variant node doesn't exist, skip
            }
          }
          
          if (variantNodes.length > 0) {
            // Remove old trunk and all its branches
            const parent = connector.parent;
            if (parent && 'children' in parent) {
              // Find and remove all related branch connectors
              const siblings = parent.children;
              for (const sibling of siblings) {
                if (sibling.type === 'VECTOR' && sibling !== connector) {
                  try {
                    const siblingMeta = sibling.getPluginData('connectorMeta');
                    if (siblingMeta) {
                      const parsedSibling = JSON.parse(siblingMeta);
                      if (parsedSibling.type === 'BRANCH_LINE' && parsedSibling.fromNodeId === meta.fromNodeId) {
                        sibling.remove();
                      }
                    }
                  } catch {
                    // Ignore errors
                  }
                }
              }
            }
            connector.remove();
            
            // Recreate the branching tree
            const newTree = createBranchingTree(eventNode, variantNodes, meta.experimentId);
            return { success: true };
          } else {
            // No variants left, remove trunk
            connector.remove();
            return { success: false, error: 'no_variants' };
          }
        } catch (err) {
          console.error('Error refreshing branch trunk:', err);
          return { success: false, error: 'trunk_refresh_failed' };
        }
      }
      
      // Create new connector at updated positions
      const newConnector = createConnectorV2(
        fromNode,
        toNode,
        meta.type as ConnectorTypeV2,
        undefined,
        {
          label: meta.label,
        }
      );
      
      // Restore metadata
      if (newConnector) {
        try {
          // Get original metadata if connector still exists
          const originalMeta = connector && !connector.removed 
            ? connector.getPluginData('connectorMeta') 
            : JSON.stringify(meta);
          newConnector.setPluginData('connectorMeta', originalMeta);
          newConnector.name = connector && !connector.removed ? connector.name : `${meta.type} Line`;
          
          // Append to parent or page
          if (parent && !parent.removed) {
            parent.appendChild(newConnector);
          } else {
            figma.currentPage.appendChild(newConnector);
          }
          return { success: true };
        } catch (appendErr) {
          console.error('Error appending refreshed connector:', appendErr);
          // Clean up the new connector if append failed
          try {
            newConnector.remove();
          } catch {
            // Ignore cleanup errors
          }
          return { success: false, error: 'append_failed' };
        }
      }
      return { success: false, error: 'creation_failed' };
    } catch (error) {
      console.error('Error refreshing connector:', error);
      // If connector exists but has an error, try to remove it to clean up
      try {
        if (connector && !connector.removed) {
          connector.remove();
        }
      } catch {
        // Ignore cleanup errors
      }
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  });
  
  // Wait for all refresh operations to complete
  const results = await Promise.all(refreshPromises);
  
  for (const result of results) {
    if (result.success) {
      refreshed++;
    } else {
      errors++;
    }
  }
  
  isRefreshing = false;
  
  if (refreshed > 0) {
    figma.notify(`Refreshed ${refreshed} connector${refreshed !== 1 ? 's' : ''}${errors > 0 ? ` (${errors} errors)` : ''}`);
  } else if (errors > 0) {
    figma.notify(`Failed to refresh connectors (${errors} errors)`);
  }
}

/**
 * Sets up automatic connector refresh when nodes are moved.
 * Only needed in regular Figma (not FigJam, where native connectors auto-update).
 * Uses event listeners since setInterval doesn't work reliably in Figma plugins.
 */
let lastNodePositions: Map<string, { x: number; y: number }> = new Map();
let refreshTimeout: number | null = null;

async function setupAutoRefreshConnectors(): Promise<void> {
  // Only set up auto-refresh in regular Figma (not FigJam)
  if (isFigJam()) {
    console.log('In FigJam - native connectors auto-update, no refresh needed');
    return;
  }
  
  console.log('Setting up auto-refresh for connectors in regular Figma');
  
  // Store initial positions of all nodes with connectors
  function storeNodePositions(): void {
    lastNodePositions.clear();
    
    function findConnectors(node: SceneNode): void {
      if (node.type === 'VECTOR') {
        const meta = node.getPluginData('connectorMeta');
        if (meta) {
          try {
            const parsed = JSON.parse(meta);
            // Track connectors that are not native (or don't have isNative flag for backward compatibility)
            // Also track if it has fromNodeId and toNodeId (means it's a connector we can refresh)
            if ((parsed.isNative === false || parsed.isNative === undefined) && parsed.fromNodeId && parsed.toNodeId) {
              // Store node IDs for async tracking (we'll fetch positions when needed)
              // Just store the IDs for now - we'll fetch positions async in checkAndRefresh
              lastNodePositions.set(parsed.fromNodeId, { x: 0, y: 0 }); // Placeholder, will be updated
              lastNodePositions.set(parsed.toNodeId, { x: 0, y: 0 }); // Placeholder, will be updated
            }
          } catch (e) {
            // Invalid metadata
            console.warn('Invalid connector metadata:', e);
          }
        }
      }
      if ('children' in node) {
        for (const child of node.children) {
          findConnectors(child);
        }
      }
    }
    
    findConnectors(figma.currentPage as unknown as SceneNode);
    console.log(`Tracking ${lastNodePositions.size} nodes for connector refresh`);
  }
  
  // Initial position storage
  storeNodePositions();
  
  // Check for position changes and refresh if needed
  async function checkAndRefresh(): Promise<void> {
    if (isRefreshing) {
      return;
    }
    
    let needsRefresh = false;
    
    // Fetch all node positions asynchronously
    const nodeIds = Array.from(lastNodePositions.keys());
    const nodePromises = nodeIds.map(id => figma.getNodeByIdAsync(id));
    const nodes = await Promise.all(nodePromises);
    
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const node = nodes[i];
      const lastPos = lastNodePositions.get(nodeId) || { x: 0, y: 0 };
      
      if (node && 'x' in node && 'y' in node) {
        const currentPos = { x: node.x, y: node.y };
        // Check if position changed (with small threshold to avoid floating point issues)
        // Also check if this is the first time we're tracking (lastPos is 0,0 placeholder)
        if (lastPos.x === 0 && lastPos.y === 0) {
          // First time tracking, just store the position
          lastNodePositions.set(nodeId, currentPos);
        } else if (Math.abs(currentPos.x - lastPos.x) > 0.1 || Math.abs(currentPos.y - lastPos.y) > 0.1) {
          needsRefresh = true;
          lastNodePositions.set(nodeId, currentPos);
        }
      }
    }
    
    if (needsRefresh) {
      console.log('Node positions changed, refreshing connectors...');
      refreshConnectors().then(() => {
        // Update positions after refresh
        storeNodePositions();
      }).catch(err => {
        console.error('Error in auto-refresh:', err);
      });
    }
  }
  
  // Use selection change event - triggers when user selects/moves nodes
  figma.on('selectionchange', () => {
    console.log('Selection changed - checking for connector refresh...');
    // Check immediately (no debounce needed for selection)
    checkAndRefresh().catch(err => {
      console.error('Error in checkAndRefresh:', err);
    });
  });
  
  // Try to set up documentchange listener (requires loadAllPagesAsync in some cases)
  try {
    // Try to load all pages first (required for documentchange in some modes)
    // This will fail gracefully if not needed or not available
    if (typeof figma.loadAllPagesAsync === 'function') {
      try {
        await figma.loadAllPagesAsync();
        console.log('All pages loaded for documentchange listener');
      } catch (loadError) {
        // Not in a mode that requires this, or already loaded
        console.log('loadAllPagesAsync not needed or already loaded');
      }
    }
    
    // Also listen to document changes (when nodes are transformed)
    figma.on('documentchange', (event) => {
      // Check if any nodes were moved
      const hasTransform = event.documentChanges.some(change => {
        return change.type === 'PROPERTY_CHANGE' && 
               (change.properties.includes('x') || 
                change.properties.includes('y'));
      });
      
      if (hasTransform) {
        console.log('Document changed (node moved) - checking for connector refresh...');
        checkAndRefresh();
      }
    });
    
    console.log('Document change listener registered successfully');
  } catch (error) {
    console.warn('Could not register documentchange listener (this is OK, selectionchange will still work):', error);
    // Continue without documentchange - selectionchange will still work
  }
  
  console.log('Auto-refresh listeners set up. Connectors will refresh when nodes move.');
  console.log('You can also manually refresh by clicking "Refresh Connectors" button or sending: { type: "refresh-connectors" }');
}

/**
 * Creates a branching tree structure: trunk from event to midpoint, then branches to each variant
 * @param eventNode The source event node
 * @param variantNodes Array of variant nodes and their connector metadata
 * @param experimentId The experiment ID for metadata
 * @returns Array of created vector nodes (trunk + branches)
 */
function createBranchingTree(
  eventNode: SceneNode & { width: number; height: number },
  variantNodes: Array<{ connector: ConnectorV2; node: SceneNode & { width: number; height: number } }>,
  experimentId: string
): SceneNode[] {
  const result: SceneNode[] = [];
  
  // Helper to get absolute position
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
  
  // Get style for branch lines
  const style = getConnectorStyle('BRANCH_LINE', {});
  const color = style.color;
  const strokeWeight = style.strokeWeight;
  
  // Calculate positions
  const eventAbs = getAbsolutePos(eventNode);
  const eventBottom = { x: eventAbs.x + eventNode.width / 2, y: eventAbs.y + eventNode.height };
  
  // Get all variant positions and calculate trunk endpoint
  const variantPositions = variantNodes.map(v => {
    const vAbs = getAbsolutePos(v.node);
    const variantTop = { x: vAbs.x + v.node.width / 2, y: vAbs.y };
    return { ...v, pos: variantTop, absPos: vAbs };
  });
  
  // Calculate trunk length dynamically based on variant positions
  // Trunk should extend to a point that allows smooth, flexible branching to all variants
  const trunkLength = 50; // Base trunk length (increased for smoother appearance)
  // Calculate the minimum Y position needed for all variants
  const minVariantY = Math.min(...variantPositions.map(v => v.pos.y));
  // Trunk should extend to allow smooth curves - extend further for better flexibility
  const distanceToVariants = minVariantY - eventBottom.y;
  // Trunk extends to about 35% of distance to closest variant, with minimum of base length
  // This gives more room for smooth elbow curves
  const dynamicTrunkLength = Math.max(trunkLength, distanceToVariants * 0.35);
  const trunkEnd = { x: eventBottom.x, y: eventBottom.y + dynamicTrunkLength };
  
  // Create trunk (vertical line from event bottom)
  const trunkPath = `M ${eventBottom.x} ${eventBottom.y} L ${trunkEnd.x} ${trunkEnd.y}`;
  const trunk = figma.createVector();
  trunk.vectorPaths = [{ windingRule: "NONZERO", data: trunkPath }];
  trunk.strokes = [{ type: "SOLID", color }];
  trunk.strokeWeight = strokeWeight;
  trunk.strokeAlign = "CENTER";
  trunk.strokeCap = "ROUND";
  trunk.strokeJoin = "ROUND";
  if (style.dashPattern) trunk.dashPattern = style.dashPattern;
  trunk.name = "Branch Trunk";
  
  // Store metadata for trunk so it can be refreshed when variants move
  trunk.setPluginData('connectorMeta', JSON.stringify({
    connectorId: `trunk-${eventNode.id}`,
    type: 'BRANCH_TRUNK',
    fromNodeId: eventNode.id,
    toNodeId: null, // Trunk doesn't connect to a specific node
    experimentId: experimentId,
    variantNodeIds: variantNodes.map(v => v.node.id), // Track all variant IDs for refresh
    isNative: false
  }));
  
  figma.currentPage.appendChild(trunk);
  result.push(trunk);
  
  // Create branches from trunk end to each variant
  for (const variant of variantPositions) {
    const variantTop = variant.pos;
    const arrowOffset = 0; // No offset - arrowhead at card edge
    const endPoint = { x: variantTop.x, y: variantTop.y + arrowOffset };
    
    // Create branch path with elbow from trunk end to variant
    let branchPath: string;
    
    const dx = endPoint.x - trunkEnd.x;
    const dy = endPoint.y - trunkEnd.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    
    // If variant is directly below trunk (no horizontal offset), use straight line
    // Otherwise, create an elbow with smooth rounded corners
    if (absDx < 1) {
      // Straight vertical line - variant is directly below trunk
      branchPath = `M ${trunkEnd.x} ${trunkEnd.y} L ${endPoint.x} ${endPoint.y}`;
    } else {
      // Create elbow path with rounded corners
      // Corner radius scales with distance for smoother, scalable appearance
      const cornerRadius = Math.min(20, Math.min(absDx, absDy) * 0.4); // Scale radius, max 20px
      
      // Elbow path: horizontal segment → rounded corner → vertical segment
      // Start from trunk end, go horizontally first, then vertically to variant
      const elbowX = endPoint.x; // Target X (variant's X position)
      const elbowY = trunkEnd.y; // Keep same Y as trunk end for horizontal segment
      
      // Path: Start → horizontal segment → rounded corner → vertical segment → end
      branchPath = `M ${trunkEnd.x} ${trunkEnd.y}`;
      
      // Horizontal segment: move from trunk end X toward variant X
      // Stop before the corner by the radius distance
      if (absDx > cornerRadius) {
        // Enough horizontal distance for a corner
        const horizontalEndX = dx > 0 
          ? elbowX - cornerRadius  // Variant is to the right
          : elbowX + cornerRadius; // Variant is to the left
        
        branchPath += ` L ${horizontalEndX} ${elbowY}`;
        
        // Rounded corner (quadratic bezier for smooth curve)
        // Corner transitions from horizontal to vertical
        // Control point is at the actual corner (elbowX, elbowY)
        // End point is vertical segment start
        const verticalStartY = dy > 0 
          ? elbowY + cornerRadius  // Going down
          : elbowY - cornerRadius; // Going up
        
        branchPath += ` Q ${elbowX} ${elbowY} ${elbowX} ${verticalStartY}`;
        
        // Vertical segment to variant
        if (absDy > cornerRadius) {
          // Enough vertical distance, connect to variant
          branchPath += ` L ${endPoint.x} ${endPoint.y}`;
        } else {
          // Very short vertical - already at variant from corner
          branchPath += ` L ${endPoint.x} ${endPoint.y}`;
        }
      } else {
        // Very small horizontal distance - use straight line
        branchPath += ` L ${endPoint.x} ${endPoint.y}`;
      }
    }
    
    const branch = figma.createVector();
    branch.vectorPaths = [{ windingRule: "NONZERO", data: branchPath }];
    branch.strokes = [{ type: "SOLID", color }];
    branch.strokeWeight = strokeWeight;
    branch.strokeAlign = "CENTER";
    branch.strokeCap = "ROUND";
    branch.strokeJoin = "ROUND";
    if (style.dashPattern) branch.dashPattern = style.dashPattern;
    branch.name = `Branch to Variant`;
    figma.currentPage.appendChild(branch);
    
    // Store metadata (important: mark as not native so refresh system can find it)
    branch.setPluginData('connectorMeta', JSON.stringify({
      connectorId: variant.connector.id,
      type: 'BRANCH_LINE',
      fromNodeId: eventNode.id,
      toNodeId: variant.node.id,
      experimentId: experimentId,
      label: variant.connector.label,
      isNative: false  // Critical: mark as non-native so refresh system tracks it
    }));
    
    result.push(branch);
    
    // No arrowhead for branch lines - they connect directly to variant cards
  }
  
  return result;
}

/**
 * Creates a merging tree structure: branches from each variant to midpoint, then trunk to target
 * @param variantNodes Array of variant nodes and their connector metadata
 * @param targetNode The destination node (event or exit)
 * @param experimentId The experiment ID for metadata
 * @returns Array of created vector nodes (branches + trunk)
 */
function createMergingTree(
  variantNodes: Array<{ connector: ConnectorV2; node: SceneNode & { width: number; height: number } }>,
  targetNode: SceneNode & { width: number; height: number },
  experimentId: string
): SceneNode[] {
  const result: SceneNode[] = [];
  
  // Helper to get absolute position
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
  
  // Get style for merge lines
  const style = getConnectorStyle('MERGE_LINE', {});
  const color = style.color;
  const strokeWeight = style.strokeWeight;
  
  // Calculate target position (left edge, center)
  const targetAbs = getAbsolutePos(targetNode);
  const arrowOffset = 0; // No offset - arrowhead at card edge
  const targetLeft = { 
    x: targetAbs.x + arrowOffset, 
    y: targetAbs.y + targetNode.height / 2 
  };
  
  // Calculate merge point (trunk start) - positioned before the target
  const trunkLength = 40; // Horizontal distance from target
  const trunkStart = { x: targetLeft.x - trunkLength, y: targetLeft.y };
  
  // Create trunk (horizontal line to target)
  const trunkPath = `M ${trunkStart.x} ${trunkStart.y} L ${targetLeft.x} ${targetLeft.y}`;
  const trunk = figma.createVector();
  trunk.vectorPaths = [{ windingRule: "NONZERO", data: trunkPath }];
  trunk.strokes = [{ type: "SOLID", color }];
  trunk.strokeWeight = strokeWeight;
  trunk.strokeAlign = "CENTER";
  trunk.strokeCap = "ROUND";
  trunk.strokeJoin = "ROUND";
  if (style.dashPattern) trunk.dashPattern = style.dashPattern;
  trunk.name = "Merge Trunk";
  figma.currentPage.appendChild(trunk);
  result.push(trunk);
  
  // No arrowhead for merge trunk - only PRIMARY_FLOW_LINE gets arrowheads
  
  // Create branches from each variant to trunk start
  for (const variant of variantNodes) {
    const vAbs = getAbsolutePos(variant.node);
    const variantRight = { 
      x: vAbs.x + variant.node.width, 
      y: vAbs.y + variant.node.height / 2 
    };
    
    // Create branch path with elbow from variant right to trunk start
    let branchPath: string;
    
    const dx = trunkStart.x - variantRight.x;
    const dy = trunkStart.y - variantRight.y;
    
    // Simple straight line from variant right directly to trunk start (no elbow)
    // This was the "almost perfect" version the user mentioned
    // Just draw a straight line from variant to trunk
    branchPath = `M ${variantRight.x} ${variantRight.y} L ${trunkStart.x} ${trunkStart.y}`;
    
    const branch = figma.createVector();
    branch.vectorPaths = [{ windingRule: "NONZERO", data: branchPath }];
    branch.strokes = [{ type: "SOLID", color }];
    branch.strokeWeight = strokeWeight;
    branch.strokeAlign = "CENTER";
    branch.strokeCap = "ROUND";
    branch.strokeJoin = "ROUND";
    if (style.dashPattern) branch.dashPattern = style.dashPattern;
    branch.name = `Merge from Variant`;
    figma.currentPage.appendChild(branch);
    
    // Store metadata (important: mark as not native so refresh system can find it)
    branch.setPluginData('connectorMeta', JSON.stringify({
      connectorId: variant.connector.id,
      type: 'MERGE_LINE',
      fromNodeId: variant.node.id,
      toNodeId: targetNode.id,
      experimentId: experimentId,
      label: variant.connector.label,
      isNative: false  // Critical: mark as non-native so refresh system tracks it
    }));
    
    result.push(branch);
  }
  
  return result;
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
    rolledout?: boolean;  // NEW
  }
): SceneNode {
  const style = getConnectorStyle(type, { 
    winner: options?.winner, 
    variantColor: options?.variantColor,
    rolledout: options?.rolledout  // NEW
  });
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
    
    // Offset for arrowhead to stop before card edge
    const arrowOffset = 0; // No offset - arrowhead at card edge
    
    let fromPoint, toPoint;
    if (type === 'PRIMARY_FLOW_LINE' || type === 'MERGE_LINE') {
      // Horizontal connections (left-right)
      // Use RIGHT edge of 'from' node, LEFT edge of 'to' node
      fromPoint = { x: dx > 0 ? fromAbs.x + from.width : fromAbs.x, y: fromAbs.y + from.height / 2 };
      // Offset the destination point inward by arrowOffset
      toPoint = { 
        x: dx > 0 ? toAbs.x + arrowOffset : toAbs.x + to.width - arrowOffset, 
        y: toAbs.y + to.height / 2 
      };
    } else if (type === 'BRANCH_LINE') {
      // Vertical connections (event to variant: bottom to top)
      // Use BOTTOM edge of 'from' node, TOP edge of 'to' node
      fromPoint = { x: fromAbs.x + from.width / 2, y: fromAbs.y + from.height };
      // Offset the destination point inward by arrowOffset
      toPoint = { 
        x: toAbs.x + to.width / 2, 
        y: toAbs.y + arrowOffset 
      };
    } else {
      // Auto-detect based on distance
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal
        fromPoint = { x: dx > 0 ? fromAbs.x + from.width : fromAbs.x, y: fromAbs.y + from.height / 2 };
        toPoint = { 
          x: dx > 0 ? toAbs.x + arrowOffset : toAbs.x + to.width - arrowOffset, 
          y: toAbs.y + to.height / 2 
        };
      } else {
        // Vertical
        fromPoint = { x: fromAbs.x + from.width / 2, y: dy > 0 ? fromAbs.y + from.height : fromAbs.y };
        toPoint = { 
          x: toAbs.x + to.width / 2, 
          y: dy > 0 ? toAbs.y + arrowOffset : toAbs.y + to.height - arrowOffset 
        };
      }
    }
    return { from: fromPoint, to: toPoint };
  }
  
  const { from: startAbs, to: endAbs } = getEdgePoints(fromNode, toNode);
  // Always work in absolute coordinates for accurate edge positioning
  // endAbs is the EXACT card edge position - use this directly for arrowhead
  let start = { ...startAbs }, end = { ...endAbs };
  
  // Convert to flowFrame-local if provided (only for line path coordinates)
  // Arrowhead will always use endAbs (absolute) for precise positioning
  if (flowFrame) {
    const frameAbs = getAbsolutePos(flowFrame);
    start.x = startAbs.x - frameAbs.x;
    start.y = startAbs.y - frameAbs.y;
    end.x = endAbs.x - frameAbs.x;
    end.y = endAbs.y - frameAbs.y;
  }
  // When flowFrame is undefined, start/end are already absolute (same as startAbs/endAbs)
  
  const index = options?.index ?? 0;
  let midX, midY;
  let line: VectorNode, arrow: VectorNode | null = null;
  const cornerRadius = 24; // Radius for rounded corners
  
  if (Math.abs(start.x - end.x) > Math.abs(start.y - end.y)) {
    // Horizontal - with horizontal segments at start and end
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    let pathData: string = ''; // Initialize to avoid TypeScript error
    
    // Track the actual end point of the path for arrowhead positioning
    let actualPathEnd = { x: end.x, y: end.y };
    let pathEndDirection = { x: 1, y: 0 }; // Default direction (right)
    
    // Get path coordinates (for all connector types)
    const pathStartX = flowFrame ? start.x : startAbs.x;
    const pathStartY = flowFrame ? start.y : startAbs.y;
    const pathEndX = flowFrame ? end.x : endAbs.x;
    const pathEndY = flowFrame ? end.y : endAbs.y;
    const pathDy = pathEndY - pathStartY;
    
    // PRIMARY_FLOW_LINE: entry/exit points are always straight horizontal (0 degrees), curve only at midpoint if vertically offset
    if (type === 'PRIMARY_FLOW_LINE') {
      // PRIMARY_FLOW_LINE connects event to event (left to right)
      // Entry point: straight horizontal (0 degrees) from event right edge
      // Exit point: straight horizontal (0 degrees) to event left edge
      // Midpoint: curve only if nodes are vertically offset
      const absDy = Math.abs(pathDy);
      
      // If nodes are vertically aligned, use straight horizontal line (0 degrees at entry and exit)
      if (absDy < 2) {
        // Vertically aligned - straight horizontal line
        pathData = `M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathStartY}`;
        // Actual path end is at the card edge (horizontal line, so Y matches start, X matches end)
        actualPathEnd = { x: endAbs.x, y: startAbs.y };
        // Direction is horizontal, pointing toward the card (0 degrees)
        pathEndDirection = { x: Math.sign(pathEndX - pathStartX), y: 0 };
      } else {
        // Vertically offset - use midpoint curve with straight horizontal entry/exit segments
        // Calculate midpoint X
        const midX = (pathStartX + pathEndX) / 2;
        const absDx = Math.abs(pathEndX - pathStartX);
        
        // Corner radius scales with distance, max 20px
        const cornerRadius = Math.min(20, Math.min(absDx, absDy) * 0.4);
        
        // Path structure:
        // 1. Straight horizontal from entry (startX to midX - radius) - 0 degrees
        // 2. Curve from horizontal to vertical at midpoint
        // 3. Straight vertical segment
        // 4. Curve from vertical to horizontal at midpoint
        // 5. Straight horizontal to exit (midX + radius to endX) - 0 degrees
        
        pathData = `M ${pathStartX} ${pathStartY}`;
        
        // Straight horizontal segment from entry (0 degrees)
        const horizontalEndX = midX - cornerRadius;
        pathData += ` L ${horizontalEndX} ${pathStartY}`;
        
        // Curve from horizontal to vertical (at midpoint)
        // Control point creates smooth transition
        const verticalStartY = pathDy > 0 
          ? pathStartY + cornerRadius  // Going down
          : pathStartY - cornerRadius; // Going up
        
        // Quadratic bezier: from (midX - radius, startY) via (midX, startY) to (midX, startY ± radius)
        pathData += ` Q ${midX} ${pathStartY} ${midX} ${verticalStartY}`;
        
        // Straight vertical segment
        const verticalEndY = pathDy > 0
          ? pathEndY - cornerRadius  // Going down
          : pathEndY + cornerRadius; // Going up
        pathData += ` L ${midX} ${verticalEndY}`;
        
        // Curve from vertical to horizontal (at midpoint)
        // Quadratic bezier: from (midX, endY ± radius) via (midX, endY) to (midX + radius, endY)
        pathData += ` Q ${midX} ${pathEndY} ${midX + cornerRadius} ${pathEndY}`;
        
        // Straight horizontal segment to exit (0 degrees)
        pathData += ` L ${pathEndX} ${pathEndY}`;
        
        // Actual path end is at the card edge
        actualPathEnd = { x: endAbs.x, y: endAbs.y };
        // Direction is horizontal, pointing toward the card (0 degrees)
        pathEndDirection = { x: Math.sign(pathEndX - pathStartX), y: 0 };
      }
    } else if (Math.abs(pathDy) < 1) {
      // Simple straight horizontal line (no vertical displacement) - for other connector types
      // CRITICAL: Path must start and end at EXACT card edge coordinates
      
      pathData = `M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathEndY}`;
      // Actual path end is at the card edge
      // Use endAbs (absolute coordinates) for arrowhead positioning to ensure it's at the exact card edge
      actualPathEnd = { x: endAbs.x, y: endAbs.y };
      // Direction is horizontal, pointing toward the card
      pathEndDirection = { x: Math.sign(pathEndX - pathStartX), y: 0 };
    } else {
      // For BRANCH_LINE: entry/exit points are always straight, curve only at midpoint if offset
      if (type === 'BRANCH_LINE') {
        // BRANCH_LINE connects event bottom center to variant top center
        // Entry point: straight vertical (90 degrees) from event bottom
        // Exit point: straight vertical (90 degrees) to variant top
        // Midpoint: curve only if nodes are offset horizontally
        const pathStartX = flowFrame ? start.x : startAbs.x;
        const pathStartY = flowFrame ? start.y : startAbs.y;
        const pathEndX = flowFrame ? end.x : endAbs.x;
        const pathEndY = flowFrame ? end.y : endAbs.y;
        
        const dx = pathEndX - pathStartX;
        const dy = pathEndY - pathStartY;
        const absDx = Math.abs(dx);
        
        // Magnet behavior: if nodes are horizontally aligned (X centers match), use straight vertical line
        if (absDx < 2) {
          // Horizontally aligned - straight vertical line (90 degrees at entry and exit)
          pathData = `M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathEndY}`;
          pathEndDirection = { x: 0, y: Math.sign(dy) }; // Straight vertical
        } else {
          // Not aligned - use midpoint curve with straight entry/exit segments
          // Calculate midpoint Y
          const midY = (pathStartY + pathEndY) / 2;
          const absDy = Math.abs(dy);
          
          // Corner radius scales with distance, max 20px
          const cornerRadius = Math.min(20, Math.min(absDx, absDy) * 0.4);
          
          // Path structure: 
          // 1. Straight vertical from entry (startY to midY - radius) - 90 degrees
          // 2. Curve from vertical to horizontal at midpoint
          // 3. Straight horizontal segment
          // 4. Curve from horizontal to vertical at midpoint  
          // 5. Straight vertical to exit (midY + radius to endY) - 90 degrees
          
          pathData = `M ${pathStartX} ${pathStartY}`;
          
          // Straight vertical segment from entry (90 degrees)
          const verticalEndY = midY - cornerRadius;
          pathData += ` L ${pathStartX} ${verticalEndY}`;
          
          // Curve from vertical to horizontal (at midpoint)
          // Control point creates smooth transition
          const horizontalStartX = dx > 0 
            ? pathStartX + cornerRadius  // Going right
            : pathStartX - cornerRadius; // Going left
          
          // Quadratic bezier: from (startX, midY - radius) via (startX, midY) to (startX ± radius, midY)
          pathData += ` Q ${pathStartX} ${midY} ${horizontalStartX} ${midY}`;
          
          // Straight horizontal segment
          const horizontalEndX = dx > 0
            ? pathEndX - cornerRadius  // Going right
            : pathEndX + cornerRadius; // Going left
          pathData += ` L ${horizontalEndX} ${midY}`;
          
          // Curve from horizontal to vertical (at midpoint)
          // Quadratic bezier: from (endX ± radius, midY) via (endX, midY) to (endX, midY + radius)
          pathData += ` Q ${pathEndX} ${midY} ${pathEndX} ${midY + cornerRadius}`;
          
          // Straight vertical segment to exit (90 degrees)
          pathData += ` L ${pathEndX} ${pathEndY}`;
          
          pathEndDirection = { x: 0, y: Math.sign(dy) }; // Exit is straight vertical
        }
        
        // actualPathEnd is the exact card edge position
        actualPathEnd = { x: endAbs.x, y: endAbs.y };
      } else if (type === 'MERGE_LINE') {
        // MERGE_LINE uses straight direct line from card edge to card edge
        const pathStartX = flowFrame ? start.x : startAbs.x;
        const pathStartY = flowFrame ? start.y : startAbs.y;
        const pathEndX = flowFrame ? end.x : endAbs.x;
        const pathEndY = flowFrame ? end.y : endAbs.y;
        
        pathData = `M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathEndY}`;
        
        actualPathEnd = { x: endAbs.x, y: endAbs.y };
        const dx = pathEndX - pathStartX;
        const dy = pathEndY - pathStartY;
        const length = Math.sqrt(dx * dx + dy * dy);
        pathEndDirection = length > 0 ? { x: dx / length, y: dy / length } : { x: 1, y: 0 };
      } else {
        // Fallback for any other connector types (should not normally occur)
        pathData = `M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathEndY}`;
        actualPathEnd = { x: endAbs.x, y: endAbs.y };
        pathEndDirection = { x: Math.sign(pathEndX - pathStartX), y: 0 };
      }
    }
    
    line = figma.createVector();
    line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
    line.strokes = [{ type: "SOLID", color }];
    line.strokeWeight = strokeWeight;
    line.strokeAlign = "CENTER";
    line.strokeCap = "ROUND";
    line.strokeJoin = "ROUND";
    if (style.dashPattern) line.dashPattern = style.dashPattern;
    line.name = `${type} Line`;
    // Append to the same parent as the coordinate system
    if (flowFrame) flowFrame.appendChild(line); else figma.currentPage.appendChild(line);
    
    // Arrowhead - only create for PRIMARY_FLOW_LINE (not for variant connectors)
    // Variant connectors (BRANCH_LINE, MERGE_LINE) connect directly without arrowheads
    if (type === 'PRIMARY_FLOW_LINE') {
      const arrowSize = 12; // Larger arrowhead for better visibility
      arrow = figma.createVector();
      
      // Calculate angle from the path end direction (points toward the card)
      const angle = Math.atan2(pathEndDirection.y, pathEndDirection.x);
      
      // The arrowhead tip should be exactly at the card edge
      // For PRIMARY_FLOW_LINE horizontal lines, use endAbs.x and startAbs.y (horizontal line Y)
      // For other cases, use endAbs (the card edge)
      // Convert to correct coordinate system based on where arrowhead is appended
      let tipX: number, tipY: number;
      if (flowFrame) {
        // Arrowhead is in flowFrame - convert absolute to relative coordinates
        const frameAbs = getAbsolutePos(flowFrame);
        // For horizontal PRIMARY_FLOW_LINE, Y should match the line's Y (startAbs.y)
        const arrowY = (type === 'PRIMARY_FLOW_LINE' && Math.abs(endAbs.y - startAbs.y) < 1) ? startAbs.y : endAbs.y;
        tipX = endAbs.x - frameAbs.x;
        tipY = arrowY - frameAbs.y;
      } else {
        // Arrowhead is on page - use absolute coordinates
        // For horizontal PRIMARY_FLOW_LINE, Y should match the line's Y (startAbs.y)
        const arrowY = (type === 'PRIMARY_FLOW_LINE' && Math.abs(endAbs.y - startAbs.y) < 1) ? startAbs.y : endAbs.y;
        tipX = endAbs.x;
        tipY = arrowY;
      }
      
      // Base of arrowhead is offset inward from the tip along the direction vector
      // This ensures the arrowhead points toward the card center
      const baseX1 = tipX - arrowSize * Math.cos(angle);
      const baseY1 = tipY - arrowSize * Math.sin(angle);
      
      // Calculate perpendicular angle for base width
      const perpAngle = angle + Math.PI / 2;
      const halfWidth = arrowSize * 0.4;
      
      // Base points form a line perpendicular to the arrow direction
      const baseX2 = baseX1 - halfWidth * Math.cos(perpAngle);
      const baseY2 = baseY1 - halfWidth * Math.sin(perpAngle);
      const baseX3 = baseX1 + halfWidth * Math.cos(perpAngle);
      const baseY3 = baseY1 + halfWidth * Math.sin(perpAngle);
      
      // Create filled triangle path
      arrow.vectorPaths = [{
        windingRule: "NONZERO",
        data: `M ${tipX} ${tipY} L ${baseX2} ${baseY2} L ${baseX3} ${baseY3} Z`,
      }];
      arrow.fills = [{ type: "SOLID", color }]; // Filled arrowhead
      arrow.strokes = [{ type: "SOLID", color }];
      arrow.strokeWeight = strokeWeight;
      arrow.strokeCap = "ROUND";
      arrow.strokeJoin = "ROUND";
      arrow.name = "Arrowhead";
      // Append to the same parent as the coordinate system
      if (flowFrame) flowFrame.appendChild(arrow); else figma.currentPage.appendChild(arrow);
    }
  } else {
    // Vertical - with vertical segments at start and end
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    let pathData: string;
    
    // Track the actual end point of the path for arrowhead positioning
    let actualPathEnd = { x: end.x, y: end.y };
    let pathEndDirection = { x: 0, y: 1 }; // Default direction (down)
    
    // For BRANCH_LINE in vertical orientation: entry/exit points are always straight, curve only at midpoint if offset
    if (type === 'BRANCH_LINE') {
      // BRANCH_LINE connects event bottom center to variant top center
      // Entry point: straight vertical (90 degrees) from event bottom
      // Exit point: straight vertical (90 degrees) to variant top
      // Midpoint: curve only if nodes are offset horizontally
      const pathStartX = flowFrame ? start.x : startAbs.x;
      const pathStartY = flowFrame ? start.y : startAbs.y;
      const pathEndX = flowFrame ? end.x : endAbs.x;
      const pathEndY = flowFrame ? end.y : endAbs.y;
      
      const absDx = Math.abs(dx);
      
      // Magnet behavior: if nodes are horizontally aligned (X centers match), use straight vertical line
      if (absDx < 2) {
        // Horizontally aligned - straight vertical line (90 degrees at entry and exit)
        pathData = `M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathEndY}`;
        actualPathEnd = { x: endAbs.x, y: endAbs.y };
        pathEndDirection = { x: 0, y: Math.sign(pathEndY - pathStartY) }; // Straight vertical
      } else {
        // Not aligned - use midpoint curve with straight entry/exit segments
        // Calculate midpoint Y
        const midY = (pathStartY + pathEndY) / 2;
        const absDy = Math.abs(dy);
        
        // Corner radius scales with distance, max 20px
        const cornerRadius = Math.min(20, Math.min(absDx, absDy) * 0.4);
        
        // Path structure: 
        // 1. Straight vertical from entry (startY to midY - radius) - 90 degrees
        // 2. Curve from vertical to horizontal at midpoint
        // 3. Straight horizontal segment
        // 4. Curve from horizontal to vertical at midpoint  
        // 5. Straight vertical to exit (midY + radius to endY) - 90 degrees
        
        pathData = `M ${pathStartX} ${pathStartY}`;
        
        // Straight vertical segment from entry (90 degrees)
        const verticalEndY = midY - cornerRadius;
        pathData += ` L ${pathStartX} ${verticalEndY}`;
        
        // Curve from vertical to horizontal (at midpoint)
        // Control point creates smooth transition
        const horizontalStartX = dx > 0 
          ? pathStartX + cornerRadius  // Going right
          : pathStartX - cornerRadius; // Going left
        
        // Quadratic bezier: from (startX, midY - radius) via (startX, midY) to (startX ± radius, midY)
        pathData += ` Q ${pathStartX} ${midY} ${horizontalStartX} ${midY}`;
        
        // Straight horizontal segment
        const horizontalEndX = dx > 0
          ? pathEndX - cornerRadius  // Going right
          : pathEndX + cornerRadius; // Going left
        pathData += ` L ${horizontalEndX} ${midY}`;
        
        // Curve from horizontal to vertical (at midpoint)
        // Quadratic bezier: from (endX ± radius, midY) via (endX, midY) to (endX, midY + radius)
        pathData += ` Q ${pathEndX} ${midY} ${pathEndX} ${midY + cornerRadius}`;
        
        // Straight vertical segment to exit (90 degrees)
        pathData += ` L ${pathEndX} ${pathEndY}`;
        
        actualPathEnd = { x: endAbs.x, y: endAbs.y };
        pathEndDirection = { x: 0, y: Math.sign(pathEndY - pathStartY) }; // Exit is straight vertical
      }
    } else if (Math.abs(dx) < 1) {
      // Simple straight vertical line (for other connector types)
      // CRITICAL: Path must start and end at EXACT card edge coordinates
      // Use startAbs/endAbs directly to ensure precision (when flowFrame is undefined, start/end == startAbs/endAbs)
      const pathStartX = flowFrame ? start.x : startAbs.x;
      const pathStartY = flowFrame ? start.y : startAbs.y;
      const pathEndX = flowFrame ? end.x : endAbs.x;
      const pathEndY = flowFrame ? end.y : endAbs.y;
      
      pathData = `M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathEndY}`;
      // Actual path end is at the card edge
      // Use endAbs (absolute coordinates) for arrowhead positioning to ensure it's at the exact card edge
      actualPathEnd = { x: endAbs.x, y: endAbs.y };
      // Direction is vertical, pointing toward the card
      pathEndDirection = { x: 0, y: Math.sign(pathEndY - pathStartY) };
    } else {
      // For MERGE_LINE, use straight direct line
      // For PRIMARY_FLOW_LINE with horizontal displacement, use curved path
      if (type === 'MERGE_LINE') {
        // Straight direct line from card edge to card edge (no curves, no angles)
        // CRITICAL: Path must start and end at EXACT card edge coordinates
        const pathStartX = flowFrame ? start.x : startAbs.x;
        const pathStartY = flowFrame ? start.y : startAbs.y;
        const pathEndX = flowFrame ? end.x : endAbs.x;
        const pathEndY = flowFrame ? end.y : endAbs.y;
        
        // Simple straight line directly connecting the edges
        pathData = `M ${pathStartX} ${pathStartY} L ${pathEndX} ${pathEndY}`;
        
        // actualPathEnd is the exact card edge position
        actualPathEnd = { x: endAbs.x, y: endAbs.y };
        // Direction points directly toward the card
        const dx = pathEndX - pathStartX;
        const dy = pathEndY - pathStartY;
        const length = Math.sqrt(dx * dx + dy * dy);
        pathEndDirection = length > 0 ? { x: dx / length, y: dy / length } : { x: 0, y: 1 };
      } else {
        // Complex path with horizontal segment and rounded corners (for PRIMARY_FLOW_LINE with horizontal displacement)
        const radius = Math.min(Math.abs(dx) / 2, cornerRadius);
        
        // Calculate midpoint Y for the horizontal segment
        midY = start.y + dy * 0.5 + index * 12;
        
        // Build path: vertical down → curve → horizontal → curve → vertical down
        // CRITICAL: Path must start and end at EXACT card edge coordinates
        const pathStartX = flowFrame ? start.x : startAbs.x;
        const pathStartY = flowFrame ? start.y : startAbs.y;
        const pathEndX = flowFrame ? end.x : endAbs.x;
        const pathEndY = flowFrame ? end.y : endAbs.y;
        
        pathData = `M ${pathStartX} ${pathStartY}`;
        
        // Initial vertical segment - starts from card edge
        pathData += ` L ${pathStartX} ${midY - radius}`;
        
        // First corner: vertical to horizontal (going right or left)
        pathData += ` Q ${pathStartX} ${midY} ${pathStartX + radius * Math.sign(dx)} ${midY}`;
        
        // Horizontal segment
        pathData += ` L ${pathEndX - radius * Math.sign(dx)} ${midY}`;
        
        // Second corner: horizontal to vertical (going down)
        pathData += ` Q ${pathEndX} ${midY} ${pathEndX} ${midY + radius}`;
        
        // Final vertical segment - ends exactly at the card edge
        const finalSegmentStart = { x: pathEndX, y: midY + radius };
        pathData += ` L ${pathEndX} ${pathEndY}`;
        
        // actualPathEnd MUST be the exact card edge position (endAbs) for arrowhead positioning
        actualPathEnd = { x: endAbs.x, y: endAbs.y };
        // Direction is vertical, pointing toward the card (from final segment start to end)
        pathEndDirection = { x: 0, y: Math.sign(pathEndY - finalSegmentStart.y) };
      }
    }
    
    line = figma.createVector();
    line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
    line.strokes = [{ type: "SOLID", color }];
    line.strokeWeight = strokeWeight;
    line.strokeAlign = "CENTER";
    line.strokeCap = "ROUND";
    line.strokeJoin = "ROUND";
    if (style.dashPattern) line.dashPattern = style.dashPattern;
    line.name = `${type} Line`;
    // Append to the same parent as the coordinate system
    if (flowFrame) flowFrame.appendChild(line); else figma.currentPage.appendChild(line);
    
    // Arrowhead - only create for PRIMARY_FLOW_LINE (not for variant connectors)
    // Variant connectors (BRANCH_LINE, MERGE_LINE) connect directly without arrowheads
    if (type === 'PRIMARY_FLOW_LINE') {
      const arrowSize = 12; // Larger arrowhead for better visibility
      arrow = figma.createVector();
      
      // Calculate angle from the path end direction (points toward the card)
      const angle = Math.atan2(pathEndDirection.y, pathEndDirection.x);
      
      // The arrowhead tip should be exactly at the card edge (actualPathEnd)
      // actualPathEnd is already in absolute coordinates (from endAbs)
      // Vector paths in Figma use absolute coordinates when appended to page
      // Convert to relative only if appended to a flowFrame
      let tipX: number, tipY: number;
      let baseX1: number, baseY1: number;
      let baseX2: number, baseY2: number;
      let baseX3: number, baseY3: number;
      
      // Use endAbs directly (absolute card edge position) for arrowhead
      // This ensures the arrowhead tip is exactly at the card boundary
      if (flowFrame) {
        // Arrowhead is in flowFrame - convert absolute to relative coordinates
        const frameAbs = getAbsolutePos(flowFrame);
        tipX = endAbs.x - frameAbs.x;
        tipY = endAbs.y - frameAbs.y;
      } else {
        // Arrowhead is on page - use absolute coordinates directly from endAbs
        tipX = endAbs.x;
        tipY = endAbs.y;
      }
      
      // Base of arrowhead is offset inward from the tip along the direction vector
      // This ensures the arrowhead points toward the card center
      baseX1 = tipX - arrowSize * Math.cos(angle);
      baseY1 = tipY - arrowSize * Math.sin(angle);
      
      // Calculate perpendicular angle for base width
      const perpAngle = angle + Math.PI / 2;
      const halfWidth = arrowSize * 0.4;
      
      // Base points form a line perpendicular to the arrow direction
      baseX2 = baseX1 - halfWidth * Math.cos(perpAngle);
      baseY2 = baseY1 - halfWidth * Math.sin(perpAngle);
      baseX3 = baseX1 + halfWidth * Math.cos(perpAngle);
      baseY3 = baseY1 + halfWidth * Math.sin(perpAngle);
      
      // Create filled triangle path
      arrow.vectorPaths = [{
        windingRule: "NONZERO",
        data: `M ${tipX} ${tipY} L ${baseX2} ${baseY2} L ${baseX3} ${baseY3} Z`,
      }];
      arrow.fills = [{ type: "SOLID", color }]; // Filled arrowhead
      arrow.strokes = [{ type: "SOLID", color }];
      arrow.strokeWeight = strokeWeight;
      arrow.strokeCap = "ROUND";
      arrow.strokeJoin = "ROUND";
      arrow.name = "Arrowhead";
      // Append to the same parent as the coordinate system
      if (flowFrame) flowFrame.appendChild(arrow); else figma.currentPage.appendChild(arrow);
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
    notion?: string;
    amplitude?: string;
    asana?: string;
    linear?: string;
    slack?: string;
    github?: string;
    confluence?: string;
    trello?: string;
    monday?: string;
    clickup?: string;
    generic?: string;
  };
  outcomes?: {
    winningPaths?: Array<{ eventId: string; variantId: string }>;
    notes?: string;
    rolledoutVariantId?: string;  // ID of the rolled-out variant
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
function getConnectorStyle(
  type: ConnectorTypeV2, 
  options?: { 
    winner?: boolean; 
    variantColor?: string;
    rolledout?: boolean;  // NEW
  }
): ConnectorStyleConfig {
  // Prioritize rollout over winner for visual distinction
  if (options?.rolledout) {
    switch (type) {
      case 'PRIMARY_FLOW_LINE':
      case 'BRANCH_LINE':
      case 'MERGE_LINE':
        return {
          strokeWeight: 2,  // Medium thickness (between normal and winner)
          color: hexToRgb(TOKENS.electricViolet600), // Purple for rollout
          dashPattern: [6, 3], // Different dash pattern than winner (solid) and normal (dashed)
          arrowhead: true,
        };
      default:
        return {
          strokeWeight: 2,
          color: hexToRgb(TOKENS.electricViolet600),
          dashPattern: [6, 3],
          arrowhead: true,
        };
    }
  }
  
  // Winner styling (only if not rolled out)
  if (options?.winner) {
    switch (type) {
      case 'PRIMARY_FLOW_LINE':
        return {
          strokeWeight: 5,  // Thicker for winner
          color: hexToRgb(TOKENS.malachite600), // Green for winner
          dashPattern: undefined, // Solid line for winner
          arrowhead: true,
        };
      case 'BRANCH_LINE':
        return {
          strokeWeight: 4,
          color: hexToRgb(TOKENS.malachite600),
          dashPattern: undefined,
          arrowhead: true,
        };
      case 'MERGE_LINE':
        return {
          strokeWeight: 3,
          color: hexToRgb(TOKENS.malachite600),
          dashPattern: undefined,
          arrowhead: true,
        };
      default:
        return {
          strokeWeight: 4,
          color: hexToRgb(TOKENS.malachite600),
          dashPattern: undefined,
          arrowhead: true,
        };
    }
  }
  
  // Default styling
  switch (type) {
    case 'PRIMARY_FLOW_LINE':
      return {
        strokeWeight: 1,
        color: hexToRgb(TOKENS.azure300),
        dashPattern: [4, 4], // Dashed pattern
        arrowhead: true,
      };
    case 'BRANCH_LINE':
      return {
        strokeWeight: 1,
        color: hexToRgb(TOKENS.azure300),
        dashPattern: [4, 4], // Dashed pattern
        arrowhead: true,
      };
    case 'MERGE_LINE':
      return {
        strokeWeight: 1,
        color: hexToRgb(TOKENS.azure300),
        dashPattern: [4, 4], // Dashed pattern
        arrowhead: true,
      };
    default:
      return {
        strokeWeight: 4,
        color: hexToRgb(TOKENS.azure300),
        dashPattern: [4, 4],
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

export interface MetricDefinition {
  id: string;
  name: string;
  abbreviation?: string;
  min?: number;
  max?: number;
  isPrimary?: boolean;
}

export interface CreateFlowV2Payload {
  experiment: ExperimentV2;
  flow: FlowV2;
  metrics?: MetricDefinition[];
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
  [key: string]: number; // Dynamic metrics based on plugin configuration
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
import { createExperimentOutcomeCard, createOutcomeCardFromExperimentData } from './experiment-outcome-card';
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
          name: '', // BLANK NAME TO TRIGGER FALLBACK
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
    const dashPattern = options?.dashPattern ?? [4, 4];

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
    vector.strokeMiterLimit = 4;
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
      layout: { direction: 'HORIZONTAL', eventSpacing: 80, variantSpacing: 40 },
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
  async function createFlowV2FromData(experiment: ExperimentV2, flow: FlowV2, metrics?: MetricDefinition[]): Promise<void> {
    await loadFonts();

    // Remove any existing flow frames with the same name/id
    const flowFrameName = `Experiment Flow — ${experiment.name}`;
    const infoCardName = `Experiment Overview — ${experiment.name}`;
    const cardsContainerName = `Experiment Cards — ${experiment.name}`;
    const existingFlow = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === flowFrameName);
    if (existingFlow) existingFlow.remove();
    let infoCard = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === infoCardName) as FrameNode | undefined;
    if (infoCard) infoCard.remove();
    // Also remove existing cards container (info + outcome)
    const existingCardsContainer = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === cardsContainerName);
    if (existingCardsContainer) existingCardsContainer.remove();

    // Collect all variants from flow events for outcome card
    const allVariants: Array<{
      id?: string;
      key: string;
      name: string;
      description?: string;
      isControl?: boolean;
      traffic: number;
      status?: string;
      metrics?: { [key: string]: number };
      isRolledOut?: boolean;
      isStatSig?: boolean;
      color?: string;
    }> = [];
    
    for (const event of flow.events) {
      if (event.variants && event.variants.length > 0) {
        event.variants.forEach((variant, index) => {
          const rolledOutId = experiment.outcomes?.rolledoutVariantId;
          // Use isControl from variant data (single-select baseline in ui.html), only show baseline badge when explicitly true
          const finalIsControl = (variant as any).isControl === true ? true : false;
          allVariants.push({
            id: variant.id,
            key: variant.key,
            name: variant.name || `Variant ${variant.key}`,
            description: variant.description,
            // Use isControl from variant data (single-select baseline in ui.html), only show baseline badge when explicitly true
            isControl: finalIsControl,
            traffic: variant.traffic,
            metrics: variant.metrics,
            isRolledOut: rolledOutId === variant.id, // Check if this variant is the rolled out one
            isStatSig: (variant as any).isStatSig, // Pass statistical significance from UI
            color: (variant as any).color || variant.style?.variantColor, // Variant color for display
          });
        });
      }
    }

    // Safety: enforce AT MOST one baseline/control for the outcome card data.
    // If none is explicitly set, keep none (outcome card will fall back to first variant for comparison).
    if (allVariants.length > 0) {
      const firstControlIndex = allVariants.findIndex(v => v.isControl === true);
      const resolvedControlIndex = firstControlIndex >= 0 ? firstControlIndex : -1;
      allVariants.forEach((v, i) => {
        v.isControl = resolvedControlIndex >= 0 ? i === resolvedControlIndex : false;
      });
    }

    // Create experiment info card with two-panel structure (content + resources)
    infoCard = await createExperimentInfoCard(
      experiment.name,
      experiment.description || 'e.g., Testing if new CTA increases conversions.',
      experiment.links?.figma || '',
      experiment.links?.jira || '',
      experiment.links?.miro || '',
      experiment.links?.notion || '',
      experiment.links?.amplitude || '',
      experiment.links?.asana || '',
      experiment.links?.linear || '',
      experiment.links?.slack || '',
      experiment.links?.github || '',
      experiment.links?.confluence || '',
      experiment.links?.trello || '',
      experiment.links?.monday || '',
      experiment.links?.clickup || '',
      Array.isArray(experiment.links?.generic) ? experiment.links.generic : [],
      metrics,
      (experiment as any).status || 'running',
      {
        showOutcomeCard: allVariants.length > 0,
        variants: allVariants,
        owner: (experiment as any).owner,
        audience: (experiment as any).audience,
        experimentType: (experiment as any).experimentType,
        hypothesis: (experiment as any).hypothesis,
        startDate: (experiment as any).startDate,
        endDate: (experiment as any).endDate,
        totalSampleSize: (experiment as any).sampleSize,
        confidenceLevel: (experiment as any).confidenceLevel,
        primaryMetric: (() => {
          // Find the metric marked as primary, or fall back to first metric
          const primaryMetricDef = metrics?.find(m => m.isPrimary) || (metrics && metrics.length > 0 ? metrics[0] : undefined);
          if (!primaryMetricDef) return undefined;
          return primaryMetricDef.abbreviation?.toLowerCase() || primaryMetricDef.name.replace(/\s+/g, '_').toLowerCase();
        })(),
        rolledOutVariantName: (() => {
          // Find the rolled out variant name from the outcomes
          const rolledOutId = experiment.outcomes?.rolledoutVariantId;
          if (!rolledOutId) return undefined;
          const rolledOutVariant = allVariants.find(v => v.id === rolledOutId);
          return rolledOutVariant?.name;
        })(),
        rolledOutVariantColor: (() => {
          // Find the rolled out variant color from the outcomes
          const rolledOutId = experiment.outcomes?.rolledoutVariantId;
          if (!rolledOutId) return undefined;
          const rolledOutVariant = allVariants.find(v => v.id === rolledOutId);
          return rolledOutVariant?.color;
        })(),
      }
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
    const eventSpacing = flow.layout?.eventSpacing ?? 80;
    const variantSpacing = flow.layout?.variantSpacing ?? 40; // Horizontal spacing between variants
    const eventToVariantSpacing = 100; // Vertical spacing between event and variant row
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

    // --- Pre-calculate variant widths ---
    // First, create all variant cards off-screen to measure their widths
    // This allows us to calculate proper spacing between events with variants
    const variantWidthsByEvent: Map<string, number> = new Map();
    const variantCardsByEvent: Map<string, FrameNode[]> = new Map();
    
    // Generate metric key from abbreviation or name (same logic as UI)
    const getMetricKey = (metric: MetricDefinition): string => {
      if (metric.abbreviation) {
        return metric.abbreviation.toLowerCase();
      }
      return metric.name.replace(/\s+/g, '_').toLowerCase();
    };
    
    for (const event of flow.events) {
      if (event.variants && event.variants.length > 0) {
        let totalVariantWidth = 0;
        const variantCards: FrameNode[] = [];
        
        for (const [vIdx, variant] of event.variants.entries()) {
          const safeVariantName = typeof variant.name === 'string' && variant.name.trim().length > 0
            ? variant.name
            : `Variant ${vIdx + 1}`;
          
          const variantColor = (variant as any).color || variant.style?.variantColor;
          
          // Check if this variant is rolled out
          const isRolledout = experiment.outcomes?.rolledoutVariantId === variant.id;
          
          const variantForCard = {
            ...variant,
            name: safeVariantName,
            status: isRolledout ? 'winner' : ((variant as any).status || 'none'),
            metrics: variant.metrics || {},
            color: variantColor,
          };
          
          const variantCard = await createVariantCard(variantForCard, vIdx, { 
            rolledout: isRolledout,
            metrics: metrics
          });
          // Position off-screen temporarily to measure width
          variantCard.x = -10000;
          variantCard.y = -10000;
          figma.currentPage.appendChild(variantCard);
          
          // Calculate total width including spacing between variants
          if (vIdx > 0) {
            totalVariantWidth += variantSpacing;
          }
          totalVariantWidth += variantCard.width;
          variantCards.push(variantCard);
        }
        
        variantWidthsByEvent.set(event.id, totalVariantWidth);
        variantCardsByEvent.set(event.id, variantCards);
      }
    }

    // --- Event Nodes ---
    // Place event nodes directly on page with manual positioning for magnetized connectors
    let currentX = baseX + entryCard.width + eventSpacing;
    let maxEventHeight = 0;
    
    // Store event positions for variant placement
    const eventPositions: {event: any, eventCard: any, x: number, y: number}[] = [];
    
    for (const [eventIdx, event] of flow.events.entries()) {
      const safeEventName = typeof event.name === 'string' && event.name.trim().length > 0
        ? event.name
        : `Step ${eventIdx + 1}`;
      
      // Create event card
      const eventCard = createEventCard(safeEventName, event.variants?.length ?? 0);
      eventCard.name = `Step: ${safeEventName}`;
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
      
      // Calculate spacing: use the maximum of event width and variant row width
      // Add extra spacing when event has variants to prevent overlap
      const eventWidth = eventCard.width;
      const variantRowWidth = variantWidthsByEvent.get(event.id) || 0;
      const effectiveWidth = Math.max(eventWidth, variantRowWidth);
      const extraSpacingForVariants = event.variants && event.variants.length > 0 ? eventSpacing * 0.5 : 0; // Add 50% more spacing when variants exist
      
      // Move to next event position with spacing that accounts for variants
      currentX += effectiveWidth + eventSpacing + extraSpacingForVariants;
    }

    // --- Variants ---
    // Position pre-created variant cards below their events
    for (const {event, eventCard, x: eventX, y: eventY} of eventPositions) {
      const variantCards = variantCardsByEvent.get(event.id);
      if (variantCards && variantCards.length > 0) {
        let variantX = eventX;
        const variantY = eventY + eventCard.height + eventToVariantSpacing;
        
        for (const [vIdx, variantCard] of variantCards.entries()) {
          const variant = event.variants[vIdx];
          const safeVariantName = typeof variant.name === 'string' && variant.name.trim().length > 0
            ? variant.name
            : `Variant ${vIdx + 1}`;
          
          // Set variant card metadata (if not already set)
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
    
    // --- Vertical Alignment: Center Entry and Exit nodes with Event nodes ---
    // Find the maximum height among all spine nodes (Entry, Events, Exit)
    const spineNodes = [entryCard, ...eventPositions.map(ep => ep.eventCard), exitCard];
    const maxSpineHeight = Math.max(...spineNodes.map(n => n.height));
    
    // Center Entry node vertically
    const entryCenterOffset = (maxSpineHeight - entryCard.height) / 2;
    entryCard.y = baseY + entryCenterOffset;
    
    // Center Event nodes vertically and adjust their variants
    for (const {event, eventCard} of eventPositions) {
      const oldEventY = eventCard.y;
      const eventCenterOffset = (maxSpineHeight - eventCard.height) / 2;
      const newEventY = baseY + eventCenterOffset;
      eventCard.y = newEventY;
      
      // Update variant positions to match the event's new Y position
      if (event.variants && event.variants.length > 0) {
        const yDelta = newEventY - oldEventY;
        for (const variant of event.variants) {
          const variantNode = allNodes.find(n => n.id === variant.id);
          if (variantNode) {
            variantNode.node.y += yDelta;
          }
        }
      }
    }
    
    // Center Exit node vertically
    const exitCenterOffset = (maxSpineHeight - exitCard.height) / 2;
    exitCard.y = baseY + exitCenterOffset;

    // --- Build node map for connector rendering ---
    // Nodes are already on the page, just build the map
    const nodeMap: Record<string, SceneNode & { width: number; height: number }> = {};
    for (const {node, id} of allNodes) {
      nodeMap[id] = node;
    }
    
    // InfoCard positioning (if it exists)
    if (infoCard) {
      if (infoCard.parent === null) {
        infoCard.x = 100;
        infoCard.y = center.y;
        figma.currentPage.appendChild(infoCard);
      }
      console.log('Info card created:', {
        name: infoCard.name,
        width: infoCard.width,
        height: infoCard.height,
        x: infoCard.x,
        y: infoCard.y,
        hasParent: infoCard.parent !== null
      });
    } else {
      console.error('Info card was not created!');
    }
    
    // Wait for layout to settle before drawing connectors
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // --- Render Dynamic Connectors ---
    // Uses createDynamicConnector() which:
    // 1. Tries native ConnectorNode first (automatically updates when nodes move!)
    // 2. Falls back to VectorNode if native connectors aren't available
    // For VectorNode connectors, use refreshConnectors() or send 'refresh-connectors' message to update positions
    const createdConnectors: SceneNode[] = [];
    
    console.log('=== CONNECTOR RENDERING ===');
    console.log('Flow has connectors:', flow.connectors?.length || 0);
    console.log('NodeMap keys:', Object.keys(nodeMap));
    
    if (flow.connectors && Array.isArray(flow.connectors) && flow.connectors.length > 0) {
      // Group merge connectors by destination event for merge+trunk pattern
      const mergeGroups = new Map<string, ConnectorV2[]>();
      const directConnectors: ConnectorV2[] = []; // PRIMARY_FLOW_LINE and BRANCH_LINE use direct connections
      
      for (const connector of flow.connectors) {
        if (connector.type === 'MERGE_LINE') {
          const toId = connector.to.id;
          if (!mergeGroups.has(toId)) {
            mergeGroups.set(toId, []);
          }
          mergeGroups.get(toId)!.push(connector);
        } else {
          // PRIMARY_FLOW_LINE and BRANCH_LINE use direct connections (no grouping)
          directConnectors.push(connector);
        }
      }
      
      // Render direct connectors (PRIMARY_FLOW_LINE and BRANCH_LINE)
      for (const connector of directConnectors) {
        console.log(`Processing connector: ${connector.type} from ${connector.from.id} to ${connector.to.id}`);
        
        const fromNode = nodeMap[connector.from.id];
        const toNode = nodeMap[connector.to.id];
        
        console.log('From node found:', !!fromNode, fromNode?.name);
        console.log('To node found:', !!toNode, toNode?.name);
        
        if (fromNode && toNode) {
          try {
            // Check if this connector involves a rolled-out variant (which is the winner)
            const fromNodeId = connector.from.id;
            const toNodeId = connector.to.id;
            const rolledoutVariantId = experiment.outcomes?.rolledoutVariantId;
            const isRolledout = rolledoutVariantId && (fromNodeId === rolledoutVariantId || toNodeId === rolledoutVariantId);
            // Rolled-out variant is the winner, but rollout styling takes priority
            const isWinner = isRolledout || false;
            
            // Use dynamic connector (tries native ConnectorNode first, falls back to VectorNode)
            const connectorNode = createDynamicConnector(
              fromNode,
              toNode,
              connector.type,
              {
                label: connector.label,
                winner: isWinner, // Rolled-out variant is the winner
                variantColor: undefined,
                index: 0,
                rolledout: isRolledout || false,  // Rollout styling takes priority over winner
                useNativeConnector: true, // Try native connectors for automatic updates
              }
            );
            
            if (connectorNode) {
              // Store additional metadata on the connector
              const existingMeta = connectorNode.getPluginData('connectorMeta');
              let meta = existingMeta ? JSON.parse(existingMeta) : {};
              meta = {
                ...meta,
                connectorId: connector.id,
                fromNodeType: connector.from.nodeType,
                toNodeType: connector.to.nodeType,
                experimentId: experiment.id,
              };
              connectorNode.setPluginData('connectorMeta', JSON.stringify(meta));
              
              // Name the connector for easy identification
              if (!connectorNode.name.includes('Dynamic') && !connectorNode.name.includes('Static')) {
                connectorNode.name = `${connector.type}: ${connector.from.nodeType} → ${connector.to.nodeType}`;
              }
              
              console.log('✓ Connector created:', connectorNode.name, connectorNode.type === 'CONNECTOR' ? '(Native - Auto-updates!)' : '(Vector - Use refresh to update)');
              
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
      
      // Render merge connectors as merge+trunk groups
      for (const [targetId, merges] of mergeGroups.entries()) {
        console.log(`Processing merge group to ${targetId} from ${merges.length} variants`);
        
        const targetNode = nodeMap[targetId];
        if (!targetNode) {
          console.warn('✗ Target node not found for merge group:', targetId);
          continue;
        }
        
        // Get all variant nodes for this merge group
        const variantNodes = merges
          .map(m => ({ connector: m, node: nodeMap[m.from.id] }))
          .filter(v => v.node !== undefined) as Array<{ connector: ConnectorV2; node: SceneNode & { width: number; height: number } }>;
        
        if (variantNodes.length === 0) {
          console.warn('✗ No variant nodes found for merge group');
          continue;
        }
        
        try {
          // Create merge+trunk structure (variants → trunk → target)
          const mergeConnectors = createMergingTree(variantNodes, targetNode, experiment.id);
          createdConnectors.push(...mergeConnectors);
          console.log(`✓ Created merge+trunk with ${mergeConnectors.length} elements`);
        } catch (error) {
          console.error('ERROR creating merge group:', error);
        }
      }
    } else {
      console.warn('No connectors in flow.connectors array');
    }
    
    // Notify user
    console.log('=== CONNECTOR SUMMARY ===');
    console.log('Total connectors created:', createdConnectors.length);
    
    if (createdConnectors.length > 0) {
      const nativeCount = createdConnectors.filter(c => c.type === 'CONNECTOR').length;
      const vectorCount = createdConnectors.length - nativeCount;
      let message = `Created ${createdConnectors.length} connector${createdConnectors.length !== 1 ? 's' : ''}`;
      if (nativeCount > 0) {
        message += ` (${nativeCount} dynamic${nativeCount !== 1 ? 's' : ''} - auto-update when cards move)`;
      }
      if (vectorCount > 0) {
        if (isFigJam()) {
          message += `. ${vectorCount} static connector${vectorCount !== 1 ? 's' : ''} - use "Refresh Connectors" to update`;
        } else {
          message += `. ${vectorCount} connector${vectorCount !== 1 ? 's' : ''} - auto-refreshing when cards move`;
        }
      }
      figma.notify(message);
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

    // Outcome Note removed

    figma.notify('Experiment flow v2: nodes, connectors, and entry notes created.');
    
    // Set up auto-refresh for connectors in regular Figma
    // (In FigJam, native connectors auto-update, so this isn't needed)
    setupAutoRefreshConnectors().catch(err => {
      console.error('Error setting up auto-refresh:', err);
    });
  }

  figma.ui.onmessage = async (msg: PluginMessage | PluginMessageV2 | { type: string; width?: number; height?: number }) => {
    // Handle UI resize
    if (msg.type === 'resize-ui') {
      const resizeMsg = msg as { type: string; width?: number; height?: number };
      if (typeof resizeMsg.width === 'number' && typeof resizeMsg.height === 'number') {
        figma.ui.resize(resizeMsg.width, resizeMsg.height);
      }
      return;
    }

    if (msg.type === 'create-flow-v2' && 'payload' in msg && msg.payload) {
      figma.notify('Handler: create-flow-v2 (NEW SCHEMA)');
      console.log('Handler: create-flow-v2 (NEW SCHEMA)');
      // --- NEW V2 FLOW HANDLER ---
      const { experiment, flow, metrics } = msg.payload as CreateFlowV2Payload;
      await createFlowV2FromData(experiment, flow, metrics);
    }
    
    if (msg.type === 'refresh-connectors') {
      console.log('Manual refresh requested');
      await refreshConnectors();
    }

    // --- OLD HANDLERS BELOW ---
    if (msg.type === 'delete-experiment-flows') {
      deleteExperimentFlowFrames();
      figma.notify('Experiment Flow frames deleted (if any were found).');
      return;
    }


    if (msg.type === 'create-flow' && 'payload' in msg && msg.payload) {
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
      if (!('payload' in msg) || !msg.payload) {
        figma.notify('Please fill the experiment form and click \"Create from selection\" again.');
        return;
      }
      const payload = (msg as PluginMessage).payload;
      if (!payload) return;
      const { experimentName, roundNumber, entryLabel, exitLabel, variants } = payload as any;

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
        entryCard = await createVariantCard(matchingVariant);
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
      roundContainer.itemSpacing = 24;
      roundContainer.paddingLeft = roundContainer.paddingRight = 24;
      roundContainer.paddingTop = roundContainer.paddingBottom = 24;
      roundContainer.cornerRadius = 24;
      roundContainer.fills = [{ type: 'SOLID', color: hexToRgb(TOKENS.royalBlue600) }];
      roundContainer.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
      roundContainer.strokeWeight = 1;

      const variantNodes: FrameNode[] = [];
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        const card = await createVariantCard(v);
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
      line.strokeCap = "ROUND";
      line.strokeJoin = "ROUND";
      line.dashPattern = [4, 4];
      line.name = "Flow Line";
      if (flowFrame) flowFrame.appendChild(line); else figma.currentPage.appendChild(line);
      if (options?.label) {
        // Removed Pill: label chip
      }
      // Arrowhead - chevron (open caret)
      arrow = figma.createVector();
      const size = 10;
      const arrowX = end.x - size * Math.sign(end.x - start.x);
      arrow.vectorPaths = [
        {
          windingRule: "NONZERO",
          data: `M ${end.x} ${end.y} L ${arrowX} ${end.y - size / 2} M ${end.x} ${end.y} L ${arrowX} ${end.y + size / 2}`,
        },
      ];
      arrow.fills = [];
      arrow.strokes = [{ type: "SOLID", color }];
      arrow.strokeWeight = strokeWeight;
      arrow.strokeCap = "ROUND";
      arrow.strokeJoin = "ROUND";
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
      line.strokeCap = "ROUND";
      line.strokeJoin = "ROUND";
      line.dashPattern = [4, 4];
      line.name = "Flow Line";
      if (flowFrame) flowFrame.appendChild(line); else figma.currentPage.appendChild(line);
      if (options?.label) {
        // Removed Pill: label chip
      }
      // Arrowhead - chevron (open caret)
      arrow = figma.createVector();
      const size = 10;
      const arrowY = end.y - size * Math.sign(end.y - start.y);
      arrow.vectorPaths = [
        {
          windingRule: "NONZERO",
          data: `M ${end.x} ${end.y} L ${end.x - size / 2} ${arrowY} M ${end.x} ${end.y} L ${end.x + size / 2} ${arrowY}`,
        },
      ];
      arrow.fills = [];
      arrow.strokes = [{ type: "SOLID", color }];
      arrow.strokeWeight = strokeWeight;
      arrow.strokeCap = "ROUND";
      arrow.strokeJoin = "ROUND";
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