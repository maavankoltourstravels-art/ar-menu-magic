import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { ProductForm } from "@/components/admin/ProductForm";
import { Button } from "@/components/ui/button";
import { updateProduct, useProducts } from "@/lib/products-store";

export const Route = createFileRoute("/admin/products/$productId/edit")({
  component: EditProductPage,
});

function EditProductPage() {
  const { productId } = Route.useParams();
  const navigate = useNavigate();
  const product = useProducts().find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Button asChild className="mt-4 rounded-full">
          <Link to="/admin/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-primary">Edit product</p>
        <h1 className="mt-1 text-3xl font-semibold">{product.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Replacing the .glb model instantly updates the public AR page at /menu/{product.slug}.
        </p>
      </header>

      <ProductForm
        initial={product}
        submitLabel="Save changes"
        onSubmit={(input) => {
          updateProduct(product.id, input);
          toast.success("Product updated");
          navigate({ to: "/admin/products" });
        }}
      />
    </div>
  );
}