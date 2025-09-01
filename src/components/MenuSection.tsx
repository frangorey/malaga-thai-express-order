import { useState } from "react";
import { Plus, Leaf, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuItem } from "@/types/menu";

interface MenuSectionProps {
  title: string;
  description: string;
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
}

export const MenuSection = ({ title, description, items, onAddToCart }: MenuSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState(title);

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
          {items.map((item) => (
            <Card key={item.id} className="group hover:neon-border transition-all duration-300 bg-card/50 backdrop-blur-sm">
              <div className="relative overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.vegetarian && (
                    <div className="bg-green-500 rounded-full p-1">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {item.spicy && (
                    <div className="bg-red-500 rounded-full p-1">
                      <Flame className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span className="text-lg">{item.name}</span>
                  <span className="neon-text font-bold text-xl">{item.price.toFixed(2)}€</span>
                </CardTitle>
                <CardDescription className="text-sm">
                  {item.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Button 
                  variant="neon" 
                  className="w-full"
                  onClick={() => onAddToCart(item)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir al Carrito
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};