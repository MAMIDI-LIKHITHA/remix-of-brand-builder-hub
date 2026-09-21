import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";

import { Header } from "./Header";
import { Footer } from "./Footer";
import { settingsQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/whatsapp";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { data: s } = useQuery(settingsQuery);
  const wa = whatsappLink(s?.whatsapp_number, "Hello, I would like to know more.");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-5 z-50 inline-flex size-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lift transition-transform hover:scale-105"
        >
          <MessageCircle className="size-7" />
        </a>
      ) : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
}) {
  return (
    <section className="border-b border-border bg-sand">
      <div className="section-shell py-14 md:py-20">
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h1 className="max-w-3xl text-4xl md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
