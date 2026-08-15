import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { MenuCardPreview } from "@/components/admin/MenuCardPreview";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/products-store";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/admin/products/new")({
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const [created, setCreated] = useState<Product | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-primary">New product</p>
        <h1 className="mt-1 text-3xl font-semibold">Add a dish to the AR menu</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Publishing a dish automatically creates its public AR page, a unique QR code and a
          printable menu card.
        </p>
      </header>

      <ProductForm
        submitLabel="Publish product"
        onSubmit={(input) => {
          const product = createProduct(input);
          toast.success(
            product.published
              ? "Published — AR page, QR code and menu card are ready"
              : "Saved as draft",
          );
          if (product.published) setCreated(product);
          else navigate({ to: "/admin/products" });
        }}
      />

      <MenuCardPreview
        product={created}
        open={Boolean(created)}
        onOpenChange={(open) => {
          if (!open) {
            setCreated(null);
            navigate({ to: "/admin/products" });
          }
        }}
      />
    </div>
  );
}