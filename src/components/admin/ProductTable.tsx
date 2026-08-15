import { Link } from "@tanstack/react-router";
import {
  Box,
  Copy,
  Ellipsis,
  ExternalLink,
  FileText,
  ImageIcon,
  Pencil,
  QrCode,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssetUrl } from "@/hooks/use-asset-url";
import { formatPrice } from "@/lib/menu-card";
import { deleteProduct, duplicateProduct } from "@/lib/products-store";
import { downloadQrPng, productUrl } from "@/lib/qr";
import type { Product } from "@/lib/types";

function Thumb({ product }: { product: Product }) {
  const url = useAssetUrl(product.imageUrl);
  return (
    <div className="size-12 overflow-hidden rounded-lg border border-border bg-secondary">
      {url ? (
        <img src={url} alt={product.name} className="size-full object-cover" loading="lazy" />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ImageIcon className="size-4" />
        </div>
      )}
    </div>
  );
}

export function ProductTable({
  products,
  onPreviewCard,
}: {
  products: Product[];
  onPreviewCard: (product: Product) => void;
}) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">No products yet.</p>
        <Button asChild className="mt-4 rounded-full">
          <Link to="/admin/products/new">Add your first product</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>3D model</TableHead>
            <TableHead>QR</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Thumb product={product} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">/menu/{product.slug}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap font-medium">
                {formatPrice(product.price)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
              <TableCell>
                <Badge
                  variant={product.published ? "default" : "secondary"}
                  className="rounded-full"
                >
                  {product.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell>
                {product.model3dUrl ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-olive">
                    <Box className="size-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Missing</span>
                )}
              </TableCell>
              <TableCell>
                {product.qrCodeUrl ? (
                  <button
                    onClick={() => onPreviewCard(product)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary"
                  >
                    <QrCode className="size-3.5" /> View
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {new Date(product.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Actions">
                      <Ellipsis className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem asChild>
                      <Link to="/menu/$productSlug" params={{ productSlug: product.slug }}>
                        <ExternalLink className="mr-2 size-4" /> View AR page
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/admin/products/$productId/edit" params={{ productId: product.id }}>
                        <Pencil className="mr-2 size-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        duplicateProduct(product.id);
                        toast.success("Product duplicated as draft");
                      }}
                    >
                      <Copy className="mr-2 size-4" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        downloadQrPng(productUrl(product.slug), `${product.slug}-qr.png`)
                      }
                    >
                      <QrCode className="mr-2 size-4" /> Download QR
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPreviewCard(product)}>
                      <FileText className="mr-2 size-4" /> Download menu
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={async () => {
                        await deleteProduct(product.id);
                        toast.success("Product deleted");
                      }}
                    >
                      <Trash2 className="mr-2 size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}