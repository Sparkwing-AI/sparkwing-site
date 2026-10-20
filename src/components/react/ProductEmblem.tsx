import { useState } from "react";
import type { ProductPreviewKey } from "@/lib/offerings-content";

const EMBLEM_FILE: Partial<Record<ProductPreviewKey, string>> = {
  studio: "emblem-studio",
  sparkkeeping: "emblem-books",
  academy: "emblem-academy",
  "spark-check": "emblem-check",
  hive: "emblem-sparkplug",
};

export type ProductEmblemProps = {
  productId?: ProductPreviewKey | string;
  title?: string;
  className?: string;
};

function SparkFallback({ className, title }: { className: string; title: string }) {
  return (
    <div className={className} aria-hidden="true" title={title}>
      <svg className="product-emblem__spark" viewBox="0 0 16 16" focusable="false">
        <path d="M8 1 9.2 5.8 14 7 9.2 8.2 8 13 6.8 8.2 2 7 6.8 5.8Z" />
      </svg>
    </div>
  );
}

export function ProductEmblem({
  productId,
  title = "Product emblem",
  className,
}: ProductEmblemProps) {
  const [missing, setMissing] = useState(false);
  const key = productId as ProductPreviewKey | undefined;
  const file = key ? EMBLEM_FILE[key] : undefined;
  const cls = ["product-emblem", className].filter(Boolean).join(" ");

  if (!file || missing) {
    return <SparkFallback className={cls} title={title} />;
  }

  return (
    <div className={cls} title={title}>
      <img
        className="product-emblem__img"
        src={`/assets/emblems/${file}.webp`}
        srcSet={`/assets/emblems/${file}.webp 1x, /assets/emblems/${file}@2x.webp 2x`}
        alt=""
        width={40}
        height={40}
        decoding="async"
        onError={() => setMissing(true)}
      />
    </div>
  );
}
