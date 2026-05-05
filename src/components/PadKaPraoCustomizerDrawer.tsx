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

interface Props {
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: SupabaseProductWithCustomization) => void;
  editingItem?: EditingItem;
}

type ProteinId =
  | "pollo"
  | "ternera"
  | "gambas"
  | "pollo_ternera"
  | "pollo_gambas"
  | "ternera_gambas"
  | "pollo_ternera_gambas";

const SLUG = "pad_ka_prao";
const SIMPLE_IDS: ProteinId[] = ["pollo", "ternera", "gambas"];

export const PadKaPraoCustomizerDrawer = ({ open, onClose, onAddToCart, editingItem }: Props) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: bundle, isLoading, isError } = useDishTemplate(SLUG);
  const { imageUrl, videoUrl } = useMemo(() => resolveMedia(bundle), [bundle]);
  const templateProducts = bundle?.products ?? [];

  const [selectedProtein, setSelectedProtein] = useState<ProteinId | "">("");

  const resetSelections = () => {
    setSelectedProtein("");
  };

  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      if (editingItem.customizationData?.customizerType !== 'pad_ka_prao') {
        resetSelections();
        return;
      }
      const sel = editingItem.customizationData.selections ?? {};
      setSelectedProtein((sel.protein as ProteinId) ?? "");
    } else {
      resetSelections();
    }
  }, [open, editingItem]);

  const proteins: { id: ProteinId; nameKey: string; emoji: string; matchToken: string }[] = [
    { id: "pollo", nameKey: "protein_chicken", emoji: "🍗", matchToken: "con pollo" },
    { id: "ternera", nameKey: "protein_beef", emoji: "🥩", matchToken: "con ternera" },
    { id: "gambas", nameKey: "protein_shrimp", emoji: "🦐", matchToken: "con gambas" },
    { id: "pollo_ternera", nameKey: "protein_chicken_beef", emoji: "🍗🥩", matchToken: "mix 2 con pollo y ternera" },
    { id: "pollo_gambas", nameKey: "protein_chicken_shrimp", emoji: "🍗🦐", matchToken: "mix 2 con pollo y gambas" },
    { id: "ternera_gambas", nameKey: "protein_beef_shrimp", emoji: "🥩🦐", matchToken: "mix 2 con ternera y gambas" },
    { id: "pollo_ternera_gambas", nameKey: "protein_chicken_beef_shrimp", emoji: "🍗🥩🦐", matchToken: "mix 3 con pollo, ternera y gambas" },
  ];

  const findProductFor = (id: ProteinId): SupabaseProduct | null => {
    const sel = proteins.find((p) => p.id === id);
    if (!sel || templateProducts.length === 0) return null;
    const token = sel.matchToken.toLowerCase();
    const isSimple = SIMPLE_IDS.includes(id);
    return (
      templateProducts.find((p) => {
        const n = p.name.toLowerCase();
        if (!n.includes(token)) return false;
        if (isSimple && n.includes("mix")) return false;
        return true;
      }) ?? null
    );
  };

  const matched = selectedProtein ? findProductFor(selectedProtein) : null;
  const totalPrice = matched?.price ?? 0;
  const selProtein = proteins.find((p) => p.id === selectedProtein) ?? null;

  const handleClose = () => {
    onClose();
  };

  const handleAddToCart = () => {
    if (!matched) {
      toast({
        title: "Error",
        description: t("error_variant_not_found"),
        variant: "destructive",
      });
      return;
    }
    const customizationData: CustomizationData = {
      customizerType: 'pad_ka_prao',
      selections: { protein: selectedProtein || undefined },
    };
    onAddToCart({ ...matched, customizationData, ...(editingItem?.cartItemId ? { cartItemId: editingItem.cartItemId } : {}) });
    toast({ title: editingItem ? '✅ ' + t('update_item') : "✅", description: matched.name });
    handleClose();
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="max-h-[90dvh] bg-background">
        <DrawerHeader className="flex items-center justify-between pb-2 border-b border-border">
          <DrawerTitle className="text-lg font-bold">🌶️ Pad Ka Prao</DrawerTitle>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </DrawerHeader>

        <div className="relative aspect-video bg-black overflow-hidden">
          {videoUrl ? (
            <video
              src={videoUrl}
              poster={imageUrl ?? undefined}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Pad Ka Prao"
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
              {t("error_loading_variants")}
            </div>
          )}

          {!isLoading && !isError && templateProducts.length === 0 && (
            <div className="mt-4 p-3 rounded-md border border-border bg-muted text-sm text-muted-foreground">
              {t("error_no_variants_available")}
            </div>
          )}

          {!isLoading && !isError && templateProducts.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-3">{t("padkaprao_choose_protein")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {proteins.map((p) => {
                  const prod = findProductFor(p.id);
                  if (!prod) return null;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProtein(p.id)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 p-4 rounded-xl border transition-all text-left",
                        selectedProtein === p.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{p.emoji}</span>
                        <span className="font-medium text-sm">{t(p.nameKey)}</span>
                      </span>
                      <span className="text-sm font-semibold text-primary">{prod.price.toFixed(2)}€</span>
                    </button>
                  );
                })}
              </div>

              {matched && selProtein && (
                <div className="mt-5 p-4 rounded-xl border border-border bg-muted/40 space-y-2">
                  <h4 className="font-semibold text-sm mb-2">{t("order_summary")}</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">🌶️</span>
                    <span className="font-medium">Pad Ka Prao</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{selProtein.emoji}</span>
                    <span className="font-medium">{t(selProtein.nameKey)}</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-border">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-primary">{totalPrice.toFixed(2)}€</span>
                  </div>
                  <Button onClick={handleAddToCart} className="w-full mt-2" size="lg">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {editingItem ? t('update_item') : t('add_to_cart')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {matched && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-border bg-background/95 backdrop-blur-sm flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-primary">{totalPrice.toFixed(2)}€</span>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
