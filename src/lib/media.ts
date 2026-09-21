/** Resolve a stored media reference to a URL usable in <img src>. */
export function mediaUrl(ref?: string | null): string | null {
  if (!ref) return null;
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith("data:")) return ref;
  return `/api/public/media/${ref.replace(/^\/+/, "")}`;
}
