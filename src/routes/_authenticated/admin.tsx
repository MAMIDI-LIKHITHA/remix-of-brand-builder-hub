import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Wrench,
  Tags,
  Images,
  FileText,
  Phone,
  Loader2,
  LogOut,
  Menu,
  ExternalLink,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/services", label: "Services", icon: Wrench, exact: false },
  { to: "/admin/categories", label: "Categories", icon: Tags, exact: false },
  { to: "/admin/gallery", label: "Gallery", icon: Images, exact: false },
  { to: "/admin/content", label: "Website content", icon: FileText, exact: false },
  { to: "/admin/contact", label: "Contact & social", icon: Phone, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["admin-session"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) return { email: null, isAdmin: false };
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      return { email: user.email ?? null, isAdmin: Boolean(isAdmin) };
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session.isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5 text-center">
        <h1 className="text-2xl">No admin access</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This account is signed in but is not an administrator of this website. Ask the owner to
          grant access.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
          <Link to="/">
            <Button>Back to website</Button>
          </Link>
        </div>
      </div>
    );
  }

  const nav = (
    <nav className="space-y-1">
      {NAV.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.exact }}
          activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col justify-between bg-sidebar p-5 lg:flex">
        <div>
          <Link to="/admin" className="font-display text-lg font-semibold text-sidebar-foreground">
            fts88994 admin
          </Link>
          <div className="mt-7">{nav}</div>
        </div>
        <div className="space-y-3 border-t border-sidebar-border pt-5">
          <p className="truncate text-xs text-sidebar-foreground/50">{session.email}</p>
          <Link to="/" className="block">
            <Button variant="onInk" size="sm" className="w-full justify-start">
              <ExternalLink className="size-4" /> View website
            </Button>
          </Link>
          <Button
            variant="onInk"
            size="sm"
            className="w-full justify-start"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-10 items-center justify-center rounded-md border border-border"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display font-semibold">Admin</span>
          <Button size="sm" variant="outline" onClick={() => void signOut()}>
            <LogOut className="size-4" />
          </Button>
        </header>

        {open ? (
          <div className="bg-sidebar p-4 lg:hidden">
            {nav}
            <Link to="/" className="mt-3 block">
              <Button variant="onInk" size="sm" className="w-full">
                View website
              </Button>
            </Link>
          </div>
        ) : null}

        <div className="min-w-0 flex-1 p-5 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
