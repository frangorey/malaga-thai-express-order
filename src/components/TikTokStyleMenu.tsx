import { VideoMenuCard, ProductVariant } from "@/components/VideoMenuCard";
import { MainCategoriesNav } from "@/components/MainCategoriesNav";
import { SupabaseProduct } from "@/types/menu";

export interface FeaturedItem {
  product: SupabaseProduct;
  videoUrl: string;
  posterUrl: string;
  tags?: string[];
  variants?: ProductVariant[];
  displayName?: string;
  onCustomize?: () => void;
  customizeLabel?: string;
}

interface TikTokStyleMenuProps {
  items: FeaturedItem[];
  onAddToCart: (product: SupabaseProduct) => void;
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const TikTokStyleMenu = ({ items, onAddToCart, activeCategory, onCategoryChange }: TikTokStyleMenuProps) => {
  if (!items.length) return null;

  return (
    <div className="w-full h-full relative">
      {/* Floating categories overlay */}
      {activeCategory && onCategoryChange && (
        <MainCategoriesNav
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          floating
        />
      )}

      <div className="w-full h-full snap-y snap-mandatory overflow-y-auto scrollbar-hide">
        {items.map((item) => (
          <div key={item.product.id} className="h-full w-full snap-start relative flex-shrink-0">
            <VideoMenuCard
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
          </div>
        ))}
      </div>
    </div>
  );
};
