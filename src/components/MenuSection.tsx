import { useState } from "react";
import { Plus, Leaf, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuItem, SupabaseProduct } from "@/types/menu";
import { useLanguage } from "@/contexts/LanguageContext";

interface MenuSectionProps {
  title: string;
  description: string;
  items: SupabaseProduct[];
  onAddToCart: (item: SupabaseProduct) => void;
}

export const MenuSection = ({ title, description, items, onAddToCart }: MenuSectionProps) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState(title);

  // Function to get translated product name and description
  const getTranslatedProduct = (product: SupabaseProduct) => {
    // Create a translation key based on product ID
    const nameKey = getProductNameKey(product.id);
    const descKey = getProductDescKey(product.id);
    
    // Try to get translation, fallback to original if not found
    const translatedName = t(nameKey) !== nameKey ? t(nameKey) : product.name;
    const translatedDesc = t(descKey) !== descKey ? t(descKey) : product.description;
    
    return {
      name: translatedName,
      description: translatedDesc
    };
  };

  // Generate translation keys based on product ID
  const getProductNameKey = (id: number): string => {
    const keyMap: Record<number, string> = {
      190: 'panko_chicken',
      191: 'panko_shrimp',
      192: 'chicken_skewer_1',
      193: 'chicken_skewer_2',
      194: 'shrimp_skewer_1',
      195: 'shrimp_skewer_2',
      196: 'mushroom_skewer_1',
      197: 'mushroom_skewer_2',
      198: 'grilled_salmon',
      199: 'spring_rolls',
      200: 'shrimp_rolls',
      201: 'chicken_wings',
      202: 'gyoza_fried',
      203: 'gyoza_grilled',
      204: 'bao_chicken',
      205: 'bao_shrimp',
      206: 'edamame',
      207: 'edamame_spicy'
    };
    return keyMap[id] || `product_${id}`;
  };

  const getProductDescKey = (id: number): string => {
    const keyMap: Record<number, string> = {
      190: 'panko_chicken_desc',
      191: 'panko_shrimp_desc',
      192: 'chicken_skewer_1_desc',
      193: 'chicken_skewer_2_desc',
      194: 'shrimp_skewer_1_desc',
      195: 'shrimp_skewer_2_desc',
      196: 'mushroom_skewer_1_desc',
      197: 'mushroom_skewer_2_desc',
      198: 'grilled_salmon_desc',
      199: 'spring_rolls_desc',
      200: 'shrimp_rolls_desc',
      201: 'chicken_wings_desc',
      202: 'gyoza_fried_desc',
      203: 'gyoza_grilled_desc',
      204: 'bao_chicken_desc',
      205: 'bao_shrimp_desc',
      206: 'edamame_desc',
      207: 'edamame_spicy_desc'
    };
    return keyMap[id] || `product_${id}_desc`;
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="neon-text">{title.toUpperCase()}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const translatedProduct = getTranslatedProduct(item);
            return (
            <Card key={item.id} className="group hover:neon-border transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <div className="relative overflow-hidden">
                <img 
                  src={item.image_url || '/placeholder.svg'} 
                  alt={translatedProduct.name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.is_vegetarian && (
                    <div className="bg-green-500 rounded-full p-1">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {item.is_spicy && (
                    <div className="bg-red-500 rounded-full p-1">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-lg">{translatedProduct.name}</span>
                  <span className="neon-text font-bold text-xl">{item.price.toFixed(2)}€</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  {translatedProduct.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Button 
                  variant="neon" 
                  className="w-full"
                  onClick={() => onAddToCart(item)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add_to_cart')}
                </Button>
              </CardContent>
            </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};