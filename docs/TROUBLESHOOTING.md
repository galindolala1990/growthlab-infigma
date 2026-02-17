# Troubleshooting Guide

Solutions to common issues when using Growthlab Builder.

---

## Table of Contents
- [Plugin Issues](#plugin-issues)
- [Font & Styling Issues](#font--styling-issues)
- [Flow Generation Issues](#flow-generation-issues)
- [Variant & Traffic Issues](#variant--traffic-issues)
- [Link & Resource Issues](#link--resource-issues)
- [Performance Issues](#performance-issues)
- [Known Limitations](#known-limitations)

---

## Plugin Issues

### Plugin won't open or appears blank

**Symptoms**: Plugin window is empty, won't load, or gets stuck on loading screen.

**Solutions**:
1. **Restart Figma**
   - Close Figma completely
   - Reopen and try again

2. **Check internet connection**
   - Plugin needs internet to load UI
   - Try disconnecting/reconnecting

3. **Clear Figma cache** (Desktop only)
   - Close Figma
   - Clear cache folder:
     - Mac: `~/Library/Application Support/Figma/`
     - Windows: `%APPDATA%\Figma\`
   - Restart Figma

4. **Try Figma in browser**
   - If desktop version fails, try https://figma.com
   - This can help isolate if it's a local issue

5. **Check for Figma updates**
   - Go to Figma menu → About Figma
   - Install updates if available

### Plugin closes immediately after opening

**Symptoms**: Plugin window opens then closes right away.

**Solutions**:
1. **Check file permissions**
   - Make sure you have edit access to the file
   - View-only access won't work

2. **Try a different file**
   - Create a new test file
   - Run plugin there to isolate the issue

3. **Check browser console** (Browser version)
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Share errors with support team

### "Create flow" button doesn't work

**Symptoms**: Clicking the button does nothing.

**Solutions**:
1. **Fill in required field**
   - Experiment name is required
   - Check for error messages

2. **Check for field validation errors**
   - Look for red highlights or error text
   - Fix any validation issues

3. **Try the Refresh button**
   - If flow already exists, use Refresh instead

4. **Restart the plugin**
   - Close and reopen
   - Try again

---

## Font & Styling Issues

### Text looks wrong or uses fallback fonts

**Symptoms**: Text appears in system fonts instead of Figtree.

**Solutions**:
1. **Install Figtree font**
   - Download from [Google Fonts](https://fonts.google.com/specimen/Figtree)
   - Install all weights (Regular, Medium, SemiBold, Bold)
   - Restart Figma

2. **Check font availability in Figma**
   - Create a text layer
   - Try selecting Figtree in font dropdown
   - If not available, reinstall the font

3. **Re-generate the flow**
   - After installing font, click "Refresh"
   - New flow should use correct fonts

### Colors look wrong or washed out

**Symptoms**: Elements appear in unexpected colors.

**Solutions**:
1. **Check color profile**
   - Figma menu → Preferences → Color space
   - Try switching between sRGB and Display P3

2. **Check layer opacity**
   - Generated elements might have opacity settings
   - Select layer and check opacity in properties panel

3. **Check dark mode**
   - Plugin colors are optimized for Figma light mode
   - Try switching to light mode if using dark

### Alignment or spacing looks off

**Symptoms**: Elements are misaligned, overlapping, or have odd spacing.

**Solutions**:
1. **Refresh the flow**
   - Click "Refresh" button to regenerate
   - This often fixes alignment issues

2. **Check Auto Layout**
   - All frames should use Auto Layout
   - If disrupted, try regenerating

3. **Check zoom level**
   - Zoom in/out to refresh rendering
   - Some alignment issues are display-only

4. **Don't manually move elements before refreshing**
   - Manual edits can interfere with Auto Layout
   - Reset positions or regenerate flow

---

## Flow Generation Issues

### Flow appears off-screen or far away

**Symptoms**: Generated flow is not visible or very far from viewport.

**Solutions**:
1. **Use Zoom to fit**
   - Press **Shift + 1** to zoom to fit all
   - Or View menu → Zoom to Fit

2. **Check viewport before creating**
   - Center your viewport where you want the flow
   - Flow generates near your current view

3. **Move the flow**
   - Select all elements (or the parent frame)
   - Drag to desired position

### Elements are overlapping or jumbled

**Symptoms**: Cards, nodes, or text overlap each other.

**Solutions**:
1. **Refresh the flow**
   - Click "Refresh" button
   - Plugin recalculates positions

2. **Check for duplicate flows**
   - You might have multiple versions stacked
   - Delete old versions

3. **Clear selection before creating**
   - Deselect all layers (Esc)
   - Then create flow

### Missing elements in generated flow

**Symptoms**: Expected cards, metrics, or variants don't appear.

**Solutions**:
1. **Check form inputs**
   - Make sure you added the items in the plugin form
   - Empty sections won't generate elements

2. **Check for errors**
   - Look for error messages in the plugin
   - Some fields might have validation issues

3. **Try creating a simple flow first**
   - Minimal experiment with just name
   - Add complexity gradually

### "Refresh" button doesn't update the flow

**Symptoms**: Clicking Refresh doesn't change the existing flow.

**Solutions**:
1. **Select the existing flow first**
   - Click on any part of the generated flow
   - Then click Refresh

2. **Check layer naming**
   - Plugin looks for specific layer names
   - If manually renamed, plugin can't find them
   - Solution: Delete and create new flow

3. **Delete and recreate**
   - If Refresh fails, delete the flow
   - Create a new one with "Create flow"

---

## Variant & Traffic Issues

### Can't add variants

**Symptoms**: "+ Add variant" button is grayed out or doesn't work.

**Solutions**:
1. **Mark a touchpoint as Experiment Step**
   - Only Experiment Step touchpoints can have variants
   - Click the beaker icon on a touchpoint to mark it

2. **Check maximum variants**
   - Make sure you haven't hit a limit (unlikely, but possible)

3. **Refresh the form**
   - Close and reopen plugin
   - Try again

### Traffic splits don't show in diagram

**Symptoms**: Percentages are missing or show 0%.

**Solutions**:
1. **Enter traffic percentages**
   - Each variant needs a traffic % value
   - Default might be 0

2. **Check number format**
   - Use whole numbers (50, not 50%)
   - Use digits only (no special characters)

3. **Refresh the flow**
   - After updating percentages, click Refresh

### Winner badge doesn't appear

**Symptoms**: Trophy/winner indicator missing on winning variant.

**Solutions**:
1. **Set status to "Concluded"**
   - Winner only shows for concluded experiments

2. **Mark winner in two places**:
   - Click trophy icon next to variant (in Journey section)
   - Select winner in "Rolled out" dropdown (in Status section)

3. **Refresh after marking winner**
   - Changes won't show until you refresh

---

## Link & Resource Issues

### Links aren't showing icons

**Symptoms**: Resource links show generic icon instead of service icon.

**Solutions**:
1. **Use full URLs**
   - Include `https://` or `http://`
   - Example: `https://figma.com/file/...` not `figma.com/file/...`

2. **Check URL format**
   - URL should be valid and complete
   - Copy directly from browser address bar

3. **Supported services**
   - Plugin recognizes: Figma, Miro, Jira, Notion, Asana, Linear, GitHub, Slack, Trello, Confluence, Monday, ClickUp
   - Other URLs get generic link icon

### Can't remove a link

**Symptoms**: Delete/X button doesn't remove link.

**Solutions**:
1. **Click the X icon directly**
   - Click the X on the link chip
   - Don't click the link text

2. **Refresh and try again**
   - Close and reopen plugin
   - Links should still be there
   - Try removing again

3. **Edit form state**
   - Links are stored in form state
   - Delete and re-add if stuck

### Links don't appear in generated flow

**Symptoms**: Resource links missing from experiment info card.

**Solutions**:
1. **Check if you added links**
   - Links must be added in Resources section
   - Check under Advanced Settings

2. **Refresh the flow**
   - After adding links, click Refresh
   - Or create new flow

3. **Check link limit**
   - Too many links might overflow
   - Try reducing number of links

---

## Performance Issues

### Plugin is slow or laggy

**Symptoms**: Plugin UI is unresponsive, slow to type, or freezes.

**Solutions**:
1. **Close other plugins**
   - Multiple plugins can slow Figma
   - Close unused plugins

2. **Simplify your file**
   - Large files with many layers slow everything
   - Try in a smaller test file

3. **Restart Figma**
   - Memory leaks can slow things down
   - Full restart often helps

4. **Check system resources**
   - Close other apps using lots of RAM
   - Check Activity Monitor (Mac) or Task Manager (Windows)

### Flow generation takes a long time

**Symptoms**: "Create flow" or "Refresh" hangs for a while.

**Solutions**:
1. **Reduce complexity**
   - Try with fewer variants (start with 2)
   - Add fewer metrics
   - Simplify journey

2. **Close other files**
   - Multiple open Figma files slow things down

3. **Wait it out**
   - Complex flows can take 5-10 seconds
   - Be patient before clicking again

4. **Check for errors**
   - Open browser console (F12) to see if errors occur

---

## Known Limitations

### Maximum Limits
- **Variants**: No hard limit, but recommend ≤10 for readability
- **Metrics**: No hard limit, but recommend ≤5 for clarity  
- **Touchpoints**: No hard limit, but recommend ≤7 for flow clarity
- **Links**: No hard limit, but card has limited space

### Unsupported Features
- **Multiple experiment steps**: Only one touchpoint can have variants
- **Branching flows**: Linear flows only (entry → steps → exit)
- **Custom node shapes**: Preset shapes only
- **Real-time data integration**: Plugin doesn't connect to analytics

### Platform Limitations
- **Font loading**: Figtree must be installed locally
- **Network access**: Plugin needs internet for initial load
- **File permissions**: Requires edit access to generate flows

### Browser-Specific Issues
- **Safari**: Some performance issues reported
  - Solution: Use Chrome or Figma Desktop
- **Firefox**: Minor rendering differences
  - Solution: Use Chrome or Figma Desktop

---

## Getting More Help

### Before Contacting Support

1. **Check this guide** - Most issues have solutions here
2. **Check FAQ** - [FAQ.md](FAQ.md) covers common questions
3. **Try in a fresh file** - Isolate if it's file-specific
4. **Note error messages** - Copy exact error text
5. **Check Figma status** - https://status.figma.com

### When Reporting Issues

Include:
- ✅ What you were trying to do
- ✅ What actually happened
- ✅ Error messages (exact text or screenshot)
- ✅ Figma version (Desktop or Browser, version number)
- ✅ OS and version (Mac/Windows, version)
- ✅ Steps to reproduce the issue
- ✅ Screenshots or screen recording (if applicable)

### Contact

- Check with your Growth Labs team
- Submit issue to development team
- Include debugging info from above

---

## Quick Troubleshooting Checklist

When something goes wrong, try these in order:

1. ☐ Restart the plugin (close and reopen)
2. ☐ Check for required fields (experiment name)
3. ☐ Try clicking "Refresh" instead of "Create flow"
4. ☐ Restart Figma completely
5. ☐ Check that Figtree font is installed
6. ☐ Try in a new/test file
7. ☐ Check internet connection
8. ☐ Update Figma to latest version
9. ☐ Check browser console for errors (F12)
10. ☐ Contact support with details

---

**Still stuck?** Refer to:
- [User Guide](USER_GUIDE.md) - Complete feature reference
- [Getting Started](GETTING_STARTED.md) - Step-by-step walkthrough  
- [FAQ](FAQ.md) - Common questions and answers
