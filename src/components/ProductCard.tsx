import { Link } from "@tanstack/react-router";
import { Box, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAssetUrl } from "@/hooks/use-asset-url";
import { formatPrice } from "@/lib/menu-card";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const image = useAssetUrl(product.imageUrl);

  return (
    <article className="group overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link
        to="/menu/$productSlug"
        params={{ productSlug: product.slug }}
        className="block"
        aria-label={`View ${product.name} in AR`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Box className="size-8" />
            </div>
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            {product.featured && (
              <Badge className="rounded-full bg-gradient-warm text-primary-foreground">
                <Sparkles className="mr-1 size-3" /> Featured
              </Badge>
            )}
            {product.model3dUrl && (
              <Badge variant="secondary" className="rounded-full">
                3D · AR
              </Badge>
            )}
          </div>
        </div>
      </Link>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-[0.6rem] text-muted-foreground">{product.category}</p>
            <h3 className="font-display text-xl font-semibold leading-tight">{product.name}</h3>
          </div>
          <p className="whitespace-nowrap font-semibold text-primary">
            {formatPrice(product.price)}
          </p>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <Button asChild className="w-full rounded-full">
          <Link to="/menu/$productSlug" params={{ productSlug: product.slug }}>
            View in AR
          </Link>
        </Button>
      </div>
    </article>
  );
}