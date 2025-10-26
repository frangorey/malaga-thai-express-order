import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChefHat, Wheat, Utensils, Soup, Fish, IceCream, Salad, Coffee, LucideIcon } from "lucide-react";

interface MainCategoriesNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const mainCategories: { id: string; name: string; icon: LucideIcon }[] = [
  { id: "entrantes", name: "Entrantes", icon: ChefHat },
  { id: "arroz", name: "Arroz", icon: Wheat },
  { id: "tallarines", name: "Tallarines", icon: Utensils },
  { id: "sopas", name: "Sopas", icon: Soup },
  { id: "pokes", name: "Pokes", icon: Fish },
  { id: "postres", name: "Postres", icon: IceCream },
  { id: "ensaladas", name: "Ensaladas", icon: Salad },
  { id: "bebidas", name: "Bebidas", icon: Coffee },
];

export const MainCategoriesNav = ({ activeCategory, onCategoryChange }: MainCategoriesNavProps) => {
  const { t } = useLanguage();
  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "neon" : "outline"}
                onClick={() => onCategoryChange(category.id)}
                className="h-16 flex flex-col items-center justify-center space-y-1 text-sm hover:scale-105 transition-transform"
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{t(category.id)}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};