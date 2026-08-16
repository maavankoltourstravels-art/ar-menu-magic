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

const CREAM = [252, 248, 240] as const;
const INK = [40, 29, 22] as const;
const TERRA = [166, 62, 40] as const;
const MUTED = [122, 105, 92] as const;
const GOLD = [186, 148, 84] as const;

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

export async function generateMenuCardPdf(data: CardData): Promise<jsPDF> {
  const { product } = data;
  const doc = new jsPDF({ unit: "mm", format: [CARD_W, CARD_H], orientation: "portrait" });

  doc.setFillColor(...CREAM);
  doc.rect(0, 0, CARD_W, CARD_H, "F");

  // Double gold frame
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.7);
  doc.rect(5, 5, CARD_W - 10, CARD_H - 10);
  doc.setLineWidth(0.2);
  doc.rect(7, 7, CARD_W - 14, CARD_H - 14);

  // Header
  doc.setFont("times", "bold");
  doc.setTextColor(...INK);
  doc.setFontSize(20);
  doc.text(RESTAURANT.name.toUpperCase(), CARD_W / 2, 19, { align: "center", charSpace: 0.9 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  doc.text(RESTAURANT.tagline.toUpperCase(), CARD_W / 2, 24, { align: "center", charSpace: 0.6 });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.3);
  doc.line(CARD_W / 2 - 12, 27, CARD_W / 2 + 12, 27);

  // Product image (centre-cropped into a fixed window)
  const imgX = 14;
  const imgY = 31;
  const imgW = CARD_W - 28;
  const imgH = 42;
  if (data.imageDataUrl) {
    try {
      const img = await loadImage(data.imageDataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = Math.round((900 * imgH) / imgW);
      const ctx = canvas.getContext("2d")!;
      drawCover(ctx, img, 0, 0, canvas.width, canvas.height);
      doc.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", imgX, imgY, imgW, imgH);
    } catch {
      /* image unavailable — layout still valid */
    }
  } else {
    doc.setFillColor(238, 230, 218);
    doc.rect(imgX, imgY, imgW, imgH, "F");
  }
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.25);
  doc.rect(imgX, imgY, imgW, imgH);

  // Name
  let y = imgY + imgH + 9;
  doc.setFont("times", "bold");
  doc.setTextColor(...INK);
  doc.setFontSize(14);
  const nameLines = doc.splitTextToSize(product.name.toUpperCase(), CARD_W - 24) as string[];
  nameLines.forEach((line) => {
    doc.text(line, CARD_W / 2, y, { align: "center", charSpace: 0.4 });
    y += 6;
  });

  // Description
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  const descLines = (doc.splitTextToSize(product.description, CARD_W - 26) as string[]).slice(0, 4);
  y += 1;
  descLines.forEach((line) => {
    doc.text(line, CARD_W / 2, y, { align: "center" });
    y += 4;
  });

  // Price
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...TERRA);
  doc.text(formatPrice(product.price), CARD_W / 2, y, { align: "center" });

  // QR block with generous quiet zone
  const qrSize = 30;
  const qrX = (CARD_W - qrSize) / 2;
  const qrY = CARD_H - 46;
  doc.setFillColor(255, 255, 255);
  doc.rect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, "F");
  doc.addImage(data.qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK);
  doc.text("SCAN TO VIEW IN AR", CARD_W / 2, qrY + qrSize + 8, {
    align: "center",
    charSpace: 0.5,
  });
  doc.setFont("times", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text(`\u201C${RESTAURANT.motto}\u201D`, CARD_W / 2, qrY + qrSize + 12.5, { align: "center" });

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

export async function generateMenuCardCanvas(data: CardData): Promise<HTMLCanvasElement> {
  const S = 300 / 25.4; // px per mm @300dpi
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(CARD_W * S);
  canvas.height = Math.round(CARD_H * S);
  const ctx = canvas.getContext("2d")!;
  const mm = (v: number) => v * S;
  const rgb = (c: readonly number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;
  const { product } = data;

  ctx.fillStyle = rgb(CREAM);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = rgb(GOLD);
  ctx.lineWidth = mm(0.7);
  ctx.strokeRect(mm(5), mm(5), mm(CARD_W - 10), mm(CARD_H - 10));
  ctx.lineWidth = mm(0.25);
  ctx.strokeRect(mm(7), mm(7), mm(CARD_W - 14), mm(CARD_H - 14));

  ctx.textAlign = "center";
  ctx.fillStyle = rgb(INK);
  ctx.font = `bold ${mm(7.4)}px Georgia, 'Times New Roman', serif`;
  ctx.letterSpacing = `${mm(0.9)}px`;
  ctx.fillText(RESTAURANT.name.toUpperCase(), canvas.width / 2, mm(19));
  ctx.fillStyle = rgb(MUTED);
  ctx.font = `${mm(2.4)}px Helvetica, Arial, sans-serif`;
  ctx.letterSpacing = `${mm(0.5)}px`;
  ctx.fillText(RESTAURANT.tagline.toUpperCase(), canvas.width / 2, mm(24));
  ctx.letterSpacing = "0px";

  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - mm(12), mm(27));
  ctx.lineTo(canvas.width / 2 + mm(12), mm(27));
  ctx.strokeStyle = rgb(GOLD);
  ctx.lineWidth = mm(0.3);
  ctx.stroke();

  const imgX = mm(14);
  const imgY = mm(31);
  const imgW = mm(CARD_W - 28);
  const imgH = mm(42);
  if (data.imageDataUrl) {
    try {
      const img = await loadImage(data.imageDataUrl);
      drawCover(ctx, img, imgX, imgY, imgW, imgH);
    } catch {
      /* ignore */
    }
  } else {
    ctx.fillStyle = "rgb(238,230,218)";
    ctx.fillRect(imgX, imgY, imgW, imgH);
  }
  ctx.strokeStyle = rgb(GOLD);
  ctx.lineWidth = mm(0.25);
  ctx.strokeRect(imgX, imgY, imgW, imgH);

  let y = mm(31 + 42 + 9);
  ctx.fillStyle = rgb(INK);
  ctx.font = `bold ${mm(5.2)}px Georgia, 'Times New Roman', serif`;
  ctx.letterSpacing = `${mm(0.4)}px`;
  const nameLines = measureLines(ctx, product.name.toUpperCase(), mm(CARD_W - 24));
  nameLines.forEach((line, i) => ctx.fillText(line, canvas.width / 2, y + i * mm(6)));
  y += mm(6) * nameLines.length;
  ctx.letterSpacing = "0px";

  ctx.fillStyle = rgb(MUTED);
  ctx.font = `italic ${mm(3)}px Georgia, 'Times New Roman', serif`;
  const descLines = measureLines(ctx, product.description, mm(CARD_W - 26)).slice(0, 4);
  y += mm(1);
  descLines.forEach((line) => {
    ctx.fillText(line, canvas.width / 2, y);
    y += mm(4);
  });

  y += mm(4.5);
  ctx.fillStyle = rgb(TERRA);
  ctx.font = `bold ${mm(5.6)}px Helvetica, Arial, sans-serif`;
  ctx.fillText(formatPrice(product.price), canvas.width / 2, y);

  const qrSize = mm(30);
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = mm(CARD_H - 46);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX - mm(3), qrY - mm(3), qrSize + mm(6), qrSize + mm(6));
  const qrImg = await loadImage(data.qrDataUrl);
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = rgb(INK);
  ctx.font = `bold ${mm(2.8)}px Helvetica, Arial, sans-serif`;
  ctx.letterSpacing = `${mm(0.5)}px`;
  ctx.fillText("SCAN TO VIEW IN AR", canvas.width / 2, qrY + qrSize + mm(8));
  ctx.letterSpacing = "0px";
  ctx.fillStyle = rgb(MUTED);
  ctx.font = `italic ${mm(2.8)}px Georgia, serif`;
  ctx.fillText(`\u201C${RESTAURANT.motto}\u201D`, canvas.width / 2, qrY + qrSize + mm(12.5));

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