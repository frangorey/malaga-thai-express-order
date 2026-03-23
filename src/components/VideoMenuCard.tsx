import { useRef, useState, useEffect, useCallback } from "react";
import { Plus, Leaf, Flame, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";

// --- Native IntersectionObserver hook (60% threshold for TikTok-style) ---
function useInViewport<T extends HTMLElement>(threshold = 0.6): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null!);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible];
}

interface VideoMenuCardProps {
  product: SupabaseProduct;
  videoUrl: string;
  posterUrl: string;
  tags?: string[];
  onAddToCart: (product: SupabaseProduct) => void;
}

export const VideoMenuCard = ({
  product,
  videoUrl,
  posterUrl,
  tags = [],
  onAddToCart,
}: VideoMenuCardProps) => {
  const { t } = useLanguage();
  const [cardRef, isVisible] = useInViewport<HTMLDivElement>(0.6);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState("");

  // Lazy-load src only once when first visible
  useEffect(() => {
    if (isVisible && !videoSrc) {
      setVideoSrc(videoUrl);
    }
  }, [isVisible, videoSrc, videoUrl]);

  // Play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    if (isVisible) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isVisible, videoSrc]);

  const handleAddToCart = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToCart(product);
    },
    [onAddToCart, product]
  );

  return (
    <div
      ref={cardRef}
      className="relative h-[85dvh] w-full snap-center flex-shrink-0 overflow-hidden rounded-none sm:rounded-xl"
    >
      {/* Video background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
        poster={posterUrl}
        src={videoSrc || undefined}
        preload="none"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      {/* Floating UI */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pb-8 flex items-end justify-between z-10">
        {/* Left: name, price, tags */}
        <div className="flex-1 min-w-0 mr-4 space-y-3">
          <h3 className="text-white font-extrabold text-xl sm:text-2xl leading-tight line-clamp-2 drop-shadow-lg">
            {product.name}
          </h3>

          {/* Price badge */}
          <span className="inline-block bg-primary text-primary-foreground font-bold text-lg px-4 py-1.5 rounded-full shadow-lg">
            {product.price.toFixed(2)}€
          </span>

          {/* Tags / badges */}
          <div className="flex flex-wrap gap-2">
            {product.is_vegetarian && (
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                <Leaf className="w-3 h-3" />
                {t("vegetarian") !== "vegetarian" ? t("vegetarian") : "Vegetariano"}
              </span>
            )}
            {product.is_spicy && (
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                <Flame className="w-3 h-3" />
                {t("spicy") !== "spicy" ? t("spicy") : "Picante"}
              </span>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full"
              >
                <Sparkles className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: add to cart */}
        <button
          onClick={handleAddToCart}
          aria-label={t("add_to_cart")}
          className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-200"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};
