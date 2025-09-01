import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryNav } from "@/components/CategoryNav";
import { MenuSection } from "@/components/MenuSection";
import { Cart } from "@/components/Cart";
import { Footer } from "@/components/Footer";
import { menuCategories } from "@/data/menuData";
import { CartItem, MenuItem } from "@/types/menu";
import { toast } from "sonner";

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");

  // Get unique categories
  const categories = menuCategories.map(cat => cat.name);

  // Set first category as active on load
  useEffect(() => {
    if (categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, []);

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        toast.success(`${item.name} cantidad aumentada`);
        return prev.map(cartItem =>
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        toast.success(`${item.name} añadido al carrito`);
        return [...prev, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast.success("Producto eliminado del carrito");
  };

  const scrollToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    const element = document.getElementById(categoryName.toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOrderClick = () => {
    if (categories.length > 0) {
      scrollToCategory(categories[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItems={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />
      
      <Hero onOrderClick={handleOrderClick} />
      
      <CategoryNav 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={scrollToCategory}
      />

      <main>
        {menuCategories.map((category) => (
          <div key={category.id} id={category.name.toLowerCase()}>
            <MenuSection
              title={category.name}
              description={category.description}
              items={category.items}
              onAddToCart={addToCart}
            />
          </div>
        ))}
      </main>

      <Footer />

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
};

export default Index;
