import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MainCategoriesNav } from "@/components/MainCategoriesNav";
import { TikTokStyleMenu, FeaturedItem } from "@/components/TikTokStyleMenu";
import { Cart, SupabaseCartItem } from "@/components/Cart";
import { Footer } from "@/components/Footer";
import { RiceCustomizerDrawer } from "@/components/RiceCustomizerDrawer";
import { NoodleCustomizerDrawer, NoodleType } from "@/components/NoodleCustomizerDrawer";
import { SupabaseProduct } from "@/types/menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";

const FALLBACK_VIDEO_URL =
  "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/video-hero-web%20(1).mp4";

const RICE_VIDEO_URL =
  "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/arroz-video.mp4";

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

const VARIANT_GROUPS: Record<string, { displayName: string; ids: number[]; labels: Record<number, string> }> = {
  edamame: {
    displayName: "Edamame",
    ids: [206, 207],
    labels: { 206: "Edamame", 207: "Edamame Picante (+0,20€)" },
  },
  gyozas: {
    displayName: "Gyozas con gambas (6 uds)",
    ids: [202, 203],
    labels: { 202: "Fritas", 203: "A la Plancha" },
  },
  pinchito_langostino: {
    displayName: "Pinchito de langostino",
    ids: [194, 195],
    labels: { 194: "1 unidad", 195: "2 unidades" },
  },
  pinchito_pollo: {
    displayName: "Pinchito de pollo",
    ids: [192, 193],
    labels: { 192: "1 unidad", 193: "2 unidades" },
  },
};

/** Sopas: group by subcategory, show protein variants */
const SOUP_GROUPS: Record<string, { displayName: string; ids: number[]; labels: Record<number, string> }> = {
  tom_yam: {
    displayName: "🍲 Sopa Tom Yam",
    ids: [130, 131, 132],
    labels: { 130: "Pollo — 8,90€", 131: "Langostino — 9,40€", 132: "Veggie — 8,90€" },
  },
  miso: {
    displayName: "🍜 Sopa Miso",
    ids: [127, 128, 129],
    labels: { 127: "Pollo — 8,90€", 128: "Langostino — 9,40€", 129: "Veggie — 8,90€" },
  },
};

/** Noodle types with their video URLs and display info */
const NOODLE_CARDS: { type: NoodleType; displayName: string; videoUrl: string; emoji: string }[] = [
  {
    type: "Anchos",
    displayName: "Pad Thai (Anchos)",
    videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/padthaii-video.mp4",
    emoji: "🍜",
  },
  {
    type: "Finos",
    displayName: "Noodles (Finos)",
    videoUrl: FALLBACK_VIDEO_URL,
    emoji: "🥢",
  },
  {
    type: "Glass",
    displayName: "Glass",
    videoUrl: FALLBACK_VIDEO_URL,
    emoji: "✨",
  },
  {
    type: "Udon",
    displayName: "Udon",
    videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/udon-video.mp4",
    emoji: "🍲",
  },
];

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
  const [isRiceCustomizerOpen, setIsRiceCustomizerOpen] = useState(false);
  const [noodleCustomizer, setNoodleCustomizer] = useState<{ open: boolean; type: NoodleType }>({ open: false, type: "Anchos" });
  const [searchParams] = useSearchParams();
  const { products, loading } = useProducts();

  const mesaParam = searchParams.get('mesa');
  const tableNumber = mesaParam ? parseInt(mesaParam, 10) : null;
  const validTableNumber = tableNumber && tableNumber >= 1 && tableNumber <= 14 ? tableNumber : null;

  const videoItems = useMemo(() => {
    const dbCategory = CATEGORY_MAP[activeCategory];
    if (!dbCategory) return [];

    const categoryProducts = products.filter((p) => p.category === dbCategory);

    // ARROCES: single customizable card
    if (dbCategory === "Arroces") {
      const firstRice = categoryProducts[0];
      if (!firstRice) return [];
      return [{
        product: toSupabaseProduct(firstRice),
        videoUrl: RICE_VIDEO_URL,
        posterUrl: firstRice.image_url || PLACEHOLDER_POSTER,
        tags: [],
        displayName: "🍚 Arroz Frito Thai",
        onCustomize: () => setIsRiceCustomizerOpen(true),
        customizeLabel: "Personalizar 🍚",
      }] as FeaturedItem[];
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
          tags: [],
          displayName: `${nc.emoji} Tallarines ${nc.displayName}`,
          onCustomize: () => setNoodleCustomizer({ open: true, type: nc.type }),
          customizeLabel: `Personalizar ${nc.emoji}`,
        } as FeaturedItem;
      }).filter(Boolean);
    }

    // SOPAS: 2 cards with protein variants
    if (dbCategory === "Sopas") {
      const items: FeaturedItem[] = [];
      for (const group of Object.values(SOUP_GROUPS)) {
        const groupProducts = categoryProducts.filter((p) => group.ids.includes(p.id));
        if (groupProducts.length === 0) continue;
        const primary = groupProducts[0];
        items.push({
          product: toSupabaseProduct(primary),
          videoUrl: primary.video_url || FALLBACK_VIDEO_URL,
          posterUrl: primary.image_url || PLACEHOLDER_POSTER,
          tags: [],
          displayName: group.displayName,
          variants: groupProducts.map((p) => ({
            product: toSupabaseProduct(p),
            label: group.labels[p.id] || p.name,
          })),
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
          videoUrl: primary.video_url || FALLBACK_VIDEO_URL,
          posterUrl: primary.image_url || PLACEHOLDER_POSTER,
          tags: [],
          displayName: group.displayName,
          variants: groupProducts.map((p) => ({
            product: toSupabaseProduct(p),
            label: group.labels[p.id] || p.name,
          })),
        });
      }

      for (const p of categoryProducts) {
        if (processedIds.has(p.id)) continue;
        items.push({
          product: toSupabaseProduct(p),
          videoUrl: p.video_url || FALLBACK_VIDEO_URL,
          posterUrl: p.image_url || PLACEHOLDER_POSTER,
          tags: [],
        });
      }
      return items;
    }

    // Default: one card per product
    return categoryProducts.map((p) => ({
      product: toSupabaseProduct(p),
      videoUrl: p.video_url || FALLBACK_VIDEO_URL,
      posterUrl: p.image_url || PLACEHOLDER_POSTER,
      tags: [] as string[],
    }));
  }, [products, activeCategory]);

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

  const handleOrderClick = () => setActiveCategory("arroz");

  return (
    <main className="h-[100dvh] w-full bg-background flex flex-col overflow-hidden">
      <div className="flex-none">
        <Header
          cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
        />
      </div>

      {validTableNumber && (
        <div className="flex-none bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
          🍽️ Estás pidiendo desde la Mesa {validTableNumber}
        </div>
      )}

      <div className="flex-none">
        <Hero onOrderClick={handleOrderClick} compact />
      </div>

      <div className="flex-none">
        <MainCategoriesNav
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      <div className="flex-1 min-h-0 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : (
          <TikTokStyleMenu
            items={videoItems}
            onAddToCart={addToCart}
          />
        )}
      </div>

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
        open={isRiceCustomizerOpen}
        onClose={() => setIsRiceCustomizerOpen(false)}
        onAddToCart={addToCart}
      />

      <NoodleCustomizerDrawer
        open={noodleCustomizer.open}
        onClose={() => setNoodleCustomizer((prev) => ({ ...prev, open: false }))}
        onAddToCart={addToCart}
        noodleType={noodleCustomizer.type}
      />
    </main>
  );
};

export default Index;
