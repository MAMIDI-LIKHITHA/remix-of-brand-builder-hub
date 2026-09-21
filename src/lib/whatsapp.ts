export function normalizeNumber(raw?: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  return digits.length >= 7 ? digits : null;
}

export function whatsappLink(number: string | null | undefined, message?: string): string | null {
  const n = normalizeNumber(number);
  if (!n) return null;
  const base = `https://wa.me/${n}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function enquiryMessage(itemName: string): string {
  return `Hello, I am interested in ${itemName}. Could you please provide more information?`;
}
