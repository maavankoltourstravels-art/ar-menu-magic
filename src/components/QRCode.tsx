import { Check, Copy, Download, FileCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { downloadQrPng, downloadQrSvg, qrPngDataUrl } from "@/lib/qr";
import { cn } from "@/lib/utils";

export function QRCode({
  url,
  size = 180,
  className,
}: {
  url: string;
  size?: number;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    qrPngDataUrl(url, 720).then((d) => active && setDataUrl(d));
    return () => {
      active = false;
    };
  }, [url]);

  return (
    <div
      className={cn("rounded-2xl bg-white p-3 shadow-card", className)}
      style={{ width: size + 24 }}
    >
      {dataUrl ? (
        <img src={dataUrl} width={size} height={size} alt={`QR code for ${url}`} />
      ) : (
        <div style={{ width: size, height: size }} className="animate-pulse rounded bg-muted" />
      )}
    </div>
  );
}

export function QRActions({ url, slug }: { url: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => downloadQrPng(url, `${slug}-qr.png`)}
      >
        <Download className="mr-2 size-4" /> PNG
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={() => downloadQrSvg(url, `${slug}-qr.svg`)}
      >
        <FileCode className="mr-2 size-4" /> SVG
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success("Product URL copied");
          setTimeout(() => setCopied(false), 1800);
        }}
      >
        {copied ? <Check className="mr-2 size-4" /> : <Copy className="mr-2 size-4" />} Copy URL
      </Button>
    </div>
  );
}