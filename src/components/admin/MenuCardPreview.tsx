import { Download, FileImage, Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildCardData,
  generateMenuCardCanvas,
  generateMenuCardPdf,
  type CardData,
} from "@/lib/menu-card";
import { downloadQrPng, shareUrl, triggerDownload } from "@/lib/qr";
import type { Product } from "@/lib/types";

/**
 * Shows the exact print layout (rendered by the same generator that produces
 * the PDF/PNG) before download.
 */
export function MenuCardPreview({
  product,
  open,
  onOpenChange,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [data, setData] = useState<CardData | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || !product) {
      setPreview(null);
      setData(null);
      return;
    }
    let active = true;
    (async () => {
      const cardData = await buildCardData(product);
      const canvas = await generateMenuCardCanvas(cardData);
      if (!active) return;
      setData(cardData);
      setPreview(canvas.toDataURL("image/png"));
    })();
    return () => {
      active = false;
    };
  }, [open, product]);

  async function download(kind: "pdf" | "png") {
    if (!product || !data) return;
    setBusy(true);
    try {
      if (kind === "pdf") {
        const doc = await generateMenuCardPdf(data);
        doc.save(`${product.slug}-ar-menu-card.pdf`);
      } else {
        const canvas = await generateMenuCardCanvas(data);
        triggerDownload(canvas.toDataURL("image/png"), `${product.slug}-ar-menu-card.png`);
      }
      toast.success(`Menu card ${kind.toUpperCase()} downloaded`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Printable AR menu card</DialogTitle>
          <DialogDescription>
            A6 (105 × 148 mm) print-ready card at 300 DPI — exactly what the PDF and PNG contain.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center rounded-2xl bg-secondary/60 p-4">
          {preview ? (
            <img
              src={preview}
              alt="Menu card preview"
              className="w-full max-w-[300px] rounded-lg shadow-lift"
            />
          ) : (
            <div className="flex h-[420px] w-[300px] items-center justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            className="rounded-full"
            disabled={!preview || busy}
            onClick={() => download("pdf")}
          >
            <Download className="mr-2 size-4" /> Download PDF
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            disabled={!preview || busy}
            onClick={() => download("png")}
          >
            <FileImage className="mr-2 size-4" /> Download PNG
          </Button>
          <Button
            variant="outline"
            className="rounded-full"
            disabled={!product}
            onClick={() =>
              product && downloadQrPng(productUrl(product.slug), `${product.slug}-qr.png`)
            }
          >
            <QrCode className="mr-2 size-4" /> Download QR
          </Button>
          <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
            Close preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}