import { Link } from "@tanstack/react-router";
import { MessageCircle, ImageOff } from "lucide-react";

import { mediaUrl } from "@/lib/media";
import { whatsappLink, enquiryMessage } from "@/lib/whatsapp";
import { formatPrice, type Product, type Service } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ImageFrame({
  src,
  alt,
  className = "aspect-4/3",
}: {
  src?: string | null | undefined;
  alt: string;
  className?: string | undefined;
}) {
  const url = mediaUrl(src);
  return (
    <div className={`w-full overflow-hidden bg-muted ${className}`}>
      {url ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ImageOff className="size-8" />
        </div>
      )}
    </div>
  );
}

export function ProductCard({
  product,
  whatsappNumber,
}: {
  product: Product;
  whatsappNumber?: string | null | undefined;
}) {
  const price = formatPrice(product.price, product.currency);
  const wa = whatsappLink(whatsappNumber, enquiryMessage(product.name));

  return (
    <article className="surface-card group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <Link to="/products/$id" params={{ id: product.id }} className="block">
        <ImageFrame src={product.main_image} alt={product.name} />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug">
            <Link to="/products/$id" params={{ id: product.id }} className="hover:text-primary">
              {product.name}
            </Link>
          </h3>
          {product.is_featured ? <Badge className="shrink-0">Featured</Badge> : null}
        </div>
        {product.short_description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.short_description}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div>
            {price ? (
              <p className="font-display text-lg font-semibold">{price}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Price on request</p>
            )}
            <p className="text-xs capitalize text-muted-foreground">
              {product.availability?.replace(/_/g, " ")}
            </p>
          </div>
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="whatsapp">
                <MessageCircle className="size-4" /> Enquire
              </Button>
            </a>
          ) : (
            <Link to="/contact">
              <Button size="sm">Enquire</Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function ServiceCard({
  service,
  whatsappNumber,
}: {
  service: Service;
  whatsappNumber?: string | null | undefined;
}) {
  const price = formatPrice(service.price, service.currency);
  const wa = whatsappLink(whatsappNumber, enquiryMessage(service.name));

  return (
    <article className="surface-card group flex flex-col overflow-hidden transition-shadow hover:shadow-lift">
      <ImageFrame src={service.image} alt={service.name} className="aspect-16/9" />
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl leading-snug">{service.name}</h3>
          {service.is_featured ? <Badge className="shrink-0">Featured</Badge> : null}
        </div>
        {service.short_description ? (
          <p className="text-sm text-muted-foreground">{service.short_description}</p>
        ) : null}
        {service.full_description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
            {service.full_description}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {price ? (
            <p className="font-display text-lg font-semibold">{price}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Price on request</p>
          )}
          {wa ? (
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="whatsapp">
                <MessageCircle className="size-4" /> Enquire
              </Button>
            </a>
          ) : (
            <Link to="/contact">
              <Button size="sm">Enquire</Button>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="surface-card flex flex-col items-center gap-2 px-6 py-16 text-center">
      <h3 className="text-lg">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
