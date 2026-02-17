import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Growthlab Builder",
  description: "Create professional experiment flow diagrams in Figma",
  base: '/growthlab-infigma/',
  
  head: [
    ['link', { rel: 'icon', href: '/growthlab-infigma/favicon.ico' }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/getting-started' },
      { text: 'Reference', link: '/user-guide' },
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/' },
          { text: 'Quick Start', link: '/getting-started' },
        ]
      },
      {
        text: 'Guide',
        items: [
          { text: 'User Guide', link: '/user-guide' },
          { text: 'Features', link: '/features' },
          { text: 'Best Practices', link: '/best-practices' },
        ]
      },
      {
        text: 'Help',
        items: [
          { text: 'FAQ', link: '/faq' },
          { text: 'Troubleshooting', link: '/troubleshooting' },
        ]
      },
      {
        text: 'Developer Docs',
        collapsed: true,
        items: [
          { text: 'Figma Plugin API', link: '/dev/figma-api' },
          { text: 'Plugin Messaging', link: '/dev/messaging' },
          { text: 'Plugin Manifest', link: '/dev/manifest' },
          { text: 'UX Guidelines', link: '/dev/ux-guidelines' },
          { text: 'Release Checklist', link: '/dev/release-checklist' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/growthlab-infigma' }
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Built with ❤️ for Growth Teams',
      copyright: 'Copyright © 2026 Growthlab'
    }
  }
})
