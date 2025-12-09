import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Leaf, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { SupabaseProduct } from "@/types/menu";

interface PokeCustomizerProps {
  onAddToCart: (product: SupabaseProduct) => void;
}

export const PokeCustomizer = ({ onAddToCart }: PokeCustomizerProps) => {
  const { t } = useLanguage();
  const { getProductsByCategory } = useProducts();
  const [selectedPoke, setSelectedPoke] = useState<SupabaseProduct | null>(null);

  const pokeProducts = getProductsByCategory('Pokes');

  const getTranslatedProduct = (product: SupabaseProduct) => {
    const nameKey = getProductNameKey(product.id);
    const descKey = getProductDescKey(product.id);
    
    return {
      name: t(nameKey) || product.name,
      description: t(descKey) || product.description
    };
  };

  const getProductNameKey = (id: number): string => {
    const keyMap: Record<number, string> = {
      184: 'poke_korean_name',
      185: 'poke_japanese_name', 
      186: 'poke_indonesia_name',
      187: 'poke_thailand_name',
      188: 'poke_basic_name',
      189: 'poke_premium_name'
    };
    return keyMap[id] || `product_${id}_name`;
  };

  const getProductDescKey = (id: number): string => {
    const keyMap: Record<number, string> = {
      184: 'poke_korean_desc',
      185: 'poke_japanese_desc',
      186: 'poke_indonesia_desc', 
      187: 'poke_thailand_desc',
      188: 'poke_basic_desc',
      189: 'poke_premium_desc'
    };
    return keyMap[id] || `product_${id}_desc`;
  };

  const handleAddToCart = () => {
    if (selectedPoke) {
      const translatedProduct = getTranslatedProduct(selectedPoke);
      const customProduct: SupabaseProduct = {
        ...selectedPoke,
        name: translatedProduct.name,
        description: translatedProduct.description
      };
      onAddToCart(customProduct);
      setSelectedPoke(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          {t('poke_customizer_title')}
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t('poke_customizer_description')}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <img 
            src="https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/Poke-Coreano.jpeg"
            alt={t('poke_customizer_title')}
            className="w-full h-[400px] object-cover rounded-lg"
            style={{ objectPosition: 'center 60%' }}
          />
        </div>

        {/* Step 1: Choose Poke Type */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                1
              </span>
              {t('step_poke_type')}
            </CardTitle>
            <CardDescription>
              {t('choose_your_poke')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pokeProducts.map((poke) => {
                const translatedProduct = getTranslatedProduct(poke);
                return (
                  <Card
                    key={poke.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedPoke?.id === poke.id ? 'ring-2 ring-primary shadow-lg' : ''
                    }`}
                    onClick={() => setSelectedPoke(poke)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{translatedProduct.name}</h3>
                        <div className="flex items-center gap-1">
                          {poke.is_vegetarian && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Leaf className="w-3 h-3 mr-1" />
                              {t('vegetarian')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                        {translatedProduct.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-primary">
                          €{poke.price}
                        </span>
                        {selectedPoke?.id === poke.id && (
                          <Badge variant="default">{t('selected')}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        {selectedPoke && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('order_summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('poke_type')}</span>
                  <span>{getTranslatedProduct(selectedPoke).name}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>{t('total')}</span>
                  <span className="text-primary">€{selectedPoke.price}</span>
                </div>
              </div>
              <Button 
                onClick={handleAddToCart}
                className="w-full mt-6"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('add_to_cart')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};