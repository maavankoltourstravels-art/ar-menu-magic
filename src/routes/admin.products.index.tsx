import { Link, createFileRoute } from "@tanstack/react-router";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { MenuCardPreview } from "@/components/admin/MenuCardPreview";
import { ProductTable } from "@/components/admin/ProductTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/lib/products-store";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/")({
  component: ProductsPage,
});

function ProductsPage() {
  const products = useProducts();
  const [query, setQuery] = useState("");
  const [cardProduct, setCardProduct] = useState<Product | null>(null);

  const filtered = products.filter((p) =>
    `${p.name} ${p.category} ${p.slug}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-primary">Products</p>
          <h1 className="mt-1 text-3xl font-semibold">Product management</h1>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/admin/products/new">
            <PlusCircle className="mr-2 size-4" /> Add product
          </Link>
        </Button>
      </header>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, slug or category…"
        className="max-w-sm bg-card"
      />

      <ProductTable products={filtered} onPreviewCard={setCardProduct} />

      <MenuCardPreview
        product={cardProduct}
        open={Boolean(cardProduct)}
        onOpenChange={(open) => !open && setCardProduct(null)}
      />
    </div>
  );
}