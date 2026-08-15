export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  ingredients: string;
  imageUrl: string | null;
  model3dUrl: string | null;
  qrCodeUrl: string | null;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt" | "qrCodeUrl">;

export const CATEGORIES = [
  "Pizza",
  "Pasta",
  "Antipasti",
  "Dolci",
  "Bevande",
] as const;

export const RESTAURANT = {
  name: "La Piazza",
  tagline: "Cucina Italiana · Since 1998",
  motto: "See it before you order",
} as const;