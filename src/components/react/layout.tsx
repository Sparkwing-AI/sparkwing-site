import type { HTMLAttributes, ReactNode } from "react";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={["page", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function Section({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <section className={className} {...rest}>
      {children}
    </section>
  );
}

export function Grid({
  children,
  variant = "offerings",
  className,
}: {
  children: ReactNode;
  variant?: "offerings";
  className?: string;
}) {
  const cls = ["card-grid", variant === "offerings" ? "card-grid--offerings" : "", className]
    .filter(Boolean)
    .join(" ");
  return <ul className={cls}>{children}</ul>;
}
