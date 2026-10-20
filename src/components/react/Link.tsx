import type { AnchorHTMLAttributes, ReactNode } from "react";

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "text" | "card";
};

export function Link({ variant = "text", className, children, ...rest }: LinkProps) {
  const base = variant === "card" ? "card__link" : "text-link";
  return (
    <a className={[base, className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </a>
  );
}
