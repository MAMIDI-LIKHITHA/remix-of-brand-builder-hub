import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, MessageCircle } from "lucide-react";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { ImageFrame } from "@/components/site/Cards";
import { settingsQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — fts88994" },
      {
        name: "description",
        content: "Learn about fts88994, what we offer and why customers in Qatar and Dubai choose us.",
      },
      { property: "og:title", content: "About — fts88994" },
      {
        property: "og:description",
        content: "Learn about fts88994, what we offer and why customers choose us.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { data: s } = useQuery(settingsQuery);
  const wa = whatsappLink(s?.whatsapp_number, "Hello, I would like to know more.");
  const strengths = Array.isArray(s?.strengths) ? (s!.strengths as unknown[]) : [];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="About"
        title={s?.about_heading ?? "About us"}
        description={s?.tagline ?? null}
      />
      <section className="section-shell grid gap-12 py-16 md:py-24 lg:grid-cols-2">
        <div>
          {s?.about_body ? (
            <p className="whitespace-pre-line text-base leading-relaxed text-foreground/85">
              {s.about_body}
            </p>
          ) : (
            <p className="text-muted-foreground">
              Business introduction can be added from the admin panel.
            </p>
          )}

          {strengths.length ? (
            <div className="mt-10">
              <h2 className="text-2xl">Why choose us</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {strengths.map((item, i) => (
                  <li key={i} className="surface-card flex items-start gap-2 p-4 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{String(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="whatsapp">
                  <MessageCircle className="size-4" /> WhatsApp us
                </Button>
              </a>
            ) : null}
            <Link to="/products">
              <Button size="lg" variant="outline">
                Browse products
              </Button>
            </Link>
          </div>
        </div>

        <div className="surface-card overflow-hidden">
          <ImageFrame
            src={s?.about_image ?? s?.hero_image}
            alt={s?.about_heading ?? "About"}
            className="aspect-4/3"
          />
        </div>
      </section>
    </SiteLayout>
  );
}
