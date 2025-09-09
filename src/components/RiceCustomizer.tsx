import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Flame, FlameKindling } from "lucide-react";

interface Protein {
  id: string;
  name: string;
  description: string;
  image?: string;
}

interface Sauce {
  id: string;
  name: string;
  description: string;
  spicyLevel: 0 | 1 | 2; // 0: no picante, 1: medio picante, 2: picante
  color: string;
  image?: string;
}

const proteins: Protein[] = [
  { id: "pollo", name: "Pollo", description: "Tierno pollo marinado" },
  { id: "ternera", name: "Ternera", description: "Jugosa ternera salteada" },
  { id: "gambas", name: "Gambas", description: "Gambas frescas del mar" },
  { id: "pollo-ternera", name: "Pollo y Ternera", description: "Combinación de pollo y ternera" },
  { id: "pollo-gambas", name: "Pollo y Gambas", description: "Pollo con gambas frescas" },
  { id: "ternera-gambas", name: "Ternera y Gambas", description: "Ternera con gambas del mar" },
  { id: "mix-3", name: "Pollo, Ternera y Gambas", description: "Combinación completa de proteínas" },
];

const sauces: Sauce[] = [
  { id: "classic", name: "Salsa Classic", description: "Salsa tradicional asiática", spicyLevel: 0, color: "bg-amber-500" },
  { id: "original", name: "Salsa Original", description: "Nuestra receta especial", spicyLevel: 0, color: "bg-orange-500" },
  { id: "teriyaki", name: "Salsa Teriyaki", description: "Dulce y sabrosa salsa japonesa", spicyLevel: 0, color: "bg-brown-600" },
  { id: "curry-amarillo", name: "Curry Amarillo", description: "Suave curry amarillo", spicyLevel: 0, color: "bg-yellow-500" },
  { id: "curry-verde", name: "Curry Verde", description: "Curry verde medio picante", spicyLevel: 1, color: "bg-green-500" },
  { id: "curry-rojo", name: "Curry Rojo", description: "Intenso curry rojo picante", spicyLevel: 2, color: "bg-red-500" },
];

interface RiceCustomizerProps {
  onAddToCart: (protein: string, sauce: string, price: number) => void;
}

export const RiceCustomizer = ({ onAddToCart }: RiceCustomizerProps) => {
  const [selectedProtein, setSelectedProtein] = useState<string>("");
  const [selectedSauce, setSelectedSauce] = useState<string>("");

  const getPrice = (proteinId: string) => {
    const basePrices: Record<string, number> = {
      "pollo": 10.60,
      "ternera": 10.80,
      "gambas": 11.80,
      "pollo-ternera": 12.90,
      "pollo-gambas": 12.90,
      "ternera-gambas": 12.90,
      "mix-3": 13.30,
    };
    return basePrices[proteinId] || 10.60;
  };

  const getSpicyIcon = (level: number) => {
    switch (level) {
      case 1:
        return <FlameKindling className="h-4 w-4 text-orange-500" />;
      case 2:
        return <Flame className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleAddToCart = () => {
    if (selectedProtein && selectedSauce) {
      const price = getPrice(selectedProtein);
      onAddToCart(selectedProtein, selectedSauce, price);
      // Reset selections
      setSelectedProtein("");
      setSelectedSauce("");
    }
  };

  const canAddToCart = selectedProtein && selectedSauce;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Personaliza tu Arroz Frito</h1>
        <p className="text-muted-foreground">Elige tu proteína favorita y la salsa perfecta</p>
      </div>

      <Tabs defaultValue="protein" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="protein" className="text-lg py-3">
            <ChefHat className="h-5 w-5 mr-2" />
            1. Proteína
          </TabsTrigger>
          <TabsTrigger value="sauce" className="text-lg py-3">
            <Flame className="h-5 w-5 mr-2" />
            2. Salsa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="protein" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {proteins.map((protein) => (
              <Card
                key={protein.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedProtein === protein.id
                    ? "ring-2 ring-primary shadow-lg neon-glow"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedProtein(protein.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    {protein.name}
                    <Badge variant="outline" className="text-xs">
                      €{getPrice(protein.id).toFixed(2)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{protein.description}</p>
                  {protein.image && (
                    <div className="mt-3 h-20 w-full bg-muted rounded-md flex items-center justify-center">
                      <span className="text-2xl">🍖</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sauce" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sauces.map((sauce) => (
              <Card
                key={sauce.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedSauce === sauce.id
                    ? "ring-2 ring-primary shadow-lg neon-glow"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedSauce(sauce.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    {sauce.name}
                    {getSpicyIcon(sauce.spicyLevel)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{sauce.description}</p>
                  <div className={`h-4 w-full rounded-full ${sauce.color} mb-2`}></div>
                  {sauce.spicyLevel > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {sauce.spicyLevel === 1 ? "Medio picante" : "Picante"}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Summary and Add to Cart */}
      <div className="mt-8 p-6 bg-card rounded-lg border">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Tu selección:</h3>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {selectedProtein && (
                <Badge variant="outline">
                  Proteína: {proteins.find(p => p.id === selectedProtein)?.name}
                </Badge>
              )}
              {selectedSauce && (
                <Badge variant="outline">
                  Salsa: {sauces.find(s => s.id === selectedSauce)?.name}
                </Badge>
              )}
            </div>
            {selectedProtein && (
              <p className="text-lg font-bold text-primary">
                Precio: €{getPrice(selectedProtein).toFixed(2)}
              </p>
            )}
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            variant="neon"
            size="lg"
            className="w-full md:w-auto"
          >
            Añadir al Carrito
          </Button>
        </div>
      </div>
    </div>
  );
};