import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { ServiceCard, EmptyState } from "@/components/site/Cards";
import { settingsQuery, servicesQuery } from "@/lib/queries";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — fts88994" },
      {
        name: "description",
        content: "The services fts88994 offers in Qatar and Dubai. Message us on WhatsApp to book.",
      },
      { property: "og:title", content: "Services — fts88994" },
      { property: "og:description", content: "The services we offer. Message us to book." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const { data: s } = useQuery(settingsQuery);
  const { data: services = [], isLoading } = useQuery(servicesQuery);
  const visible = services
    .filter((x) => x.is_published)
    .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Services"
        title="Our services"
        description="Tell us what you need and we will take care of it. Enquire on WhatsApp for availability and pricing."
      />
      <section className="section-shell py-12 md:py-16">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="surface-card h-80 animate-pulse" />
            ))}
          </div>
        ) : visible.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((x) => (
              <ServiceCard key={x.id} service={x} whatsappNumber={s?.whatsapp_number} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No services listed yet"
            body="Services added from the admin panel will appear here automatically."
          />
        )}
      </section>
    </SiteLayout>
  );
}
