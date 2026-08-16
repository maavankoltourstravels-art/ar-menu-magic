import { Box, CheckCircle2, ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductViewer } from "@/components/ProductViewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAssetUrl } from "@/hooks/use-asset-url";
import { uploadAsset } from "@/lib/asset-storage";
import { slugify } from "@/lib/products-store";
import { CATEGORIES, type Product, type ProductInput } from "@/lib/types";

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ProductForm({
  initial,
  submitLabel = "Save product",
  onSubmit,
}: {
  initial?: Product;
  submitLabel?: string;
  onSubmit: (input: ProductInput) => void | Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [category, setCategory] = useState<string>(initial?.category ?? CATEGORIES[0]);
  const [ingredients, setIngredients] = useState(initial?.ingredients ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(initial?.published ?? true);
  const [arUrl, setArUrl] = useState(initial?.arUrl ?? "");

  const [imageRef, setImageRef] = useState<string | null>(initial?.imageUrl ?? null);
  const [modelRef, setModelRef] = useState<string | null>(initial?.model3dUrl ?? null);
  const [modelMeta, setModelMeta] = useState<{ name: string; size: number } | null>(
    initial?.model3dUrl
      ? { name: initial.model3dUrl.split("/").pop() ?? "model.glb", size: 0 }
      : null,
  );
  const [uploading, setUploading] = useState<"image" | "model" | null>(null);
  const [saving, setSaving] = useState(false);

  const imagePreview = useAssetUrl(imageRef);

  async function handleImage(file: File) {
    if (!IMAGE_TYPES.includes(file.type)) {
      toast.error("Use a JPG, JPEG, PNG or WEBP image.");
      return;
    }
    setUploading("image");
    setImageRef(await uploadAsset(file));
    setUploading(null);
    toast.success("Image uploaded");
  }

  async function handleModel(file: File) {
    if (!file.name.toLowerCase().endsWith(".glb")) {
      toast.error("Only .glb 3D models are supported.");
      return;
    }
    setUploading("model");
    const ref = await uploadAsset(file);
    setModelRef(ref);
    setModelMeta({ name: file.name, size: file.size });
    setUploading(null);
    toast.success("3D model uploaded");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !price) {
      toast.error("Name, description and price are required.");
      return;
    }
    setSaving(true);
    await onSubmit({
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      price: Number(price),
      category,
      ingredients: ingredients.trim(),
      imageUrl: imageRef,
      model3dUrl: modelRef,
      arUrl: arUrl.trim() || null,
      published,
      featured,
    });
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <section className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
        <h2 className="font-display text-xl font-semibold">Basic information</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              value={name}
              placeholder="Margherita Pizza"
              onChange={(e) => {
                setName(e.target.value);
                if (!slugEdited) setSlug(slugify(e.target.value));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Product slug</Label>
            <Input
              id="slug"
              value={slug}
              placeholder="margherita-pizza"
              onChange={(e) => {
                setSlugEdited(true);
                setSlug(slugify(e.target.value));
              }}
            />
            <p className="text-xs text-muted-foreground">Public AR page: /menu/{slug || "…"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={description}
            placeholder="Classic Italian-style pizza with fresh mozzarella…"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1"
              value={price}
              placeholder="299"
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ingredients">Ingredients</Label>
          <Textarea
            id="ingredients"
            rows={2}
            value={ingredients}
            placeholder="San Marzano tomato, fior di latte, basil…"
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="arUrl">External AR experience link (optional)</Label>
          <Input
            id="arUrl"
            value={arUrl}
            placeholder="https://webxr.run/…"
            onChange={(e) => setArUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            When set, the QR code and menu card point straight to this WebAR experience.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-xl border border-border p-4">
            <span>
              <span className="block text-sm font-medium">Featured</span>
              <span className="text-xs text-muted-foreground">Show on the home page</span>
            </span>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-border p-4">
            <span>
              <span className="block text-sm font-medium">Published</span>
              <span className="text-xs text-muted-foreground">Creates AR page + QR code</span>
            </span>
            <Switch checked={published} onCheckedChange={setPublished} />
          </label>
        </div>

        <Button type="submit" size="lg" className="w-full rounded-full" disabled={saving}>
          {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
          {submitLabel}
        </Button>
      </section>

      <section className="space-y-6">
        <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold">Product image</h2>
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-dashed border-border bg-secondary/50">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="size-full object-cover" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageIcon className="size-6" />
                <span className="text-xs">JPG · JPEG · PNG · WEBP</span>
              </div>
            )}
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary">
            {uploading === "image" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            Upload image
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
            />
          </label>
        </div>

        <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-semibold">3D model (.glb)</h2>
          {modelRef ? (
            <>
              <ProductViewer
                modelRef={modelRef}
                alt={name || "3D product preview"}
                showArButton={false}
                className="aspect-square"
              />
              <div className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3 text-xs">
                <CheckCircle2 className="mt-0.5 size-4 text-olive" />
                <span>
                  <span className="block font-medium">{modelMeta?.name ?? "model.glb"}</span>
                  <span className="text-muted-foreground">
                    {modelMeta?.size ? formatBytes(modelMeta.size) : "linked file"} · upload
                    complete
                  </span>
                </span>
              </div>
            </>
          ) : (
            <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-secondary/50 text-muted-foreground">
              <Box className="size-6" />
              <span className="text-xs">No model uploaded</span>
            </div>
          )}
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary">
            {uploading === "model" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}
            {modelRef ? "Replace .glb model" : "Upload .glb model"}
            <input
              type="file"
              accept=".glb,model/gltf-binary"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleModel(e.target.files[0])}
            />
          </label>
        </div>
      </section>
    </form>
  );
}