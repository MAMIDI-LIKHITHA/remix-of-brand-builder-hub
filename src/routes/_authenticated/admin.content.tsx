import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { settingsQuery, type SiteSettings } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: AdminContent,
});

type Form = {
  business_name: string;
  tagline: string;
  logo_url: string | null;
  hero_heading: string;
  hero_subheading: string;
  hero_image: string | null;
  hero_primary_cta: string;
  hero_secondary_cta: string;
  about_heading: string;
  about_body: string;
  about_image: string | null;
  strengths: string[];
  cta_heading: string;
  cta_body: string;
  footer_text: string;
};

function toForm(s: SiteSettings): Form {
  return {
    business_name: s.business_name ?? "",
    tagline: s.tagline ?? "",
    logo_url: s.logo_url,
    hero_heading: s.hero_heading ?? "",
    hero_subheading: s.hero_subheading ?? "",
    hero_image: s.hero_image,
    hero_primary_cta: s.hero_primary_cta ?? "",
    hero_secondary_cta: s.hero_secondary_cta ?? "",
    about_heading: s.about_heading ?? "",
    about_body: s.about_body ?? "",
    about_image: s.about_image,
    strengths: Array.isArray(s.strengths) ? (s.strengths as unknown[]).map(String) : [],
    cta_heading: s.cta_heading ?? "",
    cta_body: s.cta_body ?? "",
    footer_text: s.footer_text ?? "",
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card space-y-5 p-6">
      <h2 className="text-lg font-medium">{title}</h2>
      {children}
    </section>
  );
}

function AdminContent() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery(settingsQuery);
  const [form, setForm] = useState<Form | null>(null);
  const [newStrength, setNewStrength] = useState("");

  useEffect(() => {
    if (settings && !form) setForm(toForm(settings));
  }, [settings, form]);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      const clean = (v: string) => (v.trim() === "" ? null : v.trim());
      const { error } = await supabase
        .from("site_settings")
        .update({
          business_name: f.business_name.trim() || "My business",
          tagline: clean(f.tagline),
          logo_url: f.logo_url,
          hero_heading: clean(f.hero_heading),
          hero_subheading: clean(f.hero_subheading),
          hero_image: f.hero_image,
          hero_primary_cta: clean(f.hero_primary_cta),
          hero_secondary_cta: clean(f.hero_secondary_cta),
          about_heading: clean(f.about_heading),
          about_body: clean(f.about_body),
          about_image: f.about_image,
          strengths: f.strengths,
          cta_heading: clean(f.cta_heading),
          cta_body: clean(f.cta_body),
          footer_text: clean(f.footer_text),
        })
        .eq("id", "main");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Website content updated");
      void queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !form) {
    return (
      <AdminPage title="Website content" description="Loading…">
        <div className="surface-card h-64 animate-pulse" />
      </AdminPage>
    );
  }

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm({ ...form, [key]: value });

  return (
    <AdminPage
      title="Website content"
      description="Everything the visitor reads on your website — edit it here, no coding needed."
      actions={
        <Button disabled={save.isPending} onClick={() => save.mutate(form)}>
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{" "}
          Save changes
        </Button>
      }
    >
      <Section title="Business identity">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business name</Label>
            <Input
              id="business_name"
              value={form.business_name}
              maxLength={80}
              onChange={(e) => set("business_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={form.tagline}
              maxLength={160}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </div>
        </div>
        <ImageUploader
          label="Logo"
          value={form.logo_url}
          onChange={(v) => set("logo_url", (v as string | null) ?? null)}
        />
      </Section>

      <Section title="Hero (top of the home page)">
        <div className="space-y-2">
          <Label htmlFor="hero_heading">Headline</Label>
          <Input
            id="hero_heading"
            value={form.hero_heading}
            maxLength={140}
            onChange={(e) => set("hero_heading", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hero_subheading">Short description</Label>
          <Textarea
            id="hero_subheading"
            rows={3}
            maxLength={400}
            value={form.hero_subheading}
            onChange={(e) => set("hero_subheading", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="hero_primary_cta">Main button text</Label>
            <Input
              id="hero_primary_cta"
              value={form.hero_primary_cta}
              maxLength={40}
              onChange={(e) => set("hero_primary_cta", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hero_secondary_cta">Second button text</Label>
            <Input
              id="hero_secondary_cta"
              value={form.hero_secondary_cta}
              maxLength={40}
              onChange={(e) => set("hero_secondary_cta", e.target.value)}
            />
          </div>
        </div>
        <ImageUploader
          label="Hero image"
          value={form.hero_image}
          onChange={(v) => set("hero_image", (v as string | null) ?? null)}
        />
      </Section>

      <Section title="About">
        <div className="space-y-2">
          <Label htmlFor="about_heading">Heading</Label>
          <Input
            id="about_heading"
            value={form.about_heading}
            maxLength={140}
            onChange={(e) => set("about_heading", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="about_body">Text</Label>
          <Textarea
            id="about_body"
            rows={7}
            maxLength={4000}
            value={form.about_body}
            onChange={(e) => set("about_body", e.target.value)}
          />
        </div>
        <ImageUploader
          label="About image"
          value={form.about_image}
          onChange={(v) => set("about_image", (v as string | null) ?? null)}
        />
      </Section>

      <Section title="Why choose us">
        <p className="text-sm text-muted-foreground">
          Short points shown as a checklist on the home and about pages.
        </p>
        {form.strengths.length ? (
          <ul className="space-y-2">
            {form.strengths.map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <Input
                  value={item}
                  maxLength={120}
                  onChange={(e) => {
                    const next = [...form.strengths];
                    next[i] = e.target.value;
                    set("strengths", next);
                  }}
                />
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Remove"
                  onClick={() => set("strengths", form.strengths.filter((_, j) => j !== i))}
                >
                  <X className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex gap-2">
          <Input
            placeholder="Add a point"
            value={newStrength}
            maxLength={120}
            onChange={(e) => setNewStrength(e.target.value)}
          />
          <Button
            variant="outline"
            onClick={() => {
              if (!newStrength.trim()) return;
              set("strengths", [...form.strengths, newStrength.trim()]);
              setNewStrength("");
            }}
          >
            <Plus className="size-4" /> Add
          </Button>
        </div>
      </Section>

      <Section title="Call to action & footer">
        <div className="space-y-2">
          <Label htmlFor="cta_heading">Call-to-action heading</Label>
          <Input
            id="cta_heading"
            value={form.cta_heading}
            maxLength={140}
            onChange={(e) => set("cta_heading", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cta_body">Call-to-action text</Label>
          <Textarea
            id="cta_body"
            rows={3}
            maxLength={600}
            value={form.cta_body}
            onChange={(e) => set("cta_body", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="footer_text">Footer text</Label>
          <Input
            id="footer_text"
            value={form.footer_text}
            maxLength={200}
            onChange={(e) => set("footer_text", e.target.value)}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <Button disabled={save.isPending} onClick={() => save.mutate(form)}>
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{" "}
          Save changes
        </Button>
      </div>
    </AdminPage>
  );
}
