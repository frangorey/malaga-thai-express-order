import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { MainCategoriesNav } from "@/components/MainCategoriesNav";
import { RiceCustomizer } from "@/components/RiceCustomizer";
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
  const [activeCategory, setActiveCategory] = useState("arroz");

  // Configurar la categoría activa inicial
  useEffect(() => {
    // Default to arroz (rice) section
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

  const handleRiceCustomization = (protein: string, sauce: string, price: number) => {
    const customProduct: SupabaseProduct = {
      id: Date.now(), // temporary ID for custom products
      name: `Arroz frito con ${protein} y ${sauce}`,
      description: `Arroz frito personalizado con ${protein} y ${sauce}`,
      price,
      image_url: null,
      category: "Arroces",
      subcategory: sauce,
      is_vegetarian: false,
      is_spicy: sauce.includes("curry"),
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    addToCart(customProduct);
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
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Entrantes</h2>
              <p className="text-muted-foreground mb-8">Deliciosos entrantes para comenzar tu experiencia culinaria</p>
              <p className="text-lg text-muted-foreground">Próximamente disponible...</p>
            </div>
          </div>
        )}

        {activeCategory === "tallarines" && (
          <div id="category-tallarines" className="py-8">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Tallarines</h2>
              <p className="text-muted-foreground mb-8">Tallarines tradicionales asiáticos salteados con verduras frescas</p>
              <p className="text-lg text-muted-foreground">Próximamente disponible...</p>
            </div>
          </div>
        )}

        {activeCategory === "sopas" && (
          <div id="category-sopas" className="py-8">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Sopas</h2>
              <p className="text-muted-foreground mb-8">Sopas reconfortantes con sabores auténticos de la cocina asiática</p>
              <p className="text-lg text-muted-foreground">Próximamente disponible...</p>
            </div>
          </div>
        )}

        {activeCategory === "pokes" && (
          <div id="category-pokes" className="py-8">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Pokes</h2>
              <p className="text-muted-foreground mb-8">Pokes frescos y saludables con ingredientes de calidad</p>
              <p className="text-lg text-muted-foreground">Próximamente disponible...</p>
            </div>
          </div>
        )}

        {activeCategory === "postres" && (
          <div id="category-postres" className="py-8">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Postres</h2>
              <p className="text-muted-foreground mb-8">Deliciosos postres para endulzar tu experiencia</p>
              <p className="text-lg text-muted-foreground">Próximamente disponible...</p>
            </div>
          </div>
        )}

        {activeCategory === "ensaladas" && (
          <div id="category-ensaladas" className="py-8">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Ensaladas</h2>
              <p className="text-muted-foreground mb-8">Ensaladas frescas y nutritivas con ingredientes de temporada</p>
              <p className="text-lg text-muted-foreground">Próximamente disponible...</p>
            </div>
          </div>
        )}

        {activeCategory === "bebidas" && (
          <div id="category-bebidas" className="py-8">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Bebidas</h2>
              <p className="text-muted-foreground mb-8">Refrescantes bebidas para acompañar tu comida</p>
              <p className="text-lg text-muted-foreground">Próximamente disponible...</p>
            </div>
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