<<<<<<< keep
import { Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ARButton({
  supported,
  onActivate,
  className,
}: {
  supported: boolean;
  onActivate: () => void;
  className?: string;
}) {
  if (!supported) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-secondary/60 p-4 text-sm text-muted-foreground",
          className,
        )}
      >
        <p className="font-medium text-foreground">AR isn’t supported on this device.</p>
        <p className="mt-1">
          You can still explore this product in 3D — drag to rotate, pinch or scroll to zoom. Open
          this page on an AR-capable Android or iOS phone to place it on your table.
        </p>
      </div>
    );
  }

  return (
    <Button
      size="lg"
      onClick={onActivate}
      className={cn("h-14 w-full rounded-full bg-gradient-warm text-base shadow-lift", className)}
    >
      <Smartphone className="mr-2 size-5" />
      View in AR
    </Button>
  );
}