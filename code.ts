// ...existing code...
  import { createExperimentInfoCard } from './experiment-info-card';
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
          color: '#2563eb', // THIS IS THE COLOR FOR THIS VARIANT IN AN EVENT CARD
          traffic: 50, // THIS IS THE TRAFFIC PERCENTAGE FOR THIS VARIANT IN AN EVENT CARD
          status: 'none' as VariantStatus, // THIS IS THE STATUS FOR THIS VARIANT IN AN EVENT CARD
          metrics: { ctr: 0.695, cr: 0.425, su: 0.0 } // THIS IS THE METRICS FOR THIS VARIANT IN AN EVENT CARD
        },
        {
          key: 'B', // THIS IS A VARIANT KEY IN AN VARIANT CARD, RELATED TO AN EVENT
          name: 'Variation A',  // THIS IS A VARIANT NAME IN AN VARIANT CARD, RELATED TO AN EVENT
          description: 'New CTA button design', // THIS IS A VARIANT DESCRIPTION IN AN VARIANT CARD, RELATED TO AN EVENT  
          color: '#0eab43', // THIS IS THE COLOR FOR THIS VARIANT IN AN EVENT CARD
          traffic: 30, // THIS IS THE TRAFFIC PERCENTAGE FOR THIS VARIANT IN AN EVENT CARD  
          status: 'running' as VariantStatus, // THIS IS THE STATUS FOR THIS VARIANT IN AN EVENT CARD
          metrics: { ctr: 0.725, cr: 0.480, su: 0.0 } // THIS IS THE METRICS FOR THIS VARIANT IN AN EVENT CARD
        },
        {
          key: 'C', // THIS IS A VARIANT KEY IN AN VARIANT CARD, RELATED TO AN EVENT
          name: 'Variation B', // THIS IS A VARIANT NAME IN AN VARIANT CARD, RELATED TO AN EVENT
          description: 'CTA with icon', // THIS IS A VARIANT DESCRIPTION IN AN VARIANT CARD, RELATED TO AN EVENT
          color: '#f59e42', // THIS IS THE COLOR FOR THIS VARIANT IN AN EVENT CARD
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
  async function createSampleFlowFromData() {
    await loadFonts();
    const experimentInfoCard = await createExperimentInfoCard(
      'Sample Experiment',
      'This is a sample experiment info card.',
      '', '', ''
    );
    experimentInfoCard.name = 'Experiment Info — sample-experiment';

    const flowFrame = figma.createFrame();
    flowFrame.name = 'Sample Experiment Flow';
    flowFrame.layoutMode = 'HORIZONTAL';
    flowFrame.counterAxisSizingMode = 'AUTO';
    flowFrame.primaryAxisSizingMode = 'AUTO';
    flowFrame.itemSpacing = 48;
    flowFrame.paddingLeft = flowFrame.paddingRight = 48;
    flowFrame.paddingTop = flowFrame.paddingBottom = 48;
    flowFrame.fills = [];
    flowFrame.cornerRadius = 24;

    for (const [i, event] of sampleEvents.entries()) {
      // Event Card (ungrouped)
      const eventCard = createEventCard(event.name);
      flowFrame.appendChild(eventCard);

      // Add variant cards directly to flowFrame (ungrouped)
      if (event.hasVariants && event.variants.length > 0) {
        for (let v = 0; v < event.variants.length; v++) {
          const variant = event.variants[v];
          const variantCard = createVariantCard(variant, v);
          flowFrame.appendChild(variantCard);
        }
      }
    }

    // Position and append to canvas
    const center = figma.viewport.center;
    let totalWidth = flowFrame.width;
    if (experimentInfoCard) totalWidth += experimentInfoCard.width + 48;
    let startX = center.x - totalWidth / 2;

    if (experimentInfoCard) {
      experimentInfoCard.x = startX;
      experimentInfoCard.y = center.y - experimentInfoCard.height / 2;
      figma.currentPage.appendChild(experimentInfoCard);
      startX += experimentInfoCard.width + 48;
    }
    flowFrame.x = startX;
    flowFrame.y = center.y - flowFrame.height / 2;
    figma.currentPage.appendChild(flowFrame);
    figma.currentPage.selection = [flowFrame];
    figma.viewport.scrollAndZoomIntoView([flowFrame, experimentInfoCard]);
  }

  // Uncomment to auto-run sample flow on plugin open:
  // createSampleFlowFromData();

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

  function createNodeCard(title: string, subtitle?: string, trafficLabel?: string): FrameNode {
    const card = figma.createFrame();
    card.layoutMode = 'VERTICAL';
    card.counterAxisSizingMode = 'AUTO';
    card.primaryAxisSizingMode = 'AUTO';
    card.paddingLeft = card.paddingRight = 20;
    card.paddingTop = card.paddingBottom = 16;
    card.cornerRadius = 16;
    card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    card.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
    card.strokeWeight = 1;
    card.name = title ? `Node: ${title}` : 'Node';

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
    titleText.fontSize = 18;
    titleText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.3 } }];
    titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
    titleText.characters = title && title.length > 0 ? title : '';
    topRow.appendChild(titleText);

    if (trafficLabel) {
      // Removed Pill: traffic chip
    }
    card.appendChild(topRow);

    const thumb = figma.createFrame();
    thumb.resize(240, 140);
    thumb.cornerRadius = 12;
    thumb.fills = [{ type: 'SOLID', color: { r: 0.93, g: 0.95, b: 0.99 } }];
    thumb.strokes = [{ type: 'SOLID', color: { r: 0.85, g: 0.9, b: 1 } }];
      if (trafficLabel) {
        // Removed Pill: traffic chip
      const subtitleText = figma.createText();
      subtitleText.fontName = { family: "Figtree", style: "Regular" };
      subtitleText.fontSize = 14;
      subtitleText.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.5 } }];
      subtitleText.textAutoResize = 'WIDTH_AND_HEIGHT';
      subtitleText.characters = subtitle && subtitle.length > 0 ? subtitle : '';
      card.appendChild(subtitleText);
    }
    return card;
  }

  figma.ui.onmessage = async (msg: PluginMessage | PluginMessageV2) => {
    if (msg.type === 'create-flow-v2' && msg.payload) {
      figma.notify('Handler: create-flow-v2 (NEW SCHEMA)');
      console.log('Handler: create-flow-v2 (NEW SCHEMA)');
      // --- NEW V2 FLOW HANDLER ---
      const { experiment, flow } = msg.payload as CreateFlowV2Payload;
      await loadFonts();

      // Remove any existing flow frames with the same name/id
      const flowFrameName = `NEW NEW NEW Experiment Flow — ${experiment.name} — Round ${experiment.roundNumber}`;
      const infoCardName = `NEW NEW NEW Experiment Info — ${experiment.name}`;
      const existingFlow = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === flowFrameName);
      if (existingFlow) existingFlow.remove();
      let infoCard = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === infoCardName) as FrameNode | undefined;
      if (infoCard) infoCard.remove();

      // Create experiment info card (optional, for context)
      infoCard = await createExperimentInfoCard(
        experiment.name,
        experiment.description || '',
        experiment.links?.figma || '',
        experiment.links?.jira || '',
        experiment.links?.miro || ''
      );
      attachNodeMeta(infoCard, {
        name: infoCardName,
        type: 'frame' as CanvasNodeType,
        description: experiment.description || '',
        extra: { experimentId: experiment.id, role: 'experiment-info' },
      });

      // Create main flow frame (spine) - HORIZONTAL LAYOUT
      const flowFrameMeta = {
        name: flowFrameName,
        type: 'frame' as const,
        experimentId: experiment.id,
        roundNumber: experiment.roundNumber,
        role: 'experiment-flow',
      };
      const flowFrame = createFrame(flowFrameMeta, {
        layoutMode: 'HORIZONTAL', // Force horizontal layout for event spine
        itemSpacing: flow.layout?.eventSpacing ?? 160, // Wider spacing for horizontal
        padding: 32,
        paddingLeft: 48,
        paddingRight: 48,
        fills: [{ type: 'SOLID', color: hexToRgb(TOKENS.fillsBackground) }],
        cornerRadius: 24,
        extra: {
          primaryAxisSizingMode: 'AUTO',
          counterAxisSizingMode: 'AUTO',
        },
      });

      // --- Entry Node ---
      const entry = flow.entry;
      const entryCard = createNodeCard(entry.label, undefined, undefined);
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
      flowFrame.appendChild(entryCard);

      // --- Event Nodes + Variants ---
      // Lay out eventGroups side by side in flowFrame (horizontal auto layout will do this)
      for (const event of flow.events) {
        // ...existing code for eventGroup creation...
        const safeEventName = typeof event.name === 'string' && event.name.trim().length > 0
          ? event.name
          : `Event ${flow.events.indexOf(event) + 1}`;
        const eventGroup = figma.createFrame();
        eventGroup.layoutMode = 'VERTICAL';
        eventGroup.counterAxisSizingMode = 'AUTO';
        eventGroup.primaryAxisSizingMode = 'AUTO';
        eventGroup.itemSpacing = flow.layout?.variantSpacing ?? 32;
        eventGroup.paddingLeft = eventGroup.paddingRight = 0;
        eventGroup.paddingTop = eventGroup.paddingBottom = 0;
        eventGroup.fills = [];
        eventGroup.strokes = [];
        eventGroup.name = `EventGroup: ${safeEventName}`;
        eventGroup.resizeWithoutConstraints(220, 300);

        const eventCard = createEventCard(safeEventName);
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
        eventGroup.appendChild(eventCard);

        if (event.variants && event.variants.length > 0) {
          const variantsContainer = figma.createFrame();
          variantsContainer.layoutMode = 'VERTICAL';
          variantsContainer.counterAxisSizingMode = 'AUTO';
          variantsContainer.primaryAxisSizingMode = 'AUTO';
          variantsContainer.itemSpacing = flow.layout?.variantSpacing ?? 24;
          variantsContainer.paddingLeft = variantsContainer.paddingRight = 0;
          variantsContainer.paddingTop = variantsContainer.paddingBottom = 0;
          variantsContainer.fills = [];
          variantsContainer.strokes = [];
          variantsContainer.name = `Variants: ${safeEventName}`;
          for (const [vIdx, variant] of event.variants.entries()) {
            const safeVariantName = typeof variant.name === 'string' && variant.name.trim().length > 0
              ? variant.name
              : `Variant ${String.fromCharCode(65 + vIdx)}`;
            const variantForCard = {
              ...variant,
              name: safeVariantName,
              status: (variant as any).status || 'none',
              metrics: variant.metrics || { ctr: 0, cr: 0, su: 0 },
            };
            const variantCard = createVariantCard(variantForCard, vIdx);
            variantCard.name = `Variant: ${safeVariantName}`;
            variantCard.resizeWithoutConstraints(180, 80);
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
            variantsContainer.appendChild(variantCard);
          }
          eventGroup.appendChild(variantsContainer);
        }
        flowFrame.appendChild(eventGroup);
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
      // Always place exit node at the end of the spine (rightmost in horizontal layout)
      // Remove and re-append to ensure it's last
      if (flowFrame.children.length > 0 && flowFrame.children[flowFrame.children.length - 1] !== exitCard) {
        if (exitCard.parent) exitCard.remove();
        flowFrame.appendChild(exitCard);
      }

      // --- Position and append to canvas ---

      const center = figma.viewport.center;
      const gap = 100;
      // Always append both to the canvas before setting positions
      if (infoCard && infoCard.parent === null) {
        figma.currentPage.appendChild(infoCard);
      }
      if (flowFrame && flowFrame.parent === null) {
        figma.currentPage.appendChild(flowFrame);
      }
      // Guarantee both are visible and never overlap by enforcing a minimum width
      const minInfoWidth = 240;
      const minFlowWidth = 600;
      const infoWidth = infoCard ? Math.max(infoCard.width, minInfoWidth) : minInfoWidth;
      const infoHeight = infoCard ? infoCard.height : 0;
      const flowWidth = Math.max(flowFrame.width, minFlowWidth);
      const flowHeight = flowFrame.height;
      const totalWidth = infoWidth + gap + flowWidth;
      const startX = center.x - totalWidth / 2;
      const sharedY = center.y;
      if (infoCard) {
        infoCard.x = 100;
        infoCard.y = sharedY - infoHeight / 2;
        if (infoCard.width < minInfoWidth) infoCard.resizeWithoutConstraints(minInfoWidth, infoCard.height);
      }
      if (flowFrame) {
        flowFrame.x = 450;
        flowFrame.y = sharedY - flowHeight / 2;
        if (flowFrame.width < minFlowWidth) flowFrame.resizeWithoutConstraints(minFlowWidth, flowFrame.height);
      }

      // Align all eventGroups (children of flowFrame) to the shared Y axis
      // No manual y alignment needed; horizontal auto layout will handle side-by-side arrangement

      // --- Force Figma to update layout before drawing connectors ---
      // This ensures all node positions are correct for absolute connector lines
      await new Promise(resolve => setTimeout(resolve, 0));
      figma.viewport.scrollAndZoomIntoView([flowFrame]);

      figma.currentPage.selection = [flowFrame];
      if (infoCard) {
        figma.viewport.scrollAndZoomIntoView([flowFrame, infoCard]);
      } else {
        figma.viewport.scrollAndZoomIntoView([flowFrame]);
      }

      // --- Entry Notes Rendering ---
      // In v2 schema, entry notes may be on flow.entryNotes or experiment.flow.entryNotes or not present
      const entryNotesV2 = (flow as any).entryNotes || (experiment as any).entryNotes || [];
      // Build nodeMap for anchor lookup (always available)
      const nodeMap: Record<string, SceneNode> = {};
      nodeMap[flow.entry.id] = flowFrame.children[0];
      let eventIdx = 1;
      for (const event of flow.events) {
        nodeMap[event.id] = flowFrame.children[eventIdx];
        eventIdx++;
      }
      nodeMap[flow.exit.id] = flowFrame.children[flowFrame.children.length - 1];
      if (Array.isArray(entryNotesV2)) {
        for (const note of entryNotesV2) {
          // Create a sticky note frame
          const noteFrame = figma.createFrame();
          noteFrame.layoutMode = 'VERTICAL';
          noteFrame.counterAxisSizingMode = 'AUTO';
          noteFrame.primaryAxisSizingMode = 'AUTO';
          noteFrame.paddingLeft = noteFrame.paddingRight = 12;
          noteFrame.paddingTop = noteFrame.paddingBottom = 8;
          noteFrame.cornerRadius = 8;
          noteFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 0.7 } }];
          noteFrame.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.8, b: 0.2 } }];
          noteFrame.strokeWeight = 1;
          noteFrame.name = `EntryNote: ${note.text}`;

          const noteText = figma.createText();
          noteText.fontName = { family: 'Figtree', style: 'Regular' };
          noteText.fontSize = 13;
          noteText.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.2, b: 0.1 } }];
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
            anchorNode = nodeMap[anchorId];
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
            // Default: place near flowFrame
            noteFrame.x = flowFrame.x - 60;
            noteFrame.y = flowFrame.y - 60;
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

        // Place outcome note above the flowFrame
        outcomeFrame.x = flowFrame.x + flowFrame.width / 2 - 80;
        outcomeFrame.y = flowFrame.y - 80;
        figma.currentPage.appendChild(outcomeFrame);
      }

      figma.notify('Experiment flow v2: nodes, connectors, entry notes, and outcomes created.');
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

      await loadFonts();

      function slugify(str: string): string {
        return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      const slug = slugify(experimentName);
      const flowFrameName = `Experiment Flow — ${slug} — Round ${roundNumber}`;
      const infoCardName = `Experiment Info — ${slug}`;

      const existingFlow = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === flowFrameName);
      if (existingFlow) existingFlow.remove();

      let infoCard = figma.currentPage.findOne(n => n.type === 'FRAME' && n.name === infoCardName) as FrameNode | undefined;
      if (infoCard) infoCard.remove();
      infoCard = await createExperimentInfoCard(
        experimentName,
        experimentDescription || '',
        figmaLink || '',
        jiraLink || '',
        miroLink || ''
      );
      attachNodeMeta(infoCard, {
        name: infoCardName,
        type: 'frame' as CanvasNodeType,
        description: experimentDescription || '',
        extra: { experimentName, role: 'experiment-info' },
      });

      const flowFrameMeta = {
        name: flowFrameName,
        type: 'frame' as const,
        experimentName,
        roundNumber,
        role: 'experiment-flow',
      };
      let flowFrame = createFrame(flowFrameMeta, {
        layoutMode: 'HORIZONTAL',
        itemSpacing: 64,
        padding: 32,
        paddingLeft: 48,
        paddingRight: 48,
        fills: [{ type: 'SOLID', color: hexToRgb(TOKENS.royalBlue600) }],
        cornerRadius: 24,
        // Ensure hugging content
        extra: {
          primaryAxisSizingMode: 'AUTO',
          counterAxisSizingMode: 'AUTO'
        }
      });


      const entryCard = createNodeCard(entryLabel, undefined, '100%');
      entryCard.name = 'Entry Node';
      attachNodeMeta(entryCard, {
        name: entryLabel,
        type: 'frame' as CanvasNodeType,
        extra: { role: 'entry', experimentName, roundNumber },
      });


      // Always use entryLabel for the event card name (never a variant name)
      const eventCard = createEventCard(entryLabel || 'Event');
      flowFrame.appendChild(eventCard);

      // Add variant cards directly to flowFrame (ungrouped)
      const variantNodes: FrameNode[] = [];
      variants.forEach((variant: Variant, index: number) => {
        const card = createVariantCard(variant, index);
        // Compute fallback display name for meta and node name
        const variantLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        let fallbackName = 'Variant';
        if (typeof index === 'number' && index >= 0 && index < variantLetters.length) {
          fallbackName = variantLetters[index];
        }
        const displayName = (variant.name && variant.name.trim().length > 0) ? variant.name : fallbackName;
        card.name = `Variant: ${displayName}`;
        attachNodeMeta(card, {
          name: displayName,
          type: 'frame' as CanvasNodeType,
          extra: { role: 'variant', experimentName, roundNumber, variantIndex: index, traffic: variant.traffic, status: variant.status },
        });
        flowFrame.appendChild(card);
        variantNodes.push(card);

        connectNodes(eventCard, card, {
          label: `${variant.traffic}%`,
          winner: variant.status === "winner",
          index,
        });
      });

      const exitCard = createNodeCard(exitLabel);
      exitCard.name = 'Exit Node';
      attachNodeMeta(exitCard, {
        name: exitLabel,
        type: 'frame' as CanvasNodeType,
        extra: { role: 'exit', experimentName, roundNumber },
      });

      flowFrame.appendChild(exitCard);


      // Horizontally align infoCard and flowFrame, centered vertically
      const center = figma.viewport.center;

      const gap = 100;
      // Compute total width and center both as a group
      const totalWidth = (infoCard ? infoCard.width : 0) + gap + flowFrame.width;
      const startX = center.x - totalWidth / 2;

      // Remove from parent if already present to avoid double-append
      let infoCardValid = infoCard && infoCard.parent;
      let flowFrameValid = flowFrame && flowFrame.parent;
      if (!infoCardValid) {
        infoCard = await createExperimentInfoCard(
          experimentName,
          experimentDescription || '',
          figmaLink || '',
          jiraLink || '',
          miroLink || ''
        );
        attachNodeMeta(infoCard, {
          name: infoCardName,
          type: 'frame' as CanvasNodeType,
          description: experimentDescription || '',
          extra: { experimentName, role: 'experiment-info' },
        });
      }
      if (!flowFrameValid) {
        const flowFrameMeta = {
          name: flowFrameName,
          type: 'frame' as CanvasNodeType,
          extra: { experimentName, roundNumber, role: 'experiment-flow' },
        };
        flowFrame = createFrame(flowFrameMeta, {
          layoutMode: 'HORIZONTAL',
          itemSpacing: 64,
          padding: 32,
          paddingLeft: 48,
          paddingRight: 48,
          fills: [],
          cornerRadius: 24,
          // Ensure hugging content
          extra: {
            primaryAxisSizingMode: 'AUTO',
            counterAxisSizingMode: 'AUTO'
          }
        });
        // Removed reference to undefined roundBadge
        // Entry card is not appended here, as eventGroup and variantGroup are appended independently
      }

      // Only set position and append if node is valid
      if (infoCard && infoCard.parent === null) {
        infoCard.x = startX;
        infoCard.y = center.y - infoCard.height / 2;
        figma.currentPage.appendChild(infoCard);
      }
      if (flowFrame && flowFrame.parent === null) {
        flowFrame.x = startX + (infoCard ? infoCard.width : 0) + gap;
        flowFrame.y = center.y - flowFrame.height / 2;
        figma.currentPage.appendChild(flowFrame);
      }

      if (infoCard) figma.currentPage.appendChild(infoCard);
      figma.currentPage.appendChild(flowFrame);

      figma.currentPage.selection = [flowFrame];
      if (infoCard) {
        figma.viewport.scrollAndZoomIntoView([flowFrame, infoCard]);
      } else {
        figma.viewport.scrollAndZoomIntoView([flowFrame]);
      }

        // --- Visual QA: Send node data to UI ---
        // figma.ui.postMessage({ type: 'qa-node', payload: serializeNode(flowFrame) }); // Debug output hidden

      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(entryCard, variantNodes[i], {
          winner: variants[i].status === 'winner',
          label: `${variants[i].traffic}%`,
          index: i
        });
      }
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(variantNodes[i], exitCard, {
          winner: variants[i].status === 'winner',
          index: i
        });
      }

      figma.notify('Experiment flow created.');
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
        entryCard = createEventCard(entryLabel);
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
        connectNodes(entryCard, variantNodes[i], {
          winner: variants[i].status === 'winner',
          label: `${variants[i].traffic}%`,
          index: i
        });
      }
      for (let i = 0; i < variantNodes.length; i++) {
        connectNodes(variantNodes[i], exitCard, {
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
    fromNode: SceneNode,
    toNode: SceneNode,
    options?: {
      winner?: boolean;
      label?: string;
      index?: number;
    }
  ): SceneNode | null {
    const color = options?.winner
      ? { r: 0.22, g: 0.7, b: 0.36 }
      : { r: 0.18, g: 0.45, b: 0.85 };

    const strokeWeight = options?.winner ? 7 : 4;

    const fx = fromNode.absoluteTransform[0][2];
    const fy = fromNode.absoluteTransform[1][2];
    const tx = toNode.absoluteTransform[0][2];
    const ty = toNode.absoluteTransform[1][2];

    const startX = fx + fromNode.width;
    const startY = fy + fromNode.height / 2;
    const endX = tx;
    const endY = ty + toNode.height / 2;

    const index = options?.index ?? 0;
    const midX = startX + 96 + index * 12;

    const pathData = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

    const line = figma.createVector();
    line.vectorPaths = [{ windingRule: "NONZERO", data: pathData }];
    line.strokes = [{ type: "SOLID", color }];
    line.strokeWeight = strokeWeight;
    line.strokeAlign = "CENTER";
    line.name = "Flow Line";
    figma.currentPage.appendChild(line);

    if (options?.label) {
      // Removed Pill: label chip
    }

    const arrow = figma.createVector();
    const size = 10;
    arrow.vectorPaths = [
      {
        windingRule: "NONZERO",
        data: `M ${endX} ${endY} L ${endX - size} ${endY - size / 2} L ${endX - size} ${endY + size / 2} Z`,
      },
    ];
    arrow.fills = [{ type: "SOLID", color }];
    arrow.strokes = [];
    arrow.name = "Arrowhead";
    figma.currentPage.appendChild(arrow);

    return line;
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