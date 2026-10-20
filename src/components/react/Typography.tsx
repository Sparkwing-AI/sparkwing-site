import type { HTMLAttributes, ReactNode } from "react";

type TypoVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body-lg"
  | "body"
  | "small"
  | "caption";

const variantClass: Record<TypoVariant, string> = {
  display: "type-display",
  h1: "type-h1",
  h2: "type-h2",
  h3: "type-h3",
  h4: "type-h4",
  "body-lg": "type-body-lg",
  body: "type-body",
  small: "type-small",
  caption: "type-caption",
};

const headingDefaultTag: Record<
  "display" | "h1" | "h2" | "h3" | "h4",
  "h1" | "h2" | "h3" | "h4" | "p"
> = {
  display: "p",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
};

export type HeadingProps = HTMLAttributes<HTMLElement> & {
  as?: "h1" | "h2" | "h3" | "h4" | "p";
  variant?: "display" | "h1" | "h2" | "h3" | "h4";
  children: ReactNode;
};

export function Heading({ as, variant = "h2", className, children, ...rest }: HeadingProps) {
  const Tag = as || headingDefaultTag[variant];
  const cls = [variantClass[variant], className].filter(Boolean).join(" ");
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}

export type TextProps = HTMLAttributes<HTMLElement> & {
  variant?: "body-lg" | "body" | "small" | "caption";
  as?: "p" | "span" | "div";
  children: ReactNode;
};

export function Text({
  variant = "body",
  as = "p",
  className,
  children,
  ...rest
}: TextProps) {
  const cls = [variantClass[variant], className].filter(Boolean).join(" ");
  const Tag = as;
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
