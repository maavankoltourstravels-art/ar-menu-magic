import { del, get, set } from "idb-keyval";

/**
 * Binary asset layer (product images + GLB models).
 * Demo implementation uses IndexedDB and returns an `idb:<uuid>` reference.
 * Swapping this file for Supabase Storage (upload -> public URL) is enough to
 * move the whole app to a real backend: the rest of the code only ever stores
 * and resolves opaque reference strings.
 */
const PREFIX = "idb:";

export function isManagedRef(ref?: string | null): boolean {
  return !!ref && ref.startsWith(PREFIX);
}

export async function uploadAsset(file: File | Blob): Promise<string> {
  const ref = `${PREFIX}${crypto.randomUUID()}`;
  await set(ref, file);
  return ref;
}

const urlCache = new Map<string, string>();

export async function resolveAssetUrl(ref?: string | null): Promise<string | null> {
  if (!ref) return null;
  if (!isManagedRef(ref)) return ref;
  const cached = urlCache.get(ref);
  if (cached) return cached;
  const blob = await get<Blob>(ref);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  urlCache.set(ref, url);
  return url;
}

export async function deleteAsset(ref?: string | null): Promise<void> {
  if (!isManagedRef(ref)) return;
  const cached = urlCache.get(ref!);
  if (cached) URL.revokeObjectURL(cached);
  urlCache.delete(ref!);
  await del(ref!);
}

export async function assetToDataUrl(ref?: string | null): Promise<string | null> {
  const url = await resolveAssetUrl(ref);
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  const blob = await (await fetch(url)).blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}