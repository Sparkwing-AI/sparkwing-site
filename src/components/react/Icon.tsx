import type { LucideIcon } from "lucide-react";
import {
  Globe,
  Mail,
  Phone,
  type LucideProps,
} from "lucide-react";

const ICON_MAP = {
  phone: Phone,
  mail: Mail,
  globe: Globe,
} as const;

export type IconName = keyof typeof ICON_MAP;

export type IconProps = {
  name: IconName;
  size?: "sm" | "md" | "lg";
  muted?: boolean;
  label?: string;
  className?: string;
};

export function Icon({ name, size = "md", muted, label, className }: IconProps) {
  const Lucide: LucideIcon = ICON_MAP[name];
  const sizeClass = size === "sm" ? "icon--sm" : size === "lg" ? "icon--lg" : "";
  const cls = ["icon", sizeClass, muted ? "icon--muted" : "", className]
    .filter(Boolean)
    .join(" ");

  const lucideProps: LucideProps = {
    className: cls,
    strokeWidth: 2,
    "aria-hidden": label ? undefined : true,
    "aria-label": label,
    role: label ? "img" : undefined,
  };

  return <Lucide {...lucideProps} />;
}
