import { Button } from "@/components/ui/button";

interface MainCategoriesNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const mainCategories = [
  { id: "entrantes", name: "Entrantes", icon: "🥟" },
  { id: "arroz", name: "Arroz", icon: "🍚" },
  { id: "tallarines", name: "Tallarines", icon: "🍜" },
  { id: "sopas", name: "Sopas", icon: "🥣" },
  { id: "pokes", name: "Pokes", icon: "🥗" },
  { id: "postres", name: "Postres", icon: "🍮" },
  { id: "ensaladas", name: "Ensaladas", icon: "🥬" },
  { id: "bebidas", name: "Bebidas", icon: "🥤" },
];

export const MainCategoriesNav = ({ activeCategory, onCategoryChange }: MainCategoriesNavProps) => {
  return (
    <nav className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {mainCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "neon" : "outline"}
              onClick={() => onCategoryChange(category.id)}
              className="h-16 flex flex-col items-center justify-center space-y-1 text-sm hover:scale-105 transition-transform"
            >
              <span className="text-xl">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};