import { useState, useMemo, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Loader2, ImageOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";
import { useDishTemplate, resolveMedia } from "@/hooks/useDishTemplate";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: SupabaseProduct) => void;
}

type GarnishId = "white_rice" | "japanese_rice" | "fries";
type SauceId = "sweet_sour" | "honey_mustard" | "yogurt";

const TOTAL_PRICE = 12.7;
const SLUG = "pollo_coreano";

export const PolloCoreanoCustomizerDrawer = ({ open, onClose, onAddToCart }: Props) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: bundle, isLoading, isError } = useDishTemplate(SLUG);
  const { imageUrl, videoUrl } = useMemo(() => resolveMedia(bundle), [bundle]);
  const templateProducts = bundle?.products ?? [];

  const [garnish, setGarnish] = useState<GarnishId | "">("");
  const [sauce, setSauce] = useState<SauceId | "">("");

  useEffect(() => {
    if (!open) {
      setGarnish("");
      setSauce("");
    }
  }, [open]);

  const garnishes: { id: GarnishId; name: string; emoji: string; matchToken: string }[] = [
    { id: "white_rice", name: t("korean_chicken_garnish_white_rice"), emoji: "🍚", matchToken: "Arroz Blanco" },
    { id: "japanese_rice", name: t("korean_chicken_garnish_japanese_rice"), emoji: "🍙", matchToken: "Arroz Japonés" },
    { id: "fries", name: t("korean_chicken_garnish_fries"), emoji: "🍟", matchToken: "Patatas Fritas" },
  ];

  const sauces: { id: SauceId; name: string; matchToken: string; ring: string }[] = [
    { id: "sweet_sour", name: t("korean_chicken_sauce_sweet_sour"), matchToken: "Agridulce", ring: "border-amber-500/70" },
    { id: "honey_mustard", name: t("korean_chicken_sauce_honey_mustard"), matchToken: "Miel Mostaza", ring: "border-yellow-400/70" },
    { id: "yogurt", name: t("korean_chicken_sauce_yogurt"), matchToken: "Yogur", ring: "border-sky-400/70" },
  ];

  const selGarnish = garnishes.find((g) => g.id === garnish) ?? null;
  const selSauce = sauces.find((s) => s.id === sauce) ?? null;

  const findMatchingProduct = (): SupabaseProduct | null => {
    if (!selGarnish || !selSauce || templateProducts.length === 0) return null;
    return (
      templateProducts.find(
        (p) => p.name.includes(selGarnish.matchToken) && p.name.includes(selSauce.matchToken),
      ) ?? null
    );
  };

  const handleClose = () => {
    setGarnish("");
    setSauce("");
    onClose();
  };

  const handleAddToCart = () => {
    const base = findMatchingProduct();
    if (!base) {
      toast({
        title: "Error",
        description: t("error_variant_not_found"),
        variant: "destructive",
      });
      return;
    }
    onAddToCart(base);
    toast({ title: "✅", description: base.name });
    handleClose();
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="max-h-[90dvh] bg-background">
        <DrawerHeader className="flex items-center justify-between pb-2 border-b border-border">
          <DrawerTitle className="text-lg font-bold">🍗 Pollo Coreano</DrawerTitle>
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
              alt="Pollo Coreano"
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
              <p className="text-sm text-muted-foreground mb-3">{t("korean_chicken_choose_garnish")}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {garnishes.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGarnish(g.id)}
                    className={cn(
                      "w-full flex items-center gap-2 p-4 rounded-xl border transition-all text-left",
                      garnish === g.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <span className="text-lg">{g.emoji}</span>
                    <span className="font-medium text-sm">{g.name}</span>
                  </button>
                ))}
              </div>

              {selGarnish && (
                <>
                  <p className="text-sm text-muted-foreground mt-5 mb-3">{t("korean_chicken_choose_sauce")}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {sauces.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSauce(s.id)}
                        className={cn(
                          "w-full flex items-center justify-center p-4 rounded-xl border transition-all text-center font-medium text-sm",
                          sauce === s.id
                            ? `${s.ring} bg-primary/10`
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selGarnish && selSauce && (
                <div className="mt-5 p-4 rounded-xl border border-border bg-muted/40 space-y-2">
                  <h4 className="font-semibold text-sm mb-2">{t("order_summary")}</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">🍗</span>
                    <span className="font-medium">Pollo Coreano</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{selGarnish.emoji}</span>
                    <span className="font-medium">{selGarnish.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">🥫</span>
                    <span className="font-medium">{selSauce.name}</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-border">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-primary">{TOTAL_PRICE.toFixed(2)}€</span>
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

        {selGarnish && selSauce && (
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-border bg-background/95 backdrop-blur-sm flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-bold text-primary">{TOTAL_PRICE.toFixed(2)}€</span>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
