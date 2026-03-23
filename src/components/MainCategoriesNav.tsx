import { useLanguage } from "@/contexts/LanguageContext";
import { ChefHat, Wheat, Utensils, Soup, Fish, IceCream, Salad, Coffee, Globe, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MainCategoriesNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  floating?: boolean;
}

const mainCategories: { id: string; name: string; icon: LucideIcon }[] = [
  { id: "entrantes", name: "Entrantes", icon: ChefHat },
  { id: "arroz", name: "Arroz", icon: Wheat },
  { id: "tallarines", name: "Tallarines", icon: Utensils },
  { id: "sopas", name: "Sopas", icon: Soup },
  { id: "pokes", name: "Pokes", icon: Fish },
  { id: "postres", name: "Postres", icon: IceCream },
  { id: "ensaladas", name: "Ensaladas", icon: Salad },
  { id: "otras", name: "Otras del Mundo", icon: Globe },
  { id: "bebidas", name: "Bebidas", icon: Coffee },
];

export const MainCategoriesNav = ({ activeCategory, onCategoryChange, floating }: MainCategoriesNavProps) => {
  const { t } = useLanguage();

  if (floating) {
    return (
      <nav className="absolute top-0 left-0 w-full z-50 pt-3 pb-2 px-3 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pointer-events-auto pb-1">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-200 border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                    : "bg-white/15 backdrop-blur-md text-white border-white/10 hover:bg-white/25"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t(category.id)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border py-3 sm:py-4 lg:py-6">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-2 sm:gap-3 lg:gap-4">
          {mainCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "h-14 sm:h-16 lg:h-18 flex flex-col items-center justify-center space-y-0.5 sm:space-y-1 text-xs sm:text-sm hover:scale-105 transition-transform p-2 rounded-lg border",
                  activeCategory === category.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground border-border hover:bg-accent"
                )}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium line-clamp-1">{t(category.id)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};