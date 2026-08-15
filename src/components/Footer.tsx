import { Link } from "@tanstack/react-router";

import { RESTAURANT } from "@/lib/types";

export function Footer() {
  return (
    <footer className="mt-24 bg-gradient-dark text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl font-semibold">{RESTAURANT.name}</p>
          <p className="mt-1 text-sm opacity-70">{RESTAURANT.tagline}</p>
          <p className="mt-4 max-w-sm text-sm opacity-60">
            12 Marine Drive, Mumbai · Open daily 12:00 – 23:30
          </p>
        </div>
        <div className="flex gap-8 text-sm">
          <Link to="/menu" className="opacity-70 transition-opacity hover:opacity-100">
            AR Menu
          </Link>
          <Link to="/admin" className="opacity-70 transition-opacity hover:opacity-100">
            Admin Panel
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-50">
        “{RESTAURANT.motto}” — WebAR Smart Menu demo
      </div>
    </footer>
  );
}