import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { Flame, Leaf, ImageOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";
import {
  useDishTemplate,
  resolveVariant,
  resolveMedia,
  type ProteinKey,
} from "@/hooks/useDishTemplate";

interface SoupCustomizerProps {
  onAddToCart: (product: SupabaseProduct) => void;
}

type SoupSlug = "sopa_miso" | "sopa_tom_yam";

export const SoupCustomizer = ({ onAddToCart }: SoupCustomizerProps) => {
  const { t } = useLanguage();
  const [selectedSoupType, setSelectedSoupType] = useState<SoupSlug | "">("");
  const [selectedProtein, setSelectedProtein] = useState<ProteinKey | "">("");

  const soupTypes: { id: SoupSlug; name: string; description: string; isSpicy: boolean }[] = [
    { id: "sopa_miso", name: t("soup_miso"), description: t("soup_miso_desc"), isSpicy: false },
    { id: "sopa_tom_yam", name: t("soup_tom_yam"), description: t("soup_tom_yam_desc"), isSpicy: true },
  ];

  const proteins: { id: ProteinKey; name: string; price: number; isVegetarian: boolean }[] = [
    { id: "veggie", name: t("veggie"), price: 8.9, isVegetarian: true },
    { id: "pollo", name: t("chicken"), price: 8.9, isVegetarian: false },
    { id: "langostino", name: t("prawn"), price: 9.4, isVegetarian: false },
  ];

  const { data: bundle, isLoading, isError } = useDishTemplate(selectedSoupType || null);

  const { imageUrl } = useMemo(() => resolveMedia(bundle), [bundle]);

  const resolvedProduct = useMemo(() => {
    if (!bundle || !selectedProtein) return null;
    return resolveVariant(bundle, selectedProtein);
  }, [bundle, selectedProtein]);

  const currentPrice =
    resolvedProduct?.price ?? proteins.find((p) => p.id === selectedProtein)?.price ?? 0;
  const canAddToCart = !!selectedSoupType && !!selectedProtein && !!resolvedProduct && !isLoading;

  const handleAddToCart = () => {
    if (!selectedSoupType || !selectedProtein) return;
    if (!resolvedProduct) {
      toast.error(
        t("error_variant_not_found") || "No encontramos esa variante. Inténtalo de nuevo.",
      );
      return;
    }
    onAddToCart(resolvedProduct);
    setSelectedSoupType("");
    setSelectedProtein("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">{t("soup_customizer_title")}</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("soup_customizer_description")}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          {imageUrl ? (
            <ResponsiveImage
              src={imageUrl}
              alt={t("soup_customizer_title")}
              className="w-full h-[400px] object-cover rounded-lg"
              style={{ objectPosition: "center 60%" }}
            />
          ) : (
            <div className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center">
              <ImageOff className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* Step 1: Soup Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  1
                </span>
                {t("step_soup_type")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {soupTypes.map((soup) => (
                  <div
                    key={soup.id}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedSoupType === soup.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => {
                      setSelectedSoupType(soup.id);
                      setSelectedProtein("");
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{soup.name}</h3>
                      {soup.isSpicy && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {t("spicy")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{soup.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Protein */}
          {selectedSoupType && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  {t("step_protein")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isError && (
                  <div className="mb-4 p-3 rounded-md border border-destructive/50 bg-destructive/10 text-sm text-destructive">
                    {t("error_loading_variants") ||
                      "No pudimos cargar las variantes. Recarga la página."}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {proteins.map((protein) => (
                    <div
                      key={protein.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedProtein === protein.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() => setSelectedProtein(protein.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{protein.name}</h3>
                        {protein.isVegetarian && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Leaf className="h-3 w-3" />
                            {t("vegetarian")}
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

          {/* Summary */}
          {selectedSoupType && selectedProtein && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle>{t("order_summary")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("soup_type")}:</span>
                    <span className="font-medium">
                      {soupTypes.find((s) => s.id === selectedSoupType)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{t("protein")}:</span>
                    <span className="font-medium">
                      {proteins.find((p) => p.id === selectedProtein)?.name}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>{t("total")}:</span>
                      <span className="text-primary">{currentPrice.toFixed(2)}€</span>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("add_to_cart")}
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

export default SoupCustomizer;
