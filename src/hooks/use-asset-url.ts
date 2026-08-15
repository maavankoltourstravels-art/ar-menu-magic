import { useEffect, useState } from "react";

import { resolveAssetUrl } from "@/lib/asset-storage";

/** Resolves a stored asset reference (idb:… or plain URL) to a usable src. */
export function useAssetUrl(ref?: string | null): string | null {
  const [url, setUrl] = useState<string | null>(
    ref && !ref.startsWith("idb:") ? ref : null,
  );

  useEffect(() => {
    let active = true;
    resolveAssetUrl(ref).then((resolved) => {
      if (active) setUrl(resolved);
    });
    return () => {
      active = false;
    };
  }, [ref]);

  return url;
}