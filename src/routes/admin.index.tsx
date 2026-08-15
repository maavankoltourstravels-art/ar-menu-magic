import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, PlusCircle } from "lucide-react";
import { useState } from "react";

import { DashboardStats } from "@/components/admin/DashboardStats";
import { MenuCardPreview } from "@/components/admin/MenuCardPreview";
import { ProductTable } from "@/components/admin/ProductTable";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/products-store";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const products = useProducts();
  const [cardProduct, setCardProduct] = useState<Product | null>(null);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow text-primary">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold">AR menu overview</h1>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/admin/products/new">
            <PlusCircle className="mr-2 size-4" /> Add product
          </Link>
        </Button>
      </header>

      <DashboardStats products={products} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent products</h2>
          <Link
            to="/admin/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary"
          >
            All products <ArrowRight className="size-4" />
          </Link>
        </div>
        <ProductTable products={products.slice(0, 5)} onPreviewCard={setCardProduct} />
      </section>

      <MenuCardPreview
        product={cardProduct}
        open={Boolean(cardProduct)}
        onOpenChange={(open) => !open && setCardProduct(null)}
      />
    </div>
  );
}