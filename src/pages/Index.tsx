import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { MainCategoriesNav } from "@/components/MainCategoriesNav";
import { RiceCustomizer } from "@/components/RiceCustomizer";
import { NoodleCustomizer } from "@/components/NoodleCustomizer";
import { SoupCustomizer } from "@/components/SoupCustomizer";
import { PokeCustomizer } from "@/components/PokeCustomizer";
import { SaladCustomizer } from "@/components/SaladCustomizer";
import { Cart, SupabaseCartItem } from "@/components/Cart";
import { Footer } from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { SupabaseProduct } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const { products, categories, loading, error, getProductsByCategory } = useProducts();
  const [cartItems, setCartItems] = useState<SupabaseCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("arroz");
  const [searchParams] = useSearchParams();

  // Lectura del número de mesa desde el QR (?mesa=X)
  const mesaParam = searchParams.get('mesa');
  const tableNumber = mesaParam ? parseInt(mesaParam, 10) : null;
  const validTableNumber = tableNumber && tableNumber >= 1 && tableNumber <= 14 ? tableNumber : null;

  // Lógica del Carrito
  const addToCart = (product: SupabaseProduct) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Lógica de Navegación del Menú
  const scrollToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    setTimeout(() => {
      const element = document.getElementById(`category-${categoryName}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleOrderClick = () => {
    scrollToCategory("arroz");
  };

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

      {/* Zona de Menú Dinámica */}
      <div className="min-h-screen">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">{t('loading_products') || 'Cargando la carta...'}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-destructive mb-4">{t('error_loading') || 'Error al cargar el menú'}: {error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              {t('retry') || 'Reintentar'}
            </Button>
          </div>
        ) : (
          <>
            <MainCategoriesNav
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />

            <div className="min-h-screen">
              {activeCategory === "arroz" && (
                <div id="category-arroz" className="py-8">
                  <RiceCustomizer onAddToCart={addToCart} />
                </div>
              )}

              {activeCategory === "entrantes" && (
                <div id="category-entrantes" className="py-8">
                  <MenuSection
                    title={t('entrantes')}
                    description={t('starters_description')}
                    items={getProductsByCategory('Entrantes')}
                    onAddToCart={addToCart}
                  />
                </div>
              )}

              {activeCategory === "tallarines" && (
                <div id="category-tallarines" className="py-8">
                  <NoodleCustomizer onAddToCart={addToCart} />
                </div>
              )}

              {activeCategory === "sopas" && (
                <div id="category-sopas" className="py-8">
                  <SoupCustomizer onAddToCart={addToCart} />
                </div>
              )}

              {activeCategory === "pokes" && (
                <div id="category-pokes" className="py-8">
                  <PokeCustomizer onAddToCart={addToCart} />
                </div>
              )}

              {activeCategory === "postres" && (
                <div id="category-postres" className="py-8">
                  <MenuSection
                    title={t('postres')}
                    description={t('desserts_description')}
                    items={getProductsByCategory('Postres')}
                    onAddToCart={addToCart}
                  />
                </div>
              )}

              {activeCategory === "ensaladas" && (
                <div id="category-ensaladas" className="py-8">
                  <SaladCustomizer onAddToCart={addToCart} />
                </div>
              )}

              {activeCategory === "bebidas" && (
                <div id="category-bebidas" className="py-8">
                  <MenuSection
                    title={t('bebidas')}
                    description={t('drinks_description')}
                    items={getProductsByCategory('Bebidas')}
                    onAddToCart={addToCart}
                  />
                </div>
              )}

              {activeCategory === "otras" && (
                <div id="category-otras" className="py-8">
                  <MenuSection
                    title={t('otras_title')}
                    description={t('otras_description')}
                    items={getProductsByCategory('Otras del Mundo')}
                    onAddToCart={addToCart}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

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
