export type ProductEmblemProps = {
  title?: string;
  className?: string;
};

export function ProductEmblem({
  title = "Product emblem coming soon",
  className,
}: ProductEmblemProps) {
  return (
    <div
      className={["offering-card__emblem offering-card__emblem--placeholder", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
      title={title}
    />
  );
}
