(function () {
  "use strict";

  const STORAGE_KEY = "sparkwing-currency";
  const CURRENCY_PHP = "PHP";
  const CURRENCY_AUD = "AUD";

  function detectDefaultCurrency() {
    const langs = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || "en-AU"];
    const langMatch = langs.some(function (l) {
      const lower = (l || "").toLowerCase();
      return lower === "fil" || lower.startsWith("fil-") || lower === "en-ph" || lower.startsWith("en-ph");
    });
    if (langMatch) {
      return CURRENCY_PHP;
    }
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === "Asia/Manila") {
        return CURRENCY_PHP;
      }
    } catch (_e) {
      /* ignore */
    }
    return CURRENCY_AUD;
  }

  function getStoredCurrency() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === CURRENCY_PHP || stored === CURRENCY_AUD) {
        return stored;
      }
    } catch (_e) {
      /* ignore */
    }
    return null;
  }

  function setStoredCurrency(code) {
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (_e) {
      /* ignore */
    }
  }

  function formatMoney(amount, currency) {
    if (currency === CURRENCY_PHP) {
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

  function priceForProduct(product, currency) {
    if (!SPARKWING_PRICING.showPrices) {
      return null;
    }
    if (product.free) {
      return { text: "Free", kind: "free" };
    }
    if (product.includedWithBuild) {
      return { text: "Included with every build", kind: "included" };
    }
    const amount = currency === CURRENCY_PHP ? product.php : product.aud;
    if (amount == null || amount === "") {
      return null;
    }
    let text = formatMoney(amount, currency);
    if (product.from) {
      text = "From " + text;
    }
    if (product.monthly) {
      text += " a month";
    }
    return { text: text, kind: "amount" };
  }

  function applyCurrency(currency) {
    document.documentElement.setAttribute("data-currency", currency);

    const toggle = document.querySelector(".currency-toggle");
    if (toggle) {
      toggle.querySelectorAll("[data-currency-btn]").forEach(function (btn) {
        const isActive = btn.getAttribute("data-currency-btn") === currency;
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-price-key]").forEach(function (el) {
      const key = el.getAttribute("data-price-key");
      const product = SPARKWING_PRICING.products[key];
      if (!product) {
        el.hidden = true;
        return;
      }
      const priced = priceForProduct(product, currency);
      if (!priced) {
        el.hidden = true;
        el.textContent = "";
        return;
      }
      el.hidden = false;
      el.textContent = priced.text;
    });
  }

  function initCurrencyToggle() {
    const toggle = document.querySelector(".currency-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function (event) {
      const btn = event.target.closest("[data-currency-btn]");
      if (!btn) {
        return;
      }
      const code = btn.getAttribute("data-currency-btn");
      if (code !== CURRENCY_PHP && code !== CURRENCY_AUD) {
        return;
      }
      setStoredCurrency(code);
      applyCurrency(code);
    });
  }

  function initTaxNote() {
    const taxNote = document.getElementById("price-tax-note");
    if (taxNote && !SPARKWING_PRICING.showPrices) {
      taxNote.hidden = true;
    }
  }

  const currency = getStoredCurrency() || detectDefaultCurrency();
  applyCurrency(currency);
  initCurrencyToggle();
  initTaxNote();
})();
