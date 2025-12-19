import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";

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

interface Vegetable {
  id: string;
  name: string;
  price: number;
}

interface NoodleCustomizerProps {
  onAddToCart: (product: SupabaseProduct) => void;
}

export const NoodleCustomizer = ({ onAddToCart }: NoodleCustomizerProps) => {
  const { t } = useLanguage();
  const { products } = useProducts();
  const { toast } = useToast();
  const [selectedNoodleType, setSelectedNoodleType] = useState<string>("");
  const [selectedProtein, setSelectedProtein] = useState<string>("");
  const [selectedSauce, setSelectedSauce] = useState<string>("");
  const [selectedVegetables, setSelectedVegetables] = useState<string[]>([]);
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

  const vegetables: Vegetable[] = [
    { id: "huevo", name: t('veg_egg'), price: 1.40 },
    { id: "cilantro", name: t('veg_cilantro'), price: 1.40 },
    { id: "albahaca", name: t('veg_basil'), price: 1.40 },
    { id: "brotes-soja", name: t('veg_bean_sprouts'), price: 1.40 },
    { id: "cebolla-roja", name: t('veg_red_onion'), price: 1.40 },
    { id: "maiz", name: t('veg_corn'), price: 1.40 },
    { id: "judia-verde", name: t('veg_green_beans'), price: 1.40 },
    { id: "zanahoria", name: t('veg_carrot'), price: 1.40 },
    { id: "cacahuete", name: t('veg_peanut'), price: 1.40 },
    { id: "brocoli", name: t('veg_broccoli'), price: 1.90 },
    { id: "cebolleta", name: t('veg_scallion'), price: 1.90 },
    { id: "champinones", name: t('veg_mushroom'), price: 1.90 },
    { id: "pimiento", name: t('veg_pepper'), price: 1.90 }
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
    setActiveTab("vegetables");
  };

  const handleVegetableToggle = (vegetableId: string) => {
    setSelectedVegetables(prev => 
      prev.includes(vegetableId) 
        ? prev.filter(id => id !== vegetableId)
        : [...prev, vegetableId]
    );
  };

  const getTotalPrice = (): number => {
    const basePrice = getPrice(selectedProtein);
    const vegetablesPrice = selectedVegetables.reduce((sum, vegId) => {
      const veg = vegetables.find(v => v.id === vegId);
      return sum + (veg?.price || 0);
    }, 0);
    return basePrice + vegetablesPrice;
  };

  const findMatchingProduct = (): SupabaseProduct | null => {
    if (!selectedNoodleType || !selectedProtein || !selectedSauce) return null;

    // Map noodle type IDs to DB subcategories
    const noodleTypeMap: Record<string, string> = {
      "finos": "Finos",
      "anchos": "Anchos", 
      "glass": "Glass",
      "udon": "Udon"
    };

    // Map protein IDs to search patterns in product name
    const proteinMap: Record<string, string[]> = {
      "pollo": ["con pollo classic", "con pollo original", "con pollo teriyaki"],
      "ternera": ["con ternera classic", "con ternera original", "con ternera teriyaki"],
      "gambas": ["con gambas classic", "con gambas original", "con gambas teriyaki"],
      "pollo_ternera": ["mix 2 con pollo y ternera"],
      "pollo_gambas": ["mix 2 con pollo y gambas"],
      "ternera_gambas": ["mix 2 con ternera y gambas"],
      "pollo_ternera_gambas": ["mix 3 con pollo, ternera y gambas"]
    };

    const noodleType = noodleTypeMap[selectedNoodleType] || "Finos";
    const proteinPatterns = proteinMap[selectedProtein] || [];

    // Build the expected product name pattern
    // Product names are like: "Tallarines Finos con pollo classic"
    // or "Tallarines Finos MIX 2 con pollo y ternera classic"
    
    // For single proteins, include the sauce in the pattern
    let searchPattern = "";
    if (["pollo", "ternera", "gambas"].includes(selectedProtein)) {
      // Single protein - sauce is at the end of the name
      const proteinName = selectedProtein === "pollo" ? "pollo" : 
                          selectedProtein === "ternera" ? "ternera" : "gambas";
      searchPattern = `con ${proteinName} ${selectedSauce}`;
    } else {
      // Mix proteins - sauce is at the end after the protein combo
      const proteinCombo = proteinPatterns[0] || "";
      searchPattern = `${proteinCombo} ${selectedSauce}`;
    }

    // Find matching product in DB
    const matchingProduct = products.find(p => 
      p.category === "Tallarines" && 
      p.subcategory?.toLowerCase() === noodleType.toLowerCase() &&
      p.name.toLowerCase().includes(searchPattern.toLowerCase())
    );

    return matchingProduct || null;
  };

  const handleAddToCart = () => {
    if (!selectedNoodleType || !selectedProtein || !selectedSauce) return;

    const baseProduct = findMatchingProduct();
    
    if (!baseProduct) {
      toast({
        title: "Error",
        description: "No se pudo encontrar el producto en la base de datos. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
      return;
    }

    const vegetablesNames = selectedVegetables
      .map(id => vegetables.find(v => v.id === id)?.name)
      .filter(Boolean);

    const vegetablesPrice = selectedVegetables.reduce((sum, vegId) => {
      const veg = vegetables.find(v => v.id === vegId);
      return sum + (veg?.price || 0);
    }, 0);

    const customProduct: SupabaseProduct = {
      ...baseProduct,
      name: vegetablesNames.length > 0 
        ? `${baseProduct.name} + ${vegetablesNames.join(", ")}`
        : baseProduct.name,
      price: baseProduct.price + vegetablesPrice,
      customizations: vegetablesNames
    };

    onAddToCart(customProduct);
    
    // Reset selections
    setSelectedNoodleType("");
    setSelectedProtein("");
    setSelectedSauce("");
    setSelectedVegetables([]);
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
            <ResponsiveImage 
              src="https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Finos-classic-pollogambas.jpeg" 
              alt={t('noodle_customizer_title')}
              className="w-full h-[400px] object-cover rounded-lg"
              style={{ objectPosition: 'center 60%' }}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="noodle">{t('step_noodle_type')}</TabsTrigger>
              <TabsTrigger value="protein" disabled={!selectedNoodleType}>
                {t('step_protein')}
              </TabsTrigger>
              <TabsTrigger value="sauce" disabled={!selectedProtein}>
                {t('step_sauce')}
              </TabsTrigger>
              <TabsTrigger value="vegetables" disabled={!selectedSauce}>
                {t('step_vegetables')}
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
            </TabsContent>

            <TabsContent value="vegetables" className="mt-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{t('extra_vegetables_optional')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('extra_vegetables_desc')}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                {vegetables.map((vegetable) => (
                  <Card
                    key={vegetable.id}
                    className={`cursor-pointer transition-all duration-300 hover:neon-border ${
                      selectedVegetables.includes(vegetable.id) ? 'neon-border bg-primary/10' : ''
                    }`}
                    onClick={() => handleVegetableToggle(vegetable.id)}
                  >
                    <CardHeader className="text-center p-4">
                      <CardTitle className="text-sm">{vegetable.name}</CardTitle>
                      <CardDescription className="text-sm font-bold text-primary">
                        +{vegetable.price.toFixed(2)}€
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
                    {selectedVegetables.length > 0 && (
                      <p><strong>{t('extra_vegetables_label')}:</strong> {selectedVegetables.map(id => vegetables.find(v => v.id === id)?.name).join(", ")}</p>
                    )}
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