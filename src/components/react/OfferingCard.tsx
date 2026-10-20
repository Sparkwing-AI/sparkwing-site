import type { ReactNode } from "react";
import { Card } from "./Card";
import { Link } from "./Link";
import { PriceTag } from "./PriceTag";
import { ProductEmblem } from "./ProductEmblem";
import type { ProductKey } from "@/lib/pricing";

export type OfferingCardProps = {
  id?: string;
  title: string;
  productKey: ProductKey;
  body: ReactNode;
  href?: string;
  linkLabel?: string;
  featured?: boolean;
  children?: ReactNode;
  inlinePriceKeys?: ProductKey[];
};

export function OfferingCard({
  id,
  title,
  productKey,
  body,
  href,
  linkLabel,
  featured,
  children,
}: OfferingCardProps) {
  return (
    <Card id={id} featured={featured}>
      <div className="card__header">
        <ProductEmblem />
        <h3 className="card__title">{title}</h3>
      </div>
      <PriceTag productKey={productKey} />
      <p className="card__body">{body}</p>
      {children}
      {href && linkLabel ? (
        <Link variant="card" href={href}>
          {linkLabel}
        </Link>
      ) : null}
    </Card>
  );
}
