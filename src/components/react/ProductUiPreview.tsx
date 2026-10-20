import type { ProductPreviewKey } from "@/lib/offerings-content";

export type ProductUiPreviewProps = {
  variant: ProductPreviewKey;
  className?: string;
};

export function ProductUiPreview({ variant, className }: ProductUiPreviewProps) {
  const cls = ["product-preview", `product-preview--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} aria-hidden="true">
      {variant === "studio" && <StudioPreview />}
      {variant === "hive" && <HivePreview />}
      {variant === "spark-check" && <SparkCheckPreview />}
      {variant === "sparkkeeping" && <SparkkeepingPreview />}
      {variant === "academy" && <AcademyPreview />}
    </div>
  );
}

function StudioPreview() {
  return (
    <div className="product-preview__frame">
      <div className="product-preview__chrome">
        <span className="product-preview__dot" />
        <span className="product-preview__dot" />
        <span className="product-preview__dot" />
      </div>
      <div className="product-preview__studio-grid">
        <div className="product-preview__panel">
          <span className="product-preview__label">Workflow</span>
          <div className="product-preview__bar" />
          <div className="product-preview__bar product-preview__bar--short" />
        </div>
        <div className="product-preview__panel product-preview__panel--accent">
          <span className="product-preview__label">Receipts</span>
          <div className="product-preview__chip-row">
            <span className="product-preview__mini-chip" />
            <span className="product-preview__mini-chip" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HivePreview() {
  return (
    <div className="product-preview__frame product-preview__frame--chat">
      <div className="product-preview__bubble product-preview__bubble--user">
        Summarise last month for this client.
      </div>
      <div className="product-preview__bubble product-preview__bubble--ai">
        Here is a draft with sources attached.
        <span className="product-preview__receipt">Receipt · Drive</span>
      </div>
    </div>
  );
}

function SparkCheckPreview() {
  return (
    <div className="product-preview__frame product-preview__frame--check">
      <p className="product-preview__check-title">Question 3 of 10</p>
      <p className="product-preview__check-q">Where do your files live today?</p>
      <div className="product-preview__progress">
        <span className="product-preview__progress-fill" />
      </div>
    </div>
  );
}

function SparkkeepingPreview() {
  return (
    <div className="product-preview__frame product-preview__frame--ledger">
      <div className="product-preview__receipt-card">
        <span className="product-preview__receipt-thumb" />
        <div>
          <div className="product-preview__bar product-preview__bar--short" />
          <div className="product-preview__bar product-preview__bar--tiny" />
        </div>
      </div>
      <div className="product-preview__receipt-card">
        <span className="product-preview__receipt-thumb" />
        <div>
          <div className="product-preview__bar product-preview__bar--short" />
          <div className="product-preview__bar product-preview__bar--tiny" />
        </div>
      </div>
    </div>
  );
}

function AcademyPreview() {
  return (
    <div className="product-preview__frame product-preview__frame--course">
      <p className="product-preview__course-tag">Workshop</p>
      <p className="product-preview__course-title">Using AI with your own data</p>
      <div className="product-preview__avatar-row">
        <span className="product-preview__avatar" />
        <span className="product-preview__avatar" />
        <span className="product-preview__avatar" />
      </div>
    </div>
  );
}
