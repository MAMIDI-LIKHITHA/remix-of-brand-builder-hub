import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, ArrowUp, ArrowDown, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AdminPage, AdminEmpty } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { galleryQuery, type GalleryImage } from "@/lib/queries";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  component: AdminGallery,
});

function AdminGallery() {
  const queryClient = useQueryClient();
  const { data: images = [], isLoading } = useQuery(galleryQuery);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pendingDelete, setPendingDelete] = useState<GalleryImage | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["gallery_images"] });
  };

  const addImages = useMutation({
    mutationFn: async (paths: string[]) => {
      const maxOrder = images.reduce((m, g) => Math.max(m, g.sort_order), 0);
      const rows = paths.map((p, i) => ({ image_url: p, sort_order: maxOrder + 1 + i }));
      const { error } = await supabase.from("gallery_images").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Photos added to the gallery");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<GalleryImage> }) => {
      const { error } = await supabase.from("gallery_images").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Photo removed");
      setPendingDelete(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ordered = [...images].sort((a, b) => a.sort_order - b.sort_order);

  async function move(index: number, dir: -1 | 1) {
    const a = ordered[index];
    const b = ordered[index + dir];
    if (!a || !b) return;
    await Promise.all([
      update.mutateAsync({ id: a.id, patch: { sort_order: b.sort_order } }),
      update.mutateAsync({ id: b.id, patch: { sort_order: a.sort_order } }),
    ]);
  }

  function openEdit(img: GalleryImage) {
    setEditing(img);
    setTitle(img.title ?? "");
    setDescription(img.description ?? "");
  }

  return (
    <AdminPage
      title="Gallery"
      description="Upload photos, rename them, reorder them or delete them. Changes are live immediately."
    >
      <div className="surface-card p-6">
        <ImageUploader
          label="Upload new photos (you can select several at once)"
          multiple
          value={[]}
          onChange={(v) => {
            const paths = (v as string[]) ?? [];
            if (paths.length) addImages.mutate(paths);
          }}
        />
      </div>

      {isLoading ? (
        <div className="surface-card h-40 animate-pulse" />
      ) : ordered.length === 0 ? (
        <AdminEmpty title="No photos yet" body="Upload your first photos using the box above." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {ordered.map((img, i) => (
            <div key={img.id} className="surface-card overflow-hidden">
              <div className="aspect-4/3 bg-muted">
                {mediaUrl(img.image_url) ? (
                  <img src={mediaUrl(img.image_url)!} alt="" className="size-full object-cover" />
                ) : null}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="truncate font-medium">{img.title || "Untitled photo"}</p>
                  {img.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">{img.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(img)}>
                    Edit info
                  </Button>
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
                    variant="destructive"
                    aria-label="Delete"
                    onClick={() => setPendingDelete(img)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Photo information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={title}
              maxLength={120}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              rows={3}
              maxLength={400}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              disabled={update.isPending}
              onClick={() => {
                if (!editing) return;
                update.mutate(
                  {
                    id: editing.id,
                    patch: { title: title.trim() || null, description: description.trim() || null },
                  },
                  {
                    onSuccess: () => {
                      toast.success("Photo updated");
                      setEditing(null);
                    },
                  },
                );
              }}
            >
              {update.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}{" "}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this photo?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            It will be removed from the website gallery.
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
