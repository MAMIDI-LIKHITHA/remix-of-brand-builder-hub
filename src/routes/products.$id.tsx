import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ImageFrame } from "@/components/site/Cards";
import { settingsQuery, productQuery, categoriesQuery, formatPrice } from "@/lib/queries";
import { mediaUrl } from "@/lib/media";
import { whatsappLink, enquiryMessage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/products/$id")({
  head: () => ({
    meta: [
      { title: "Product details — fts88994" },
      {
        name: "description",
        content: "Full details, pricing and availability for this fts88994 product.",
      },
      { property: "og:title", content: "Product details — fts88994" },
      {
        property: "og:description",
        content: "Full details, pricing and availability for this product.",
      },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: s } = useQuery(settingsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: product, isLoading, isError } = useQuery(productQuery(id));
  const [active, setActive] = useState<string | null>(null);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="section-shell py-24">
          <div className="surface-card h-96 animate-pulse" />
        </div>
      </SiteLayout>
    );
  }

  if (isError || !product) {
    return (
      <SiteLayout>
        <div className="section-shell py-24 text-center">
          <h1 className="text-3xl">Product not found</h1>
          <p className="mt-3 text-muted-foreground">
            This product may have been removed or is no longer available.
          </p>
          <Link to="/products" className="mt-6 inline-block">
            <Button>Back to products</Button>
          </Link>
        </div>
      </SiteLayout>
    );
  }

  const gallery = [product.main_image, ...(product.images ?? [])].filter(Boolean) as string[];
  const current = active ?? gallery[0] ?? null;
  const price = formatPrice(product.price, product.currency);
  const wa = whatsappLink(s?.whatsapp_number, enquiryMessage(product.name));
  const categoryName = categories.find((c) => c.id === product.category_id)?.name;

  return (
    <SiteLayout>
      <div className="section-shell py-10 md:py-16">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All products
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="surface-card overflow-hidden">
              <ImageFrame src={current} alt={product.name} className="aspect-square" />
            </div>
            {gallery.length > 1 ? (
              <div className="grid grid-cols-4 gap-3">
                {gallery.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActive(img)}
                    className={`overflow-hidden rounded-lg border-2 transition-colors ${
                      current === img ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={mediaUrl(img) ?? ""}
                      alt=""
                      className="aspect-square size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              {categoryName ? <Badge variant="secondary">{categoryName}</Badge> : null}
              {product.is_featured ? <Badge>Featured</Badge> : null}
              <Badge variant="outline" className="capitalize">
                {product.availability?.replace(/_/g, " ")}
              </Badge>
            </div>

            <h1 className="mt-4 text-3xl md:text-4xl">{product.name}</h1>

            <p className="mt-4 font-display text-2xl font-semibold">
              {price ?? <span className="text-lg text-muted-foreground">Price on request</span>}
            </p>

            {product.short_description ? (
              <p className="mt-6 text-base leading-relaxed text-foreground/85">
                {product.short_description}
              </p>
            ) : null}

            {product.full_description ? (
              <div className="mt-6 border-t border-border pt-6">
                <h2 className="text-lg">Details</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {product.full_description}
                </p>
              </div>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  <Button size="xl" variant="whatsapp">
                    <MessageCircle className="size-4" /> Enquire on WhatsApp
                  </Button>
                </a>
              ) : null}
              <Link to="/contact">
                <Button size="xl" variant="outline">
                  Other ways to reach us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
