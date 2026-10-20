import { SPARKWING_PRICING } from "../../pricing-config.js";

export type CurrencyCode = "PHP" | "AUD";

export type ProductKey = keyof typeof SPARKWING_PRICING.products;

export type PriceResult = {
  text: string;
  kind: "free" | "included" | "amount";
};

export { SPARKWING_PRICING };

export function formatMoney(amount: number, currency: CurrencyCode): string {
  if (currency === "PHP") {
    return (
      "PHP " +
      new Intl.NumberFormat("en-PH", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(amount)
    );
  }
  return (
    "A$" +
    new Intl.NumberFormat("en-AU", {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount)
  );
}

export function priceForProduct(
  productKey: ProductKey,
  currency: CurrencyCode
): PriceResult | null {
  const product = SPARKWING_PRICING.products[productKey];
  if (!SPARKWING_PRICING.showPrices) {
    return null;
  }
  if (product.free) {
    return { text: "Free", kind: "free" };
  }
  if (product.includedWithBuild) {
    return { text: "Included with every build", kind: "included" };
  }
  const amount = currency === "PHP" ? product.php : product.aud;
  if (amount == null) {
    return null;
  }
  let text = formatMoney(amount, currency);
  if (product.from) {
    text = `From ${text}`;
  }
  if (product.monthly) {
    text += " a month";
  }
  return { text, kind: "amount" };
}

export function shouldShowTaxNote(): boolean {
  return SPARKWING_PRICING.showPrices;
}
