import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Utensils, Wheat, Coffee, Fish, IceCream, Leaf, CupSoda, type LucideIcon } from "lucide-react";

interface MainCategoriesNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const mainCategories: { id: string; name: string; icon: LucideIcon }[] = [
  { id: "entrantes", name: "Entrantes", icon: Utensils },
  { id: "arroz", name: "Arroz", icon: Wheat },
  { id: "tallarines", name: "Tallarines", icon: Utensils },
  { id: "sopas", name: "Sopas", icon: Coffee },
  { id: "pokes", name: "Pokes", icon: Fish },
  { id: "postres", name: "Postres", icon: IceCream },
  { id: "ensaladas", name: "Ensaladas", icon: Leaf },
  { id: "bebidas", name: "Bebidas", icon: CupSoda },
];

export const MainCategoriesNav = ({ activeCategory, onCategoryChange }: MainCategoriesNavProps) => {
  const { t } = useLanguage();
  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {mainCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "neon" : "outline"}
                onClick={() => onCategoryChange(category.id)}
                className="h-16 flex flex-col items-center justify-center space-y-1 text-sm hover:scale-105 transition-transform"
              >
                <IconComponent className="h-6 w-6" />
                <span className="font-medium">{t(category.id)}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};