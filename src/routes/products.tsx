import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { ProductCard, EmptyState } from "@/components/site/Cards";
import { settingsQuery, productsQuery, categoriesQuery } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [
    { title: "Products — Aaron Sau" },
    { name: "description", content: "Browse Aaron Sau's product catalogue and enquire on WhatsApp." },
    { property: "og:title", content: "Products — Aaron Sau" },
  ]}),
  component: ProductsPage,
});
type Sort = "featured" | "newest" | "price_asc" | "price_desc" | "name";
function ProductsPage() {
  const { data: s } = useQuery(settingsQuery);
  const { data: products = [], isLoading } = useQuery(productsQuery);
  const { data: categories = [] } = useQuery(categoriesQuery);
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("all"); const [sort, setSort] = useState<Sort>("featured"); const [featuredOnly, setFeaturedOnly] = useState(false);
  const visible = useMemo(() => {
    const q=search.trim().toLowerCase(); let list=products.filter(p=>p.is_published);
    if(q) list=list.filter(p=>[p.name,p.short_description,p.full_description].filter(Boolean).some(t=>String(t).toLowerCase().includes(q)));
    if(category!=="all") list=list.filter(p=>p.category_id===category); if(featuredOnly) list=list.filter(p=>p.is_featured);
    const sorted=[...list]; switch(sort){case"newest":sorted.sort((a,b)=>a.created_at<b.created_at?1:-1);break;case"price_asc":sorted.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));break;case"price_desc":sorted.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));break;case"name":sorted.sort((a,b)=>a.name.localeCompare(b.name));break;default:sorted.sort((a,b)=>Number(b.is_featured)-Number(a.is_featured)||a.sort_order-b.sort_order);} return sorted;
  },[products,search,category,sort,featuredOnly]);
  const published=products.filter(p=>p.is_published); const showTools=published.length>3;
  return <SiteLayout><PageHeader eyebrow="Products" title="Aaron Sau — Products" description="Everything currently available. Tap any item for full details or enquire on WhatsApp."/><section className="section-shell py-12 md:py-16">
    {showTools?<div className="mb-10 flex flex-col gap-3 md:flex-row md:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" className="pl-9"/></div>{categories.length?<Select value={category} onValueChange={setCategory}><SelectTrigger className="md:w-52"><SelectValue placeholder="Category"/></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map(c=><SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>:null}<Select value={sort} onValueChange={v=>setSort(v as Sort)}><SelectTrigger className="md:w-48"><SelectValue placeholder="Sort"/></SelectTrigger><SelectContent><SelectItem value="featured">Featured first</SelectItem><SelectItem value="newest">Newest</SelectItem><SelectItem value="price_asc">Price: low to high</SelectItem><SelectItem value="price_desc">Price: high to low</SelectItem><SelectItem value="name">Name A–Z</SelectItem></SelectContent></Select><Button variant={featuredOnly?"default":"outline"} onClick={()=>setFeaturedOnly(v=>!v)}>Featured</Button></div>:null}
    {isLoading?<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0,1,2].map(i=><div key={i} className="surface-card h-80 animate-pulse"/>)}</div>:visible.length?<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map(p=><ProductCard key={p.id} product={p} whatsappNumber={s?.whatsapp_number}/>)}</div>:<EmptyState title="No products to show yet" body="Products added from the admin panel will appear here automatically."/>}
  </section></SiteLayout>;
}