import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Leaf, Scan, UtensilsCrossed } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProductViewer } from "@/components/ProductViewer";
import { QRCode } from "@/components/QRCode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAssetUrl } from "@/hooks/use-asset-url";
import { formatPrice } from "@/lib/menu-card";
import { useProducts } from "@/lib/products-store";
import { shareUrl } from "@/lib/qr";
import { RESTAURANT } from "@/lib/types";

export const Route = createFileRoute("/menu/$productSlug")({
  head: ({ params }) => {
    const label = params.productSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    const title = `${label} in AR — ${RESTAURANT.name}`;
    const description = `View ${label} in 3D and place it on your table in augmented reality at ${RESTAURANT.name}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { productSlug } = Route.useParams();
  const product = useProducts().find((p) => p.slug === productSlug && p.published);
  const image = useAssetUrl(product?.imageUrl ?? null);

  if (!product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="mx-auto max-w-xl px-4 py-24 text-center">
          <h1 className="text-3xl font-semibold">Dish not found</h1>
          <p className="mt-3 text-muted-foreground">
            This dish may have been unpublished or the link is incorrect.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/menu">Back to the AR menu</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const ingredients = product.ingredients
    .split(",")
    .map((i) => i.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to menu
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="animate-rise space-y-6">
            <ProductViewer
              modelRef={product.model3dUrl}
              posterRef={product.imageUrl}
              alt={`3D model of ${product.name}`}
            />
            {product.arUrl && (
              <Button asChild size="lg" className="w-full rounded-full">
                <a href={product.arUrl} target="_blank" rel="noopener noreferrer">
                  <Scan className="mr-2 size-4" /> View this dish in AR
                </a>
              </Button>
            )}
            {image && (
              <div className="overflow-hidden rounded-3xl border border-border/70 shadow-card">
                <img
                  src={image}
                  alt={product.name}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="animate-rise space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {product.category}
                </Badge>
                {product.model3dUrl && (
                  <Badge className="rounded-full bg-gradient-warm text-primary-foreground">
                    3D · AR ready
                  </Badge>
                )}
              </div>
              <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{product.name}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{product.description}</p>
              <p className="font-display mt-5 text-4xl font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            {ingredients.length > 0 && (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Leaf className="size-4 text-olive" /> Ingredients
                </h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {ingredients.map((i) => (
                    <li
                      key={i}
                      className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                    >
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <UtensilsCrossed className="size-4 text-primary" /> Dish details
              </h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="font-medium">{product.category}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Served at</dt>
                  <dd className="font-medium">{RESTAURANT.name}, Marine Drive</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">3D model</dt>
                  <dd className="font-medium">{product.model3dUrl ? "Available" : "Coming soon"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="font-medium">
                    {new Date(product.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-dark p-6 text-primary-foreground sm:flex-row">
              <QRCode url={shareUrl(product)} size={120} />
              <div className="text-center sm:text-left">
                <p className="eyebrow text-[0.6rem] opacity-70">Share this dish</p>
                <p className="mt-1 font-semibold">Scan to view in AR</p>
                <p className="mt-1 text-sm opacity-70">
                  This is the same QR code printed on the table card.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}