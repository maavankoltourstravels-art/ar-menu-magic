import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_CREDENTIALS, signIn, useAdminSession } from "@/lib/auth";
import { RESTAURANT } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Admin — ${RESTAURANT.name} AR Studio` },
      {
        name: "description",
        content:
          "Manage dishes, upload 3D models and generate printable AR menu cards for La Piazza.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const session = useAdminSession();

  if (!session) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-secondary/40 md:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark px-4 py-12">
      <div className="w-full max-w-md animate-rise rounded-3xl border border-border/40 bg-card p-8 shadow-lift">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-warm text-primary-foreground">
          <Lock className="size-5" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold">{RESTAURANT.name} AR Studio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage dishes, 3D models and printable AR menu cards.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lapiazza.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Login
          </Button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-2xl bg-secondary/70 p-4 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 text-olive" />
          <span>
            <span className="block font-medium text-foreground">Demo credentials</span>
            {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
            <span className="mt-1 block">
              Auth is isolated in one module, ready to swap for Supabase Auth.
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}