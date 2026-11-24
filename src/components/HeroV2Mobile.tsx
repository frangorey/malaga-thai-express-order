import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { ConveyorDish, DishTier } from "@/components/ui/sushi-conveyor-menu";

/**
 * HeroV2Mobile - version kaiten recortada para moviles (<768px).
 * 3 platos visibles (izq pequeno, centro grande, der pequeno), autoplay,
 * dots inferiores y swipe horizontal. Comparte tipos con SushiConveyorMenu.
 *
 * Decidido con Fran 2026-11-24 (Opcion C del comparativo).
 */

interface HeroV2MobileProps {
  items: ConveyorDish[];
  eyebrow?: string;
  heading?: string;
  caption?: string;
  labels: {
    add: string;
    close: string;
    previous: string;
    next: string;
    pause?: string;
  };
  onAdd?: (item: ConveyorDish) => void;
  interval?: number;
  autoplay?: boolean;
}

const TIER_HSL: Record<DishTier, string> = {
  1: "hsl(var(--chart-1))",
  2: "hsl(var(--chart-2))",
  3: "hsl(var(--chart-3))",
  4: "hsl(var(--chart-4))",
  5: "hsl(var(--chart-5))",
};

export function HeroV2Mobile({
  items,
  eyebrow,
  heading,
  caption,
  labels,
  onAdd,
  interval = 3500,
  autoplay = true,
}: HeroV2MobileProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const resumeTimer = useRef<number | null>(null);

  const next = useCallback(
    () => setActiveIndex((i) => (i + 1) % items.length),
    [items.length]
  );
  const prev = useCallback(
    () => setActiveIndex((i) => (i - 1 + items.length) % items.length),
    [items.length]
  );

  // Autoplay (respeta prefers-reduced-motion)
  useEffect(() => {
    if (!autoplay || paused || items.length < 2) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;
    const id = window.setInterval(next, interval);
    return () => window.clearInterval(id);
  }, [autoplay, paused, interval, next, items.length]);

  // Swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx > 40) prev();
    else if (dx < -40) next();
    touchStartX.current = null;
    resumeTimer.current = window.setTimeout(() => setPaused(false), 4000);
  };

  if (items.length === 0) return null;

  const active = items[activeIndex];
  const leftItem = items[(activeIndex - 1 + items.length) % items.length];
  const rightItem = items[(activeIndex + 1) % items.length];

  const activeTierColor = TIER_HSL[(active.tier ?? 1) as DishTier];
  const leftTierColor = TIER_HSL[(leftItem.tier ?? 1) as DishTier];
  const rightTierColor = TIER_HSL[(rightItem.tier ?? 1) as DishTier];

  return (
    <section
      className="w-full bg-background py-6"
      aria-label={heading}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="px-4 text-center">
        {eyebrow && (
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
        )}
        {heading && (
          <h2 className="mt-2 text-2xl font-medium tracking-tight text-foreground">
            {heading}
          </h2>
        )}
      </div>

      {/* Cinta: 3 platos */}
      <div className="relative mt-5 h-[210px] flex items-center justify-center overflow-hidden">
        {/* Rieles decorativos */}
        <div className="pointer-events-none absolute top-1/2 left-0 right-0 -translate-y-[85px] h-px bg-border/60" />
        <div className="pointer-events-none absolute top-1/2 left-0 right-0 translate-y-[85px] h-px bg-border/60" />

        {/* Plato izquierdo */}
        <button
          type="button"
          onClick={() => {
            setActiveIndex((i) => (i - 1 + items.length) % items.length);
            setPaused(true);
            if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
            resumeTimer.current = window.setTimeout(() => setPaused(false), 4000);
          }}
          aria-label={labels.previous}
          className="absolute left-3 w-[88px] h-[88px] rounded-full border-2 bg-black/30 flex items-center justify-center opacity-55 transition-all duration-300"
          style={{ borderColor: leftTierColor }}
        >
          <img
            src={leftItem.image}
            alt=""
            className="w-[90%] h-[90%] object-contain"
            loading="eager"
            draggable={false}
          />
        </button>

        {/* Plato central (grande) */}
        <button
          type="button"
          onClick={() => onAdd?.(active)}
          aria-label={`${active.name} — ${labels.add}`}
          className="relative w-[180px] h-[180px] rounded-full border-[3px] bg-black/50 flex items-center justify-center z-10 shadow-2xl transition-all duration-300"
          style={{
            borderColor: activeTierColor,
            boxShadow: `0 12px 40px -8px ${activeTierColor}`,
          }}
        >
          <img
            src={active.image}
            alt={active.name}
            className="w-[92%] h-[92%] object-contain"
            loading="eager"
            draggable={false}
          />
        </button>

        {/* Plato derecho */}
        <button
          type="button"
          onClick={() => {
            setActiveIndex((i) => (i + 1) % items.length);
            setPaused(true);
            if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
            resumeTimer.current = window.setTimeout(() => setPaused(false), 4000);
          }}
          aria-label={labels.next}
          className="absolute right-3 w-[88px] h-[88px] rounded-full border-2 bg-black/30 flex items-center justify-center opacity-55 transition-all duration-300"
          style={{ borderColor: rightTierColor }}
        >
          <img
            src={rightItem.image}
            alt=""
            className="w-[90%] h-[90%] object-contain"
            loading="eager"
            draggable={false}
          />
        </button>
      </div>

      {/* Nombre + caption */}
      <div className="mt-4 text-center px-4 min-h-[3.5rem]">
        <p
          className="text-lg font-semibold tracking-tight"
          style={{ color: activeTierColor }}
          aria-live="polite"
        >
          {active.name}
        </p>
        {caption && (
          <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
        )}
      </div>

      {/* Controles */}
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={prev}
          aria-label={labels.previous}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent/20 active:scale-95 transition"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={labels.pause ?? "Pause"}
          aria-pressed={paused}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent/20 active:scale-95 transition"
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
        <button
          type="button"
          onClick={next}
          aria-label={labels.next}
          className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-accent/20 active:scale-95 transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Dots */}
      <div
        className="mt-3 flex items-center justify-center gap-1.5 px-4"
        role="tablist"
        aria-label={heading}
      >
        {items.map((it, i) => (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={it.name}
            onClick={() => {
              setActiveIndex(i);
              setPaused(true);
              if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
              resumeTimer.current = window.setTimeout(() => setPaused(false), 4000);
            }}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-6 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroV2Mobile;
