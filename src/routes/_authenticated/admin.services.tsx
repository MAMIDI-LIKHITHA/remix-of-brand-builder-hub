import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminEmpty } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { servicesQuery, formatPrice, type Service } from "@/lib/queries";
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

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: AdminServices,
});

type Draft = {
  id?: string;
  name: string;
  image: string | null;
  short_description: string;
  full_description: string;
  price: string;
  currency: string;
  is_featured: boolean;
  is_published: boolean;
};

const empty = (): Draft => ({
  name: "",
  image: null,
  short_description: "",
  full_description: "",
  price: "",
  currency: "QAR",
  is_featured: false,
  is_published: true,
});

const toDraft = (s: Service): Draft => ({
  id: s.id,
  name: s.name,
  image: s.image,
  short_description: s.short_description ?? "",
  full_description: s.full_description ?? "",
  price: s.price === null ? "" : String(s.price),
  currency: s.currency,
  is_featured: s.is_featured,
  is_published: s.is_published,
});

function AdminServices() {
  const queryClient = useQueryClient();
  const { data: services = [], isLoading } = useQuery(servicesQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["services"] });
  };

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        name: d.name.trim(),
        image: d.image,
        short_description: d.short_description.trim() || null,
        full_description: d.full_description.trim() || null,
        price: d.price.trim() === "" ? null : Number(d.price),
        currency: d.currency.trim() || "QAR",
        is_featured: d.is_featured,
        is_published: d.is_published,
      };
      if (d.id) {
        const { error } = await supabase.from("services").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const maxOrder = services.reduce((m, s) => Math.max(m, s.sort_order), 0);
        const { error } = await supabase
          .from("services")
          .insert({ ...payload, sort_order: maxOrder + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Service saved");
      setDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Service deleted");
      setPendingDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const quickUpdate = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Service> }) => {
      const { error } = await supabase.from("services").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const ordered = [...services].sort(
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
      title="Services"
      description="Manage the services listed on your website."
      actions={
        <Button onClick={() => setDraft(empty())}>
          <Plus className="size-4" /> Add service
        </Button>
      }
    >
      {isLoading ? (
        <div className="surface-card h-40 animate-pulse" />
      ) : ordered.length === 0 ? (
        <AdminEmpty
          title="No services yet"
          body="Add a service and it will appear on the website immediately."
        />
      ) : (
        <div className="space-y-3">
          {ordered.map((s, i) => (
            <div key={s.id} className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {mediaUrl(s.image) ? (
                  <img src={mediaUrl(s.image)!} alt="" className="size-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{s.name}</p>
                  {s.is_featured ? <Badge>Featured</Badge> : null}
                  {!s.is_published ? <Badge variant="secondary">Hidden</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatPrice(s.price, s.currency) ?? "Price on request"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="icon" variant="outline" aria-label="Move up" disabled={i === 0} onClick={() => void move(i, -1)}>
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
                  variant={s.is_featured ? "default" : "outline"}
                  aria-label="Toggle featured"
                  onClick={() => quickUpdate.mutate({ id: s.id, patch: { is_featured: !s.is_featured } })}
                >
                  <Star className="size-4" />
                </Button>
                <Button size="icon" variant="outline" aria-label="Edit" onClick={() => setDraft(toDraft(s))}>
                  <Pencil className="size-4" />
                </Button>
                <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => setPendingDelete(s)}>
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
            <DialogTitle>{draft?.id ? "Edit service" : "Add service"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="s-name">Service name</Label>
                <Input
                  id="s-name"
                  value={draft.name}
                  maxLength={140}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="s-price">Price (leave empty for "on request")</Label>
                  <Input
                    id="s-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="s-currency">Currency</Label>
                  <Input
                    id="s-currency"
                    value={draft.currency}
                    maxLength={8}
                    onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-short">Short description</Label>
                <Textarea
                  id="s-short"
                  rows={2}
                  maxLength={300}
                  value={draft.short_description}
                  onChange={(e) => setDraft({ ...draft, short_description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-full">Detailed description</Label>
                <Textarea
                  id="s-full"
                  rows={5}
                  maxLength={4000}
                  value={draft.full_description}
                  onChange={(e) => setDraft({ ...draft, full_description: e.target.value })}
                />
              </div>
              <ImageUploader
                label="Service image"
                value={draft.image}
                onChange={(v) => setDraft({ ...draft, image: (v as string | null) ?? null })}
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
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{pendingDelete?.name}"?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
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
