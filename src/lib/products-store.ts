import { useSyncExternalStore } from "react";

import burgerImage from "@/assets/classic-burger.jpg";
import sandwichImage from "@/assets/club-sandwich.jpg";
import margheritaImage from "@/assets/margherita-pizza.jpg";
import cupcakeImage from "@/assets/vanilla-cupcake.jpg";
import { deleteAsset } from "@/lib/asset-storage";
import { productPath } from "@/lib/qr";
import type { Product, ProductInput } from "@/lib/types";

const KEY = "lapiazza.products.v2";

const seed: Product[] = [
  {
    id: "seed-margherita-pizza",
    name: "Margherita Pizza",
    slug: "margherita-pizza",
    description:
      "Classic Italian-style pizza with fresh mozzarella, tomato sauce, basil and a crispy golden crust.",
    price: 299,
    category: "Pizza",
    ingredients:
      "San Marzano tomato sauce, fior di latte mozzarella, fresh basil, extra virgin olive oil, sea salt",
    imageUrl: margheritaImage,
    // Placeholder GLB — replace by uploading a real model in the admin panel.
    model3dUrl: "/models/margherita-pizza.glb",
    qrCodeUrl: "/menu/margherita-pizza",
    published: true,
    featured: true,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "seed-club-sandwich",
    name: "Toscana Club Sandwich",
    slug: "club-sandwich",
    description:
      "Golden grilled sourdough layered with roast chicken, melted provolone, vine tomato and garden greens.",
    price: 249,
    category: "Sandwich",
    ingredients:
      "Sourdough bread, roast chicken, provolone, vine tomato, baby greens, herb aioli",
    imageUrl: sandwichImage,
    model3dUrl: null,
    arUrl: "https://webxr.run/1YdPrgmrYmmlg",
    qrCodeUrl: "/menu/club-sandwich",
    published: true,
    featured: true,
    createdAt: "2026-08-02T10:00:00.000Z",
    updatedAt: "2026-08-02T10:00:00.000Z",
  },
  {
    id: "seed-classic-burger",
    name: "La Piazza Classic Burger",
    slug: "classic-burger",
    description:
      "Flame-grilled beef patty with aged cheddar, caramelised onion and tomato in a brioche bun.",
    price: 329,
    category: "Burger",
    ingredients:
      "Brioche bun, grilled beef patty, aged cheddar, caramelised onion, tomato, house sauce",
    imageUrl: burgerImage,
    model3dUrl: null,
    arUrl: "https://webxr.run/pz1k3pmdPx7EQ",
    qrCodeUrl: "/menu/classic-burger",
    published: true,
    featured: true,
    createdAt: "2026-08-03T10:00:00.000Z",
    updatedAt: "2026-08-03T10:00:00.000Z",
  },
  {
    id: "seed-vanilla-cupcake",
    name: "Vanilla Bean Cupcake",
    slug: "vanilla-cupcake",
    description:
      "Light vanilla sponge crowned with silky Madagascan vanilla buttercream, baked fresh each morning.",
    price: 149,
    category: "Dolci",
    ingredients:
      "Vanilla sponge, Madagascan vanilla buttercream, butter, free-range eggs, cane sugar",
    imageUrl: cupcakeImage,
    model3dUrl: null,
    arUrl: "https://webxr.run/v32MErLX2b1n9",
    qrCodeUrl: "/menu/vanilla-cupcake",
    published: true,
    featured: false,
    createdAt: "2026-08-04T10:00:00.000Z",
    updatedAt: "2026-08-04T10:00:00.000Z",
  },
];

let state: Product[] | null = null;
const listeners = new Set<() => void>();

function read(): Product[] {
  if (typeof window === "undefined") return seed;
  if (state) return state;
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as Product[]) : seed;
    if (!raw) window.localStorage.setItem(KEY, JSON.stringify(seed));
  } catch {
    state = seed;
  }
  return state;
}

function commit(next: Product[]) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota — demo layer only */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProducts(): Product[] {
  return useSyncExternalStore(
    subscribe,
    read,
    () => seed,
  );
}

export function getProducts(): Product[] {
  return read();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function uniqueSlug(slug: string, ignoreId?: string): string {
  const taken = new Set(read().filter((p) => p.id !== ignoreId).map((p) => p.slug));
  if (!taken.has(slug)) return slug;
  let i = 2;
  while (taken.has(`${slug}-${i}`)) i++;
  return `${slug}-${i}`;
}

export function createProduct(input: ProductInput): Product {
  const now = new Date().toISOString();
  const slug = uniqueSlug(slugify(input.slug || input.name));
  const product: Product = {
    ...input,
    slug,
    id: crypto.randomUUID(),
    // The public AR page + QR target are derived automatically from the slug.
    qrCodeUrl: input.published ? productPath(slug) : null,
    createdAt: now,
    updatedAt: now,
  };
  commit([product, ...read()]);
  return product;
}

export function updateProduct(id: string, patch: Partial<ProductInput>): Product | null {
  let updated: Product | null = null;
  const next = read().map((p) => {
    if (p.id !== id) return p;
    const slug = patch.slug ? uniqueSlug(slugify(patch.slug), id) : p.slug;
    const published = patch.published ?? p.published;
    updated = {
      ...p,
      ...patch,
      slug,
      published,
      qrCodeUrl: published ? productPath(slug) : null,
      updatedAt: new Date().toISOString(),
    };
    return updated;
  });
  commit(next);
  return updated;
}

export function duplicateProduct(id: string): Product | null {
  const source = read().find((p) => p.id === id);
  if (!source) return null;
  const now = new Date().toISOString();
  const slug = uniqueSlug(`${source.slug}-copy`);
  const copy: Product = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} (Copy)`,
    slug,
    published: false,
    featured: false,
    qrCodeUrl: null,
    createdAt: now,
    updatedAt: now,
  };
  commit([copy, ...read()]);
  return copy;
}

export async function deleteProduct(id: string): Promise<void> {
  const product = read().find((p) => p.id === id);
  commit(read().filter((p) => p.id !== id));
  if (product) {
    await deleteAsset(product.imageUrl);
    await deleteAsset(product.model3dUrl);
  }
}

export function togglePublished(id: string) {
  const product = read().find((p) => p.id === id);
  if (product) updateProduct(id, { published: !product.published });
}