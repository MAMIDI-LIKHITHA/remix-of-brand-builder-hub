import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { uploadMedia } from "@/lib/media.functions";
import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({
  label,
  value,
  onChange,
  multiple = false,
}: {
  label: string;
  /** single: string | null. multiple: string[] */
  value: string | string[] | null;
  onChange: (next: string | string[] | null) => void;
  multiple?: boolean;
}) {
  const upload = useServerFn(uploadMedia);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const list = multiple
    ? Array.isArray(value)
      ? value
      : []
    : value && typeof value === "string"
      ? [value]
      : [];

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const base64 = await fileToBase64(file);
        const res = await upload({
          data: { fileName: file.name, contentType: file.type, data: base64 },
        });
        uploaded.push(res.path);
        if (!multiple) break;
      }
      if (multiple) onChange([...list, ...uploaded]);
      else onChange(uploaded[0] ?? null);
      toast.success(uploaded.length > 1 ? "Images uploaded" : "Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(path: string) {
    if (multiple) onChange(list.filter((p) => p !== path));
    else onChange(null);
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-3">
        {list.map((path) => (
          <div key={path} className="relative size-24 overflow-hidden rounded-lg border border-border">
            <img src={mediaUrl(path) ?? ""} alt="" className="size-full object-cover" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => remove(path)}
              className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          {busy ? "Uploading" : "Upload"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => void handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto px-0 text-xs"
        onClick={() => {
          const url = window.prompt("Paste an image URL");
          if (!url) return;
          if (multiple) onChange([...list, url]);
          else onChange(url);
        }}
      >
        or paste an image link
      </Button>
    </div>
  );
}
