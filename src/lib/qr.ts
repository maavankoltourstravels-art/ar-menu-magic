import QRCode from "qrcode";

import type { Product } from "@/lib/types";

export const productPath = (slug: string) => `/menu/${slug}`;

export function productUrl(slug: string): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}${productPath(slug)}`;
}

/**
 * The URL encoded in a product's QR code: an external WebAR experience when
 * one is linked, otherwise the in-app AR product page.
 */
export function shareUrl(product: Pick<Product, "slug" | "arUrl">): string {
  return product.arUrl?.trim() ? product.arUrl.trim() : productUrl(product.slug);
}

export function qrPngDataUrl(url: string, size = 1024): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 3,
    errorCorrectionLevel: "M",
    color: { dark: "#221a14ff", light: "#ffffffff" },
  });
}

export function qrSvgString(url: string): Promise<string> {
  return QRCode.toString(url, {
    type: "svg",
    margin: 3,
    errorCorrectionLevel: "M",
    color: { dark: "#221a14ff", light: "#ffffffff" },
  });
}

export function triggerDownload(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadQrPng(url: string, filename: string) {
  triggerDownload(await qrPngDataUrl(url), filename);
}

export async function downloadQrSvg(url: string, filename: string) {
  const svg = await qrSvgString(url);
  const blobUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  triggerDownload(blobUrl, filename);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
}