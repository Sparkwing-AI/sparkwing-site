import { useEffect, useRef } from "react";
import type { OfferingTileContent } from "@/lib/offerings-content";
import { OfferingTile } from "./OfferingTile";

export type BentoGridProps = {
  items: OfferingTileContent[];
  labelledBy?: string;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BentoGrid({ items, labelledBy }: BentoGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      return;
    }
    const grid = gridRef.current;
    if (!grid) {
      return;
    }

    const tiles = Array.from(grid.querySelectorAll<HTMLElement>("[data-parallax-tile]"));

    const onScroll = () => {
      const vh = window.innerHeight;
      tiles.forEach((tile) => {
        const rect = tile.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - vh / 2) / vh;
        const shift = Math.max(-6, Math.min(6, offset * 8));
        tile.style.setProperty("--bento-parallax", `${shift}px`);
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <div
      ref={gridRef}
      className="bento-grid"
      role="list"
      aria-labelledby={labelledBy}
    >
      {items.map((item, index) => (
        <OfferingTile key={item.id} {...item} revealDelay={index * 70} />
      ))}
    </div>
  );
}
