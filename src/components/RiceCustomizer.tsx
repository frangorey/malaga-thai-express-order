import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Flame, FlameKindling } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

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

// Note: We'll use dynamic translation keys, defined in the component itself

// Note: We'll use dynamic translation keys for sauces too

interface RiceCustomizerProps {
  onAddToCart: (protein: string, sauce: string, price: number) => void;
}

export const RiceCustomizer = ({ onAddToCart }: RiceCustomizerProps) => {
  const { t } = useLanguage();
  const [selectedProtein, setSelectedProtein] = useState<string>("");
  const [selectedSauce, setSelectedSauce] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("protein");

  const proteins: Protein[] = [
    { id: "pollo", name: t('chicken_protein'), description: t('chicken_desc') },
    { id: "ternera", name: t('beef_protein'), description: t('beef_desc') },
    { id: "gambas", name: t('shrimp_protein'), description: t('shrimp_desc') },
    { id: "pollo-ternera", name: t('chicken_beef'), description: t('chicken_beef_desc') },
    { id: "pollo-gambas", name: t('chicken_shrimp'), description: t('chicken_shrimp_desc') },
    { id: "ternera-gambas", name: t('beef_shrimp'), description: t('beef_shrimp_desc') },
    { id: "mix-3", name: t('mix_three'), description: t('mix_three_desc') },
  ];

  const sauces: Sauce[] = [
    { id: "classic", name: t('classic_sauce'), description: t('classic_sauce_desc'), spicyLevel: 0, color: "bg-amber-500" },
    { id: "original", name: t('original_sauce'), description: t('original_sauce_desc'), spicyLevel: 0, color: "bg-orange-500" },
    { id: "teriyaki", name: t('teriyaki_sauce'), description: t('teriyaki_sauce_desc'), spicyLevel: 0, color: "bg-brown-600" },
    { id: "curry-amarillo", name: t('yellow_curry_sauce'), description: t('yellow_curry_sauce_desc'), spicyLevel: 0, color: "bg-yellow-500" },
    { id: "curry-verde", name: t('green_curry_sauce'), description: t('green_curry_sauce_desc'), spicyLevel: 1, color: "bg-green-500" },
    { id: "curry-rojo", name: t('red_curry_sauce'), description: t('red_curry_sauce_desc'), spicyLevel: 2, color: "bg-red-500" },
  ];

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

  const handleProteinSelect = (proteinId: string) => {
    setSelectedProtein(proteinId);
    setActiveTab("sauce"); // Cambiar automáticamente a la pestaña de salsa
  };

  const handleSauceSelect = (sauceId: string) => {
    setSelectedSauce(sauceId);
    if (!selectedProtein) {
      setActiveTab("protein"); // Si no hay proteína seleccionada, cambiar a proteína
    }
  };

  const handleAddToCart = () => {
    if (selectedProtein && selectedSauce) {
      const price = getPrice(selectedProtein);
      onAddToCart(selectedProtein, selectedSauce, price);
      // Reset selections
      setSelectedProtein("");
      setSelectedSauce("");
      setActiveTab("protein"); // Volver a la primera pestaña
    }
  };

  // Generar URL de la imagen desde Supabase Storage
  const getRiceImageUrl = () => {
    return "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Arroz-ternera.jpeg";
  };

  const canAddToCart = selectedProtein && selectedSauce;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="mb-6">
          <img 
            src={getRiceImageUrl()} 
            alt="Arroz frito con ternera" 
            className="w-full max-w-md mx-auto rounded-lg shadow-lg object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('customize_rice')}</h1>
        <p className="text-muted-foreground">{t('select_protein')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="protein" className="text-lg py-3">
            <ChefHat className="h-5 w-5 mr-2" />
            1. {t('protein_tab')}
          </TabsTrigger>
          <TabsTrigger value="sauce" className="text-lg py-3">
            <Flame className="h-5 w-5 mr-2" />
            2. {t('sauce_tab')}
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
                onClick={() => handleProteinSelect(protein.id)}
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
                  <div className="mt-3 h-20 w-full rounded-md overflow-hidden">
                    <img 
                      src="https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Arroz-ternera.jpeg"
                      alt="Arroz con proteína"
                      className="w-full h-full object-cover"
                    />
                  </div>
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
                onClick={() => handleSauceSelect(sauce.id)}
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
                      {sauce.spicyLevel === 1 ? t('medium_spicy') : t('spicy_level_high')}
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
            <h3 className="text-lg font-semibold">{t('selected_items')}:</h3>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {selectedProtein && (
                <Badge variant="outline">
                  {t('protein_tab')}: {proteins.find(p => p.id === selectedProtein)?.name}
                </Badge>
              )}
              {selectedSauce && (
                <Badge variant="outline">
                  {t('sauce_tab')}: {sauces.find(s => s.id === selectedSauce)?.name}
                </Badge>
              )}
            </div>
            {selectedProtein && (
              <p className="text-lg font-bold text-primary">
                {t('price')}: €{getPrice(selectedProtein).toFixed(2)}
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
            {t('add_to_cart')}
          </Button>
        </div>
      </div>
    </div>
  );
};