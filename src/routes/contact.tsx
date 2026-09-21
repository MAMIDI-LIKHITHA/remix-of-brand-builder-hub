import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Phone, Mail, MapPin, Clock, Instagram, ExternalLink } from "lucide-react";

import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { settingsQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — fts88994" },
      {
        name: "description",
        content: "Contact fts88994 by WhatsApp, phone or email. Serving Qatar and Dubai.",
      },
      { property: "og:title", content: "Contact — fts88994" },
      { property: "og:description", content: "Contact us by WhatsApp, phone or email." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: s } = useQuery(settingsQuery);
  const wa = whatsappLink(s?.whatsapp_number, "Hello, I would like to know more.");

  const rows = [
    s?.phone
      ? { icon: Phone, label: "Phone", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` }
      : null,
    s?.email ? { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` } : null,
    s?.address ? { icon: MapPin, label: "Location", value: s.address, href: null } : null,
    s?.business_hours
      ? { icon: Clock, label: "Business hours", value: s.business_hours, href: null }
      : null,
  ].filter(Boolean) as {
    icon: typeof Phone;
    label: string;
    value: string;
    href: string | null;
  }[];

  const socials = [
    { url: s?.instagram_url, label: "Instagram", icon: Instagram },
    { url: s?.facebook_url, label: "Facebook", icon: ExternalLink },
    { url: s?.tiktok_url, label: "TikTok", icon: ExternalLink },
    { url: s?.snapchat_url, label: "Snapchat", icon: ExternalLink },
  ].filter((x) => Boolean(x.url));

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        description={s?.cta_body ?? "Message us on WhatsApp and we will get back to you."}
      />

      <section className="section-shell grid gap-8 py-14 md:py-20 lg:grid-cols-3">
        <div className="surface-card flex flex-col gap-4 p-8 lg:col-span-1">
          <h2 className="text-2xl">Fastest reply</h2>
          <p className="text-sm text-muted-foreground">
            WhatsApp is the quickest way to reach us with a question about any product or service.
          </p>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <Button size="xl" variant="whatsapp" className="w-full">
                <MessageCircle className="size-4" /> Chat on WhatsApp
              </Button>
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              A WhatsApp number can be added from the admin panel.
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          {rows.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {rows.map((r) => (
                <div key={r.label} className="surface-card flex items-start gap-4 p-6">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <r.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      {r.label}
                    </p>
                    {r.href ? (
                      <a href={r.href} className="break-words text-base hover:text-primary">
                        {r.value}
                      </a>
                    ) : (
                      <p className="break-words text-base">{r.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="surface-card p-8 text-sm text-muted-foreground">
              Contact details can be added from the admin panel.
            </div>
          )}

          {socials.length ? (
            <div className="mt-8">
              <h2 className="text-xl">Follow us</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {socials.map((soc) => (
                  <a key={soc.label} href={soc.url!} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      <soc.icon className="size-4" /> {soc.label}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </SiteLayout>
  );
}
