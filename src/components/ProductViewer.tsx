import { Loader2, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ARButton } from "@/components/ARButton";
import { useAssetUrl } from "@/hooks/use-asset-url";
import { cn } from "@/lib/utils";

type ModelViewerElement = HTMLElement & {
  canActivateAR?: boolean;
  activateAR?: () => void;
  resetTurntableRotation?: (n?: number) => void;
};

/**
 * Dynamic 3D/AR viewer built on Google's <model-viewer> web component.
 * The GLB source is per-product — nothing is hardcoded.
 */
export function ProductViewer({
  modelRef,
  posterRef,
  alt,
  className,
  showArButton = true,
}: {
  modelRef: string | null;
  posterRef?: string | null;
  alt: string;
  className?: string;
  showArButton?: boolean;
}) {
  const src = useAssetUrl(modelRef);
  const poster = useAssetUrl(posterRef ?? null);
  const ref = useRef<ModelViewerElement | null>(null);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [arSupported, setArSupported] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("@google/model-viewer").then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !ready) return;
    const onLoad = () => {
      setLoaded(true);
      setArSupported(Boolean(el.canActivateAR));
    };
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [ready, src]);

  if (!modelRef) {
    return (
      <div
        className={cn(
          "flex aspect-square w-full items-center justify-center rounded-3xl border border-dashed border-border bg-secondary/50 p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        No 3D model uploaded for this dish yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-secondary to-background shadow-card",
          className,
        )}
      >
        {ready && src ? (
          <model-viewer
            ref={ref as never}
            src={src}
            alt={alt}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="auto"
            camera-controls
            auto-rotate
            touch-action="pan-y"
            shadow-intensity="1"
            exposure="1.05"
            style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
            {...(poster ? { poster } : {})}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}

        {loaded && (
          <button
            onClick={() => ref.current?.resetTurntableRotation?.(0)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-2 text-xs font-medium backdrop-blur transition-colors hover:bg-background"
          >
            <RotateCcw className="size-3.5" /> Reset view
          </button>
        )}
        <p className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-[0.65rem] font-medium tracking-wide text-muted-foreground backdrop-blur">
          Drag to rotate · Pinch to zoom
        </p>
      </div>

      {showArButton && (
        <ARButton supported={arSupported} onActivate={() => ref.current?.activateAR?.()} />
      )}
    </div>
  );
}