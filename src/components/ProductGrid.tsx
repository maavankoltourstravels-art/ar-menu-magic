import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export function ProductGrid({
  products,
  emptyMessage = "No dishes published yet.",
}: {
  products: Product[];
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card/60 p-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}