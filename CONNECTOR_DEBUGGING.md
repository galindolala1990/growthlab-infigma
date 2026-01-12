# Connector Debugging Guide

## Issue: Connectors Not Appearing in V2 Flow

## Fixes Applied

### 1. Improved Node Map Building ✅
- Added robust `findNodeById()` function that searches by metadata
- Falls back to name-based search if metadata search fails
- Handles nested node structures (event groups, variant containers)

### 2. Fixed Frame Clipping ✅
- Set `flowFrame.clipsContent = false` to prevent connectors from being clipped
- Connectors can now extend beyond frame bounds

### 3. Increased Layout Settle Time ✅
- Changed timeout from 0ms to 100ms to allow auto-layout to fully settle
- Ensures node positions are accurate before connector calculation

### 4. Added Debugging ✅
- Console logs for node map building
- Console logs for connector creation
- Notification showing connector count
- Detailed logging of connector positions

## How to Debug

### Step 1: Check Console Logs

When you create a flow, check the browser console (F12) for:

```
Node Map: ['entry-1', 'event-1', 'variant-1', ...]
Flow Connectors: 5
Rendering connectors from schema: 5
Connector PRIMARY_FLOW_LINE: { fromId: 'entry-1', toId: 'event-1', fromFound: true, toFound: true }
Created PRIMARY_FLOW_LINE connector: { from: 'Entry Node', to: 'Event: Landing Page', ... }
Total connector elements created: 15
```

### Step 2: Check Node Map

If you see `fromFound: false` or `toFound: false`, the node map isn't finding nodes correctly.

**Possible causes:**
- Node IDs don't match between flow schema and created nodes
- Metadata not attached correctly
- Nodes not yet added to flowFrame when map is built

### Step 3: Check Connector Visibility

1. Select the flow frame
2. Check if connector elements are in the layer list:
   - Look for nodes named `PRIMARY_FLOW_LINE Line`, `BRANCH_LINE Line`, etc.
   - Look for `Arrowhead` nodes
   - Look for `Connector Label` frames

3. If connectors exist but aren't visible:
   - Check if they're outside the viewport
   - Check if stroke color matches background
   - Check if stroke weight is too small

### Step 4: Verify Connector Creation

The code now logs:
- How many connectors were found in schema
- Whether nodes were found for each connector
- Total connector elements created
- Position and size of each connector

## Common Issues

### Issue 1: Node Map Empty
**Symptom:** `Node Map: []` in console
**Fix:** Check that nodes are being created with correct IDs and metadata

### Issue 2: Connectors Created But Not Visible
**Symptom:** Console shows connectors created, but nothing visible
**Possible causes:**
- `clipsContent = true` on flowFrame (FIXED)
- Connectors positioned off-screen
- Stroke color same as background
- Stroke weight too small

### Issue 3: Wrong Node IDs
**Symptom:** `fromFound: false` or `toFound: false`
**Fix:** Ensure UI sends correct node IDs that match the created nodes

## Testing Checklist

- [ ] Open browser console (F12)
- [ ] Create a flow via UI
- [ ] Check console for "Node Map:" log
- [ ] Check console for "Rendering connectors" log
- [ ] Check console for "Created X connector elements" log
- [ ] Verify connectors appear on canvas
- [ ] Check layer list for connector nodes
- [ ] Verify connector colors and styles

## Next Steps if Still Not Working

1. **Check UI Payload:**
   - Verify `flow.connectors` array is being sent
   - Verify connector IDs match node IDs

2. **Check Node Creation:**
   - Verify nodes are created with correct IDs
   - Verify metadata is attached correctly

3. **Manual Test:**
   - Try creating a simple flow with 1 entry, 1 event, 1 exit
   - Check if primary flow line appears

4. **Check Figma Console:**
   - Open Figma → Plugins → Development → Console
   - Look for any errors or warnings

---

**Last Updated:** January 2026
