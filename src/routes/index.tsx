import { Link, createFileRoute } from "@tanstack/react-router";
import { Box, QrCode, ScanLine, Smartphone, Sparkles } from "lucide-react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProductGrid } from "@/components/ProductGrid";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-pizza.jpg";
import { useProducts } from "@/lib/products-store";
import { RESTAURANT } from "@/lib/types";

const title = "La Piazza — Italian Dining with a WebAR Menu";
const description =
  "Scan, view every dish in 3D and place it on your table before you order. La Piazza's augmented-reality Italian menu in Mumbai.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

const steps = [
  {
    icon: QrCode,
    title: "Scan the table card",
    text: "Every dish has its own QR code printed on the menu card at your table.",
  },
  {
    icon: Box,
    title: "See it in 3D",
    text: "The dish opens instantly in your browser — rotate, zoom and inspect it.",
  },
  {
    icon: Smartphone,
    title: "Place it on your table",
    text: "Tap “View in AR” and see a life-size dish on your own table before ordering.",
  },
];

function Index() {
  const products = useProducts();
  const featured = products.filter((p) => p.published && p.featured);
  const showcase = (featured.length ? featured : products.filter((p) => p.published)).slice(0, 3);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-rise">
            <p className="eyebrow inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-accent-foreground">
              <Sparkles className="size-3.5" /> WebAR Smart Menu
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Taste with your eyes,
              <span className="text-gradient-warm block">before you order.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              {RESTAURANT.name} is a family trattoria on Marine Drive serving wood-fired Neapolitan
              pizza and hand-rolled pasta. Every dish on our menu can be viewed in 3D — and placed
              right on your table in augmented reality.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-13 rounded-full bg-gradient-warm shadow-lift">
                <Link to="/menu">
                  <ScanLine className="mr-2 size-5" /> Explore Our AR Menu
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-13 rounded-full">
                <Link to="/admin">Restaurant admin</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                ["3D", "Every dish"],
                ["AR", "On your table"],
                ["0", "Apps to install"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl font-semibold text-primary">{value}</dt>
                  <dd className="text-xs text-muted-foreground">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-rise">
            <div className="overflow-hidden rounded-[2rem] border border-border/70 shadow-lift">
              <img
                src={heroImage}
                alt="Wood-fired margherita pizza on a rustic table at La Piazza"
                width={1600}
                height={1104}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-card backdrop-blur sm:left-8">
              <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-warm text-primary-foreground">
                <QrCode className="size-5" />
              </span>
              <span className="text-sm">
                <span className="block font-semibold">Scan · View · Order</span>
                <span className="text-muted-foreground">“{RESTAURANT.motto}”</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-primary">Featured dishes</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Straight from the wood fire</h2>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/menu">See the full AR menu</Link>
          </Button>
        </div>
        <div className="mt-8">
          <ProductGrid products={showcase} emptyMessage="Dishes are being plated — check back soon." />
        </div>
      </section>

      <section className="bg-secondary/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="eyebrow text-primary">How the AR menu works</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold sm:text-4xl">
            No app. No download. Just your camera.
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title: t, text }, i) => (
              <div
                key={t}
                className="rounded-3xl border border-border bg-card p-6 shadow-card transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <p className="eyebrow mt-5 text-[0.6rem] text-muted-foreground">Step {i + 1}</p>
                <h3 className="mt-1 text-xl font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
