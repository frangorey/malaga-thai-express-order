import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

interface SaladType {
  id: string;
  name: string;
  ingredients: string;
}

interface ProteinOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

interface SaladCustomizerProps {
  onAddToCart: (product: SupabaseProduct) => void;
}

export const SaladCustomizer = ({ onAddToCart }: SaladCustomizerProps) => {
  const { t } = useLanguage();
  const { products } = useProducts();
  const { toast } = useToast();
  const [selectedSalad, setSelectedSalad] = useState<string>("");
  const [selectedProtein, setSelectedProtein] = useState<string>("");
  const [activeTab, setActiveTab] = useState("salad");

   const saladTypes: SaladType[] = [
    {
      id: "cesar",
      name: t('salad_cesar'),
      ingredients: t('salad_cesar_ingredients')
    },
    {
      id: "classic",
      name: t('salad_classic_name'),
      ingredients: t('salad_classic_ingredients')
    },
    {
      id: "malaysia",
      name: t('salad_malaysia'),
      ingredients: t('salad_malaysia_ingredients')
    },
    {
      id: "thailandia",
      name: t('salad_thai'),
      ingredients: t('salad_thai_ingredients')
    },
    {
      id: "crispy",
      name: t('salad_crispy'),
      ingredients: t('salad_crispy_ingredients')
    },
    {
      id: "fruta",
      name: t('salad_fruit'),
      ingredients: t('salad_fruit_ingredients')
    }
  ];

  const proteinOptions: ProteinOption[] = [
    {
      id: "none",
      name: t('salad_protein_none'),
      price: 10.40,
      description: t('salad_protein_none_desc')
    },
    {
      id: "chicken",
      name: t('salad_protein_chicken'),
      price: 11.40,
      description: t('salad_protein_chicken_desc')
    },
    {
      id: "shrimp",
      name: t('salad_protein_shrimp'),
      price: 12.90,
      description: t('salad_protein_shrimp_desc')
    },
    {
      id: "both",
      name: t('salad_protein_both'),
      price: 14.40,
      description: t('salad_protein_both_desc')
    }
  ];

  const handleSaladSelect = (saladId: string) => {
    setSelectedSalad(saladId);
    setActiveTab("protein");
  };

  const handleProteinSelect = (proteinId: string) => {
    setSelectedProtein(proteinId);
  };

  const getTotalPrice = (): number => {
    const protein = proteinOptions.find(p => p.id === selectedProtein);
    return protein?.price || 0;
  };

  const findMatchingProduct = (): SupabaseProduct | null => {
    if (!selectedSalad || !selectedProtein) return null;

    // Map salad IDs to DB subcategories
    const saladSubcategoryMap: Record<string, string> = {
      "cesar": "Cesar",
      "classic": "Classic",
      "malaysia": "Malaysia",
      "singapur": "Singapur",
      "thailandia": "Thailandia",
      "noodles": "Noodles",
      "crispy": "Crispy",
      "fruta": "Fruta"
    };

    // Map protein IDs to name patterns
    const proteinNameMap: Record<string, string> = {
      "none": "normal",
      "chicken": "con pollo",
      "shrimp": "con langostino",
      "both": "Mixta con pollo y langostino"
    };

    const subcategory = saladSubcategoryMap[selectedSalad] || "";
    const proteinPattern = proteinNameMap[selectedProtein] || "";

    // Find matching product in DB by subcategory and name pattern
    const matchingProduct = products.find(p => 
      p.category === "Ensaladas" && 
      p.subcategory?.toLowerCase() === subcategory.toLowerCase() &&
      p.name.toLowerCase().includes(proteinPattern.toLowerCase())
    );

    return matchingProduct || null;
  };

  const handleAddToCart = () => {
    if (!selectedSalad || !selectedProtein) return;

    const baseProduct = findMatchingProduct();
    
    if (!baseProduct) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el producto en la base de datos. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
      return;
    }

    const customProduct: SupabaseProduct = {
      ...baseProduct
    };

    onAddToCart(customProduct);
    
    // Reset selections
    setSelectedSalad("");
    setSelectedProtein("");
    setActiveTab("salad");
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="neon-text">{t('salad_customizer_title')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('salad_customizer_description')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <ResponsiveImage 
              src="https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Ensalada-Noodles.jpeg" 
              alt={t('salad_customizer_title')}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="salad">{t('step_salad_type')}</TabsTrigger>
              <TabsTrigger value="protein" disabled={!selectedSalad}>
                {t('step_protein')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="salad" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {saladTypes.map((salad) => (
                  <Card
                    key={salad.id}
                    className={`cursor-pointer transition-all duration-300 hover:neon-border ${
                      selectedSalad === salad.id ? 'neon-border' : ''
                    }`}
                    onClick={() => handleSaladSelect(salad.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{salad.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {salad.ingredients}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="protein" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {proteinOptions.map((protein) => (
                  <Card
                    key={protein.id}
                    className={`cursor-pointer transition-all duration-300 hover:neon-border ${
                      selectedProtein === protein.id ? 'neon-border' : ''
                    }`}
                    onClick={() => handleProteinSelect(protein.id)}
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{protein.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {protein.description}
                      </CardDescription>
                      <div className="text-xl font-bold text-primary mt-2">
                        {protein.price.toFixed(2)}€
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {selectedSalad && selectedProtein && (
                <div className="text-center bg-card/50 backdrop-blur-sm p-6 rounded-lg border">
                  <h3 className="text-xl font-bold mb-4">{t('order_summary')}</h3>
                  <div className="space-y-2 mb-4">
                    <p><strong>{t('salad_type')}:</strong> {saladTypes.find(s => s.id === selectedSalad)?.name}</p>
                    <p><strong>{t('protein')}:</strong> {proteinOptions.find(p => p.id === selectedProtein)?.name}</p>
                    <p className="text-xl font-bold neon-text">
                      <strong>{t('total')}:</strong> {getTotalPrice().toFixed(2)}€
                    </p>
                  </div>
                  <Button
                    variant="neon"
                    size="lg"
                    onClick={handleAddToCart}
                    className="w-full md:w-auto"
                  >
                    {t('add_to_cart')}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};