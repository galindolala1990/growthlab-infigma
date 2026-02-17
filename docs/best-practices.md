# Best Practices

Tips and recommendations for getting the most out of Growthlab Builder.

## Naming Conventions

### Experiment Names

✅ **Good:**
- "Homepage hero: Button color test (Green vs Blue)"
- "Product page: Add to cart position"
- "Checkout flow: Payment form simplification"
- "Email campaign: Subject line personalization"

❌ **Avoid:**
- "Test 1"
- "Experiment"
- "New test"
- "AB_2026_01"

**Tips:**
- Be specific about what's being tested
- Include the page/feature and the change
- Use descriptive names that make sense months later
- Consider including test type if relevant

### Variant Names

✅ **Good:**
- "Control: Blue button"
- "Variant A: Green button"
- "Short copy (5 words)"
- "Image on left"
- "No hero image"

❌ **Avoid:**
- "Variant 1"
- "Test A"
- "Option 2"
- "New version"

**Tips:**
- Describe what's different
- Use clear, distinguishing characteristics
- Keep names concise but meaningful
- Match names to what stakeholders will recognize

### Metric Names

✅ **Good:**
- "Sign-up conversion rate"
- "Add-to-cart rate"
- "Revenue per user"
- "Time to checkout"

❌ **Avoid:**
- "Metric 1"
- "CTR" (without context)
- "Conversions" (too vague)

**Tips:**
- Be specific about what you're measuring
- Include units if relevant
- Use consistent terminology across experiments

## Documentation

### Hypothesis

Use the **if-then-because** format:

```
If we [change X], 
then [metric Y] will [improve by Z%], 
because [reason based on insight/data]
```

**Examples:**

✅ **Good:**
```
If we add customer testimonials above the fold on the product page,
then conversion rate will increase by 12%,
because social proof builds trust and reduces purchase anxiety
```

✅ **Good:**
```
If we reduce the checkout form from 8 fields to 4 fields,
then cart abandonment will decrease by 20%,
because reducing friction makes completing purchase easier
```

❌ **Avoid:**
```
"We think this will work better"
"Testing to see if this improves conversions"
```

### Description

Keep it concise but informative:
- What's being changed
- Why it matters
- What you hope to learn

**Example:**
```
Testing green vs blue CTA button on homepage hero.
Current blue converts at 8.2%. Industry data suggests
green buttons perform 15% better for action-oriented CTAs.
```

### Resource Links

Link to everything relevant:
- 📐 Figma design files
- 📋 Jira/Linear tickets for implementation
- 📊 Analytics dashboards (Amplitude, Mixpanel)
- 📝 PRD or brief (Notion, Google Docs)
- 💬 Discussion threads (Slack)
- 🎨 Design specs or mockups (Miro, FigJam)

**Why this matters:**
- Team members can find context quickly
- Reduces "where is that file?" questions
- Creates paper trail for future reference
- Helps onboarding new team members

## Organization

### Figma File Structure

**Option 1: One page per experiment**
```
📄 Homepage CTA Test (Running)
📄 Product Page Layout Test (Concluded)
📄 Checkout Flow Test (Planned)
```

**Option 2: Organized by status**
```
📄 Running Experiments
  - Homepage CTA Test
  - Email Subject Test
📄 Concluded Experiments
  - Product Page Test
  - Navigation Test
📄 Planned Experiments
  - Checkout Flow Test
```

**Option 3: Organized by feature area**
```
📄 Homepage Experiments
📄 Product Page Experiments
📄 Checkout Experiments
```

Choose what works for your team!

### Naming Pages

Include useful metadata:
```
[Status] Experiment Name (Start Date)
```

**Examples:**
- `[Running] Homepage CTA: Button Color (Feb 2026)`
- `[Concluded ✓ Winner: Variant A] Product Page Layout (Jan 2026)`
- `[Planned] Checkout: Form Simplification (Mar 2026)`

## Experiment Design

### Traffic Splits

**A/B Test (2 variants):**
```
Control: 50%
Variant A: 50%
```

**A/B/C Test (3 variants):**
```
Control: 34%
Variant A: 33%
Variant B: 33%
```

**A/B/C/D Test (4 variants):**
```
Control: 25%
Variant A: 25%
Variant B: 25%
Variant C: 25%
```

**Cautious rollout:**
```
Control: 90%
Variant A: 10%
```

**Tips:**
- Start with 50/50 for A/B tests
- Use equal splits unless you have good reason not to
- Document why if using unequal splits
- Consider sample size requirements

### Primary Metrics

**Choose ONE primary metric:**
- This is your "north star" for the experiment
- Decision to ship/roll back based on this metric
- Makes analysis clearer
- Prevents cherry-picking results

**Secondary metrics:**
- Track for context and guardrails
- Watch for unexpected negative impacts
- Inform future experiments
- Help explain results

**Example:**
- ⭐ **Primary:** Sign-up conversion rate
- **Secondary:** Click-through rate
- **Secondary:** Time on page
- **Guardrail:** Bounce rate

### Journey Touchpoints

Keep it simple:
- 3-5 touchpoints is ideal
- Too many makes diagram cluttered
- Focus on the critical path
- Group related steps

**Example - E-commerce:**
```
Entry: Homepage
→ Product list page
→ Product detail page [Experiment Step]
→ Shopping cart
Exit: Checkout
```

**Example - SaaS signup:**
```
Entry: Landing page
→ Sign-up form [Experiment Step]
→ Email verification
Exit: Dashboard
```

## Timing & Lifecycle

### When to Create Flows

**Best practices:**
1. **Planning phase** - Create as "Draft" or "Planned"
2. **Before launch** - Update to "Running" when live
3. **After conclusion** - Update to "Concluded" and mark winner

### Keeping Flows Updated

Set reminders to:
- Update status when experiment launches
- Add actual start/end dates
- Mark winning variant when concluded
- Link to results/analysis

### Archiving Old Experiments

Consider:
- Moving concluded experiments to archive page
- Keeping last 6 months easily accessible
- Creating a "highlight reel" of key learnings

## Team Collaboration

### Standardize as a Team

Agree on:
- Naming conventions
- Required vs optional fields
- Where to store experiments
- How to mark winners
- When to archive

### Use as Communication Tool

**Internal stakeholders:**
- Share Figma link in Slack/email
- Use in experiment reviews
- Reference in roadmap planning

**External stakeholders:**
- Export as PDF/PNG
- Include in presentations
- Add to experiment briefs

### Create Templates

Build your own:
1. Create one perfect example flow
2. Duplicate for each new experiment
3. Update with actual data
4. Saves time and ensures consistency

## Visual Customization

### After Generating

Feel free to customize:
- Change colors to match your brand
- Adjust spacing and sizing (Auto Layout makes this easy)
- Add annotations or notes
- Include screenshots or mockups
- Add your logo

### Creating a Brand Style

1. Generate one flow
2. Customize colors/styles
3. Create components from elements
4. Reuse across all experiments

**Tip:** Use Figma styles for colors and text to maintain consistency

## Common Pitfalls to Avoid

❌ **Don't:**
- Create experiment without clear hypothesis
- Skip linking to resources
- Use vague variant/metric names
- Forget to update status when experiment launches
- Let experiments pile up without archiving
- Make diagrams too complex

✅ **Do:**
- Document thoroughly upfront
- Keep diagrams simple and focused
- Update regularly
- Archive old experiments
- Use consistent naming
- Link to all relevant resources

## Quality Checklist

Before finalizing an experiment flow, check:

- [ ] Experiment name is clear and descriptive
- [ ] Hypothesis follows if-then-because format
- [ ] Primary metric is marked
- [ ] All variants have meaningful names
- [ ] Traffic splits are set
- [ ] Relevant resource links added
- [ ] Owner is assigned
- [ ] Start/end dates are set (or TBD noted)
- [ ] Journey shows clear user path
- [ ] Status is accurate

---

::: tip Pro Tip
Create a "Template" experiment in your Figma file with best practices filled in. Duplicate it for each new experiment to save time and maintain consistency.
:::

::: warning Remember
The experiment flow is documentation, not just decoration. Make it useful for your future self and teammates who need to understand the experiment months from now.
:::
