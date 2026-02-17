# Documentation Site

This is the VitePress-powered documentation site for Growthlab Builder.

## Development

```bash
# Install dependencies
npm install

# Start dev server (with hot reload)
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

## Project Structure

```
docs/
├── .vitepress/
│   ├── config.mts          # VitePress configuration
│   └── theme/
│       ├── index.ts        # Custom theme
│       └── style.css       # Custom styles
├── index.md                # Homepage
├── getting-started.md      # Getting Started guide
├── user-guide.md           # Complete user guide
├── features.md             # Features overview
├── best-practices.md       # Best practices
├── faq.md                  # FAQ
├── troubleshooting.md      # Troubleshooting guide
└── dev/                    # Developer documentation
    ├── figma-api.md
    ├── messaging.md
    ├── manifest.md
    ├── ux-guidelines.md
    └── release-checklist.md
```

## Deployment

### GitHub Pages (Automated)

The site is automatically deployed to GitHub Pages when you push to the `main` branch.

The workflow is defined in `.github/workflows/deploy.yml`.

**Setup GitHub Pages:**
1. Go to your repo → Settings → Pages
2. Source: GitHub Actions
3. Push to main branch
4. Site will be available at: `https://[username].github.io/growthlab-infigma/`

### Manual Deployment

You can also deploy manually to other platforms:

**Netlify:**
```bash
npm run docs:build
# Upload docs/.vitepress/dist to Netlify
```

**Vercel:**
```bash
npm run docs:build
# Upload docs/.vitepress/dist to Vercel
```

## Customization

### Colors & Branding

Edit `.vitepress/theme/style.css` to customize:
- Brand colors (purple theme by default)
- Typography
- Component styles

### Navigation

Edit `.vitepress/config.mts` to update:
- Top navigation bar
- Sidebar structure
- Social links
- Search configuration

### Content

All markdown files in `docs/` are automatically rendered.
- Add new pages by creating `.md` files
- Update sidebar in `config.mts` to include new pages

## Writing Tips

### Frontmatter

Add metadata to pages:
```yaml
---
title: Page Title
description: Page description for SEO
---
```

### Custom Containers

```markdown
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a danger message
:::
```

### Code Blocks with Highlighting

```markdown
```typescript {2,4-6}
// Line 2 and lines 4-6 will be highlighted
const example = 'hello'
console.log(example)
```
```

## Learn More

- [VitePress Documentation](https://vitepress.dev/)
- [Markdown Extensions](https://vitepress.dev/guide/markdown)
- [Theme Customization](https://vitepress.dev/guide/custom-theme)
