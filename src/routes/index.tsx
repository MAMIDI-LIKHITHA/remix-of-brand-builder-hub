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
  const { data: products = [] } = useQuery(productsQuery);
  const { data: services = [] } = useQuery(servicesQuery);
  const { data: gallery = [] } = useQuery(galleryQuery);

  const wa = whatsappLink(s?.whatsapp_number, "Hello, I would like to know more.");
  const heroImage = mediaUrl(s?.hero_image);
  const featuredProducts = (products.filter((p) => p.is_featured).length ? products.filter((p) => p.is_featured) : products).slice(0, 6);
  const featuredServices = (services.filter((x) => x.is_featured).length ? services.filter((x) => x.is_featured) : services).slice(0, 3);
  const strengths = Array.isArray(s?.strengths) ? (s!.strengths as unknown[]) : [];

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        {heroImage ? <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover opacity-40" /> : null}
        <div className="grain-hero absolute inset-0" />
        <div className="section-shell relative py-24 md:py-36">
          <div className="max-w-2xl">
            <p className="font-arabic mb-5 text-base text-ink-foreground/85">{s?.tagline ?? DEFAULT_TAGLINE}</p>
            <h1 className="text-4xl leading-[1.05] sm:text-5xl md:text-6xl">{s?.hero_heading ?? s?.business_name ?? DEFAULT_NAME}</h1>
            {s?.hero_subheading ? <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-foreground/80">{s.hero_subheading}</p> : null}
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/products"><Button size="xl" variant="hero">{s?.hero_primary_cta ?? "View Products"} <ArrowRight className="size-4" /></Button></Link>
              <Link to="/services"><Button size="xl" variant="onInk">{s?.hero_secondary_cta ?? "Our Services"}</Button></Link>
              {wa ? <a href={wa} target="_blank" rel="noopener noreferrer"><Button size="xl" variant="whatsapp"><MessageCircle className="size-4" /> WhatsApp</Button></a> : null}
            </div>
          </div>
        </div>
      </section>
      <section className="section-shell py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">About</p>
            <h2 className="text-3xl md:text-4xl">{s?.about_heading ?? "About Aaron Sau"}</h2>
            {s?.about_body ? <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-muted-foreground">{s.about_body}</p> : null}
            {strengths.length ? <ul className="mt-8 grid gap-3 sm:grid-cols-2">{strengths.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><span>{String(item)}</span></li>)}</ul> : null}
            <div className="mt-8"><Link to="/about"><Button variant="outline">More about Aaron Sau <ArrowRight className="size-4" /></Button></Link></div>
          </div>
          <div className="surface-card overflow-hidden"><ImageFrame src={s?.about_image ?? s?.hero_image} alt={s?.about_heading ?? "Aaron Sau"} className="aspect-4/3" /></div>
        </div>
      </section>
      {featuredProducts.length ? <section className="bg-sand py-20 md:py-28"><div className="section-shell"><div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Products</p><h2 className="text-3xl md:text-4xl">What we offer</h2></div><Link to="/products"><Button variant="outline">All products <ArrowRight className="size-4" /></Button></Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featuredProducts.map((p) => <ProductCard key={p.id} product={p} whatsappNumber={s?.whatsapp_number} />)}</div></div></section> : null}
      {featuredServices.length ? <section className="section-shell py-20 md:py-28"><div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Services</p><h2 className="text-3xl md:text-4xl">How we help</h2></div><Link to="/services"><Button variant="outline">All services <ArrowRight className="size-4" /></Button></Link></div><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{featuredServices.map((x) => <ServiceCard key={x.id} service={x} whatsappNumber={s?.whatsapp_number} />)}</div></div></section> : null}
      {gallery.length ? <section className="section-shell pb-20 md:pb-28"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-3">Gallery</p><h2 className="text-3xl md:text-4xl">A closer look</h2></div><Link to="/gallery"><Button variant="outline">Open gallery <ArrowRight className="size-4" /></Button></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{gallery.slice(0, 8).map((g) => <Link key={g.id} to="/gallery" className="surface-card group overflow-hidden"><ImageFrame src={g.image_url} alt={g.title ?? ""} className="aspect-square" /></Link>)}</div></div></section> : null}
      <section className="section-shell pb-4"><div className="grain-hero surface-card flex flex-col items-start gap-6 overflow-hidden bg-ink px-8 py-14 text-ink-foreground md:px-14"><div><h2 className="text-3xl md:text-4xl">{s?.cta_heading ?? "Get in touch with Aaron Sau"}</h2>{s?.cta_body ? <p className="mt-4 max-w-xl text-base text-ink-foreground/80">{s.cta_body}</p> : null}</div><div className="flex flex-wrap gap-3">{wa ? <a href={wa} target="_blank" rel="noopener noreferrer"><Button size="xl" variant="whatsapp"><MessageCircle className="size-4" /> WhatsApp us</Button></a> : null}<Link to="/contact"><Button size="xl" variant="onInk">Contact details</Button></Link></div></div></section>
    </SiteLayout>
  );
}
