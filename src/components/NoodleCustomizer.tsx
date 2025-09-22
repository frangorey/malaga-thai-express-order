import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";
import noodlesHero from "@/assets/noodles-hero.jpg";

interface NoodleType {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface Protein {
  id: string;
  name: string;
  description: string;
  image: string;
}

interface Sauce {
  id: string;
  name: string;
  description: string;
  spicyLevel: number;
  color: string;
  image: string;
}

interface NoodleCustomizerProps {
  onAddToCart: (product: SupabaseProduct) => void;
}

export const NoodleCustomizer = ({ onAddToCart }: NoodleCustomizerProps) => {
  const { t } = useLanguage();
  const [selectedNoodleType, setSelectedNoodleType] = useState<string>("");
  const [selectedProtein, setSelectedProtein] = useState<string>("");
  const [selectedSauce, setSelectedSauce] = useState<string>("");
  const [activeTab, setActiveTab] = useState("noodle");

  const noodleTypes: NoodleType[] = [
    {
      id: "finos",
      name: t('noodle_finos'),
      description: t('noodle_finos_desc'),
      image: "/assets/noodles-finos.jpg"
    },
    {
      id: "anchos",
      name: t('noodle_anchos'),
      description: t('noodle_anchos_desc'),
      image: "/assets/noodles-anchos.jpg"
    },
    {
      id: "glass",
      name: t('noodle_glass'),
      description: "Tallarines transparentes de habas",
      image: "/assets/noodles-glass.jpg"
    },
    {
      id: "udon",
      name: t('noodle_udon'),
      description: t('noodle_udon_desc'),
      image: "/assets/noodles-udon.jpg"
    }
  ];

  const proteins: Protein[] = [
    {
      id: "pollo",
      name: t('protein_chicken'),
      description: t('protein_chicken_desc'),
      image: "/assets/protein-chicken.jpg"
    },
    {
      id: "ternera",
      name: t('protein_beef'),
      description: t('protein_beef_desc'),
      image: "/assets/protein-beef.jpg"
    },
    {
      id: "gambas",
      name: t('protein_shrimp'),
      description: t('protein_shrimp_desc'),
      image: "/assets/protein-shrimp.jpg"
    },
    {
      id: "pollo_ternera",
      name: t('protein_chicken_beef'),
      description: t('protein_chicken_beef_desc'),
      image: "/assets/protein-mix.jpg"
    },
    {
      id: "pollo_gambas",
      name: t('protein_chicken_shrimp'),
      description: t('protein_chicken_shrimp_desc'),
      image: "/assets/protein-mix.jpg"
    },
    {
      id: "ternera_gambas",
      name: t('protein_beef_shrimp'),
      description: t('protein_beef_shrimp_desc'),
      image: "/assets/protein-mix.jpg"
    },
    {
      id: "pollo_ternera_gambas",
      name: t('protein_chicken_beef_shrimp'),
      description: t('protein_chicken_beef_shrimp_desc'),
      image: "/assets/protein-mix.jpg"
    }
  ];

  const sauces: Sauce[] = [
    {
      id: "classic",
      name: t('sauce_classic'),
      description: t('sauce_classic_desc'),
      spicyLevel: 0,
      color: "bg-amber-500",
      image: "/assets/sauce-classic.jpg"
    },
    {
      id: "original",
      name: t('sauce_original'),
      description: t('sauce_original_desc'),
      spicyLevel: 0,
      color: "bg-green-500",
      image: "/assets/sauce-original.jpg"
    },
    {
      id: "teriyaki",
      name: t('sauce_teriyaki'),
      description: t('sauce_teriyaki_desc'),
      spicyLevel: 0,
      color: "bg-orange-600",
      image: "/assets/sauce-teriyaki.jpg"
    }
  ];

  const getPrice = (proteinId: string): number => {
    switch (proteinId) {
      case "pollo":
        return 10.60;
      case "ternera":
        return 10.80;
      case "gambas":
        return 11.80;
      case "pollo_ternera":
      case "pollo_gambas":
      case "ternera_gambas":
        return 12.90;
      case "pollo_ternera_gambas":
        return 13.30;
      default:
        return 10.60;
    }
  };

  const handleNoodleSelect = (noodleId: string) => {
    setSelectedNoodleType(noodleId);
    setActiveTab("protein");
  };

  const handleProteinSelect = (proteinId: string) => {
    setSelectedProtein(proteinId);
    setActiveTab("sauce");
  };

  const handleSauceSelect = (sauceId: string) => {
    setSelectedSauce(sauceId);
  };

  const handleAddToCart = () => {
    if (!selectedNoodleType || !selectedProtein || !selectedSauce) return;

    const noodleTypeName = noodleTypes.find(n => n.id === selectedNoodleType)?.name || "";
    const proteinName = proteins.find(p => p.id === selectedProtein)?.name || "";
    const sauceName = sauces.find(s => s.id === selectedSauce)?.name || "";

    const customProduct: SupabaseProduct = {
      id: Date.now(),
      name: `${t('custom_noodles_with')} ${noodleTypeName} ${t('custom_noodles_and')} ${proteinName} ${sauceName}`,
      description: `${t('custom_noodles_desc')} ${noodleTypeName} ${t('custom_noodles_and')} ${proteinName} ${t('custom_noodles_with_sauce')} ${sauceName}`,
      price: getPrice(selectedProtein),
      image_url: null,
      category: "Tallarines",
      subcategory: selectedNoodleType,
      is_vegetarian: false,
      is_spicy: selectedSauce.includes("spicy"),
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onAddToCart(customProduct);
    
    // Reset selections
    setSelectedNoodleType("");
    setSelectedProtein("");
    setSelectedSauce("");
    setActiveTab("noodle");
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="neon-text">{t('noodle_customizer_title')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('noodle_customizer_description')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <img 
              src={noodlesHero} 
              alt={t('noodle_customizer_title')}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="noodle">{t('step_noodle_type')}</TabsTrigger>
              <TabsTrigger value="protein" disabled={!selectedNoodleType}>
                {t('step_protein')}
              </TabsTrigger>
              <TabsTrigger value="sauce" disabled={!selectedProtein}>
                {t('step_sauce')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="noodle" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {noodleTypes.map((noodle) => (
                  <Card
                    key={noodle.id}
                    className={`cursor-pointer transition-all duration-300 hover:neon-border ${
                      selectedNoodleType === noodle.id ? 'neon-border' : ''
                    }`}
                    onClick={() => handleNoodleSelect(noodle.id)}
                  >
                    <CardHeader className="text-center">
                      <CardTitle className="text-lg">{noodle.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {noodle.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="protein" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proteins.map((protein) => (
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
                        {getPrice(protein.id).toFixed(2)}€
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sauce" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {sauces.map((sauce) => (
                  <Card
                    key={sauce.id}
                    className={`cursor-pointer transition-all duration-300 hover:neon-border ${
                      selectedSauce === sauce.id ? 'neon-border' : ''
                    }`}
                    onClick={() => handleSauceSelect(sauce.id)}
                  >
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 rounded-full ${sauce.color} mx-auto mb-4`}></div>
                      <CardTitle className="text-lg">{sauce.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {sauce.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {selectedNoodleType && selectedProtein && selectedSauce && (
                <div className="text-center bg-card/50 backdrop-blur-sm p-6 rounded-lg border">
                  <h3 className="text-xl font-bold mb-4">{t('order_summary')}</h3>
                  <div className="space-y-2 mb-4">
                    <p><strong>{t('noodle_type')}:</strong> {noodleTypes.find(n => n.id === selectedNoodleType)?.name}</p>
                    <p><strong>{t('protein')}:</strong> {proteins.find(p => p.id === selectedProtein)?.name}</p>
                    <p><strong>{t('sauce')}:</strong> {sauces.find(s => s.id === selectedSauce)?.name}</p>
                    <p className="text-xl font-bold neon-text">
                      <strong>{t('total')}:</strong> {getPrice(selectedProtein).toFixed(2)}€
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