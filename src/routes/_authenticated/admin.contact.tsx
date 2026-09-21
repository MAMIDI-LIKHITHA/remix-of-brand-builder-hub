import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AdminPage } from "@/components/admin/AdminShell";
import { settingsQuery, type SiteSettings } from "@/lib/queries";
import { whatsappLink, enquiryMessage } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/contact")({
  component: AdminContact,
});

type Form = {
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  business_hours: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  snapchat_url: string;
};

function toForm(s: SiteSettings): Form {
  return {
    whatsapp_number: s.whatsapp_number ?? "",
    phone: s.phone ?? "",
    email: s.email ?? "",
    address: s.address ?? "",
    business_hours: s.business_hours ?? "",
    instagram_url: s.instagram_url ?? "",
    facebook_url: s.facebook_url ?? "",
    tiktok_url: s.tiktok_url ?? "",
    snapchat_url: s.snapchat_url ?? "",
  };
}

function AdminContact() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery(settingsQuery);
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (settings && !form) setForm(toForm(settings));
  }, [settings, form]);

  const save = useMutation({
    mutationFn: async (f: Form) => {
      const clean = (v: string) => (v.trim() === "" ? null : v.trim());
      const { error } = await supabase
        .from("site_settings")
        .update({
          whatsapp_number: clean(f.whatsapp_number),
          phone: clean(f.phone),
          email: clean(f.email),
          address: clean(f.address),
          business_hours: clean(f.business_hours),
          instagram_url: clean(f.instagram_url),
          facebook_url: clean(f.facebook_url),
          tiktok_url: clean(f.tiktok_url),
          snapchat_url: clean(f.snapchat_url),
        })
        .eq("id", "main");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contact details updated");
      void queryClient.invalidateQueries({ queryKey: ["site_settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !form) {
    return (
      <AdminPage title="Contact & social" description="Loading…">
        <div className="surface-card h-64 animate-pulse" />
      </AdminPage>
    );
  }

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm({ ...form, [key]: value });
  const testLink = form.whatsapp_number
    ? whatsappLink(form.whatsapp_number, enquiryMessage("your product"))
    : null;

  return (
    <AdminPage
      title="Contact & social"
      description="These details power the contact page, the footer and every WhatsApp button."
      actions={
        <Button disabled={save.isPending} onClick={() => save.mutate(form)}>
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{" "}
          Save changes
        </Button>
      }
    >
      <section className="surface-card space-y-5 p-6">
        <h2 className="text-lg font-medium">Contact details</h2>
        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp number (with country code, e.g. +974…)</Label>
          <Input
            id="whatsapp_number"
            value={form.whatsapp_number}
            maxLength={32}
            onChange={(e) => set("whatsapp_number", e.target.value)}
          />
          {testLink ? (
            <a
              href={testLink}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline"
            >
              Test this WhatsApp link
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              Add a number to switch on the WhatsApp buttons across the website.
            </p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              maxLength={32}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              maxLength={160}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address / location</Label>
          <Textarea
            id="address"
            rows={2}
            maxLength={300}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business_hours">Business hours</Label>
          <Textarea
            id="business_hours"
            rows={3}
            maxLength={300}
            value={form.business_hours}
            onChange={(e) => set("business_hours", e.target.value)}
          />
        </div>
      </section>

      <section className="surface-card space-y-5 p-6">
        <h2 className="text-lg font-medium">Social links</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["instagram_url", "Instagram URL"],
              ["facebook_url", "Facebook URL"],
              ["tiktok_url", "TikTok URL"],
              ["snapchat_url", "Snapchat URL"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                value={form[key]}
                maxLength={300}
                placeholder="https://"
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button disabled={save.isPending} onClick={() => save.mutate(form)}>
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{" "}
          Save changes
        </Button>
      </div>
    </AdminPage>
  );
}
