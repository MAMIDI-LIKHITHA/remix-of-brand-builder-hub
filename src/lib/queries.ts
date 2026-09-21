import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type GalleryImage = Database["public"]["Tables"]["gallery_images"]["Row"];

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const settingsQuery = queryOptions({
  queryKey: ["site_settings"],
  staleTime: 30_000,
  queryFn: async () =>
    unwrap<SiteSettings>(await supabase.from("site_settings").select("*").eq("id", "main").single()),
});

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async () =>
    unwrap<Category[]>(
      await supabase.from("categories").select("*").order("sort_order").order("name"),
    ),
});

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async () =>
    unwrap<Product[]>(
      await supabase
        .from("products")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false }),
    ),
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async () =>
    unwrap<Service[]>(
      await supabase
        .from("services")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false }),
    ),
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery_images"],
  queryFn: async () =>
    unwrap<GalleryImage[]>(
      await supabase.from("gallery_images").select("*").order("sort_order").order("created_at"),
    ),
});

export function productQuery(id: string) {
  return queryOptions({
    queryKey: ["products", id],
    queryFn: async () =>
      unwrap<Product>(await supabase.from("products").select("*").eq("id", id).single()),
  });
}

export function formatPrice(price: number | null, currency: string | null): string | null {
  if (price === null || price === undefined) return null;
  const value = Number(price);
  if (!Number.isFinite(value)) return null;
  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
  return `${formatted} ${currency ?? ""}`.trim();
}
