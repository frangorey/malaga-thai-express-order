import { Button } from "@/components/ui/button";

interface CategoryNavProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryNav = ({ categories, activeCategory, onCategoryChange }: CategoryNavProps) => {
  return (
    <nav className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "neon" : "outline"}
              onClick={() => onCategoryChange(category)}
              className="whitespace-nowrap min-w-fit"
            >
              {category.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
};