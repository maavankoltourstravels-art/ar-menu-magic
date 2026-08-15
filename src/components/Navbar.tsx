import { Link } from "@tanstack/react-router";
import { Menu, Scan, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { RESTAURANT } from "@/lib/types";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "AR Menu" },
  { to: "/admin", label: "Admin" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-gradient-warm text-primary-foreground">
            <Scan className="size-4" />
          </span>
          <span className="leading-none">
            <span className="font-display block text-xl font-semibold tracking-tight">
              {RESTAURANT.name}
            </span>
            <span className="eyebrow text-[0.55rem] text-muted-foreground">AR Menu</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" className="rounded-full">
            <Link to="/menu">Explore AR Menu</Link>
          </Button>
        </nav>

        <button
          className="inline-flex size-10 items-center justify-center rounded-full border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-muted-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}