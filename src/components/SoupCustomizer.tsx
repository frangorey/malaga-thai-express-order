import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";

interface SoupCustomizerProps {
  onAddToCart: (product: SupabaseProduct) => void;
}

export const SoupCustomizer = ({ onAddToCart }: SoupCustomizerProps) => {
  const { t } = useLanguage();
  const [selectedSoupType, setSelectedSoupType] = useState<string>("");
  const [selectedProtein, setSelectedProtein] = useState<string>("");

  const soupTypes = [
    {
      id: "miso",
      name: t('soup_miso'),
      description: t('soup_miso_desc'),
      isSpicy: false
    },
    {
      id: "tom_yam",
      name: t('soup_tom_yam'),
      description: t('soup_tom_yam_desc'),
      isSpicy: true
    }
  ];

  const proteins = [
    { id: "veggie", name: t('veggie'), price: 8.10, isVegetarian: true },
    { id: "pollo", name: t('chicken'), price: 8.90, isVegetarian: false },
    { id: "langostino", name: t('prawn'), price: 9.40, isVegetarian: false }
  ];

  const getProductId = (soupType: string, protein: string): number => {
    const baseIds = {
      miso: { veggie: 129, pollo: 127, langostino: 128 },
      tom_yam: { veggie: 132, pollo: 130, langostino: 131 }
    };
    return baseIds[soupType as keyof typeof baseIds]?.[protein as keyof typeof baseIds.miso] || 127;
  };

  const getCurrentPrice = (): number => {
    if (!selectedProtein) return 0;
    const protein = proteins.find(p => p.id === selectedProtein);
    return protein?.price || 0;
  };

  const canAddToCart = selectedSoupType && selectedProtein;

  const handleAddToCart = () => {
    if (!canAddToCart) return;

    const soupType = soupTypes.find(s => s.id === selectedSoupType);
    const protein = proteins.find(p => p.id === selectedProtein);
    
    if (!soupType || !protein) return;

    const productId = getProductId(selectedSoupType, selectedProtein);
    const productName = `${soupType.name} ${protein.name === t('veggie') ? 'Veggie' : `con ${protein.name}`}`;
    
    const customProduct: SupabaseProduct = {
      id: productId,
      name: productName,
      description: `${t('custom_soup_with')} ${soupType.name} ${t('custom_soup_desc')}`,
      price: protein.price,
      image_url: 'https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/soup.jpg',
      category: 'Sopas',
      subcategory: soupType.id === 'miso' ? 'Miso' : 'Tom Yam',
      is_vegetarian: protein.isVegetarian,
      is_spicy: soupType.isSpicy,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onAddToCart(customProduct);
    
    // Reset selections
    setSelectedSoupType("");
    setSelectedProtein("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">{t('soup_customizer_title')}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t('soup_customizer_description')}</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <img 
            src="https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/sopa-miso-2.jpg"
            alt={t('soup_customizer_title')}
            className="w-full h-[400px] object-cover rounded-lg"
            style={{ objectPosition: 'center 60%' }}
          />
        </div>

        <div className="space-y-8">
        {/* Step 1: Soup Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
              {t('step_soup_type')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {soupTypes.map((soup) => (
                <div
                  key={soup.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedSoupType === soup.id
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSoupType(soup.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{soup.name}</h3>
                    {soup.isSpicy && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {t('spicy')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{soup.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Protein Selection */}
        {selectedSoupType && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                {t('step_protein')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {proteins.map((protein) => (
                  <div
                    key={protein.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProtein === protein.id
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedProtein(protein.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{protein.name}</h3>
                      {protein.isVegetarian && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Leaf className="h-3 w-3" />
                          {t('vegetarian')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-lg font-bold text-primary">{protein.price.toFixed(2)}€</p>
                  </div>
                ))}
              </div>
            </CardContent>
        </Card>
        )}

        {/* Order Summary and Add to Cart */}
        {selectedSoupType && selectedProtein && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>{t('order_summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('soup_type')}:</span>
                  <span className="font-medium">{soupTypes.find(s => s.id === selectedSoupType)?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('protein')}:</span>
                  <span className="font-medium">{proteins.find(p => p.id === selectedProtein)?.name}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>{t('total')}:</span>
                    <span className="text-primary">{getCurrentPrice().toFixed(2)}€</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                >
                  {t('add_to_cart')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
};