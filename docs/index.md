---
layout: home

hero:
  name: "Growthlab Builder"
  text: "Experiment Flows for Figma"
  tagline: Create professional experiment flow diagrams in seconds. Perfect for A/B tests, MVTs, and growth experiments.
  image:
    src: /hero-image.svg
    alt: Growthlab Builder
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View Features
      link: /features
    - theme: alt
      text: Install Plugin
      link: https://www.figma.com/community/plugin/1579196395853602242

features:
  - icon: 🚀
    title: Fast & Intuitive
    details: Create complete experiment flows in under 2 minutes. Simple form-based interface with smart defaults.
  
  - icon: 🎨
    title: Professional Design
    details: Uses Growth Labs design system with Figtree font. Auto Layout for easy customization.
  
  - icon: 📊
    title: Complete Documentation
    details: Track experiment details, metrics, journey, variants, and resources all in one place.
  
  - icon: 🔄
    title: Easy Updates
    details: Made changes? Just hit Refresh to update your existing flow diagram.
  
  - icon: 🎯
    title: Variant Management
    details: Support for A/B tests, multivariate tests, traffic splits, and winner badges.
  
  - icon: 🔗
    title: Resource Links
    details: Auto-detected icons for Figma, Miro, Jira, Notion, and 10+ other services.

  - icon: 📱
    title: Journey Mapping
    details: Visualize user flow with entry/exit nodes and experiment touchpoints.
  
  - icon: ⭐
    title: Metrics & Goals
    details: Define primary and secondary metrics. Track what matters most.
  
  - icon: 🏆
    title: Experiment States
    details: Track status from draft to concluded. Mark winning variants clearly.
---

## Quick Example

```typescript
// Example experiment setup
{
  name: "Homepage CTA: Button Color Test",
  status: "Running",
  variants: [
    { name: "Control (Blue)", traffic: 50 },
    { name: "Variant A (Green)", traffic: 50 }
  ],
  metrics: [
    { name: "Sign-up conversion rate", primary: true },
    { name: "Click-through rate" }
  ]
}
```

<div style="margin-top: 3rem; padding: 2rem; background: var(--vp-c-bg-soft); border-radius: 8px; text-align: center;">
  <h2 style="margin-top: 0;">Ready to streamline your experiment documentation?</h2>
  <p>Install the plugin from Figma Community and start creating flows today.</p>
  <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;">
    <a href="/getting-started" class="vp-button brand">Get Started →</a>
    <a href="/user-guide" class="vp-button alt">Read the Guide</a>
  </div>
</div>

## What Teams Are Saying

::: tip Used by Growth Teams
"Growthlab Builder helped us standardize experiment documentation across our team. No more inconsistent diagrams!"
:::

::: tip Perfect for Product Teams
"The ability to link Jira tickets and Figma files directly in the flow is a game-changer."
:::

::: tip Great for Researchers
"Visual experiment flows make it so much easier to communicate test plans to stakeholders."
:::
