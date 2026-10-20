import type { ProductKey } from "./pricing";

export type ProductPreviewKey = "studio" | "hive" | "spark-check" | "sparkkeeping" | "academy";

export type OfferingSurface = "card" | "depth" | "fern" | "panel";

export type OfferingTileContent = {
  id: string;
  size: "hero" | "wide" | "tall" | "default";
  surface: OfferingSurface;
  productName: string;
  tagline: string;
  outcome: string;
  capabilities: string[];
  preview: ProductPreviewKey;
  productKey: ProductKey;
  secondaryProductKey?: ProductKey;
  secondaryLabel?: string;
  ctaLabel: string;
  ctaHref: string;
  navBlurb: string;
};

export const OFFERINGS: OfferingTileContent[] = [
  {
    id: "studio",
    size: "hero",
    surface: "fern",
    productName: "Sparkwing Studio",
    tagline: "Custom AI built on Hive, ready for your team",
    outcome:
      "Starter, Standard and Custom tiers. Receipts and Guardrails on every workflow.",
    capabilities: ["Workflow design", "Hive templates", "Care plans"],
    preview: "studio",
    productKey: "studio",
    secondaryProductKey: "carePlans",
    secondaryLabel: "Care from",
    ctaLabel: "Talk about Studio",
    ctaHref: "mailto:info@sparkwing.com.au?subject=Sparkwing%20Studio%20enquiry",
    navBlurb: "Custom builds from one workflow to firm-wide AI",
  },
  {
    id: "hive",
    size: "tall",
    surface: "panel",
    productName: "Sparkwing Hive",
    tagline: "The context layer behind every answer",
    outcome: "Sparks, Receipts and Guardrails in one place.",
    capabilities: ["Source library", "Receipts", "Policy guardrails"],
    preview: "hive",
    productKey: "hive",
    ctaLabel: "Explore Hive",
    ctaHref: "mailto:info@sparkwing.com.au?subject=Sparkwing%20Hive%20enquiry",
    navBlurb: "Your knowledge library with sources shown every time",
  },
  {
    id: "spark-check",
    size: "default",
    surface: "card",
    productName: "Spark Check",
    tagline: "Free AI readiness in ten questions",
    outcome: "A short summary and clear next steps, no pressure.",
    capabilities: ["10 questions", "Expert review", "Free"],
    preview: "spark-check",
    productKey: "sparkCheck",
    ctaLabel: "Book Spark Check",
    ctaHref: "mailto:info@sparkwing.com.au?subject=Book%20a%20Spark%20Check",
    navBlurb: "See where you stand before you invest",
  },
  {
    id: "sparkkeeping",
    size: "wide",
    surface: "depth",
    productName: "Sparkkeeping",
    tagline: "Accounting that leaves paper behind",
    outcome: "Receipts, invoices and records in one calm workspace.",
    capabilities: ["Capture", "Organise", "Export ready"],
    preview: "sparkkeeping",
    productKey: "sparkkeeping",
    ctaLabel: "Ask about Sparkkeeping",
    ctaHref: "mailto:info@sparkwing.com.au?subject=Sparkkeeping%20enquiry",
    navBlurb: "Books off paper for growing practices",
  },
  {
    id: "academy",
    size: "default",
    surface: "panel",
    productName: "Sparkwing Academy",
    tagline: "AI learning where your team already works",
    outcome: "Workshops and courses matched to your stack.",
    capabilities: ["Live workshops", "Team playbooks", "Hands-on"],
    preview: "academy",
    productKey: "academy",
    ctaLabel: "Plan a workshop",
    ctaHref: "mailto:info@sparkwing.com.au?subject=Sparkwing%20Academy%20enquiry",
    navBlurb: "Practical training for safe, useful AI",
  },
];

export const PRODUCT_NAV = OFFERINGS.map((o) => ({
  id: o.id,
  name: o.productName,
  blurb: o.navBlurb,
  href: `#${o.id}`,
}));
