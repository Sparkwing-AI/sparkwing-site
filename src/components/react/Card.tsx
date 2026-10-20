import type { ReactNode } from "react";

export type CardProps = {
  children: ReactNode;
  featured?: boolean;
  id?: string;
  className?: string;
};

export function Card({ children, featured, id, className }: CardProps) {
  const cls = ["card", featured ? "card--featured" : "", className].filter(Boolean).join(" ");
  return (
    <li className={cls} id={id}>
      {children}
    </li>
  );
}
