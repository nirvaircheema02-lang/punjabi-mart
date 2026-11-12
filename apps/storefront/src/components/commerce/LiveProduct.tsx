"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { PdpPanel } from "@/components/ds/PdpPanel";
import { ProductImage } from "@/components/ds/ProductImage";
import { productImages } from "@/lib/product-images";
import { assetIfPresent } from "@/lib/image-availability";
export function LiveProduct({ slug: supplied }: { slug?: string }) {
  const params = useSearchParams();
  const slug = supplied ?? params.get("slug");
  const { products, sellers, settings, error } = useStore();
  const p = products.find((p) => p.slug === slug);
  if (!p)
    return (
      <div className="pm-empty">
        <h1 className="pm-h3">
          {settings ? "This product is unavailable" : "Loading product…"}
        </h1>
        <p>{error}</p>
        <Link href="/search">Browse products</Link>
      </div>
    );
  const seller = sellers.find((s) => s.id === p.sellerId) ?? null;
  return (
    <>
      <nav className="pm-small">
        <Link href="/">Home</Link> /{" "}
        <Link href={`/c/${p.category}`}>Collection</Link>
      </nav>
      <div className="pm-pdp pm-section">
        <div>
          <div className="pm-pdp__gallery">
            <ProductImage
              asset={
                p.image
                  ? { src: p.image, alt: p.title }
                  : assetIfPresent(productImages[p.id])
              }
              fallbackKind={p.art}
              fallbackSeed={p.id}
              priority
              sizes="(min-width:1024px) 55vw,100vw"
            />
          </div>
          {p.isDemo && (
            <p className="pm-caption">
              Preview catalogue · Illustrative imagery
            </p>
          )}
        </div>
        <PdpPanel
          key={p.id}
          product={p}
          seller={seller}
          attribution={seller?.name ?? "PunjabiMarts"}
        />
      </div>
    </>
  );
}
