var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { loadFonts } from "./load-fonts";
export function createExperimentInfoCard(experimentName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield loadFonts();
        // Container
        const card = figma.createFrame();
        card.name = `Experiment Info — ${experimentName}`;
        card.layoutMode = "VERTICAL";
        card.counterAxisSizingMode = "AUTO";
        card.primaryAxisSizingMode = "FIXED";
        card.itemSpacing = 20;
        card.paddingLeft = card.paddingRight = 20;
        card.paddingTop = card.paddingBottom = 20;
        card.cornerRadius = 20;
        card.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        card.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.9, b: 1 } }];
        card.strokeWeight = 1;
        card.effects = [{ type: "DROP_SHADOW", color: { r: 0.1, g: 0.2, b: 0.4, a: 0.08 }, offset: { x: 0, y: 2 }, radius: 8, visible: true, blendMode: "NORMAL" }];
        card.resize(340, 480);
        // Status badge
        const badge = figma.createFrame();
        badge.layoutMode = "HORIZONTAL";
        badge.counterAxisSizingMode = "AUTO";
        badge.primaryAxisSizingMode = "AUTO";
        badge.paddingLeft = badge.paddingRight = 12;
        badge.paddingTop = badge.paddingBottom = 4;
        badge.cornerRadius = 8;
        badge.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
        badge.name = "Status Badge";
        const badgeText = figma.createText();
        badgeText.fontName = { family: "Figtree", style: "Bold" };
        badgeText.fontSize = 13;
        badgeText.fills = [{ type: "SOLID", color: { r: 1, g: 1, b: 1 } }];
        badgeText.textAutoResize = "WIDTH_AND_HEIGHT";
        badgeText.characters = "Active";
        badge.appendChild(badgeText);
        card.appendChild(badge);
        // Title row (with flask icon placeholder)
        const titleRow = figma.createFrame();
        titleRow.layoutMode = "HORIZONTAL";
        titleRow.counterAxisSizingMode = "AUTO";
        titleRow.primaryAxisSizingMode = "AUTO";
        titleRow.itemSpacing = 8;
        titleRow.fills = [];
        titleRow.strokes = [];
        titleRow.name = "Title Row";
        // Flask icon placeholder (could be replaced with SVG)
        const flask = figma.createEllipse();
        flask.resize(20, 20);
        flask.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
        flask.name = "Flask Icon";
        titleRow.appendChild(flask);
        const titleText = figma.createText();
        titleText.fontName = { family: "Figtree", style: "Bold" };
        titleText.fontSize = 20;
        titleText.fills = [{ type: "SOLID", color: { r: 0.15, g: 0.18, b: 0.25 } }];
        titleText.textAutoResize = "WIDTH_AND_HEIGHT";
        titleText.characters = experimentName;
        titleRow.appendChild(titleText);
        card.appendChild(titleRow);
        // Description section
        card.appendChild(createSection("Description", "Lorem ipsum"));
        // Hypothesis section
        card.appendChild(createSection("Hypothesis", "Lorem ipsum"));
        // Metrics section
        const metricsSection = figma.createFrame();
        metricsSection.layoutMode = "VERTICAL";
        metricsSection.counterAxisSizingMode = "AUTO";
        metricsSection.primaryAxisSizingMode = "AUTO";
        metricsSection.itemSpacing = 4;
        metricsSection.fills = [];
        metricsSection.strokes = [];
        metricsSection.name = "Metrics Section";
        const metricsLabel = figma.createText();
        metricsLabel.fontName = { family: "Figtree", style: "Semibold" };
        metricsLabel.fontSize = 13;
        metricsLabel.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
        metricsLabel.textAutoResize = "WIDTH_AND_HEIGHT";
        metricsLabel.characters = "Metrics";
        metricsSection.appendChild(metricsLabel);
        const metricsList = figma.createFrame();
        metricsList.layoutMode = "VERTICAL";
        metricsList.counterAxisSizingMode = "AUTO";
        metricsList.primaryAxisSizingMode = "AUTO";
        metricsList.itemSpacing = 2;
        metricsList.fills = [];
        metricsList.strokes = [];
        metricsList.appendChild(createMetricRow("Click through rate (CTR)", "--%"));
        metricsList.appendChild(createMetricRow("Conversion rate (CR)", "--%"));
        metricsList.appendChild(createMetricRow("Sign ups (SU)", "--%"));
        metricsSection.appendChild(metricsList);
        card.appendChild(metricsSection);
        // Links section
        const linksSection = figma.createFrame();
        linksSection.layoutMode = "VERTICAL";
        linksSection.counterAxisSizingMode = "AUTO";
        linksSection.primaryAxisSizingMode = "AUTO";
        linksSection.itemSpacing = 4;
        linksSection.fills = [];
        linksSection.strokes = [];
        linksSection.name = "Links Section";
        const linksLabel = figma.createText();
        linksLabel.fontName = { family: "Figtree", style: "Semibold" };
        linksLabel.fontSize = 13;
        linksLabel.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
        linksLabel.textAutoResize = "WIDTH_AND_HEIGHT";
        linksLabel.characters = "Links";
        linksSection.appendChild(linksLabel);
        const linksRow = figma.createFrame();
        linksRow.layoutMode = "HORIZONTAL";
        linksRow.counterAxisSizingMode = "AUTO";
        linksRow.primaryAxisSizingMode = "AUTO";
        linksRow.itemSpacing = 8;
        linksRow.fills = [];
        linksRow.strokes = [];
        linksRow.appendChild(createLinkChip("Figma project name"));
        linksRow.appendChild(createLinkChip("Jira KEY"));
        linksRow.appendChild(createLinkChip("Miro project name"));
        linksSection.appendChild(linksRow);
        card.appendChild(linksSection);
        return card;
    });
}
function createSection(label, value) {
    const section = figma.createFrame();
    section.layoutMode = "VERTICAL";
    section.counterAxisSizingMode = "AUTO";
    section.primaryAxisSizingMode = "AUTO";
    section.itemSpacing = 2;
    section.fills = [];
    section.strokes = [];
    section.name = `${label} Section`;
    const labelText = figma.createText();
    labelText.fontName = { family: "Figtree", style: "Semibold" };
    labelText.fontSize = 13;
    labelText.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
    labelText.textAutoResize = "WIDTH_AND_HEIGHT";
    labelText.characters = label;
    section.appendChild(labelText);
    const valueText = figma.createText();
    valueText.fontName = { family: "Figtree", style: "Regular" };
    valueText.fontSize = 14;
    valueText.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.3 } }];
    valueText.textAutoResize = "WIDTH_AND_HEIGHT";
    valueText.characters = value;
    section.appendChild(valueText);
    return section;
}
function createMetricRow(label, value) {
    const row = figma.createFrame();
    row.layoutMode = "HORIZONTAL";
    row.counterAxisSizingMode = "AUTO";
    row.primaryAxisSizingMode = "AUTO";
    row.itemSpacing = 8;
    row.fills = [];
    row.strokes = [];
    const labelText = figma.createText();
    labelText.fontName = { family: "Figtree", style: "Regular" };
    labelText.fontSize = 14;
    labelText.fills = [{ type: "SOLID", color: { r: 0.2, g: 0.2, b: 0.3 } }];
    labelText.textAutoResize = "WIDTH_AND_HEIGHT";
    labelText.characters = label;
    row.appendChild(labelText);
    const valueText = figma.createText();
    valueText.fontName = { family: "Figtree", style: "Bold" };
    valueText.fontSize = 14;
    valueText.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
    valueText.textAutoResize = "WIDTH_AND_HEIGHT";
    valueText.characters = value;
    row.appendChild(valueText);
    return row;
}
function createLinkChip(label) {
    const chip = figma.createFrame();
    chip.layoutMode = "HORIZONTAL";
    chip.counterAxisSizingMode = "AUTO";
    chip.primaryAxisSizingMode = "AUTO";
    chip.paddingLeft = chip.paddingRight = 10;
    chip.paddingTop = chip.paddingBottom = 4;
    chip.cornerRadius = 8;
    chip.fills = [{ type: "SOLID", color: { r: 0.95, g: 0.97, b: 1 } }];
    chip.strokes = [{ type: "SOLID", color: { r: 0.85, g: 0.9, b: 1 } }];
    chip.strokeWeight = 1;
    chip.name = "Link Chip";
    const txt = figma.createText();
    txt.fontName = { family: "Figtree", style: "Medium" };
    txt.fontSize = 13;
    txt.fills = [{ type: "SOLID", color: { r: 0.18, g: 0.45, b: 0.85 } }];
    txt.textAutoResize = "WIDTH_AND_HEIGHT";
    txt.characters = label;
    chip.appendChild(txt);
    return chip;
}
