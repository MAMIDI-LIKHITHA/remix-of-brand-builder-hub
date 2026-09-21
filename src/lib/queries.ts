import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type GalleryImage = Database["public"]["Tables"]["gallery_images"]["Row"];

const PROFILE = {
  business_name: "Aaron Sau",
  tagline: "Available 🇸🇦🇶🇦🇪🇭🇦🇪🇧🇭🇴🇲",
  hero_heading: "Aaron Sau",
  hero_subheading: "1 post · 539 followers · 1,312 following",
  about_heading: "About Aaron Sau",
  about_body: "Connect with Aaron Sau and follow the latest profile updates on Instagram.",
  instagram_url: "https://www.instagram.com/aroon10153/?hl=en",
  footer_text: "Aaron Sau — Available 🇸🇦🇶🇦🇪🇭🇦🇪🇧🇭🇴🇲",
} as const;

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const settingsQuery = queryOptions({
  queryKey: ["site_settings", "aaron-sau"],
  staleTime: Infinity,
  queryFn: async () => {
    const result = await supabase.from("site_settings").select("*").eq("id", "main").maybeSingle();
    if (result.error) throw new Error(result.error.message);
    return { ...(result.data ?? {}), ...PROFILE } as SiteSettings;
  },
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () => unwrap<Category[]>(await supabase.from("categories").select("*").order("sort_order").order("name")),
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () => [] as Product[],
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () => [] as Service[],
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery_images"],
  queryFn: async () => [] as GalleryImage[],
});

export function productQuery(id: string) {
  return queryOptions({
    queryKey: ["products", id],
    queryFn: async () => {
      const result = await supabase.from("products").select("*").eq("id", id).single();
      return unwrap<Product>(result);
    },
  });
}

export function formatPrice(price: number | null, currency: string | null): string | null {
  if (price === null || price === undefined) return null;
  const value = Number(price);
  if (!Number.isFinite(value)) return null;
  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
  return `${formatted} ${currency ?? ""}`.trim();
}
