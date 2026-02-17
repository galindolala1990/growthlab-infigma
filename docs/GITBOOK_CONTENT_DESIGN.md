# GitBook Content Design — Growthlab Builder

## Purpose
Provide a clear, task‑first documentation experience for Growthlab Builder users (product, growth, and design teams) and plugin maintainers.

## Goals
- Help new users create their first experiment flow in minutes.
- Make feature discovery simple and visual.
- Reduce support questions with concise troubleshooting.
- Provide a clean dev reference for maintainers.

## Audience
- **Primary:** Growth/product teams documenting experiments in Figma.
- **Secondary:** Designers and researchers who need experiment diagrams.
- **Tertiary:** Developers maintaining the plugin.

## Information Architecture (GitBook Navigation)
### 1) Welcome
- **Overview**
- **What’s New**
- **Glossary**

### 2) Get Started
- **Install & Run**
- **Quick Start (5 min)**
- **First Experiment Flow (guided example)**

### 3) Use the Plugin
- **Experiment Details**
- **Goals & Metrics**
- **Journey Mapping**
- **Variants & Traffic Splits**
- **Resources & Links**
- **Outcomes & Rollouts**
- **Refresh vs Create**

### 4) Examples & Templates
- **A/B Test Example**
- **Multivariate Example**
- **Lifecycle/Retention Example**

### 5) Best Practices
- **Naming & Structure**
- **Metrics Quality**
- **Collaboration Tips**
- **Design & Layout Tips**

### 6) Troubleshooting
- **Common Issues**
- **Font Issues (Figtree)**
- **Links/Icons**
- **Performance**

### 7) FAQ
- **General**
- **Data & Privacy**
- **Compatibility**

### 8) Developer Docs
- **Architecture**
- **Plugin Messaging**
- **Manifest**
- **Release Checklist**

## Page Templates (Content Design)
### Overview (Welcome)
**Goal:** Introduce the plugin, who it’s for, and what it creates.
- **Hero statement:** “Create clean, structured experiment flow diagrams in Figma.”
- **Value bullets:** fast setup, consistent layout, shareable artifacts.
- **CTA links:** Quick Start, User Guide, Features.

### Quick Start
**Goal:** Get a flow on the canvas in under 5 minutes.
- **Steps:** Install → Open plugin → Fill basics → Add variants → Create flow.
- **Output preview:** “You’ll get: Experiment card, journey, variants, metrics.”
- **Tip box:** “Start with just the experiment name.”

### Feature Pages (Experiment / Metrics / Journey / Variants / Resources)
**Goal:** Explain one feature at a time with minimal friction.
- **What it does** (1–2 lines)
- **Where it lives in UI** (section name)
- **How to use** (3–5 bullets)
- **Examples** (short, realistic)
- **Best‑practice callout**

### Examples & Templates
**Goal:** Provide copy‑ready examples with realistic values.
- **Context** (what’s being tested)
- **Inputs** (pre‑filled values)
- **Expected output** (description of generated diagram)

### Troubleshooting
**Goal:** One issue per section with quick resolution.
- **Problem → Cause → Fix** format
- 3–5 bullet checks per issue

### Developer Docs
**Goal:** Keep maintenance and release steps easy to follow.
- Build/watch/lint commands
- UI ↔ plugin message contracts
- Release checklist

## Voice & Tone
- **Clear and concise** (short sentences, action verbs)
- **Productive and helpful** (tips over warnings)
- **Non‑technical by default** (explain terms)

## UI Writing Standards
- Use “Create flow” and “Refresh flow” consistently.
- Name fields exactly as seen in the UI.
- Prefer examples using growth metrics (CTR, conversion rate, revenue per user).

## Reusable Content Blocks
### “You’ll get” block
- Experiment info card
- Journey touchpoints (entry, experiment step, exit)
- Variant cards with traffic splits
- Metrics chips with primary metric

### “Pro tip” block
- “Mark a primary metric to keep the team focused.”

### “Common mistake” block
- “Avoid generic variant names like ‘A/B’. Use descriptive labels.”

## Content Inventory Mapping (Existing Docs)
- **Getting Started:** docs/GETTING_STARTED.md
- **User Guide:** docs/USER_GUIDE.md
- **Features:** docs/features.md
- **Best Practices:** docs/best-practices.md
- **FAQ:** docs/FAQ.md
- **Troubleshooting:** docs/TROUBLESHOOTING.md
- **Dev Docs:** docs/FIGMA_PLUGIN_API.md, docs/PLUGIN_MESSAGING.md, docs/PLUGIN_MANIFEST.md, docs/PLUGIN_UX_GUIDELINES.md, docs/RELEASE_CHECKLIST.md

## Next Content Tasks
1. Add “What’s New” page with release highlights.
2. Expand examples with 3 full workflows.
3. Add glossary for experiment terminology.
4. Add troubleshooting screenshots (optional).
