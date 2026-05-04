import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MainCategoriesNav } from "@/components/MainCategoriesNav";
import { TikTokStyleMenu, FeaturedItem } from "@/components/TikTokStyleMenu";
import { Cart, SupabaseCartItem } from "@/components/Cart";
// import { Footer } from "@/components/Footer";
import { RiceCustomizerDrawer, RiceType } from "@/components/RiceCustomizerDrawer";
import { NoodleCustomizerDrawer, NoodleType } from "@/components/NoodleCustomizerDrawer";
import { SupabaseProduct } from "@/types/menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { useDishTemplates } from "@/hooks/useDishTemplates";
import type { DishTemplate } from "@/hooks/useDishTemplate";

const FALLBACK_VIDEO_URL =
  "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/video-hero-web%20(1).mp4";

const CATEGORY_MAP: Record<string, string> = {
  entrantes: "Entrantes",
  arroz: "Arroces",
  tallarines: "Tallarines",
  sopas: "Sopas",
  pokes: "Pokes",
  postres: "Postres",
  ensaladas: "Ensaladas",
  otras: "Otras del Mundo",
  bebidas: "Bebidas",
};

function toSupabaseProduct(p: ReturnType<typeof useProducts>["products"][number]): SupabaseProduct {
  return {
    ...p,
    description: p.description ?? "",
    is_vegetarian: p.is_vegetarian ?? false,
    is_spicy: p.is_spicy ?? false,
    is_available: p.is_available ?? true,
    created_at: p.created_at ?? new Date().toISOString(),
    updated_at: p.updated_at ?? new Date().toISOString(),
  } as SupabaseProduct;
}

const PLACEHOLDER_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23222'/%3E%3C/svg%3E";

const Index = () => {
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<SupabaseCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("arroz");
  const [isViewingFeed, setIsViewingFeed] = useState(false);
  const [riceCustomizer, setRiceCustomizer] = useState<{ open: boolean; type: RiceType }>({ open: false, type: "frito" });
  const [noodleCustomizer, setNoodleCustomizer] = useState<{ open: boolean; type: NoodleType }>({ open: false, type: "Anchos" });
  const [searchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const { data: dishTemplates } = useDishTemplates();

  const templatesBySlug = useMemo(() => {
    const map = new Map<string, DishTemplate>();
    (dishTemplates ?? []).forEach((tpl) => map.set(tpl.slug, tpl));
    return map;
  }, [dishTemplates]);

  const mesaParam = searchParams.get('mesa');
  const tableNumber = mesaParam ? parseInt(mesaParam, 10) : null;
  const validTableNumber = tableNumber && tableNumber >= 1 && tableNumber <= 14 ? tableNumber : null;

  const NOODLE_CARDS: { type: NoodleType; displayNameKey: string; videoUrl: string | null; emoji: string }[] = [
    { type: "Anchos", displayNameKey: "noodles_pad_thai", videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/padthaii-video.mp4", emoji: "🍜" },
    { type: "Finos", displayNameKey: "noodles_finos_card", videoUrl: FALLBACK_VIDEO_URL, emoji: "🥢" },
    { type: "Glass", displayNameKey: "noodles_glass_card", videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/glass-videotiktok.mp4", emoji: "✨" },
    { type: "Udon", displayNameKey: "noodles_udon_card", videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/udon-video.mp4", emoji: "🍲" },
  ];

  const RICE_CARDS: { type: RiceType; subcategoryAnchor: string; displayNameKey: string; emoji: string; videoUrl: string | null }[] = [
    { type: "frito", subcategoryAnchor: "Classic",        displayNameKey: "rice_fried_card", emoji: "🍚", videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/arroz-video.mp4" },
    { type: "curry", subcategoryAnchor: "Curry Amarillo", displayNameKey: "rice_curry_card", emoji: "🍛", videoUrl: null },
  ];

  const VARIANT_GROUPS: Record<string, { displayNameKey: string; ids: number[]; labelKeys: Record<number, string> }> = {
    edamame: { displayNameKey: "variant_edamame", ids: [206, 207], labelKeys: { 206: "variant_edamame", 207: "variant_edamame_spicy" } },
    gyozas: { displayNameKey: "variant_gyozas", ids: [202, 203], labelKeys: { 202: "variant_fried", 203: "variant_grilled" } },
    pinchito_langostino: { displayNameKey: "variant_pinchito_shrimp", ids: [194, 195], labelKeys: { 194: "variant_1_unit", 195: "variant_2_units" } },
    pinchito_pollo: { displayNameKey: "variant_pinchito_chicken", ids: [192, 193], labelKeys: { 192: "variant_1_unit", 193: "variant_2_units" } },
  };

  const SOUP_CARDS: { slug: string; displayNameKey: string; emoji: string }[] = [
    { slug: "sopa_tom_yam", displayNameKey: "soup_tom_yam", emoji: "🍲" },
    { slug: "sopa_miso",    displayNameKey: "soup_miso",    emoji: "🍜" },
  ];

  const videoItems = useMemo(() => {
    const dbCategory = CATEGORY_MAP[activeCategory];
    if (!dbCategory) return [];

    const categoryProducts = products.filter((p) => p.category === dbCategory);

    // ARROCES: 2 cards (Frito, Curry) — patrón análogo a NOODLE_CARDS
    if (dbCategory === "Arroces") {
      return RICE_CARDS.map((rc) => {
        const anchor = categoryProducts.find((p) => p.subcategory === rc.subcategoryAnchor);
        if (!anchor) return null;
        return {
          product: toSupabaseProduct(anchor),
          videoUrl: rc.videoUrl,
          posterUrl: anchor.image_url || PLACEHOLDER_POSTER,
          imageUrl: anchor.image_url,
          tags: [] as string[],
          displayName: `${rc.emoji} ${t(rc.displayNameKey)}`,
          onCustomize: () => setRiceCustomizer({ open: true, type: rc.type }),
          customizeLabel: `${t("customize")} ${rc.emoji}`,
        } as FeaturedItem;
      }).filter(Boolean) as FeaturedItem[];
    }

    // TALLARINES: 4 cards, one per noodle type
    if (dbCategory === "Tallarines") {
      return NOODLE_CARDS.map((nc) => {
        const firstProduct = categoryProducts.find((p) => p.subcategory === nc.type);
        const product = firstProduct ? toSupabaseProduct(firstProduct) : toSupabaseProduct(categoryProducts[0]);
        return {
          product,
          videoUrl: nc.videoUrl,
          posterUrl: firstProduct?.image_url || PLACEHOLDER_POSTER,
          imageUrl: firstProduct?.image_url ?? null,
          tags: [],
          displayName: `${nc.emoji} ${t('tallarines')} ${t(nc.displayNameKey)}`,
          onCustomize: () => setNoodleCustomizer({ open: true, type: nc.type }),
          customizeLabel: `${t('customize')} ${nc.emoji}`,
        } as FeaturedItem;
      }).filter(Boolean);
    }

    // SOPAS: 2 cards with protein variants
    if (dbCategory === "Sopas") {
      const items: FeaturedItem[] = [];
      for (const sc of SOUP_CARDS) {
        const template = templatesBySlug.get(sc.slug);
        if (!template) continue;
        const groupProducts = categoryProducts.filter((p) => p.template_id === template.id);
        if (groupProducts.length === 0) continue;
        const primary = groupProducts[0];
        items.push({
          product: toSupabaseProduct(primary),
          videoUrl: template.video_url ?? primary.video_url ?? null,
          posterUrl: template.image_url || primary.image_url || PLACEHOLDER_POSTER,
          imageUrl: template.image_url ?? primary.image_url,
          tags: [],
          displayName: `${sc.emoji} ${t(sc.displayNameKey)}`,
          variants: groupProducts.map((p) => {
            let proteinKey = "";
            if (p.is_vegetarian === true) proteinKey = "soup_veggie_label";
            else if (p.name.toLowerCase().includes("langostino")) proteinKey = "soup_prawn_label";
            else if (p.name.toLowerCase().includes("pollo")) proteinKey = "soup_chicken_label";
            return {
              product: toSupabaseProduct(p),
              label: proteinKey
                ? `${t(proteinKey)} — ${p.price.toFixed(2)}€`
                : `${p.name} — ${p.price.toFixed(2)}€`,
            };
          }),
        });
      }
      return items;
    }

    // ENTRANTES: grouped variants
    if (dbCategory === "Entrantes") {
      const items: FeaturedItem[] = [];
      const processedIds = new Set<number>();

      for (const group of Object.values(VARIANT_GROUPS)) {
        const groupProducts = categoryProducts.filter((p) => group.ids.includes(p.id));
        if (groupProducts.length === 0) continue;
        groupProducts.forEach((p) => processedIds.add(p.id));
        const primary = groupProducts[0];
        items.push({
          product: toSupabaseProduct(primary),
          videoUrl: primary.video_url ?? null,
          posterUrl: primary.image_url || PLACEHOLDER_POSTER,
          imageUrl: primary.image_url,
          tags: [],
          displayName: t(group.displayNameKey),
          variants: groupProducts.map((p) => ({
            product: toSupabaseProduct(p),
            label: t(group.labelKeys[p.id] || ''),
          })),
        });
      }

      for (const p of categoryProducts) {
        if (processedIds.has(p.id)) continue;
        items.push({
          product: toSupabaseProduct(p),
          videoUrl: p.video_url ?? null,
          posterUrl: p.image_url || PLACEHOLDER_POSTER,
          imageUrl: p.image_url,
          tags: [],
        });
      }
      return items;
    }

    // Default: one card per product
    return categoryProducts.map((p) => ({
      product: toSupabaseProduct(p),
      videoUrl: p.video_url ?? null,
      posterUrl: p.image_url || PLACEHOLDER_POSTER,
      imageUrl: p.image_url,
      tags: [] as string[],
    }));
  }, [products, activeCategory, t, templatesBySlug]);

  const addToCart = (product: SupabaseProduct) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) { removeFromCart(id); return; }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleOrderClick = () => {
    setActiveCategory("arroz");
    setIsViewingFeed(true);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setIsViewingFeed(true);
  };

  const handleGoHome = () => {
    setIsViewingFeed(false);
  };

  return (
    <main className="h-[100dvh] w-full flex flex-col bg-background overflow-hidden">
      {/* Header — always visible */}
      <div className="flex-none z-50">
        <Header
          cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
          onLogoClick={isViewingFeed ? handleGoHome : undefined}
        />

        {validTableNumber && (
          <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
            🍽️ {t('ordering_from_table')} {validTableNumber}
          </div>
        )}
      </div>

      {/* Conditional view: Home vs Immersive Feed */}
      {!isViewingFeed ? (
        /* HOME VIEW */
        <div className="flex-1 overflow-y-auto">
          <Hero onOrderClick={handleOrderClick} />

          <MainCategoriesNav
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      ) : (
        /* IMMERSIVE FEED VIEW */
        <div className="flex-1 min-h-0 w-full bg-black relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <TikTokStyleMenu
              items={videoItems}
              onAddToCart={addToCart}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          )}
        </div>
      )}

      {/* Footer hidden for app-like layout */}

      {isCartOpen && (
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          tableNumber={validTableNumber}
        />
      )}

      <RiceCustomizerDrawer
        open={riceCustomizer.open}
        onClose={() => setRiceCustomizer((prev) => ({ ...prev, open: false }))}
        onAddToCart={addToCart}
        riceType={riceCustomizer.type}
      />

      <NoodleCustomizerDrawer
        open={noodleCustomizer.open}
        onClose={() => setNoodleCustomizer((prev) => ({ ...prev, open: false }))}
        onAddToCart={addToCart}
        noodleType={noodleCustomizer.type}
      />

      {validTableNumber && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-primary/30 py-3 px-4">
          <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
            <span className="neon-text font-bold text-sm sm:text-base">
              🍽️ {t('ordering_from_table') ? `Mesa ${validTableNumber}` : `Mesa ${validTableNumber}`}
            </span>
            <Link to={`/mesa/${validTableNumber}`}>
              <Button variant="neon" size="sm">
                Ver pedidos y cuenta →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
};

export default Index;
