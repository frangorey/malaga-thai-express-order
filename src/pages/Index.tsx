import { useState, useEffect } from "react";
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

  // Read table number from QR URL param (?mesa=X)
  const tableNumber = searchParams.get('mesa') ? parseInt(searchParams.get('mesa')!, 10) : null;
  const validTableNumber = tableNumber && tableNumber >= 1 && tableNumber <= 14 ? tableNumber : null;

  // Configurar la categoría activa inicial
  useEffect(() => {
    if (!activeCategory) {
      setActiveCategory("arroz");
    }
  }, [activeCategory]);

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
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const scrollToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOrderClick = () => {
    setActiveCategory("arroz");
    scrollToCategory("arroz");
  };

  const handleRiceCustomization = (product: SupabaseProduct) => addToCart(product);
  const handleNoodleCustomization = (product: SupabaseProduct) => addToCart(product);
  const handleSoupCustomization = (product: SupabaseProduct) => addToCart(product);
  const handlePokeCustomization = (product: SupabaseProduct) => addToCart(product);
  const handleSaladCustomization = (product: SupabaseProduct) => addToCart(product);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">{t('loading_products')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">{t('error_loading')}: {error}</p>
          <Button onClick={() => window.location.reload()}>
            {t('retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Header 
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      {/* Table banner if scanning QR */}
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

      <div className="min-h-screen">
        {activeCategory === "arroz" && (
          <div id="category-arroz" className="py-8">
            <RiceCustomizer onAddToCart={handleRiceCustomization} />
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
            <NoodleCustomizer onAddToCart={handleNoodleCustomization} />
          </div>
        )}

        {activeCategory === "sopas" && (
          <div id="category-sopas" className="py-8">
            <SoupCustomizer onAddToCart={handleSoupCustomization} />
          </div>
        )}

        {activeCategory === "pokes" && (
          <div id="category-pokes" className="py-8">
            <PokeCustomizer onAddToCart={handlePokeCustomization} />
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
            <SaladCustomizer onAddToCart={handleSaladCustomization} />
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

// Función para obtener descripciones de categorías
const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    "Arroces": "Deliciosos arroces fritos al wok con ingredientes frescos y auténticos sabores asiáticos",
    "Tallarines": "Tallarines tradicionales asiáticos salteados con verduras frescas y proteínas de calidad",
    "Sopas": "Sopas reconfortantes con sabores auténticos de la cocina asiática",
    "Ensaladas": "Ensaladas frescas y nutritivas con ingredientes de temporada",
    "Bebidas": "Refrescantes bebidas para acompañar tu comida",
    "Entrantes": "Deliciosos entrantes para comenzar tu experiencia culinaria",
    "Sets": "Menús completos con nuestras mejores combinaciones",
    "Especialidades": "Nuestros platos más especiales y únicos"
  };
  
  return descriptions[category] || `Descubre nuestra selección de ${category.toLowerCase()}`;
};

export default Index;
