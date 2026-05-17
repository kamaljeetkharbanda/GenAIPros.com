#!/usr/bin/env node
/**
 * scripts/build.js
 *
 * Reads:
 *   - brand/design-config.json
 *   - topics/<NN-slug>/topic.yaml
 *   - topics/<NN-slug>/deck-outline.md
 *
 * Writes:
 *   - output/t<NN>/deck.pptx
 *
 * Design system: slate-based with sky/teal/amber category colors and purple
 * reserved for the headline concept. Every slide has the author footer.
 */

const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");

// ---------------- YAML parser ----------------
function parseSimpleYaml(text) {
  const out = {};
  const lines = text.split("\n");
  const stack = [{ indent: -1, obj: out }];
  for (const raw of lines) {
    const line = raw.replace(/\r$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    const parent = stack[stack.length - 1].obj;
    const m = line.trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rest] = m;
    if (rest === "") {
      parent[key] = {};
      stack.push({ indent, obj: parent[key] });
    } else {
      let v = rest;
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      else if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
      else if (v === "true") v = true;
      else if (v === "false") v = false;
      else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
      parent[key] = v;
    }
  }
  return out;
}

// ---------------- outline parser ----------------
function parseOutline(md) {
  const blocks = md.split(/^## Slide \d+\s*$/m).slice(1);
  return blocks
    .map((b) => b.replace(/^---\s*$/gm, "").trim())
    .filter((b) => b.length > 0)
    .map(parseSlideBlock);
}

function parseSlideBlock(block) {
  const out = {};
  const lines = block.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) { i++; continue; }
    const blockMatch = line.match(/^([A-Za-z0-9_-]+):\s*\|\s*$/);
    if (blockMatch) {
      const key = blockMatch[1];
      i++;
      const collected = [];
      let baseIndent = null;
      while (i < lines.length) {
        const l = lines[i];
        if (baseIndent === null) {
          if (l.trim() === "") { i++; continue; }
          baseIndent = l.length - l.trimStart().length;
          if (baseIndent === 0) break;
        }
        const thisIndent = l.length - l.trimStart().length;
        if (l.trim() !== "" && thisIndent < baseIndent) break;
        collected.push(l.slice(baseIndent));
        i++;
      }
      out[key] = collected.join("\n").replace(/\s+$/, "");
      continue;
    }
    const arrayMatch = line.match(/^([A-Za-z0-9_-]+):\s*$/);
    if (arrayMatch) {
      const peek = lines[i + 1] || "";
      if (/^\s+-\s/.test(peek)) {
        const key = arrayMatch[1];
        const items = [];
        i++;
        while (i < lines.length) {
          const l = lines[i];
          if (!l.trim()) { i++; continue; }
          if (!/^\s+-\s/.test(l) && !/^\s+[A-Za-z0-9_-]+:/.test(l)) break;
          if (/^\s+-\s/.test(l)) {
            const obj = {};
            const itemFirstLine = l.replace(/^\s+-\s*/, "");
            const itemKv = itemFirstLine.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
            if (itemKv) obj[itemKv[1]] = parseScalar(itemKv[2]);
            else if (itemFirstLine.trim()) { items.push(parseScalar(itemFirstLine)); i++; continue; }
            i++;
            while (i < lines.length) {
              const cont = lines[i];
              if (!cont.trim()) { i++; continue; }
              if (/^\s+-\s/.test(cont)) break;
              const contKv = cont.trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
              if (!contKv) break;
              const dashIndent = l.length - l.trimStart().length;
              const contIndent = cont.length - cont.trimStart().length;
              if (contIndent <= dashIndent) break;
              obj[contKv[1]] = parseScalar(contKv[2]);
              i++;
            }
            items.push(obj);
          } else i++;
        }
        out[key] = items;
        continue;
      }
    }
    const kv = line.trim().match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) out[kv[1]] = parseScalar(kv[2]);
    i++;
  }
  return out;
}

function parseScalar(v) {
  if (v === undefined) return "";
  v = v.trim();
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

// ---------------- load inputs ----------------
const ROOT = path.resolve(__dirname, "..");
const topicDir = process.argv[2] || `topics/01-example`;
const topicYamlPath = path.join(ROOT, topicDir, "topic.yaml");
const outlinePath = path.join(ROOT, topicDir, "deck-outline.md");

function fail(msg) {
  console.error("BUILD FAILED:", msg);
  process.exit(1);
}

if (!fs.existsSync(topicYamlPath)) fail(`No topic.yaml at ${topicYamlPath}.`);
if (!fs.existsSync(outlinePath)) fail(`No deck-outline.md at ${outlinePath}. Run /finish-topic first.`);

const config = JSON.parse(fs.readFileSync(path.join(ROOT, "brand/design-config.json"), "utf8"));
const topic = parseSimpleYaml(fs.readFileSync(topicYamlPath, "utf8"));
const outline = parseOutline(fs.readFileSync(outlinePath, "utf8"));

if (outline.length === 0) fail("deck-outline.md contains no slide blocks");

const C = config.colorPalette;
const T = config.typography;
const TS = T.sizes;
const L = config.layout;
const A = config.author;
const TOTAL = outline.length;
const TOPIC_NUM = String(topic.topic_number || path.basename(topicDir).match(/^\d+/)?.[0] || "?").padStart(2, "0");

// category color picker — accepts a "category" field on each slide/card
function catColor(cat) {
  const map = {
    sky: C.sky, teal: C.teal, amber: C.amber, purple: C.purple,
    slate: C.slate700, neutral: C.slate400,
    1: C.sky, 2: C.teal, 3: C.amber, headline: C.purple,
  };
  return map[cat] || C.sky;
}
function catSoft(cat) {
  const map = {
    sky: C.skySoft, teal: C.tealSoft, amber: C.amberSoft, purple: C.purpleSoft,
    1: C.skySoft, 2: C.tealSoft, 3: C.amberSoft, headline: C.purpleSoft,
  };
  return map[cat] || C.skySoft;
}

// ---------------- pptx setup ----------------
const pptx = new PptxGenJS();
pptx.defineLayout({ name: "CUSTOM", width: L.slideWidth, height: L.slideHeight });
pptx.layout = "CUSTOM";
pptx.author = A.name;
pptx.company = config.brandName;
pptx.title = topic.topic_name || "Topic";

// ---------------- common helpers ----------------
function addFooter(slide, pageNum, isDark = false) {
  if (!config.footer.showOnContentSlides && !isDark) return;
  if (isDark && !config.footer.showOnDarkSlides) return;

  const textColor = isDark ? C.white : C.slate700;
  const subColor = isDark ? C.slate400 : C.slate400;

  // Author name (italic, Georgia)
  slide.addText(A.name, {
    x: L.marginLeft,
    y: L.footerTop,
    w: 6,
    h: 0.22,
    fontSize: TS.footerName,
    fontFace: T.signatureFont,
    color: textColor,
    italic: true,
  });

  // Title + tagline
  slide.addText(`${A.title}  ·  ${A.tagline}`, {
    x: L.marginLeft,
    y: L.footerTop + 0.22,
    w: 8,
    h: 0.22,
    fontSize: TS.footer,
    fontFace: T.bodyFont,
    color: subColor,
  });

  // Page number
  if (config.footer.showOnContentSlides) {
    const txt = config.footer.pageNumberFormat
      .replace("{n}", pageNum)
      .replace("{total}", TOTAL);
    slide.addText(txt, {
      x: L.slideWidth - L.marginRight - 2,
      y: L.footerTop + 0.11,
      w: 2,
      h: 0.22,
      fontSize: TS.footer,
      fontFace: T.bodyFont,
      color: subColor,
      align: "right",
    });
  }
}

function addTitleBar(slide, title, subtitle) {
  slide.addText(title, {
    x: L.marginLeft,
    y: 0.55,
    w: L.slideWidth - L.marginLeft - L.marginRight,
    h: 0.7,
    fontSize: TS.slideTitle,
    fontFace: T.headerFont,
    color: C.slate900,
    bold: true,
    valign: "top",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: L.marginLeft,
      y: 1.25,
      w: L.slideWidth - L.marginLeft - L.marginRight,
      h: 0.4,
      fontSize: TS.slideSubtitle,
      fontFace: T.bodyFont,
      color: C.slate600,
      italic: true,
    });
  }
}

function addInsightBand(slide, text) {
  if (!text) return;
  const y = 6.4;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: L.marginLeft,
    y: y,
    w: L.slideWidth - L.marginLeft - L.marginRight,
    h: 0.4,
    fill: { color: C.slate900 },
    line: { type: "none" },
    rectRadius: L.cardRadius,
  });
  // lightbulb-ish marker (filled disc)
  slide.addShape(pptx.ShapeType.ellipse, {
    x: L.marginLeft + 0.18,
    y: y + 0.1,
    w: 0.2,
    h: 0.2,
    fill: { color: C.amber },
    line: { type: "none" },
  });
  slide.addText(text, {
    x: L.marginLeft + 0.55,
    y: y,
    w: L.slideWidth - L.marginLeft - L.marginRight - 0.7,
    h: 0.4,
    fontSize: TS.insightBand,
    fontFace: T.bodyFont,
    color: C.white,
    italic: true,
    valign: "middle",
  });
}

function addIconDisc(slide, x, y, size, color, label) {
  slide.addShape(pptx.ShapeType.ellipse, {
    x: x, y: y, w: size, h: size,
    fill: { color: color },
    line: { type: "none" },
  });
  if (label) {
    slide.addText(label, {
      x: x, y: y, w: size, h: size,
      fontSize: size > 0.7 ? 22 : 14,
      fontFace: T.headerFont,
      color: C.white,
      bold: true,
      align: "center",
      valign: "middle",
    });
  }
}

// ---------------- slide types ----------------
function titleSlide(slide, data) {
  slide.background = { color: C.slate900 };
  // Eyebrow
  if (data.eyebrow) {
    slide.addText(String(data.eyebrow).toUpperCase(), {
      x: L.marginLeft,
      y: 1.2,
      w: L.slideWidth - L.marginLeft - L.marginRight,
      h: 0.35,
      fontSize: TS.titleEyebrow,
      fontFace: T.bodyFont,
      color: C.skyBright,
      bold: true,
      charSpacing: 6,
    });
  }
  // Big title
  slide.addText(data.title, {
    x: L.marginLeft,
    y: 2.2,
    w: L.slideWidth - L.marginLeft - L.marginRight,
    h: 2.6,
    fontSize: TS.titleSlide,
    fontFace: T.headerFont,
    color: C.white,
    bold: true,
    valign: "top",
  });
  // Subtitle
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: L.marginLeft,
      y: 5.2,
      w: L.slideWidth - L.marginLeft - L.marginRight - 1,
      h: 0.7,
      fontSize: TS.titleSubtitle,
      fontFace: T.bodyFont,
      color: C.slate400,
      italic: true,
    });
  }
  // Accent rule
  slide.addShape(pptx.ShapeType.rect, {
    x: L.marginLeft,
    y: 4.7,
    w: 1.2,
    h: 0.04,
    fill: { color: C.skyBright },
    line: { type: "none" },
  });
  // Footer (dark variant)
  addFooter(slide, 1, true);
}

function definitionSlide(slide, data, pageNum) {
  slide.background = { color: C.white };
  addTitleBar(slide, data.title, data.subtitle);

  const cat = data.category || "headline";
  const discColor = catColor(cat);

  // Large icon disc on the left
  const discSize = 1.4;
  const discX = L.marginLeft + 0.2;
  const discY = 2.5;
  slide.addShape(pptx.ShapeType.ellipse, {
    x: discX, y: discY, w: discSize, h: discSize,
    fill: { color: discColor }, line: { type: "none" },
  });
  if (data.iconLabel) {
    slide.addText(data.iconLabel, {
      x: discX, y: discY, w: discSize, h: discSize,
      fontSize: 36, fontFace: T.headerFont, color: C.white,
      bold: true, align: "center", valign: "middle",
    });
  }

  // Body paragraph to the right
  const bodyX = discX + discSize + 0.5;
  slide.addText(data.definition || data.body, {
    x: bodyX, y: 2.3,
    w: L.slideWidth - bodyX - L.marginRight, h: 3.5,
    fontSize: 18, fontFace: T.bodyFont, color: C.slate900,
    valign: "top",
  });

  addInsightBand(slide, data.insight);
  addFooter(slide, pageNum);
}

function comparisonTableSlide(slide, data, pageNum) {
  slide.background = { color: C.white };
  addTitleBar(slide, data.title, data.subtitle);

  const headers = data.headers || [];
  const rows = data.rows || [];
  const startY = 2.0;
  const endY = data.insight ? 6.3 : 6.7;
  const tableH = endY - startY;
  const headerH = 0.45;
  const rowH = (tableH - headerH) / Math.max(rows.length, 1);
  const totalW = L.slideWidth - L.marginLeft - L.marginRight;
  const colW = totalW / headers.length;

  // Header row
  headers.forEach((h, i) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: L.marginLeft + i * colW, y: startY,
      w: colW, h: headerH,
      fill: { color: C.slate900 }, line: { color: C.slate200, width: 0.5 },
    });
    slide.addText(h, {
      x: L.marginLeft + i * colW + 0.15, y: startY,
      w: colW - 0.3, h: headerH,
      fontSize: TS.body, fontFace: T.headerFont, color: C.white,
      bold: true, valign: "middle",
    });
  });

  // Data rows
  rows.forEach((row, rIdx) => {
    const y = startY + headerH + rIdx * rowH;
    const fill = rIdx % 2 === 0 ? C.white : C.slate50;
    const cells = [row.col1, row.col2, row.col3, row.col4, row.col5].filter((c) => c !== undefined);
    cells.forEach((cell, cIdx) => {
      slide.addShape(pptx.ShapeType.rect, {
        x: L.marginLeft + cIdx * colW, y: y,
        w: colW, h: rowH,
        fill: { color: fill }, line: { color: C.slate200, width: 0.5 },
      });
      slide.addText(String(cell || ""), {
        x: L.marginLeft + cIdx * colW + 0.15, y: y,
        w: colW - 0.3, h: rowH,
        fontSize: TS.body - 1, fontFace: T.bodyFont, color: C.slate900,
        valign: "middle",
      });
    });
  });

  addInsightBand(slide, data.insight);
  addFooter(slide, pageNum);
}

function cardGridSlide(slide, data, pageNum) {
  slide.background = { color: C.white };
  addTitleBar(slide, data.title, data.subtitle);

  const cards = data.cards || [];
  const cols = data.columns || Math.min(cards.length, 3);
  const gap = L.gridGap;
  const totalW = L.slideWidth - L.marginLeft - L.marginRight;
  const cardW = (totalW - gap * (cols - 1)) / cols;
  const startY = 2.0;
  const endY = data.insight ? 6.3 : 6.7;
  const rowCount = Math.max(1, Math.ceil(cards.length / cols));
  const rowH = (endY - startY - gap * (rowCount - 1)) / rowCount;

  cards.forEach((card, idx) => {
    const x = L.marginLeft + (idx % cols) * (cardW + gap);
    const y = startY + Math.floor(idx / cols) * (rowH + gap);
    const cat = card.category || data.category || "sky";
    const accentColor = catColor(cat);
    const softColor = catSoft(cat);

    // Card body
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: cardW, h: rowH,
      fill: { color: softColor },
      line: { color: C.slate200, width: 0.75 },
      rectRadius: L.cardRadius,
    });

    // Top strip
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x, y: y, w: cardW, h: L.topBorderHeight,
      fill: { color: accentColor }, line: { type: "none" },
      rectRadius: L.cardRadius,
    });
    // Mask the lower half of the rounded top strip so only the top corners are rounded
    slide.addShape(pptx.ShapeType.rect, {
      x: x, y: y + L.topBorderHeight / 2, w: cardW, h: L.topBorderHeight / 2,
      fill: { color: accentColor }, line: { type: "none" },
    });

    // Icon disc (top-left of card body)
    const discSize = L.iconDiscSmall;
    const discX = x + 0.25;
    const discY = y + L.topBorderHeight + 0.2;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: discX, y: discY, w: discSize, h: discSize,
      fill: { color: accentColor }, line: { type: "none" },
    });
    if (card.iconLabel) {
      slide.addText(card.iconLabel, {
        x: discX, y: discY, w: discSize, h: discSize,
        fontSize: 14, fontFace: T.headerFont, color: C.white,
        bold: true, align: "center", valign: "middle",
      });
    }

    // Heading
    slide.addText(card.title || "", {
      x: x + 0.25 + discSize + 0.2, y: discY,
      w: cardW - 0.5 - discSize - 0.2, h: discSize,
      fontSize: TS.cardHeader, fontFace: T.headerFont, color: C.slate900,
      bold: true, valign: "middle",
    });

    // Body
    slide.addText(card.body || "", {
      x: x + 0.25, y: discY + discSize + 0.2,
      w: cardW - 0.5,
      h: rowH - L.topBorderHeight - discSize - 0.55,
      fontSize: TS.body - 1, fontFace: T.bodyFont, color: C.slate700,
      valign: "top",
    });

    // Takeaway (bottom of card)
    if (card.takeaway) {
      slide.addText(card.takeaway, {
        x: x + 0.25, y: y + rowH - 0.4,
        w: cardW - 0.5, h: 0.3,
        fontSize: TS.caption, fontFace: T.bodyFont, color: accentColor,
        bold: true, valign: "bottom",
      });
    }
  });

  addInsightBand(slide, data.insight);
  addFooter(slide, pageNum);
}

function stepSlide(slide, data, pageNum) {
  slide.background = { color: C.white };
  addTitleBar(slide, data.title, data.subtitle);

  const startY = 2.0;
  const endY = data.insight ? 6.3 : 6.7;
  const contentH = endY - startY;
  const colW = (L.slideWidth - L.marginLeft - L.marginRight - 0.4) / 2;

  // Left: code/fact block (dark)
  if (data.codeBlock) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: L.marginLeft, y: startY, w: colW, h: contentH,
      fill: { color: C.slate900 }, line: { type: "none" },
      rectRadius: L.cardRadius,
    });
    slide.addText(data.codeBlock, {
      x: L.marginLeft + 0.25, y: startY + 0.25,
      w: colW - 0.5, h: contentH - 0.5,
      fontSize: TS.body, fontFace: T.monoFont, color: C.skySoft,
      valign: "top",
    });
  }

  // Right: explanation
  const rightX = L.marginLeft + colW + 0.4;
  const cat = data.category || "headline";
  slide.addShape(pptx.ShapeType.rect, {
    x: rightX, y: startY, w: 0.08, h: contentH,
    fill: { color: catColor(cat) }, line: { type: "none" },
  });
  slide.addText(data.whyHeader || "Why this matters", {
    x: rightX + 0.25, y: startY,
    w: colW - 0.25, h: 0.5,
    fontSize: TS.cardHeader, fontFace: T.headerFont, color: C.slate900,
    bold: true,
  });
  slide.addText(data.whyBody || "", {
    x: rightX + 0.25, y: startY + 0.55,
    w: colW - 0.25, h: contentH - 0.55,
    fontSize: TS.body, fontFace: T.bodyFont, color: C.slate700,
    valign: "top",
  });

  addInsightBand(slide, data.insight);
  addFooter(slide, pageNum);
}

function twoColumnSlide(slide, data, pageNum) {
  slide.background = { color: C.white };
  addTitleBar(slide, data.title, data.subtitle);

  const startY = 2.0;
  const endY = data.insight ? 6.3 : 6.7;
  const contentH = endY - startY;
  const colW = (L.slideWidth - L.marginLeft - L.marginRight - 0.4) / 2;
  const leftCat = data.leftCategory || "sky";
  const rightCat = data.rightCategory || "teal";

  // Left column
  slide.addShape(pptx.ShapeType.rect, {
    x: L.marginLeft, y: startY, w: colW, h: 0.08,
    fill: { color: catColor(leftCat) }, line: { type: "none" },
  });
  slide.addText(data.leftHeader || "", {
    x: L.marginLeft, y: startY + 0.2, w: colW, h: 0.45,
    fontSize: TS.cardHeader, fontFace: T.headerFont, color: C.slate900,
    bold: true,
  });
  const leftBullets = (data.leftBullets || []).map((b) => ({
    text: String(b), options: { bullet: { code: "25CF" }, color: C.slate700 },
  }));
  slide.addText(leftBullets, {
    x: L.marginLeft, y: startY + 0.8, w: colW, h: contentH - 0.8,
    fontSize: TS.body, fontFace: T.bodyFont, color: C.slate700,
    paraSpaceAfter: 6, valign: "top",
  });

  // Right column
  const rightX = L.marginLeft + colW + 0.4;
  slide.addShape(pptx.ShapeType.rect, {
    x: rightX, y: startY, w: colW, h: 0.08,
    fill: { color: catColor(rightCat) }, line: { type: "none" },
  });
  slide.addText(data.rightHeader || "", {
    x: rightX, y: startY + 0.2, w: colW, h: 0.45,
    fontSize: TS.cardHeader, fontFace: T.headerFont, color: C.slate900,
    bold: true,
  });
  const rightBullets = (data.rightBullets || []).map((b) => ({
    text: String(b), options: { bullet: { code: "25CF" }, color: C.slate700 },
  }));
  slide.addText(rightBullets, {
    x: rightX, y: startY + 0.8, w: colW, h: contentH - 0.8,
    fontSize: TS.body, fontFace: T.bodyFont, color: C.slate700,
    paraSpaceAfter: 6, valign: "top",
  });

  addInsightBand(slide, data.insight);
  addFooter(slide, pageNum);
}

function takeawaysSlide(slide, data, pageNum) {
  slide.background = { color: C.slate900 };
  // Eyebrow
  slide.addText("KEY TAKEAWAYS", {
    x: L.marginLeft, y: 0.8, w: 8, h: 0.4,
    fontSize: TS.titleEyebrow, fontFace: T.bodyFont, color: C.skyBright,
    bold: true, charSpacing: 6,
  });
  // Title
  slide.addText(data.title || "What to remember", {
    x: L.marginLeft, y: 1.5,
    w: L.slideWidth - L.marginLeft - L.marginRight, h: 1.1,
    fontSize: 44, fontFace: T.headerFont, color: C.white,
    bold: true,
  });

  // Numbered takeaways (max 5)
  const items = (data.takeaways || []).slice(0, 5);
  const startY = 3.0;
  const itemH = (6.6 - startY) / Math.max(items.length, 1);
  items.forEach((item, idx) => {
    const y = startY + idx * itemH;
    // Number
    slide.addText(String(idx + 1).padStart(2, "0"), {
      x: L.marginLeft, y: y, w: 0.8, h: itemH - 0.1,
      fontSize: 28, fontFace: T.headerFont, color: C.skyBright,
      bold: true, valign: "top",
    });
    // Text
    slide.addText(String(item), {
      x: L.marginLeft + 0.9, y: y,
      w: L.slideWidth - L.marginLeft - L.marginRight - 0.9, h: itemH - 0.1,
      fontSize: 16, fontFace: T.bodyFont, color: C.white,
      valign: "top",
    });
  });

  addFooter(slide, pageNum, true);
}

function closingSlide(slide, data, pageNum) {
  slide.background = { color: C.slate900 };
  if (data.eyebrow) {
    slide.addText(String(data.eyebrow).toUpperCase(), {
      x: L.marginLeft, y: 0.9, w: 8, h: 0.35,
      fontSize: TS.titleEyebrow, fontFace: T.bodyFont, color: C.purple,
      bold: true, charSpacing: 6,
    });
  }
  slide.addText(data.title || "", {
    x: L.marginLeft, y: 1.8,
    w: L.slideWidth - L.marginLeft - L.marginRight, h: 1.6,
    fontSize: 52, fontFace: T.headerFont, color: C.white, bold: true,
  });
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: L.marginLeft, y: 3.6,
      w: L.slideWidth - L.marginLeft - L.marginRight, h: 0.6,
      fontSize: 22, fontFace: T.bodyFont, color: C.skyBright, italic: true,
    });
  }
  if (data.body) {
    slide.addText(data.body, {
      x: L.marginLeft, y: 4.5,
      w: L.slideWidth - L.marginLeft - L.marginRight - 1, h: 2.0,
      fontSize: 16, fontFace: T.bodyFont, color: C.slate200, valign: "top",
    });
  }
  // Accent rule
  slide.addShape(pptx.ShapeType.rect, {
    x: L.marginLeft, y: 6.5, w: 1.2, h: 0.04,
    fill: { color: C.purple }, line: { type: "none" },
  });
  addFooter(slide, pageNum, true);
}

// ---------------- dispatch ----------------
const dispatch = {
  title: titleSlide,
  definition: definitionSlide,
  "comparison-table": comparisonTableSlide,
  "card-grid": cardGridSlide,
  step: stepSlide,
  "two-column": twoColumnSlide,
  takeaways: takeawaysSlide,
  closing: closingSlide,
};

outline.forEach((data, idx) => {
  const slide = pptx.addSlide();
  const handler = dispatch[data.type];
  if (!handler) {
    console.warn(`Slide ${idx + 1}: unknown type "${data.type}", falling back to two-column`);
    twoColumnSlide(slide, data, idx + 1);
    return;
  }
  handler(slide, data, idx + 1);
});

// ---------------- write ----------------
const outDir = path.join(ROOT, "output", `t${TOPIC_NUM}`);
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `deck.pptx`);
pptx.writeFile({ fileName: outPath }).then(() => {
  console.log(`built: ${outPath}`);
});
