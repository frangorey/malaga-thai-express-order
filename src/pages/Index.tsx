import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { CategoryNav } from "@/components/CategoryNav";
import { Cart, SupabaseCartItem } from "@/components/Cart";
import { Footer } from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { SupabaseProduct } from "@/types/menu";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { products, categories, loading, error, getProductsByCategory } = useProducts();
  const [cartItems, setCartItems] = useState<SupabaseCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");

  // Configurar la categoría activa inicial
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

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
    if (categories.length > 0) {
      scrollToCategory(categories[0]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-destructive mb-4">Error: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
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
      
      <Hero onOrderClick={handleOrderClick} />
      
      {categories.length > 0 && (
        <CategoryNav 
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={scrollToCategory}
        />
      )}

      {categories.map((category) => {
        const categoryProducts = getProductsByCategory(category);
        if (categoryProducts.length === 0) return null;

        return (
          <div key={category} id={`category-${category}`}>
            <MenuSection
              title={category}
              description={getCategoryDescription(category)}
              items={categoryProducts}
              onAddToCart={addToCart}
            />
          </div>
        );
      })}

      <Footer />

      {isCartOpen && (
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
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