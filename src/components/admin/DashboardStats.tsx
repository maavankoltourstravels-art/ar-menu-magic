import { CheckCircle2, FileEdit, QrCode, UtensilsCrossed } from "lucide-react";

import type { Product } from "@/lib/types";

export function DashboardStats({ products }: { products: Product[] }) {
  const published = products.filter((p) => p.published);
  const stats = [
    { label: "Total Products", value: products.length, icon: UtensilsCrossed },
    { label: "Published", value: published.length, icon: CheckCircle2 },
    { label: "Drafts", value: products.length - published.length, icon: FileEdit },
    { label: "QR Codes", value: published.length, icon: QrCode },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <p className="eyebrow text-[0.6rem] text-muted-foreground">{label}</p>
            <Icon className="size-4 text-primary" />
          </div>
          <p className="font-display mt-3 text-3xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}