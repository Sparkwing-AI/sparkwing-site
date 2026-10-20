export type CapabilityPillsProps = {
  items: string[];
  tone?: "default" | "on-teal" | "panel";
};

export function CapabilityPills({ items, tone = "default" }: CapabilityPillsProps) {
  const cls = [
    "capability-pills",
    tone === "on-teal" ? "capability-pills--on-teal" : "",
    tone === "panel" ? "capability-pills--panel" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ul className={cls}>
      {items.map((item) => (
        <li key={item} className="capability-pills__item">{item}</li>
      ))}
    </ul>
  );
}
