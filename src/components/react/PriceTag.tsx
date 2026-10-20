import { priceForProduct, type ProductKey } from "@/lib/pricing";
import { useCurrency } from "@/lib/currency";

export type PriceTagProps = {
  productKey: ProductKey;
  inline?: boolean;
  className?: string;
};

export function PriceTag({ productKey, inline, className }: PriceTagProps) {
  const { currency } = useCurrency();
  const priced = priceForProduct(productKey, currency);

  if (!priced) {
    return null;
  }

  const cls = ["price-tag", inline ? "price-tag--inline" : "", className]
    .filter(Boolean)
    .join(" ");

  return <p className={cls}>{priced.text}</p>;
}
