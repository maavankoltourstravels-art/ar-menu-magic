import { createFileRoute } from "@tanstack/react-router";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/lib/products-store";

const title = "AR Menu — La Piazza";
const description =
  "Browse every dish at La Piazza in 3D and augmented reality: pizza, pasta, antipasti and dolci you can place on your table before ordering.";

export const Route = createFileRoute("/menu/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const products = useProducts().filter((p) => p.published);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <header className="max-w-2xl animate-rise">
          <p className="eyebrow text-primary">Il Menu</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Our augmented reality menu</h1>
          <p className="mt-4 text-muted-foreground">
            Tap any dish to open its 3D view. On a supported phone you can place it on your own
            table, life-size, before you order.
          </p>
        </header>
        <div className="mt-10">
          <ProductGrid products={products} />
        </div>
      </main>
      <Footer />
    </div>
  );
}