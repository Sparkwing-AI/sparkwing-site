import { useCurrency } from "@/lib/currency";
import type { CurrencyCode } from "@/lib/pricing";

export function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  const onSelect = (code: CurrencyCode) => () => setCurrency(code);

  return (
    <div className="currency-toggle" role="group" aria-label="Display prices in">
      <button
        type="button"
        className="currency-toggle__btn"
        data-currency-btn="PHP"
        aria-pressed={currency === "PHP"}
        onClick={onSelect("PHP")}
      >
        PHP
      </button>
      <button
        type="button"
        className="currency-toggle__btn"
        data-currency-btn="AUD"
        aria-pressed={currency === "AUD"}
        onClick={onSelect("AUD")}
      >
        AUD
      </button>
    </div>
  );
}
