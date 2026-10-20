import type { CSSProperties } from "react";
import type { OfferingTileContent } from "@/lib/offerings-content";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { Button } from "./Button";
import { CapabilityPills } from "./CapabilityPills";
import { PriceTag } from "./PriceTag";
import { ProductEmblem } from "./ProductEmblem";
import { ProductUiPreview } from "./ProductUiPreview";

export type OfferingTileProps = OfferingTileContent & {
  revealDelay?: number;
};

export function OfferingTile({
  id,
  size,
  surface,
  productName,
  tagline,
  outcome,
  capabilities,
  preview,
  productKey,
  secondaryProductKey,
  secondaryLabel,
  ctaLabel,
  ctaHref,
  revealDelay = 0,
}: OfferingTileProps) {
  const { ref, revealed } = useScrollReveal<HTMLElement>();

  const cls = [
    "bento-tile",
    `bento-tile--${size}`,
    `bento-tile--${surface}`,
    revealed ? "bento-tile--revealed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const style: CSSProperties | undefined =
    revealDelay > 0 ? { "--bento-reveal-delay": `${revealDelay}ms` } as CSSProperties : undefined;

  const pillTone = surface === "panel" ? "panel" : "on-teal";
  const ctaVariant = surface === "panel" ? "primary" : "secondary";

  return (
    <article ref={ref} id={id} className={cls} style={style} data-parallax-tile role="listitem">
      <div className="bento-tile__sparks" aria-hidden="true">
        <span className="bento-tile__spark bento-tile__spark--1" />
        <span className="bento-tile__spark bento-tile__spark--2" />
      </div>
      <div className="bento-tile__inner">
        <div className="bento-tile__copy">
          <header className="bento-tile__header">
            <ProductEmblem productId={preview} />
            <div className="bento-tile__titles">
              <p className="bento-tile__product">{productName}</p>
              <h3 className="bento-tile__tagline">{tagline}</h3>
            </div>
          </header>
          <p className="bento-tile__outcome">{outcome}</p>
          <CapabilityPills items={capabilities} tone={pillTone} />
          <div className="bento-tile__pricing">
            <PriceTag productKey={productKey} />
            {secondaryProductKey && secondaryLabel ? (
              <div className="bento-tile__secondary-price">
                <span className="bento-tile__secondary-label">{secondaryLabel}</span>
                <PriceTag productKey={secondaryProductKey} inline />
              </div>
            ) : null}
          </div>
          <div className="bento-tile__cta">
            <Button
              variant={ctaVariant}
              href={ctaHref}
              size={ size === "hero" ? "default" : "compact"}
              className={surface !== "panel" ? "btn--on-teal" : undefined}
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
        <ProductUiPreview variant={preview} className="bento-tile__preview" />
      </div>
    </article>
  );
}
