# Version Guide: V2 vs Sample Flow

## 🎯 **Use V2 - This is the Latest Version**

### V2 Handler (`create-flow-v2`)

**Status:** ✅ **CURRENT & RECOMMENDED**

**Location:** `code.ts` line 839 - `figma.ui.onmessage` handler for `'create-flow-v2'`

**Features:**
- ✅ Uses V2 schema (EntryNodeV2, EventNodeV2, VariantV2, ConnectorV2)
- ✅ **All Phase 1 & 2 improvements included:**
  - Enhanced variant cards with status badges, traffic display, color accents
  - Entry nodes with note/description support
  - Unified `createConnectorV2()` function
  - All three connector types (PRIMARY_FLOW_LINE, BRANCH_LINE, MERGE_LINE)
  - Design token compliance
- ✅ Used by the UI (`ui.html` sends `create-flow-v2` messages)
- ✅ Supports full flow schema with connectors array
- ✅ Automatic connector generation if connectors not provided
- ✅ Entry notes and outcome annotations
- ✅ Proper node mapping and positioning

**How to Use:**
- Send message: `{ type: 'create-flow-v2', payload: { experiment, flow } }`
- The UI already uses this when you click "Create flow"

---

## 🧪 Sample Flow (`createSampleFlowFromData`)

**Status:** ⚠️ **DEMO/TESTING ONLY**

**Location:** `code.ts` line 580

**Purpose:**
- Auto-runs when plugin opens (line 739: `createSampleFlowFromData()`)
- For quick testing/demo purposes
- Uses hardcoded sample data

**Limitations:**
- ❌ Uses old `connectNodes()` function (not the new unified system)
- ❌ Hardcoded sample data
- ❌ Doesn't use V2 schema connectors
- ❌ Missing latest enhancements

**When to Use:**
- Quick visual testing
- Demo purposes
- Not for production flows

---

## 📋 Old Handlers (Deprecated)

**Status:** ❌ **DEPRECATED - DO NOT USE**

**Location:** `code.ts` line 1374+ - Marked as "OLD HANDLERS BELOW"

**Includes:**
- `create-flow` (old schema) - Shows deprecation message
- `create-from-selection` - Legacy handler

**Note:** These show deprecation messages and should not be used.

---

## 🎯 Recommendation

### **Use V2 for Everything**

1. **Production Flows:** Always use `create-flow-v2`
2. **UI Integration:** Already configured to use V2
3. **Testing:** You can test with V2 by sending proper payloads
4. **Sample Flow:** Only useful for quick visual checks, but doesn't show latest features

---

## Quick Reference

| Feature | V2 | Sample | Old |
|---------|----|----|-----|
| Enhanced Cards | ✅ | ❌ | ❌ |
| Unified Connectors | ✅ | ❌ | ❌ |
| All Connector Types | ✅ | ❌ | ❌ |
| Design Tokens | ✅ | ⚠️ Partial | ❌ |
| Entry Notes | ✅ | ❌ | ❌ |
| Status Badges | ✅ | ❌ | ❌ |
| Traffic Display | ✅ | ❌ | ❌ |
| Current Schema | ✅ | ❌ | ❌ |
| Production Ready | ✅ | ❌ | ❌ |

---

## How to Test V2

The UI already sends V2 messages. To test programmatically:

```typescript
// Example V2 payload structure
const payload = {
  experiment: {
    id: 'exp-1',
    name: 'Test Experiment',
    roundNumber: 1,
    description: 'Testing new features',
    links: { figma: '', jira: '', miro: '' }
  },
  flow: {
    id: 'flow-1',
    layout: { direction: 'HORIZONTAL', eventSpacing: 160, variantSpacing: 32 },
    entry: { id: 'entry-1', label: 'Start', note: 'Optional note', nodeType: 'ENTRY_NODE' },
    events: [
      {
        id: 'event-1',
        name: 'Landing Page',
        nodeType: 'EVENT_NODE',
        variants: [
          {
            id: 'var-1',
            parentEventId: 'event-1',
            key: 'A',
            name: 'Control',
            traffic: 50,
            metrics: { ctr: 0.695, cr: 0.425, su: 0 },
            status: 'none'
          }
        ]
      }
    ],
    exit: { id: 'exit-1', label: 'End', nodeType: 'EXIT_NODE' },
    connectors: [] // Will be auto-generated if empty
  }
};
```

---

**Last Updated:** January 2026  
**Current Version:** V2 ✅
