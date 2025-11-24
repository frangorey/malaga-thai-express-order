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
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border py-3 sm:py-4 lg:py-6">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "neon" : "outline"}
                onClick={() => onCategoryChange(category.id)}
                className="h-14 sm:h-16 lg:h-18 flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 text-xs sm:text-sm hover:scale-105 transition-transform p-2"
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium line-clamp-1">{t(category.id)}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};