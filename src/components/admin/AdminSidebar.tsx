import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, PlusCircle, Scan, Store, UtensilsCrossed } from "lucide-react";

import { signOut, useAdminSession } from "@/lib/auth";
import { RESTAURANT } from "@/lib/types";

const items = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: UtensilsCrossed, exact: true },
  { to: "/admin/products/new", label: "Add Product", icon: PlusCircle, exact: true },
] as const;

export function AdminSidebar() {
  const session = useAdminSession();
  const navigate = useNavigate();

  return (
    <aside className="flex shrink-0 flex-col gap-6 bg-sidebar p-4 text-sidebar-foreground md:h-screen md:w-64 md:sticky md:top-0">
      <Link to="/admin" className="flex items-center gap-3 px-2 pt-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
          <Scan className="size-4" />
        </span>
        <span>
          <span className="font-display block text-lg font-semibold leading-none">
            {RESTAURANT.name}
          </span>
          <span className="eyebrow text-[0.55rem] opacity-60">AR Studio</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium opacity-70 transition-all hover:bg-sidebar-accent hover:opacity-100"
            activeProps={{ className: "bg-sidebar-accent opacity-100" }}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
        <Link
          to="/menu"
          className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium opacity-70 transition-all hover:bg-sidebar-accent hover:opacity-100"
        >
          <Store className="size-4" /> View public site
        </Link>
      </nav>

      <div className="rounded-2xl bg-sidebar-accent/60 p-3 text-xs">
        <p className="opacity-60">Signed in as</p>
        <p className="truncate font-medium">{session?.email}</p>
        <button
          onClick={() => {
            signOut();
            navigate({ to: "/admin", replace: true });
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-full bg-sidebar-primary px-3 py-1.5 font-medium text-sidebar-primary-foreground"
        >
          <LogOut className="size-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}