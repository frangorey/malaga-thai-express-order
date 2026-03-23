import { useRef, useState, useEffect, useCallback } from "react";
import { Plus, Leaf, Flame } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// --- Native IntersectionObserver hook ---
function useInViewport<T extends HTMLElement>(threshold = 0.3): [React.RefObject<T>, boolean] {
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

// --- Props ---
interface VideoMenuItemCardProps {
  name: string;
  price: number;
  videoUrl: string;
  posterUrl: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  onAddToCart: () => void;
}

export const VideoMenuItemCard = ({
  name,
  price,
  videoUrl,
  posterUrl,
  isVegetarian,
  isSpicy,
  onAddToCart,
}: VideoMenuItemCardProps) => {
  const { t } = useLanguage();
  const [cardRef, isVisible] = useInViewport<HTMLDivElement>(0.3);
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
      onAddToCart();
    },
    [onAddToCart]
  );

  return (
    <div
      ref={cardRef}
      className="relative rounded-lg overflow-hidden aspect-[4/5] group hover:neon-border transition-all duration-300 bg-card/50 backdrop-blur-sm"
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

      {/* Badges */}
      <div className="absolute top-3 right-3 flex gap-2 z-10">
        {isVegetarian && (
          <div className="bg-green-500/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <Leaf className="w-4 h-4 text-white" />
          </div>
        )}
        {isSpicy && (
          <div className="bg-red-500/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <Flame className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between z-10">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-white font-bold text-base sm:text-lg leading-tight line-clamp-2">
            {name}
          </h3>
          <span className="neon-text font-bold text-lg sm:text-xl mt-1 block">
            {price.toFixed(2)}€
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          aria-label={t("add_to_cart")}
          className="flex-shrink-0 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg neon-glow hover:scale-110 transition-transform duration-200"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
