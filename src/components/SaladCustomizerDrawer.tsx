import { useState, useMemo, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Loader2, ImageOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";
import { SupabaseProductWithCustomization, CustomizationData, EditingItem } from "@/components/Cart";
import { useDishTemplate, resolveMedia } from "@/hooks/useDishTemplate";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type SaladType = "cesar" | "classic" | "crispy" | "fruta" | "malaysia" | "thailandia";

interface SaladCustomizerDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: SupabaseProductWithCustomization) => void;
  saladType: SaladType;
  editingItem?: EditingItem;
}

type ProteinId = "normal" | "pollo" | "langostino" | "mixta";

interface ProteinOption {
  id: ProteinId;
  name: string;
  price: number;
  emoji: string;
}

const SALAD_LABELS: Record<SaladType, string> = {
  cesar: "César",
  classic: "Classic",
  crispy: "Crispy",
  fruta: "Fruta",
  malaysia: "Malaysia",
  thailandia: "Thailandia",
};

const SALAD_SLUG_MAP: Record<SaladType, string> = {
  cesar: "ensalada_cesar",
  classic: "ensalada_classic",
  crispy: "ensalada_crispy",
  fruta: "ensalada_fruta",
  malaysia: "ensalada_malaysia",
  thailandia: "ensalada_thailandia",
};

const SALAD_EMOJI = "🥗";

export const SaladCustomizerDrawer = ({ open, onClose, onAddToCart, saladType, editingItem }: SaladCustomizerDrawerProps) => {
  const { t } = useLanguage();
  const slug = SALAD_SLUG_MAP[saladType];
  const { data: bundle, isLoading, isError } = useDishTemplate(slug);
  const { imageUrl } = useMemo(() => resolveMedia(bundle), [bundle]);
  const templateProducts = bundle?.products ?? [];
  const { toast } = useToast();

  const [selectedProtein, setSelectedProtein] = useState<ProteinId | "">("");

  const proteins: ProteinOption[] = [
    { id: "normal", name: t("salad_protein_veggie"), price: 10.40, emoji: "🌱" },
    { id: "pollo", name: t("salad_protein_chicken"), price: 11.40, emoji: "🍗" },
    { id: "langostino", name: t("salad_protein_shrimp"), price: 12.90, emoji: "🦐" },
    { id: "mixta", name: t("salad_protein_mix"), price: 14.40, emoji: "🍗🦐" },
  ];

  const selectedOption = proteins.find((p) => p.id === selectedProtein) ?? null;

  const findMatchingProduct = (): SupabaseProduct | null => {
    if (!selectedProtein || templateProducts.length === 0) return null;
    const norm = (s: string) =>
      s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isMixta = (n: string) => /\bmixta\b/.test(n);

    return (
      templateProducts.find((p) => {
        const n = norm(p.name);
        switch (selectedProtein) {
          case "mixta":
            return isMixta(n);
          case "normal":
            return p.is_vegetarian === true;
          case "pollo":
            return !isMixta(n) && /\bcon pollo\b/.test(n);
          case "langostino":
            return !isMixta(n) && /\bcon langostino\b/.test(n);
          default:
            return false;
        }
      }) ?? null
    );
  };

  const handleClose = () => {
    setSelectedProtein("");
    onClose();
  };

  const handleAddToCart = () => {
    const base = findMatchingProduct();
    if (!base) {
      toast({ title: "Error", description: "Producto no encontrado", variant: "destructive" });
      return;
    }
    const customizationData: CustomizationData = {
      customizerType: 'salad',
      drawerVariant: saladType,
      selections: { protein: selectedProtein || undefined },
    };
    onAddToCart({ ...base, customizationData });
    setSelectedProtein("");
    onClose();
    toast({ title: "✅ Añadido al carrito", description: base.name });
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="max-h-[90dvh] bg-background">
        <DrawerHeader className="flex items-center justify-between pb-2 border-b border-border">
          <DrawerTitle className="text-lg font-bold">
            {SALAD_EMOJI} Ensalada {SALAD_LABELS[saladType]}
          </DrawerTitle>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </DrawerHeader>

        {/* Hero (imagen únicamente; templates de ensaladas no tienen video) */}
        <div className="relative aspect-video bg-black overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Ensalada ${SALAD_LABELS[saladType]}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <ImageOff className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24 pt-4" style={{ maxHeight: "60dvh" }}>
          {isLoading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}

          {isError && !isLoading && (
            <div className="mt-4 p-3 rounded-md border border-destructive/50 bg-destructive/10 text-sm text-destructive">
              {t("error_loading_variants") || "No pudimos cargar las variantes. Recarga la página."}
            </div>
          )}

          {!isLoading && !isError && templateProducts.length === 0 && (
            <div className="mt-4 p-3 rounded-md border border-border bg-muted text-sm text-muted-foreground">
              {t("error_no_variants_available") || "No hay variantes disponibles ahora mismo."}
            </div>
          )}

          {!isLoading && !isError && templateProducts.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-3">{t("salad_choose_protein")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {proteins.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProtein(p.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                      selectedProtein === p.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{p.emoji}</span>
                      <span className="font-medium text-sm">{p.name}</span>
                    </span>
                    <span className="font-bold text-primary whitespace-nowrap">{p.price.toFixed(2)}€</span>
                  </button>
                ))}
              </div>

              {selectedOption && (
                <div className="mt-5 p-4 rounded-xl border border-border bg-muted/40 space-y-2">
                  <h4 className="font-semibold text-sm mb-2">{t("order_summary")}</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{SALAD_EMOJI} Ensalada {SALAD_LABELS[saladType]}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t("step_protein")}:</span>
                    <span className="font-medium">{selectedOption.emoji} {selectedOption.name}</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-border">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-primary">{selectedOption.price.toFixed(2)}€</span>
                  </div>
                  <Button onClick={handleAddToCart} className="w-full mt-2" size="lg">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t("add_to_cart")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {selectedOption && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-border bg-background/95 backdrop-blur-sm flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-primary">{selectedOption.price.toFixed(2)}€</span>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
