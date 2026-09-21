import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

export function AdminPage({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function AdminEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="surface-card flex flex-col items-center gap-2 px-6 py-14 text-center">
      <p className="font-display text-lg">{title}</p>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function StatCard({
  label,
  value,
  to,
}: {
  label: string;
  value: number | string;
  to: "/admin/products" | "/admin/services" | "/admin/gallery" | "/admin/categories";
}) {
  return (
    <Link to={to} className="surface-card block p-6 transition-shadow hover:shadow-lift">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </Link>
  );
}
