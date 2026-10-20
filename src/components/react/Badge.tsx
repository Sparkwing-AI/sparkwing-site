import type { ReactNode } from "react";

export type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "free";
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const cls = ["badge", variant === "free" ? "badge--free" : "", className]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{children}</span>;
}
