import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminEmpty } from "@/components/admin/AdminShell";
import { categoriesQuery, productsQuery, type Category } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: AdminCategories,
});

type Draft = { id?: string; name: string; description: string };

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "") || `category-${Date.now()}`
  );
}

function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useQuery(categoriesQuery);
  const { data: products = [] } = useQuery(productsQuery);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const save = useMutation({
    mutationFn: async (d: Draft) => {
      const payload = {
        name: d.name.trim(),
        description: d.description.trim() || null,
        slug: slugify(d.name),
      };
      if (d.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", d.id);
        if (error) throw error;
      } else {
        const maxOrder = categories.reduce((m, c) => Math.max(m, c.sort_order), 0);
        const { error } = await supabase
          .from("categories")
          .insert({ ...payload, sort_order: maxOrder + 1 });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Category saved");
      setDraft(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Category deleted");
      setPendingDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPage
      title="Categories"
      description="Group your products so customers can filter them on the website."
      actions={
        <Button onClick={() => setDraft({ name: "", description: "" })}>
          <Plus className="size-4" /> Add category
        </Button>
      }
    >
      {isLoading ? (
        <div className="surface-card h-32 animate-pulse" />
      ) : categories.length === 0 ? (
        <AdminEmpty
          title="No categories yet"
          body="Categories are optional, but they let customers filter your products."
        />
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="surface-card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {products.filter((p) => p.category_id === c.id).length} product(s)
                  {c.description ? ` · ${c.description}` : ""}
                </p>
              </div>
              <Button
                size="icon"
                variant="outline"
                aria-label="Edit"
                onClick={() => setDraft({ id: c.id, name: c.name, description: c.description ?? "" })}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                aria-label="Delete"
                onClick={() => setPendingDelete(c)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={draft !== null} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.id ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="c-name">Name</Label>
                <Input
                  id="c-name"
                  value={draft.name}
                  maxLength={80}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="c-desc">Description (optional)</Label>
                <Textarea
                  id="c-desc"
                  rows={3}
                  maxLength={300}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
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
              {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save
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
            Products in this category are kept — they simply lose their category.
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
