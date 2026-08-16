import { jsPDF } from "jspdf";

import { assetToDataUrl } from "@/lib/asset-storage";
import { qrPngDataUrl, shareUrl, triggerDownload } from "@/lib/qr";
import { RESTAURANT, type Product } from "@/lib/types";

/**
 * Print-ready AR menu card generator (A6 portrait, 105 x 148 mm).
 * PDF output is drawn natively (vector text + embedded raster images) — it is
 * never a screenshot of the DOM. PNG output renders the identical layout on a
 * 300 DPI canvas.
 */
export type CardData = {
  product: Product;
  imageDataUrl: string | null;
  qrDataUrl: string;
  url: string;
};

const CARD_W = 105;
const CARD_H = 148;

/** Poster palette — bold green field, cream footer, terracotta price. */
const CREAM = [250, 248, 242] as const;
const INK = [26, 32, 28] as const;
const TERRA = [190, 62, 40] as const;
const MUTED = [112, 120, 112] as const;
const GREEN = [14, 92, 58] as const;
const GREEN_SOFT = [26, 112, 72] as const;

export async function buildCardData(product: Product): Promise<CardData> {
  const url = shareUrl(product);
  const [imageDataUrl, qrDataUrl] = await Promise.all([
    assetToDataUrl(product.imageUrl).catch(() => null),
    qrPngDataUrl(url, 900),
  ]);
  return { product, imageDataUrl, qrDataUrl, url };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function formatPrice(price: number): string {
  return `\u20B9${price.toLocaleString("en-IN")}`;
}

/** Renders the product photo into a transparent circular PNG. */
async function circularPhoto(src: string, size = 900): Promise<string> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  drawCover(ctx, img, 0, 0, size, size);
  ctx.restore();
  return canvas.toDataURL("image/png");
}

const BG_WORD_ROWS = [30, 60, 90, 118];

/** Picks a short, punchy word for the oversized repeated background type. */
function bgWord(product: Product): string {
  const words = product.name.split(/\s+/).filter(Boolean);
  const candidates = [...words.reverse(), product.category].filter(Boolean);
  const fit = candidates.find((w) => w.length <= 8);
  return (fit ?? candidates[0] ?? product.name).toUpperCase();
}

export async function generateMenuCardPdf(data: CardData): Promise<jsPDF> {
  const { product } = data;
  const doc = new jsPDF({ unit: "mm", format: [CARD_W, CARD_H], orientation: "portrait" });

  // Green field
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, CARD_W, CARD_H, "F");

  // Oversized repeated product word, right-aligned, bleeding off the edge
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GREEN_SOFT);
  doc.setFontSize(46);
  const word = bgWord(product);
  BG_WORD_ROWS.forEach((y) => {
    doc.text(word, CARD_W + 4, y, { align: "right" });
  });

  // Wordmark
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(RESTAURANT.name.toUpperCase(), 9, 15, { charSpace: 0.4 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(4.6);
  doc.text(RESTAURANT.tagline.toUpperCase(), 9, 19, { charSpace: 0.4 });

  // Hero photo in a circle
  const cx = CARD_W / 2;
  const cy = 62;
  const r = 33;
  if (data.imageDataUrl) {
    try {
      doc.addImage(await circularPhoto(data.imageDataUrl), "PNG", cx - r, cy - r, r * 2, r * 2);
    } catch {
      /* layout still valid without the photo */
    }
  } else {
    doc.setFillColor(...GREEN_SOFT);
    doc.circle(cx, cy, r, "F");
  }

  // Cream footer panel
  const panelY = 104;
  doc.setFillColor(...CREAM);
  doc.rect(0, panelY, CARD_W, CARD_H - panelY, "F");

  // QR block
  const qrSize = 25;
  const qrX = 8;
  const qrY = panelY + 12;
  doc.setFillColor(...GREEN);
  doc.roundedRect(qrX - 1, panelY + 4, qrSize + 2, 5.6, 2.8, 2.8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.6);
  doc.setTextColor(255, 255, 255);
  doc.text("SCAN ME", qrX + qrSize / 2, panelY + 7.8, { align: "center", charSpace: 0.4 });
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, "F");
  doc.addImage(data.qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // Copy column
  const colX = qrX + qrSize + 6;
  const colW = CARD_W - colX - 8;
  let y = panelY + 12;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.setFontSize(11);
  const nameLines = (doc.splitTextToSize(product.name.toUpperCase(), colW) as string[]).slice(0, 2);
  nameLines.forEach((line) => {
    doc.text(line, colX, y);
    y += 5;
  });

  doc.setFont("times", "italic");
  doc.setFontSize(6.4);
  doc.setTextColor(...MUTED);
  const descLines = (doc.splitTextToSize(product.description, colW) as string[]).slice(0, 2);
  y += 1;
  descLines.forEach((line) => {
    doc.text(line, colX, y);
    y += 3;
  });

  // Price badge
  y += 3;
  const price = formatPrice(product.price);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const pw = doc.getTextWidth(price) + 8;
  doc.setFillColor(...TERRA);
  doc.roundedRect(colX, y - 4.4, pw, 7, 3.5, 3.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.text(price, colX + pw / 2, y, { align: "center" });

  // Footer contact
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5);
  doc.setTextColor(...MUTED);
  doc.text(
    `${RESTAURANT.location.toUpperCase()}  ·  ${RESTAURANT.phone}`,
    CARD_W / 2,
    CARD_H - 5,
    { align: "center", charSpace: 0.3 },
  );

  return doc;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

export async function generateMenuCardCanvas(data: CardData): Promise<HTMLCanvasElement> {
  const S = 300 / 25.4; // px per mm @300dpi
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(CARD_W * S);
  canvas.height = Math.round(CARD_H * S);
  const ctx = canvas.getContext("2d")!;
  const mm = (v: number) => v * S;
  const rgb = (c: readonly number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const { product } = data;
  const pt = (v: number) => mm(v * 0.3528);

  ctx.fillStyle = rgb(GREEN);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Repeated background word
  ctx.fillStyle = rgb(GREEN_SOFT);
  ctx.textAlign = "right";
  ctx.font = `bold ${pt(46)}px Helvetica, Arial, sans-serif`;
  const word = bgWord(product);
  BG_WORD_ROWS.forEach((y) => ctx.fillText(word, mm(CARD_W + 4), mm(y)));

  // Wordmark
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${pt(10)}px Helvetica, Arial, sans-serif`;
  ctx.letterSpacing = `${mm(0.4)}px`;
  ctx.fillText(RESTAURANT.name.toUpperCase(), mm(9), mm(15));
  ctx.font = `${pt(4.6)}px Helvetica, Arial, sans-serif`;
  ctx.fillText(RESTAURANT.tagline.toUpperCase(), mm(9), mm(19));
  ctx.letterSpacing = "0px";

  // Hero circle
  const cx = canvas.width / 2;
  const cy = mm(62);
  const r = mm(33);
  if (data.imageDataUrl) {
    try {
      const img = await loadImage(data.imageDataUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      drawCover(ctx, img, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
    } catch {
      /* ignore */
    }
  } else {
    ctx.fillStyle = rgb(GREEN_SOFT);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cream panel
  const panelY = mm(104);
  ctx.fillStyle = rgb(CREAM);
  ctx.fillRect(0, panelY, canvas.width, canvas.height - panelY);

  // QR block
  const qrSize = mm(25);
  const qrX = mm(8);
  const qrY = panelY + mm(12);
  ctx.fillStyle = rgb(GREEN);
  roundRect(ctx, qrX - mm(1), panelY + mm(4), qrSize + mm(2), mm(5.6), mm(2.8));
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = `bold ${pt(5.6)}px Helvetica, Arial, sans-serif`;
  ctx.letterSpacing = `${mm(0.4)}px`;
  ctx.fillText("SCAN ME", qrX + qrSize / 2, panelY + mm(7.8));
  ctx.letterSpacing = "0px";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX - mm(1), qrY - mm(1), qrSize + mm(2), qrSize + mm(2));
  const qrImg = await loadImage(data.qrDataUrl);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  // Copy column
  const colX = qrX + qrSize + mm(6);
  const colW = canvas.width - colX - mm(8);
  let y = panelY + mm(12);
  ctx.textAlign = "left";
  ctx.fillStyle = rgb(INK);
  ctx.font = `bold ${pt(11)}px Helvetica, Arial, sans-serif`;
  measureLines(ctx, product.name.toUpperCase(), colW)
    .slice(0, 2)
    .forEach((line) => {
      ctx.fillText(line, colX, y);
      y += mm(5);
    });

  ctx.fillStyle = rgb(MUTED);
  ctx.font = `italic ${pt(6.4)}px Georgia, 'Times New Roman', serif`;
  y += mm(1);
  measureLines(ctx, product.description, colW)
    .slice(0, 2)
    .forEach((line) => {
      ctx.fillText(line, colX, y);
      y += mm(3);
    });

  // Price badge
  y += mm(3);
  const price = formatPrice(product.price);
  ctx.font = `bold ${pt(10)}px Helvetica, Arial, sans-serif`;
  const pw = ctx.measureText(price).width + mm(8);
  ctx.fillStyle = rgb(TERRA);
  roundRect(ctx, colX, y - mm(4.4), pw, mm(7), mm(3.5));
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText(price, colX + pw / 2, y);

  // Footer contact
  ctx.fillStyle = rgb(MUTED);
  ctx.font = `${pt(5)}px Helvetica, Arial, sans-serif`;
  ctx.letterSpacing = `${mm(0.3)}px`;
  ctx.fillText(
    `${RESTAURANT.location.toUpperCase()}  ·  ${RESTAURANT.phone}`,
    canvas.width / 2,
    canvas.height - mm(5),
  );
  ctx.letterSpacing = "0px";

  return canvas;
}

function measureLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function downloadMenuCardPdf(product: Product) {
  const data = await buildCardData(product);
  const doc = await generateMenuCardPdf(data);
  doc.save(`${product.slug}-ar-menu-card.pdf`);
}

export async function downloadMenuCardPng(product: Product) {
  const data = await buildCardData(product);
  const canvas = await generateMenuCardCanvas(data);
  triggerDownload(canvas.toDataURL("image/png"), `${product.slug}-ar-menu-card.png`);
}
