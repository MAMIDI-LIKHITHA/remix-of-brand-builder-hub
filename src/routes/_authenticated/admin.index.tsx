import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { AdminPage, StatCard } from "@/components/admin/AdminShell";
import { productsQuery, servicesQuery, galleryQuery, categoriesQuery, settingsQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Overview,
});

function Overview() {
  const { data: products = [] } = useQuery(productsQuery);
  const { data: services = [] } = useQuery(servicesQuery);
  const { data: gallery = [] } = useQuery(galleryQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: settings } = useQuery(settingsQuery);

  const todo = [
    !settings?.whatsapp_number
      ? { label: "Add your WhatsApp number", to: "/admin/contact" as const }
      : null,
    !settings?.about_body ? { label: "Write your About text", to: "/admin/content" as const } : null,
    !settings?.hero_image ? { label: "Upload a hero image", to: "/admin/content" as const } : null,
    products.length === 0 ? { label: "Add your first product", to: "/admin/products" as const } : null,
    services.length === 0 ? { label: "Add your first service", to: "/admin/services" as const } : null,
    gallery.length === 0 ? { label: "Upload gallery photos", to: "/admin/gallery" as const } : null,
  ].filter(Boolean) as { label: string; to: "/admin/contact" | "/admin/content" | "/admin/products" | "/admin/services" | "/admin/gallery" }[];

  return (
    <AdminPage
      title="Overview"
      description="Everything you change here appears on the public website straight away."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Products" value={products.length} to="/admin/products" />
        <StatCard label="Services" value={services.length} to="/admin/services" />
        <StatCard label="Gallery photos" value={gallery.length} to="/admin/gallery" />
        <StatCard label="Categories" value={categories.length} to="/admin/categories" />
      </div>

      {todo.length ? (
        <div className="surface-card p-6">
          <h2 className="text-lg">Set-up checklist</h2>
          <ul className="mt-4 space-y-2">
            {todo.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
                <span className="text-sm">{item.label}</span>
                <Link to={item.to}>
                  <Button size="sm" variant="outline">
                    Do it
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="surface-card p-6">
          <h2 className="text-lg">All set</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your website has content in every section. Keep adding products and photos any time.
          </p>
        </div>
      )}
    </AdminPage>
  );
}
