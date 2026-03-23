import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MainCategoriesNav } from "@/components/MainCategoriesNav";
import { TikTokStyleMenu } from "@/components/TikTokStyleMenu";
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

    return products
      .filter((p) => p.category === dbCategory)
      .map((p) => ({
        product: {
          ...p,
          description: p.description ?? "",
          is_vegetarian: p.is_vegetarian ?? false,
          is_spicy: p.is_spicy ?? false,
          is_available: p.is_available ?? true,
          created_at: p.created_at ?? new Date().toISOString(),
          updated_at: p.updated_at ?? new Date().toISOString(),
        } as SupabaseProduct,
        videoUrl: p.video_url || FALLBACK_VIDEO_URL,
        posterUrl: p.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23222'/%3E%3C/svg%3E",
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
