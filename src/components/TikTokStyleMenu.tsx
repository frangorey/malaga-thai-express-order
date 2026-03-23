import { VideoMenuCard } from "@/components/VideoMenuCard";
import { SupabaseProduct } from "@/types/menu";

interface FeaturedItem {
  product: SupabaseProduct;
  videoUrl: string;
  posterUrl: string;
  tags?: string[];
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
        />
      ))}
    </div>
  );
};
