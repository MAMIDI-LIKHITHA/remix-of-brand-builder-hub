import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminEmpty } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { productsQuery, categoriesQuery, formatPrice, type Product } from "@/lib/queries";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProducts,
});

type Draft = {
  id?: string;
  name: string;
  category_id: string | null;
  main_image: string | null;
  images: string[];
  short_description: string;
  full_description: string;
  price: string;
  currency: string;
  availability: string;
  is_featured: boolean;
  is_published: boolean;
};

const AVAILABILITY = ["available", "made to order", "out of stock", "coming soon"];

function emptyDraft(): Draft {
  return {
    name: "",
    category_id: null,
    main_image: null,
    images: [],
    short_description: "",
    full_description: "",
    price: "",
    currency: "QAR",
    availability: "available",
    is_featured: false,
    is_published: true,
  };
}

function toDraft(p: Product): Draft {
  return {
    id: p.id,
    name: p.name,
    category_id: p.category_id,
    main_image: p.main_image,
    images: p.images ?? [],
    short_description: p.short_description ?? "",
    full_description: p.full_description ?? "",
    price: p.price === null ? "" : String(p.price),
    currency: p.currency,
    availability: p.availability,
    is_featured: p.is_featured,
    is_published: p.is_published,
  };
}

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        name: d.name.trim(),
        category_id: d.category_id,
        main_image: d.main_image,
        images: d.images,
        short_description: d.short_description.trim() || null,
        full_description: d.full_description.trim() || null,
        price: d.price.trim() === "" ? null : Number(d.price),
        currency: d.currency.trim() || "QAR",
        availability: d.availability,
        is_featured: d.is_featured,
        is_published: d.is_published,
      };
      if (d.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const maxOrder = products.reduce((m, p) => Math.max(m, p.sort_order), 0);
        const { error } = await supabase
          .from("products")
          .insert({ ...payload, sort_order: maxOrder + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Product saved");
      setDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product deleted");
      setPendingDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const quickUpdate = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Product> }) => {
      const { error } = await supabase.from("products").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const ordered = [...products].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );

  async function move(index: number, dir: -1 | 1) {
    const a = ordered[index];
    const b = ordered[index + dir];
    if (!a || !b) return;
    await Promise.all([
      quickUpdate.mutateAsync({ id: a.id, patch: { sort_order: b.sort_order } }),
      quickUpdate.mutateAsync({ id: b.id, patch: { sort_order: a.sort_order } }),
    ]);
  }

  return (
    <AdminPage
      title="Products"
      description="Add, edit, reorder and delete the products shown on your website."
      actions={
        <Button onClick={() => setDraft(emptyDraft())}>
          <Plus className="size-4" /> Add product
        </Button>
      }
    >
      {isLoading ? (
        <div className="surface-card h-40 animate-pulse" />
      ) : ordered.length === 0 ? (
        <AdminEmpty
          title="No products yet"
          body="Add your first product and it will appear on the website immediately."
        />
      ) : (
        <div className="space-y-3">
          {ordered.map((p, i) => (
            <div key={p.id} className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {mediaUrl(p.main_image) ? (
                  <img src={mediaUrl(p.main_image)!} alt="" className="size-full object-cover" />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{p.name}</p>
                  {p.is_featured ? <Badge>Featured</Badge> : null}
                  {!p.is_published ? <Badge variant="secondary">Hidden</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(p.price, p.currency) ?? "Price on request"} ·{" "}
                  <span className="capitalize">{p.availability}</span>
                  {p.category_id
                    ? ` · ${categories.find((c) => c.id === p.category_id)?.name ?? ""}`
                    : ""}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={() => void move(i, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Move down"
                  disabled={i === ordered.length - 1}
                  onClick={() => void move(i, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant={p.is_featured ? "default" : "outline"}
                  aria-label="Toggle featured"
                  onClick={() =>
                    quickUpdate.mutate({ id: p.id, patch: { is_featured: !p.is_featured } })
                  }
                >
                  <Star className="size-4" />
                </Button>
                <Button size="icon" variant="outline" aria-label="Edit" onClick={() => setDraft(toDraft(p))}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  aria-label="Delete"
                  onClick={() => setPendingDelete(p)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit product" : "Add product"}</DialogTitle>
          </DialogHeader>

          {draft ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="p-name">Product name</Label>
                <Input
                  id="p-name"
                  value={draft.name}
                  maxLength={140}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={draft.category_id ?? "none"}
                    onValueChange={(v) => setDraft({ ...draft, category_id: v === "none" ? null : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select
                    value={draft.availability}
                    onValueChange={(v) => setDraft({ ...draft, availability: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABILITY.map((a) => (
                        <SelectItem key={a} value={a} className="capitalize">
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="p-price">Price (leave empty for "on request")</Label>
                  <Input
                    id="p-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p-currency">Currency</Label>
                  <Input
                    id="p-currency"
                    value={draft.currency}
                    maxLength={8}
                    onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-short">Short description</Label>
                <Textarea
                  id="p-short"
                  rows={2}
                  maxLength={300}
                  value={draft.short_description}
                  onChange={(e) => setDraft({ ...draft, short_description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="p-full">Full description</Label>
                <Textarea
                  id="p-full"
                  rows={5}
                  maxLength={4000}
                  value={draft.full_description}
                  onChange={(e) => setDraft({ ...draft, full_description: e.target.value })}
                />
              </div>

              <ImageUploader
                label="Main image"
                value={draft.main_image}
                onChange={(v) => setDraft({ ...draft, main_image: (v as string | null) ?? null })}
              />

              <ImageUploader
                label="Additional images"
                multiple
                value={draft.images}
                onChange={(v) => setDraft({ ...draft, images: (v as string[]) ?? [] })}
              />

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 text-sm">
                  <Switch
                    checked={draft.is_featured}
                    onCheckedChange={(v) => setDraft({ ...draft, is_featured: v })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <Switch
                    checked={draft.is_published}
                    onCheckedChange={(v) => setDraft({ ...draft, is_published: v })}
                  />
                  Visible on website
                </label>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDraft(null)}>
              Cancel
            </Button>
            <Button
              disabled={save.isPending || !draft?.name.trim()}
              onClick={() => draft && save.mutate(draft)}
            >
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{pendingDelete?.name}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This removes the product from your website. It cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() => pendingDelete && remove.mutate(pendingDelete.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
