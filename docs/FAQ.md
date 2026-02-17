# Frequently Asked Questions (FAQ)

Common questions about using Growthlab Builder.

---

## General Questions

### What is Growthlab Builder?
Growthlab Builder is a Figma plugin that helps you create professional experiment flow diagrams for A/B tests, multivariate tests, and other growth experiments. It generates structured, visually consistent diagrams with experiment details, journey flows, variants, and metrics.

### Do I need to pay for this plugin?
Check with your team administrator. Pricing and access depend on your organization's setup.

### What version of Figma do I need?
Growthlab Builder works with both **Figma Desktop** and **Figma in the browser**. No specific version required—just make sure you're using a recent version.

### Does this work in FigJam?
Yes! The plugin is enabled for Figma, FigJam, Slides, and Buzz.

---

## Installation & Setup

### How do I install the plugin?
1. Open Figma
2. Go to **Plugins** menu or press **Shift + I**
3. Search for "Growthlab Builder"
4. Click **Run** to start using it

### Why do some elements look different or use the wrong font?
The plugin uses the **Figtree font**. If you don't have it installed:
1. Download it from [Google Fonts](https://fonts.google.com/specimen/Figtree)
2. Install it on your system
3. Restart Figma
4. Re-create your flow

### Can I use this plugin on multiple projects?
Yes! The plugin works in any Figma file you have edit access to.

---

## Using the Plugin

### What's the minimum information I need to create a flow?
Just an **experiment name**. Everything else is optional, though we recommend adding:
- Description
- Status
- At least one goal
- Journey touchpoints with variants

### How do I create an A/B test?
By default, the plugin creates an A/B test with:
- Control variant
- Variant A
- 50/50 traffic split

Just fill in the experiment name and click "Create flow"!

### How do I create a multivariate test?
1. In the Journey section, find the "Experiment Step" touchpoint
2. Click **"+ Add variant"** to add more variants
3. Add as many as you need (Variant B, C, D, etc.)
4. Adjust traffic splits accordingly

### Can I test multiple steps in one experiment?
Currently, only **one touchpoint** can be marked as the "Experiment Step" (where variants appear). This keeps the diagram focused and clear.

For multi-step experiments, consider:
- Creating separate flows for each step
- Using journey touchpoints to show the broader context

### How do I mark a variant as the winner?
1. Set experiment **Status** to **"Concluded"**
2. In the Journey section, click the **trophy icon** next to the winning variant
3. In the Status section, select the winner from **"Rolled out"** dropdown
4. Create or refresh your flow

The winner will show a badge in the diagram.

### Can I change the order of metrics or touchpoints?
Yes! **Drag and drop** to reorder:
- Metrics in the Goals section
- Touchpoints in the Journey section
- Variants within a touchpoint

### What if I make a mistake after creating the flow?
1. Reopen the plugin
2. Make your changes
3. Click **"Refresh"** button (instead of "Create flow")
4. The existing flow updates with your changes

---

## Variants & Traffic Splits

### What's a Control variant?
The **Control** is your baseline—the current version before any changes. Every experiment needs a Control to compare against.

By default, the first variant is marked as Control. You can change this by clicking the "Control" chip on any variant.

### How do I set traffic splits?
Each variant has a **Traffic** field where you can enter the percentage (0-100%). 

Example for 50/50 A/B test:
- Control: 50%
- Variant A: 50%

Example for 33/33/33 A/B/C test:
- Control: 33%
- Variant A: 33%
- Variant B: 34%

### Do traffic splits need to add up to 100%?
No validation is enforced, but for clarity, they should add up to 100% (or close to it, accounting for rounding).

### Can I have more than 3 variants?
Yes! Add as many variants as you need. The diagram will adjust automatically.

### What's "Create from selection"?
Instead of typing variant names, you can:
1. Create frames in Figma showing each variant design
2. Select up to 3 frames
3. Click **"Create from selection"**
4. Plugin auto-generates variants with visual thumbnails

Great for visual experiments!

---

## Goals & Metrics

### What's a Primary Metric?
The **primary metric** is your main success measure—the one metric that determines if the experiment succeeded. 

Click the **star icon** next to a metric to mark it as primary. Only one metric can be primary.

### Can I have multiple primary metrics?
No, only one metric can be marked as primary to keep focus clear. But you can have multiple secondary metrics.

### What kind of metrics should I add?
Common metrics:
- Conversion rate
- Click-through rate (CTR)
- Revenue per user
- Sign-up rate
- Bounce rate
- Time on page
- Add-to-cart rate

Choose metrics that align with your experiment hypothesis.

---

## Journey & Touchpoints

### What's an Experiment Step?
The **Experiment Step** is the touchpoint where your test happens—where users see different variants.

Only one touchpoint can be an Experiment Step. Toggle it using the **beaker icon**.

### Why can't I add variants to other touchpoints?
To keep diagrams clear and focused, only the Experiment Step can have variants. Other touchpoints show the broader user journey context.

### What's the difference between Entry and Exit touchpoints?
- **Entry**: Where users enter your experiment flow (shown as a circle)
- **Exit**: Where users leave your experiment flow (shown as a circle)
- Regular touchpoints: Steps in between (shown as cards)

These are visual conventions to make the flow easier to understand.

---

## Advanced Settings

### What should I put in the Hypothesis field?
Use the if-then-because format:
```
"If we [change X], then [metric Y] will [improve/decrease by Z%], because [reason]"
```

Example:
```
"If we add customer testimonials to the product page, then conversion rate will increase by 15%, because social proof builds trust"
```

### How do I add resource links?
1. Expand **Advanced Settings**
2. Scroll to **Resources** section
3. Paste a URL in the input field
4. Press Enter or click +

The plugin auto-detects the service (Figma, Jira, Miro, etc.) and adds an icon.

### What link types are supported?
The plugin recognizes links from:
- Figma
- Miro
- Jira
- Notion
- Asana
- Linear
- Slack
- GitHub
- Confluence
- Trello
- Monday.com
- ClickUp
- And more!

Generic links also work—they'll show with a link icon.

### Can I remove a link after adding it?
Yes! Click the **X icon** on any link chip to remove it.

---

## Working with Generated Flows

### Can I edit the generated diagram?
Yes! The diagram is made of regular Figma frames and text layers. You can:
- Edit text directly
- Change colors
- Resize elements (Auto Layout makes this easy)
- Rearrange components
- Add your own elements

### How do I update an existing flow?
1. Reopen the plugin
2. Modify any fields
3. Click **"Refresh"** button
4. Your existing flow updates automatically

### What if I want to start over?
1. Delete the generated flow from your canvas
2. Reopen the plugin
3. Fill in new information
4. Click **"Create flow"**

### Can I duplicate a flow?
Yes! Use Figma's standard duplicate command:
- Select the entire flow
- Press **Cmd + D** (Mac) or **Ctrl + D** (Windows)
- Modify the duplicate as needed

### How do I export my flow?
Use Figma's standard export:
1. Select the flow
2. Right-click → **Export...**
3. Choose format (PNG, JPG, SVG, PDF)
4. Export

---

## Troubleshooting

### The plugin won't open
- Check that you have the plugin installed
- Try restarting Figma
- Make sure you have edit access to the file

### My flow looks broken or misaligned
- Make sure Figtree font is installed
- Try clicking "Refresh" to regenerate
- Check that you're using a recent version of Figma

### I can't see the "Create from selection" button
This button only appears when you have 1-3 frames selected on the canvas. Select some frames first, then open the plugin.

### Traffic split percentages look wrong in the diagram
Double-check the numbers you entered. The diagram shows exactly what you input—it doesn't validate that they add up to 100%.

### Links aren't showing icons
Make sure you're pasting complete URLs (including `https://`). The plugin matches URLs to detect the service type.

### The winner badge isn't showing
Make sure:
1. Status is set to **"Concluded"**
2. You clicked the **trophy icon** next to a variant
3. You selected a winner in the **"Rolled out"** dropdown
4. You clicked "Refresh" or "Create flow"

---

## Best Practices

### Should I create a new flow for each experiment?
Yes, create a separate flow for each unique experiment. This keeps your documentation clear and organized.

### How should I organize experiment flows in Figma?
Consider:
- One page per experiment
- Grouped by product area or feature
- Chronological order (newest first)
- Include experiment ID or date in page name

### Should I include all advanced fields?
Fill in fields that are relevant to your team and process. Common practice:
- Always: Name, description, status, goals
- Usually: Hypothesis, timeline, owner
- Sometimes: Sample size, audience, confidence level
- As needed: Resource links

### Can I customize colors or styles?
Yes! After generating a flow, you can:
- Change colors to match your brand
- Adjust spacing and sizing
- Add your own elements or annotations
- Create reusable components/styles

Consider creating a flow template for your team.

---

## Still Have Questions?

- 📖 [User Guide](USER_GUIDE.md) - Complete features and usage
- 🚀 [Getting Started](GETTING_STARTED.md) - Step-by-step tutorial
- 🔧 [Troubleshooting](TROUBLESHOOTING.md) - Fix common issues

Contact your Growth Labs team or development team for additional support.
