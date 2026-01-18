/// <reference types="@figma/plugin-typings" />
import { TOKENS } from "./design-tokens";
import { hexToRgb } from "./layout-utils";
import { loadFonts, getLoadedFigtreeSemibold } from "./load-fonts";

// Brand icon SVG markup (complete SVGs for figma.createNodeFromSvg)
const BRAND_SVGS: Record<string, string> = {
  // Official Figma multi-color logo
  figma: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none">
    <path d="M8 24c2.208 0 4-1.792 4-4v-4H8c-2.208 0-4 1.792-4 4s1.792 4 4 4z" fill="#0ACF83"/>
    <path d="M4 12c0-2.208 1.792-4 4-4h4v8H8c-2.208 0-4-1.792-4-4z" fill="#A259FF"/>
    <path d="M4 4c0-2.208 1.792-4 4-4h4v8H8C5.792 8 4 6.208 4 4z" fill="#F24E1E"/>
    <path d="M12 0h4c2.208 0 4 1.792 4 4s-1.792 4-4 4h-4V0z" fill="#FF7262"/>
    <path d="M20 12c0 2.208-1.792 4-4 4s-4-1.792-4-4 1.792-4 4-4 4 1.792 4 4z" fill="#1ABCFE"/>
  </svg>`,

  // Notion multi-color logo
  notion: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_1113_19464)">
    <path d="M1.94896 1.18981L12.5963 0.403478C13.9041 0.291247 14.2402 0.366931 15.0625 0.964701L18.4613 3.35909C19.0219 3.77082 19.2085 3.88312 19.2085 4.33146V17.4629C19.2085 18.2859 18.9096 18.7726 17.8635 18.8471L5.49917 19.5956C4.71407 19.6328 4.34018 19.5205 3.92903 18.9965L1.42622 15.742C0.977303 15.143 0.79126 14.6946 0.79126 14.1705V2.4983C0.79126 1.82549 1.09018 1.26427 1.94896 1.18981Z" fill="white"/>
    <path d="M12.5963 0.403478L1.94896 1.18981C1.09018 1.26427 0.79126 1.82549 0.79126 2.4983V14.1706C0.79126 14.6946 0.977231 15.143 1.42622 15.742L3.92903 18.9965C4.34018 19.5205 4.71407 19.6328 5.49917 19.5956L17.8635 18.8471C18.909 18.7726 19.2085 18.2859 19.2085 17.4629V4.33146C19.2085 3.90621 19.0405 3.78369 18.5459 3.42067L18.4607 3.35909L15.0625 0.964701C14.2402 0.366931 13.9042 0.291247 12.5963 0.403478ZM5.77881 4.11657C4.76925 4.18456 4.54025 4.19995 3.96687 3.73362L2.50896 2.57398C2.36076 2.42391 2.43514 2.23657 2.80845 2.19938L13.044 1.45154C13.9035 1.3765 14.3512 1.676 14.6873 1.93772L16.4428 3.20966C16.5178 3.24743 16.7045 3.47132 16.48 3.47132L5.90968 4.10758L5.77881 4.11657ZM4.60184 17.3507V6.20305C4.60184 5.71621 4.75126 5.49175 5.19896 5.45391L17.3395 4.74319C17.7513 4.706 17.9373 4.96765 17.9373 5.45391V16.5271C17.9373 17.0139 17.8622 17.4256 17.19 17.4629L5.57227 18.1364C4.90011 18.1736 4.60184 17.9497 4.60184 17.3507ZM16.0702 6.80074C16.1446 7.13751 16.0702 7.47427 15.7334 7.51276L15.1735 7.62369V15.8542C14.6873 16.1159 14.2396 16.2653 13.8656 16.2653C13.2679 16.2653 13.1184 16.078 12.6707 15.5174L9.00896 9.75636V15.3302L10.1672 15.5925C10.1672 15.5925 10.1672 16.266 9.23277 16.266L6.65622 16.4154C6.58119 16.2653 6.65622 15.8914 6.91738 15.817L7.59011 15.6303V8.26067L6.6563 8.18499C6.58119 7.8483 6.76781 7.36204 7.29126 7.3242L10.0557 7.13823L13.8656 12.9737V7.8111L12.8946 7.69945C12.8195 7.287 13.1184 6.98751 13.4917 6.95096L16.0702 6.80074Z" fill="black"/>
    </g>
    <defs>
    <clipPath id="clip0_1113_19464">
    <rect width="20" height="20" fill="white"/>
    </clipPath>
    </defs>
  </svg>`,

  // Amplitude multi-color logo
  amplitude: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_1113_19449)">
    <path d="M10 0.375916C15.3145 0.375916 19.6241 4.68546 19.6241 9.99998C19.6241 15.3145 15.3145 19.624 10 19.624C4.68553 19.624 0.375977 15.3183 0.375977 9.99998C0.375977 4.68163 4.68553 0.375916 10 0.375916ZM8.72846 3.31727C7.54184 3.3211 6.46733 5.23043 5.54357 8.98734C4.89041 8.9796 4.29132 8.96802 3.73086 8.96028H3.6459C3.57628 8.95637 3.50673 8.96028 3.4371 8.96802C3.12019 9.02592 2.89214 9.30426 2.89214 9.62509C2.89214 9.95366 3.13568 10.2358 3.46034 10.286L3.46801 10.2937H5.24214C5.08006 11.0268 4.93701 11.764 4.81312 12.5046L4.75898 12.8176V12.8331C4.75904 12.9072 4.77785 12.9801 4.81366 13.0449C4.84947 13.1098 4.90112 13.1646 4.9638 13.2041C5.16868 13.3355 5.44312 13.2737 5.57455 13.0688L5.58613 13.0804L6.45575 10.2937H10.6455C10.9663 11.5073 11.2987 12.7558 11.7394 13.9308C11.9751 14.5608 12.5239 16.0295 13.4439 16.0373H13.4555C14.8778 16.0373 15.4344 13.7375 15.8015 12.2147C15.8827 11.8861 15.9484 11.604 16.0141 11.3952L16.0412 11.3103L16.0451 11.2977C16.0752 11.1891 16.0138 11.0731 15.9059 11.0358C15.7938 10.9972 15.6663 11.0552 15.6276 11.1711L15.5967 11.2561C15.4769 11.5924 15.3648 11.9055 15.2643 12.1876L15.2566 12.2108C14.6382 13.954 14.3599 14.7502 13.8072 14.7502H13.7724C13.0651 14.7502 12.4041 11.8823 12.1528 10.8039C12.1103 10.6184 12.0717 10.4445 12.033 10.2937H16.5939C16.6751 10.2937 16.7562 10.2744 16.8297 10.2358L16.8332 10.2328C16.8383 10.2296 16.8436 10.2268 16.849 10.2242L16.8721 10.2087L16.8837 10.201C16.8954 10.1932 16.907 10.1855 16.9185 10.1739L16.9356 10.1598C17.0194 10.0869 17.0787 9.98524 17.104 9.88013C17.1621 9.60569 16.9804 9.33516 16.706 9.2811H16.6827C16.6557 9.27719 16.6325 9.27336 16.6055 9.27336L16.5359 9.26562C14.9242 9.14968 13.266 9.10321 11.7084 9.07238L11.7045 9.06073C10.9509 6.2199 10.0038 3.31727 8.72846 3.31727ZM8.67816 4.59659C8.74387 4.59659 8.80575 4.63524 8.85981 4.70486C8.99124 4.91351 9.22312 5.38118 9.56718 6.41704C9.80289 7.12825 10.058 8.01328 10.3285 9.0414C9.30049 9.02599 8.26462 9.01434 7.25966 9.00276L6.74951 8.99892C7.32545 6.74945 8.025 5.04494 8.53898 4.64298C8.58154 4.61592 8.62793 4.59659 8.67816 4.59659Z" fill="#10069F"/>
    </g>
    <defs>
    <clipPath id="clip0_1113_19449">
    <rect width="20" height="20" fill="white"/>
    </clipPath>
    </defs>
  </svg>`,

  // Miro multi-color logo
  miro: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_1113_19461)">
    <path d="M0.375977 5.18795C0.375977 2.53035 2.53041 0.375916 5.18801 0.375916H14.8121C17.4697 0.375916 19.6241 2.53035 19.6241 5.18795V14.812C19.6241 17.4696 17.4697 19.624 14.8121 19.624H5.18801C2.53041 19.624 0.375977 17.4696 0.375977 14.812V5.18795Z" fill="#FFDD33"/>
    <path d="M13.1725 4.0451H11.4252L12.8813 6.60345L9.67791 4.0451H7.93062L9.53235 7.17202L6.18333 4.0451H4.43604L6.18333 8.02533L4.43604 15.985H6.18333L9.53235 7.45668L7.93062 15.985H9.67791L12.8813 6.88811L11.4252 15.985H13.1725L16.3759 6.0348L13.1725 4.0451Z" fill="black"/>
    </g>
    <defs>
    <clipPath id="clip0_1113_19461">
    <rect width="20" height="20" fill="white"/>
    </clipPath>
    </defs>
  </svg>`,

  // Jira multi-color logo
  jira: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_1113_19457)">
    <path d="M18.7713 0.375916H9.52686C9.52684 0.923938 9.63476 1.4666 9.84447 1.97291C10.0542 2.47922 10.3616 2.93926 10.7491 3.32677C11.1366 3.71429 11.5966 4.02167 12.1029 4.23138C12.6093 4.44109 13.1519 4.54902 13.6999 4.549H15.4029V6.19321C15.4044 8.49584 17.2706 10.3622 19.5732 10.3637V1.17787C19.5732 0.735089 19.2143 0.375916 18.7713 0.375916Z" fill="#2684FF"/>
    <path d="M14.1972 4.98212H4.95288C4.95431 7.28475 6.82055 9.15106 9.12326 9.15257H10.8262V10.802C10.8291 13.1047 12.6966 14.9697 14.9993 14.9697V5.78422C14.9993 5.34129 14.6402 4.98212 14.1972 4.98212Z" fill="url(#paint0_linear_1113_19457)"/>
    <path d="M9.62041 9.58563H0.375977C0.375977 11.8904 2.2444 13.7587 4.54906 13.7587H6.25733V15.4029C6.25883 17.7034 8.12184 19.5689 10.4224 19.5732V10.3877C10.4224 9.94473 10.0633 9.58563 9.62041 9.58563Z" fill="url(#paint1_linear_1113_19457)"/>
    </g>
    <defs>
    <linearGradient id="paint0_linear_1113_19457" x1="989.811" y1="6.59013" x2="598.957" y2="414.429" gradientUnits="userSpaceOnUse">
    <stop offset="0.18" stop-color="#0052CC"/>
    <stop offset="1" stop-color="#2684FF"/>
    </linearGradient>
    <linearGradient id="paint1_linear_1113_19457" x1="1011.7" y1="14.13" x2="559.584" y2="458.957" gradientUnits="userSpaceOnUse">
    <stop offset="0.18" stop-color="#0052CC"/>
    <stop offset="1" stop-color="#2684FF"/>
    </linearGradient>
    <clipPath id="clip0_1113_19457">
    <rect width="20" height="20" fill="white"/>
    </clipPath>
    </defs>
  </svg>`,

  // Generic link icon
  generic: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>`
};

/**
 * Create a brand icon as a Figma frame from SVG
 * @param brand - Brand name (figma, miro, jira, generic)
 * @param size - Icon size in pixels (default 14)
 * @returns FrameNode containing the vector icon
 */
function createBrandIconVector(brand: string, size: number = 14): FrameNode {
  const brandLower = brand.toLowerCase();
  const svgMarkup = BRAND_SVGS[brandLower] || BRAND_SVGS.generic;
  
  try {
    // Create node from SVG - this returns a FrameNode with vectors inside
    const svgNode = figma.createNodeFromSvg(svgMarkup);
    svgNode.name = `${brand} Icon`;
    
    // Scale to target size (SVG is 24x24)
    const scale = size / 16;
    svgNode.resize(size, size);
    
    // Flatten to clean up the structure
    svgNode.fills = [];
    
    return svgNode;
  } catch (e) {
    console.error(`Failed to create SVG icon for ${brand}:`, e);
    
    // Fallback: create empty frame
    const fallback = figma.createFrame();
    fallback.name = `${brand} Icon (fallback)`;
    fallback.resize(size, size);
    fallback.fills = [];
    return fallback;
  }
}

export interface MetricDefinition {
  id: string;
  name: string;
  abbreviation?: string;
  min?: number;
  max?: number;
}

// Status configuration matching the plugin UI dropdown
export type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

const STATUS_STYLES: Record<ExperimentStatus, StatusConfig> = {
  draft: {
    label: 'Draft',
    bgColor: TOKENS.yellow100, // yellow-100
    textColor: TOKENS.yellow600, // yellow-600
  },
  running: {
    label: 'Running',
    bgColor: TOKENS.royalBlue100,
    textColor: TOKENS.royalBlue600,
  },
  paused: {
    label: 'Paused',
    bgColor: TOKENS.coralRed100, // red-100
    textColor: TOKENS.coralRed600, // red-600
  },
  completed: {
    label: 'Completed',
    bgColor: TOKENS.malachite100,
    textColor: TOKENS.malachite800,
  },
};

export async function createExperimentInfoCard(
  experimentName: string,
  description: string = "",
  figmaLink: string = "",
  jiraLink: string = "",
  miroLink: string = "",
  notionLink: string = "",
  amplitudeLink: string = "",
  asanaLink: string = "",
  LinearLink: string = "",
  SlackLink: string = "",
  GithubLink: string = "",
  ConfluenceLink: string = "",
  TrelloLink: string = "",
  MondayLink: string = "",
  ClickupLink: string = "",


  metrics?: MetricDefinition[],
  status: ExperimentStatus = 'running'
): Promise<FrameNode> {
  // Ensure all fonts are loaded before creating any text nodes
  await loadFonts();
  // Container
  const card = figma.createFrame();
  card.name = `Experiment Info — ${experimentName}`;
  card.layoutMode = "VERTICAL";
  card.counterAxisSizingMode = "AUTO";
  card.primaryAxisSizingMode = "AUTO";
  card.itemSpacing = 24;
  card.paddingLeft = card.paddingRight = 32;
  card.paddingTop = card.paddingBottom = 32;
  card.cornerRadius = 18;
  card.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsSurface) }];
  card.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  card.strokeWeight = 1;
  card.effects = [];
  card.minWidth = 400;
  card.minHeight = 400;

  // Description section with experiment name, description, and status badge
  const statusConfig = STATUS_STYLES[status] || STATUS_STYLES.running;
  const descSection = await createDescriptionSection(experimentName, description || "", statusConfig);
  card.appendChild(descSection);
  // Make Description section fill card width (minus padding)
  descSection.primaryAxisSizingMode = "AUTO";
  descSection.itemSpacing = 8;
  descSection.resize(card.width - card.paddingLeft - card.paddingRight, descSection.height);

  // Metrics section
  const metricsSection = figma.createFrame();
  metricsSection.layoutMode = "VERTICAL";
  metricsSection.counterAxisSizingMode = "AUTO";
  metricsSection.primaryAxisSizingMode = "AUTO";
  metricsSection.layoutAlign = 'STRETCH';
  metricsSection.primaryAxisAlignItems = "MIN";
  metricsSection.counterAxisAlignItems = "MIN";
  metricsSection.paddingBottom = 0;
  metricsSection.paddingTop = 0;
  metricsSection.paddingLeft = 0;
  metricsSection.paddingRight = 0;
  metricsSection.itemSpacing = 0;
  metricsSection.fills = [];
  metricsSection.strokes = [];
  metricsSection.name = "Metrics Section";
  // Header row with Metrics Header and Expected Range
  const headerRow = figma.createFrame();
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.counterAxisSizingMode = "AUTO";
  headerRow.primaryAxisSizingMode = "AUTO";
  headerRow.primaryAxisAlignItems = "SPACE_BETWEEN";
  headerRow.counterAxisAlignItems = "MIN";
  headerRow.itemSpacing = 0;
  headerRow.fills = [];
  headerRow.strokes = [];
  headerRow.name = "Metrics Header Row";
  headerRow.layoutAlign = 'STRETCH';
  headerRow.minWidth = 336; // 21rem
  headerRow.maxWidth = 336; // 21rems
  headerRow.paddingBottom = TOKENS.space8;
  headerRow.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  headerRow.strokeWeight = 1.5;
  headerRow.strokeTopWeight = 0;
  headerRow.strokeRightWeight = 0;
  headerRow.strokeLeftWeight = 0;
  const metricsLabel = figma.createText();
  metricsLabel.fontName = { family: "Figtree", style: "Bold" };
  metricsLabel.fontSize = TOKENS.fontSizeLabel;
  metricsLabel.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  metricsLabel.opacity = 0.5;
  metricsLabel.textAutoResize = "WIDTH_AND_HEIGHT";
  metricsLabel.characters = "Metrics Header";
  headerRow.appendChild(metricsLabel);
  const expectedRangeLabel = figma.createText();
  expectedRangeLabel.fontName = { family: "Figtree", style: "Bold" };
  expectedRangeLabel.fontSize = TOKENS.fontSizeLabel;
  expectedRangeLabel.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  expectedRangeLabel.opacity = 0.5;
  expectedRangeLabel.textAutoResize = "WIDTH_AND_HEIGHT";
  expectedRangeLabel.characters = "Expected Range";
  headerRow.appendChild(expectedRangeLabel);
  metricsSection.appendChild(headerRow);
  // Metrics rows
  if (metrics && metrics.length > 0) {
    metrics.forEach((metric, index) => {
      metricsSection.appendChild(createMetricRow(index + 1, metric.name, metric.min, metric.max));
    });
  } else {
    // Fallback to default metrics if none provided
    metricsSection.appendChild(createMetricRow(1, "Click through rate (CTR)", undefined, undefined));
    metricsSection.appendChild(createMetricRow(2, "Conversion rate (CR)", undefined, undefined));
    metricsSection.appendChild(createMetricRow(3, "Sign ups (SU)", undefined, undefined));
  }
  card.appendChild(metricsSection);

  // Links section
  const linksSection = figma.createFrame();
  linksSection.layoutMode = "VERTICAL";
  linksSection.counterAxisSizingMode = "AUTO";
  linksSection.primaryAxisSizingMode = "AUTO";
  linksSection.primaryAxisAlignItems = "MIN";
  linksSection.counterAxisAlignItems = "MIN";
  linksSection.layoutAlign = 'STRETCH';
  linksSection.itemSpacing = 8;
  linksSection.fills = [];
  linksSection.strokes = [];
  linksSection.name = "Links Section";
  const linksLabel = figma.createText();
  linksLabel.fontName = { family: "Figtree", style: "Bold" };
  linksLabel.fontSize = TOKENS.fontSizeLabel;
  linksLabel.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  linksLabel.opacity = 0.5;
  linksLabel.textAutoResize = "WIDTH_AND_HEIGHT";
  linksLabel.characters = "Artifacts";
  linksSection.appendChild(linksLabel);
  
  // Links container - vertical stack for multiple links
  const linksContainer = figma.createFrame();
  linksContainer.layoutMode = "VERTICAL";
  linksContainer.counterAxisSizingMode = "AUTO";
  linksContainer.primaryAxisSizingMode = "AUTO";
  linksContainer.primaryAxisAlignItems = "MIN";
  linksContainer.counterAxisAlignItems = "MIN";
  linksContainer.layoutAlign = 'STRETCH';
  linksContainer.itemSpacing = 8;
  linksContainer.fills = [];
  linksContainer.strokes = [];
  linksContainer.name = "Links";
  
  // Add Figma link
  if (figmaLink) {
    linksContainer.appendChild(createLinkChip("Figma", figmaLink));
  }
  // Add Jira link
  if (jiraLink) {
    linksContainer.appendChild(createLinkChip("Jira", jiraLink));
  }
  // Add Miro link
  if (miroLink) {
    linksContainer.appendChild(createLinkChip("Miro", miroLink));
  }
  // Add Notion link
  if (notionLink) {
    linksContainer.appendChild(createLinkChip("Notion", notionLink));
  }
  // Add Amplitude link
  if (amplitudeLink) {
    linksContainer.appendChild(createLinkChip("Amplitude", amplitudeLink));
  }
  // Add Asana link
  if (asanaLink) {
    linksContainer.appendChild(createLinkChip("Asana", asanaLink));
  }
  // Add Linear link
  if (LinearLink) {
    linksContainer.appendChild(createLinkChip("Linear", LinearLink));
  }
  // Add Slack link
  if (SlackLink) {
    linksContainer.appendChild(createLinkChip("Slack", SlackLink));
  }
  // Add GitHub link
  if (GithubLink) {
    linksContainer.appendChild(createLinkChip("GitHub", GithubLink));
  }
  // Add Confluence link
  if (ConfluenceLink) {
    linksContainer.appendChild(createLinkChip("Confluence", ConfluenceLink));
  }
  // Add Trello link
  if (TrelloLink) {
    linksContainer.appendChild(createLinkChip("Trello", TrelloLink));
  }
  // Add Monday link
  if (MondayLink) {
    linksContainer.appendChild(createLinkChip("Monday", MondayLink));
  }
  // Add Clickup link
  if (ClickupLink) {
    linksContainer.appendChild(createLinkChip("Clickup", ClickupLink));
  }
  linksSection.appendChild(linksContainer);
  card.appendChild(linksSection);

  return card;
}

async function createDescriptionSection(experimentName: string, description: string, statusConfig: StatusConfig): Promise<FrameNode> {
  await loadFonts();
  const section = figma.createFrame();
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "AUTO";
  section.primaryAxisSizingMode = "AUTO";
  section.primaryAxisAlignItems = "MIN";
  section.counterAxisAlignItems = "MIN";
  section.layoutAlign = 'STRETCH';
  section.resizeWithoutConstraints(section.width, section.height);
  section.itemSpacing = 8;
  section.fills = [];
  section.strokes = [];
  section.name = "Description Section";
  
  // Status badge - above experiment name
  const badge = figma.createFrame();
  badge.layoutMode = "HORIZONTAL";
  badge.counterAxisSizingMode = "AUTO";
  badge.primaryAxisSizingMode = "AUTO";
  badge.paddingLeft = badge.paddingRight = 6;
  badge.paddingTop = badge.paddingBottom = 2;
  badge.cornerRadius = 4;
  badge.fills = [{ type: "SOLID", color: hexToRgb(statusConfig.bgColor) }];
  badge.name = "Status Badge";
  const badgeText = figma.createText();
  badgeText.fontName = { family: "Figtree", style: "Medium" };
  badgeText.fontSize = TOKENS.fontSizeBodySm;
  badgeText.lineHeight = { unit: "PIXELS", value: 13 };
  badgeText.fills = [{ type: "SOLID", color: hexToRgb(statusConfig.textColor) }];
  badgeText.textAutoResize = "WIDTH_AND_HEIGHT";
  badgeText.characters = statusConfig.label;
  badge.appendChild(badgeText);
  section.appendChild(badge);
  
  // Experiment name
  const titleText = figma.createText();
  titleText.fontName = { family: "Figtree", style: "Medium" };
  titleText.fontSize = 24;
  titleText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  titleText.textAutoResize = "WIDTH_AND_HEIGHT";
  titleText.characters = experimentName && experimentName.length > 0 ? experimentName : 'Experiment name';
  section.appendChild(titleText);
  
  // Description text
  if (description) {
    const valueText = figma.createText();
    valueText.fontName = { family: "Figtree", style: "Regular" };
    valueText.fontSize = TOKENS.fontSizeBodyMd;
    valueText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
    valueText.textAutoResize = "WIDTH_AND_HEIGHT";
    valueText.layoutAlign = "STRETCH";
    valueText.characters = description;
    section.appendChild(valueText);
  }
  
  return section;
}

async function createSection(label: string, value: string, _muted: boolean = false): Promise<FrameNode> {
  await loadFonts();
  const section = figma.createFrame();
  section.layoutMode = "VERTICAL";
  section.counterAxisSizingMode = "AUTO";
  section.primaryAxisSizingMode = "AUTO";
  section.primaryAxisAlignItems = "MIN";
  section.counterAxisAlignItems = "MIN";
  section.layoutAlign = 'STRETCH';
  section.itemSpacing = 8;
  section.fills = [];
  section.strokes = [];
  section.name = `${label} Section`;
  // Skip label text for Description section
  if (label !== "Description") {
    const labelText = figma.createText();
    labelText.fontName = { family: "Figtree", style: getLoadedFigtreeSemibold() };
    labelText.fontSize = 14;
    labelText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textSecondary) }];
    labelText.textAutoResize = "WIDTH_AND_HEIGHT";
    labelText.characters = label;
    section.appendChild(labelText);
  }
  const valueText = figma.createText();
  valueText.fontName = { family: "Figtree", style: "Regular" };
  valueText.fontSize = 14;
  valueText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  valueText.textAutoResize = label === "Description" ? "HEIGHT" : "WIDTH_AND_HEIGHT";
  valueText.characters = value;
  section.appendChild(valueText);
  // If Description, make valueText fill section width
  if (label === "Description") {
    valueText.layoutAlign = "STRETCH";
    // Optionally, still ensure width matches section
    valueText.resizeWithoutConstraints(section.width, valueText.height);
  }
  return section;
}

function createMetricRow(num: number, label: string, min?: number, max?: number): FrameNode {
  const row = figma.createFrame();
  row.layoutMode = "HORIZONTAL";
  row.counterAxisSizingMode = "AUTO";
  row.primaryAxisSizingMode = "AUTO";
  row.layoutAlign = 'STRETCH';
  row.counterAxisAlignItems = 'CENTER'; 
  row.primaryAxisAlignItems = 'SPACE_BETWEEN';
  row.paddingTop = row.paddingBottom = TOKENS.space8;
  row.paddingLeft = 0;
  row.paddingRight = 0;
  row.minWidth = 336; // 21rem
  row.maxWidth = 336; // 21rems
  row.fills = [];
  row.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  row.strokeWeight = 1;
  row.strokeTopWeight = 0;
  row.strokeRightWeight = 0;
  row.strokeLeftWeight = 0;
  row.name = `Metric Row`;
  // Number - hidden for now
  // const numText = figma.createText();
  // numText.fontName = { family: "Figtree", style: "Regular" };
  // numText.fontSize = 14;
  // numText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textSecondary) }];
  // numText.textAutoResize = "WIDTH_AND_HEIGHT";
  // numText.characters = `${num}.`;
  // row.appendChild(numText);
  // Label
  const labelText = figma.createText();
  labelText.fontName = { family: "Figtree", style: "Regular" };
  labelText.fontSize = TOKENS.fontSizeBodySm;
  labelText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  labelText.textAutoResize = "WIDTH_AND_HEIGHT";
  labelText.characters = label;
  labelText.name = "Metric Label";
  row.appendChild(labelText);
  // Icon + value pill
  const pill = figma.createFrame();
  pill.layoutMode = "HORIZONTAL";
  pill.counterAxisSizingMode = "AUTO";
  pill.primaryAxisSizingMode = "AUTO";
  pill.primaryAxisAlignItems = 'CENTER';
  pill.counterAxisAlignItems = 'CENTER';
  pill.itemSpacing = 4;
  pill.paddingLeft = 6;
  pill.paddingRight = 6;
  pill.paddingTop = pill.paddingBottom = 2;
  pill.cornerRadius = 4
  pill.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsBackground) }];
  pill.name = "Metric Pill";
  // Icon (target/goal) - hidden for now
  // const icon = figma.createText();
  // icon.fontName = { family: "Figtree", style: "Bold" };
  // icon.fontSize = TOKENS.fontSizeBodySm;
  // icon.lineHeight = { unit: "PIXELS", value: 14 };
  // icon.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  // icon.opacity = 0.5;
  // icon.textAutoResize = "WIDTH_AND_HEIGHT";
  // icon.characters = "◎";
  // icon.name = "Metric Icon";
  // pill.appendChild(icon);
  // Value - format as min - max
  const valueText = figma.createText();
  valueText.fontName = { family: "Figtree", style: "Regular" };
  valueText.fontSize = TOKENS.fontSizeBodySm;
  valueText.lineHeight = { unit: "PIXELS", value: 14 };
  valueText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  valueText.textAutoResize = "WIDTH_AND_HEIGHT";
  let valueString = "--";
  if (min !== undefined && max !== undefined) {
    valueString = `${min} - ${max}`;
  } else if (min !== undefined) {
    valueString = `${min} - --`;
  } else if (max !== undefined) {
    valueString = `-- - ${max}`;
  }
  valueText.characters = valueString;
  valueText.name = "Metric Value";
  pill.appendChild(valueText);
  row.appendChild(pill);
  return row;
}

function createLinkChip(label: string, url?: string): FrameNode {
  const chip = figma.createFrame();
  chip.layoutMode = "HORIZONTAL";
  chip.counterAxisSizingMode = "AUTO";
  chip.primaryAxisSizingMode = "AUTO";
  chip.primaryAxisAlignItems = "MIN";
  chip.counterAxisAlignItems = "CENTER";
  chip.layoutAlign = 'STRETCH';
  chip.minWidth = 336; // 21rem
  chip.maxWidth = 336; // 21rem
  chip.itemSpacing = 8;
  chip.paddingLeft = chip.paddingRight = 12;
  chip.paddingTop = chip.paddingBottom = 8;
  chip.cornerRadius = 8;
  chip.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.fillsSurface) }];
  chip.strokes = [{ type: "SOLID", color: hexToRgb(TOKENS.border) }];
  chip.strokeWeight = 1;
  chip.name = "Link Chip";
  
  // Brand icon (vector) - larger size for this layout
  const icon = createBrandIconVector(label, 16);
  chip.appendChild(icon);
  
  // Text container (vertical stack for title + URL)
  const textContainer = figma.createFrame();
  textContainer.layoutMode = "VERTICAL";
  textContainer.counterAxisSizingMode = "AUTO";
  textContainer.primaryAxisSizingMode = "AUTO";
  textContainer.itemSpacing = 0;
  textContainer.fills = [];
  textContainer.name = "Link Text";
  textContainer.layoutAlign = "STRETCH";
  
  
  // Title - descriptive link label
  const linkLabels: Record<string, string> = {
    'Figma': 'Figma link',
    'Miro': 'Miro board',
    'Jira': 'Jira ticket',
    'Notion': 'Notion page',
    'Amplitude': 'Amplitude dashboard',
    'Generic': 'Link to website',
    'Asana': 'Asana task',
    'Linear': 'Linear ticket',
    'Slack': 'Slack channel',
    'GitHub': 'GitHub repository',
    'Confluence': 'Confluence page',
    'Trello': 'Trello board',
    'Monday': 'Monday task',
    'ClickUp': 'ClickUp task',
  };
  const title = figma.createText();
  title.fontName = { family: "Figtree", style: "Regular" };
  title.fontSize = TOKENS.fontSizeBodySm;
  title.lineHeight = { unit: "PIXELS", value: 12 };
  title.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
  title.textAutoResize = "WIDTH_AND_HEIGHT";
  title.name = "Link Title";
  title.characters = linkLabels[label] || `${label} link`;
  textContainer.appendChild(title);
  
  // URL - smaller, secondary color
  if (url) {
    const urlText = figma.createText();
    urlText.fontName = { family: "Figtree", style: "Regular" };
    urlText.fontSize = TOKENS.fontSizeLabel;
    urlText.lineHeight = { unit: "PIXELS", value: 10 };
    urlText.fills = [{ type: "SOLID", color: hexToRgb(TOKENS.textPrimary) }];
    urlText.opacity = 0.5;
    urlText.textAutoResize = "WIDTH_AND_HEIGHT";
    urlText.name = "Link URL";
    // Truncate long URLs
    const maxLength = 58;
    const displayUrl = url.length > maxLength 
      ? url.substring(0, maxLength) + '...' 
      : url;
    urlText.characters = url.length > maxLength 
      ? url.substring(0, maxLength) + '...' 
      : url;
    textContainer.appendChild(urlText);
  }
  
  chip.appendChild(textContainer);
  // Figma plugin API does not support setting hyperlinks on FrameNode directly.
  // If hyperlink support is added in the future, add it here.
  return chip;
}