import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { ImageFrame, EmptyState } from "@/components/site/Cards";
import { galleryQuery } from "@/lib/queries";
import { mediaUrl } from "@/lib/media";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [
    { title: "Gallery — Aaron Sau" },
    { name: "description", content: "Photo gallery from Aaron Sau." },
    { property: "og:title", content: "Gallery — Aaron Sau" },
  ]}),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: images = [], isLoading } = useQuery(galleryQuery);
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null ? images[index] : null;
  const step = (dir: number) => { if (index === null || images.length === 0) return; setIndex((index + dir + images.length) % images.length); };
  return (
    <SiteLayout>
      <PageHeader eyebrow="Gallery" title="Gallery" description="Tap any photo to view it larger." />
      <section className="section-shell py-12 md:py-16">
        {isLoading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{[0,1,2,3].map((i)=><div key={i} className="surface-card aspect-square animate-pulse"/>)}</div>
        : images.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{images.map((img,i)=><button key={img.id} type="button" onClick={()=>setIndex(i)} className="surface-card group overflow-hidden text-left"><ImageFrame src={img.image_url} alt={img.title ?? ""} className="aspect-square"/>{img.title?<p className="truncate px-3 py-2.5 text-sm font-medium">{img.title}</p>:null}</button>)}</div>
        : <EmptyState title="No photos yet" body="Images uploaded from the admin panel will appear here." />}
      </section>
      {open ? <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4" role="dialog" aria-modal="true" onClick={()=>setIndex(null)}>
        <button type="button" aria-label="Close" onClick={()=>setIndex(null)} className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-ink-foreground/10 text-ink-foreground hover:bg-ink-foreground/20"><X className="size-5"/></button>
        {images.length>1?<><button type="button" aria-label="Previous" onClick={(e)=>{e.stopPropagation();step(-1)}} className="absolute left-3 inline-flex size-11 items-center justify-center rounded-full bg-ink-foreground/10 text-ink-foreground hover:bg-ink-foreground/20"><ChevronLeft className="size-6"/></button><button type="button" aria-label="Next" onClick={(e)=>{e.stopPropagation();step(1)}} className="absolute right-3 inline-flex size-11 items-center justify-center rounded-full bg-ink-foreground/10 text-ink-foreground hover:bg-ink-foreground/20"><ChevronRight className="size-6"/></button></>:null}
        <figure className="max-h-full max-w-4xl" onClick={(e)=>e.stopPropagation()}><img src={mediaUrl(open.image_url) ?? ""} alt={open.title ?? ""} className="max-h-[75vh] w-auto rounded-xl object-contain"/>{open.title||open.description?<figcaption className="mt-4 text-center text-ink-foreground">{open.title?<p className="font-display text-lg">{open.title}</p>:null}{open.description?<p className="mt-1 text-sm text-ink-foreground/70">{open.description}</p>:null}</figcaption>:null}</figure>
      </div> : null}
    </SiteLayout>
  );
}
