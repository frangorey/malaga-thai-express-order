import { VideoMenuCard, ProductVariant } from "@/components/VideoMenuCard";
import { SupabaseProduct } from "@/types/menu";

export interface FeaturedItem {
  product: SupabaseProduct;
  videoUrl: string;
  posterUrl: string;
  tags?: string[];
  variants?: ProductVariant[];
  displayName?: string;
  /** If set, show a customize button instead of add-to-cart */
  onCustomize?: () => void;
  customizeLabel?: string;
}

interface TikTokStyleMenuProps {
  items: FeaturedItem[];
  onAddToCart: (product: SupabaseProduct) => void;
}

export const TikTokStyleMenu = ({ items, onAddToCart }: TikTokStyleMenuProps) => {
  if (!items.length) return null;

  return (
    <div className="w-full max-w-lg mx-auto h-[85dvh] snap-y snap-mandatory overflow-y-auto scrollbar-hide">
      {items.map((item) => (
        <VideoMenuCard
          key={item.product.id}
          product={item.product}
          videoUrl={item.videoUrl}
          posterUrl={item.posterUrl}
          tags={item.tags}
          onAddToCart={onAddToCart}
          variants={item.variants}
          displayName={item.displayName}
          onCustomize={item.onCustomize}
          customizeLabel={item.customizeLabel}
        />
      ))}
    </div>
  );
};
