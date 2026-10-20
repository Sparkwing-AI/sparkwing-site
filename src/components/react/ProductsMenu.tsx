import { useEffect, useRef, useState } from "react";
import { PRODUCT_NAV } from "@/lib/offerings-content";
import { ProductEmblem } from "./ProductEmblem";
import type { ProductPreviewKey } from "@/lib/offerings-content";

const previewById: Record<string, ProductPreviewKey> = {
  studio: "studio",
  hive: "hive",
  "spark-check": "spark-check",
  sparkkeeping: "sparkkeeping",
  academy: "academy",
};

export function ProductsMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="products-menu" ref={wrapRef}>
      <button
        type="button"
        className="products-menu__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="products-mega-panel"
        onClick={() => setOpen((v) => !v)}
      >
        Products
        <span className="products-menu__chevron" aria-hidden="true" />
      </button>
      <div
        id="products-mega-panel"
        className={["products-mega", open ? "products-mega--open" : ""].filter(Boolean).join(" ")}
        hidden={!open}
      >
        <p className="products-mega__eyebrow">Sparkwing lineup</p>
        <ul className="products-mega__list">
          {PRODUCT_NAV.map((item) => (
            <li key={item.id}>
              <a className="products-mega__link" href={item.href} onClick={() => setOpen(false)}>
                <ProductEmblem productId={previewById[item.id]} />
                <span className="products-mega__text">
                  <span className="products-mega__name">{item.name}</span>
                  <span className="products-mega__blurb">{item.blurb}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
