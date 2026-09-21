import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle, Check } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard, ServiceCard, ImageFrame } from "@/components/site/Cards";
import { settingsQuery, productsQuery, servicesQuery, galleryQuery } from "@/lib/queries";
import { mediaUrl } from "@/lib/media";
import { whatsappLink } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";

const DEFAULT_NAME = "Aaron Sau";
const DEFAULT_TAGLINE = "Available 🇸🇦🇶🇦🇪🇭🇦🇪🇧🇭🇴🇲";
const DEFAULT_INSTAGRAM = "https://www.instagram.com/aroon10153/?hl=en";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${DEFAULT_NAME} — Products & Services` },
      { name: "description", content: `${DEFAULT_NAME} — available 🇸🇦🇶🇦🇪🇭🇦🇪🇧🇭🇴🇲.` },
      { property: "og:title", content: DEFAULT_NAME },
      { property: "og:description", content: DEFAULT_TAGLINE },
      { property: "og:url", content: DEFAULT_INSTAGRAM },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: s } = useQuery(settingsQuery);
  const instagram = s?.instagram_url ?? DEFAULT_INSTAGRAM;

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="grain-hero absolute inset-0" />
        <div className="section-shell relative py-24 md:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-arabic mb-5 text-base text-ink-foreground/85">
              {s?.tagline ?? DEFAULT_TAGLINE}
            </p>
            <div className="mx-auto mb-7 flex size-24 items-center justify-center rounded-full border border-ink-foreground/20 bg-ink-foreground/10 text-2xl font-semibold">
              AS
            </div>
            <h1 className="text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
              {s?.hero_heading ?? DEFAULT_NAME}
            </h1>
            <p className="mt-6 text-lg text-ink-foreground/80">
              {s?.hero_subheading ?? "1 post · 539 followers · 1,312 following"}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <a href={instagram} target="_blank" rel="noopener noreferrer">
                <Button size="xl" variant="hero">View Instagram <ArrowRight className="size-4" /></Button>
              </a>
              <Link to="/about"><Button size="xl" variant="onInk">About Aaron Sau</Button></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-3">Profile</p>
          <h2 className="text-3xl md:text-4xl">About Aaron Sau</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {s?.about_body ?? "Connect with Aaron Sau and follow the latest profile updates on Instagram."}
          </p>
          <div className="mt-8">
            <a href={instagram} target="_blank" rel="noopener noreferrer">
              <Button size="lg">Follow on Instagram <ArrowRight className="size-4" /></Button>
            </a>
          </div>
        </div>
      </section>

      <section className="bg-sand py-16">
        <div className="section-shell text-center">
          <p className="text-sm font-medium text-muted-foreground">Instagram</p>
          <p className="mt-2 text-2xl font-semibold">@aroon10153</p>
          <p className="mt-2 text-sm text-muted-foreground">1 post · 539 followers · 1,312 following</p>
          <div className="mt-6">
            <a href={instagram} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Open Instagram profile</Button>
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
