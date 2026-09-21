import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram, Mail, MapPin, Phone, Clock, MessageCircle } from "lucide-react";

import { settingsQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/whatsapp";

export function Footer() {
  const { data: s } = useQuery(settingsQuery);
  const wa = whatsappLink(s?.whatsapp_number, "Hello, I would like to know more.");

  const socials = [
    { url: s?.instagram_url, label: "Instagram" },
    { url: s?.facebook_url, label: "Facebook" },
    { url: s?.tiktok_url, label: "TikTok" },
    { url: s?.snapchat_url, label: "Snapchat" },
  ].filter((x) => Boolean(x.url));

  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="section-shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="font-display text-xl font-semibold">{s?.business_name ?? "Aaron Sau"}</p>
          {s?.tagline ? (
            <p className="font-arabic text-sm text-ink-foreground/70">{s.tagline}</p>
          ) : <p className="text-sm text-ink-foreground/70">Available 🇸🇦🇶🇦🇪🇭🇦🇪🇧🇭🇴🇲</p>}
          {s?.footer_text ? (
            <p className="text-sm text-ink-foreground/60">{s.footer_text}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-foreground/50">
            Explore
          </p>
          {[
            { to: "/products", label: "Products" },
            { to: "/services", label: "Services" },
            { to: "/gallery", label: "Gallery" },
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block text-sm text-ink-foreground/75 transition-colors hover:text-ink-foreground"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-foreground/50">
            Contact
          </p>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-ink-foreground/75 hover:text-ink-foreground"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          ) : null}
          {s?.phone ? (
            <a
              href={`tel:${s.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-2 text-sm text-ink-foreground/75 hover:text-ink-foreground"
            >
              <Phone className="size-4" /> {s.phone}
            </a>
          ) : null}
          {s?.email ? (
            <a
              href={`mailto:${s.email}`}
              className="flex items-center gap-2 text-sm text-ink-foreground/75 hover:text-ink-foreground"
            >
              <Mail className="size-4" /> {s.email}
            </a>
          ) : null}
          {s?.address ? (
            <p className="flex items-start gap-2 text-sm text-ink-foreground/75">
              <MapPin className="mt-0.5 size-4 shrink-0" /> {s.address}
            </p>
          ) : null}
          {s?.business_hours ? (
            <p className="flex items-start gap-2 text-sm text-ink-foreground/75">
              <Clock className="mt-0.5 size-4 shrink-0" /> {s.business_hours}
            </p>
          ) : null}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-foreground/50">
            Follow
          </p>
          {socials.map((soc) => (
            <a
              key={soc.label}
              href={soc.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-ink-foreground/75 transition-colors hover:text-ink-foreground"
            >
              {soc.label === "Instagram" ? <Instagram className="size-4" /> : null}
              {soc.label}
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="section-shell flex flex-col gap-2 py-5 text-xs text-ink-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {s?.business_name ?? "Aaron Sau"}. All rights reserved.
          </p>
          <Link to="/auth" className="hover:text-ink-foreground/80">
            Owner login
          </Link>
        </div>
      </div>
    </footer>
  );
}
