import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MainCategoriesNav } from "@/components/MainCategoriesNav";
import { TikTokStyleMenu, FeaturedItem } from "@/components/TikTokStyleMenu";
import { Cart, SupabaseCartItem } from "@/components/Cart";
import { Footer } from "@/components/Footer";
import { SupabaseProduct } from "@/types/menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";

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

/** IDs to group into a single card with variant buttons */
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

// Collect all variant IDs for quick lookup
const ALL_VARIANT_IDS = new Set(
  Object.values(VARIANT_GROUPS).flatMap((g) => g.ids)
);

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
  const [searchParams] = useSearchParams();
  const { products, loading } = useProducts();

  const mesaParam = searchParams.get('mesa');
  const tableNumber = mesaParam ? parseInt(mesaParam, 10) : null;
  const validTableNumber = tableNumber && tableNumber >= 1 && tableNumber <= 14 ? tableNumber : null;

  const videoItems = useMemo(() => {
    const dbCategory = CATEGORY_MAP[activeCategory];
    if (!dbCategory) return [];

    const categoryProducts = products.filter((p) => p.category === dbCategory);

    // For Entrantes, group variant products into single cards
    if (dbCategory === "Entrantes") {
      const items: FeaturedItem[] = [];
      const processedIds = new Set<number>();

      // First, add grouped variant cards
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

      // Then, add remaining non-grouped products
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
    <main className="min-h-screen bg-background">
      <Header
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      {validTableNumber && (
        <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
          🍽️ Estás pidiendo desde la Mesa {validTableNumber}
        </div>
      )}

      <Hero onOrderClick={handleOrderClick} />

      <MainCategoriesNav
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {loading ? (
        <div className="flex items-center justify-center h-[85dvh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      ) : (
        <TikTokStyleMenu
          items={videoItems}
          onAddToCart={addToCart}
        />
      )}

      <Footer />

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
    </main>
  );
};

export default Index;
