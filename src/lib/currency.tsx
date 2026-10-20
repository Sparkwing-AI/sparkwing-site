import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CurrencyCode } from "./pricing";

const STORAGE_KEY = "sparkwing-currency";

function detectDefaultCurrency(): CurrencyCode {
  if (typeof navigator === "undefined") {
    return "AUD";
  }
  const langs =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en-AU"];
  const langMatch = langs.some((l) => {
    const lower = (l || "").toLowerCase();
    return (
      lower === "fil" ||
      lower.startsWith("fil-") ||
      lower === "en-ph" ||
      lower.startsWith("en-ph")
    );
  });
  if (langMatch) {
    return "PHP";
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Manila") {
      return "PHP";
    }
  } catch {
    /* ignore */
  }
  return "AUD";
}

function readStoredCurrency(): CurrencyCode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "PHP" || stored === "AUD") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return null;
}

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("AUD");

  useEffect(() => {
    const initial = readStoredCurrency() || detectDefaultCurrency();
    setCurrencyState(initial);
    document.documentElement.setAttribute("data-currency", initial);
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
    document.documentElement.setAttribute("data-currency", code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
    }),
    [currency, setCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
