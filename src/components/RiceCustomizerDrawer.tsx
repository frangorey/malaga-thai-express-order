import { useState, useCallback, useMemo, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check, ShoppingCart, X, Loader2, ImageOff } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";
import { SupabaseProductWithCustomization, CustomizationData, EditingItem } from "@/components/Cart";
import { useDishTemplate, resolveMedia } from "@/hooks/useDishTemplate";
import { useToast } from "@/hooks/use-toast";
import { allExtras } from "@/data/extrasData";
import { cn } from "@/lib/utils";

export type RiceType = "frito" | "curry";

interface RiceCustomizerDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: SupabaseProductWithCustomization) => void;
  riceType: RiceType;
  editingItem?: EditingItem;
}

type Step = "protein" | "sauce" | "vegetables" | "extras" | "summary";

interface ProteinOption {
  id: string;
  name: string;
  price: number;
}

interface SauceOption {
  id: string;
  name: string;
  dbSubcategory: string;
  color: string;
}

interface VegetableOption {
  id: string;
  name: string;
  price: number;
}

const STEP_ORDER: Step[] = ["protein", "sauce", "vegetables", "extras", "summary"];

const RICE_LABELS: Record<RiceType, string> = {
  frito: "Arroz Frito",
  curry: "Arroz Curry",
};

const RICE_EMOJI: Record<RiceType, string> = {
  frito: "🍚",
  curry: "🍛",
};

const RICE_SLUG_MAP: Record<RiceType, string> = {
  frito: "arroz_frito",
  curry: "arroz_curry",
};

export const RiceCustomizerDrawer = ({ open, onClose, onAddToCart, riceType, editingItem }: RiceCustomizerDrawerProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const slug = RICE_SLUG_MAP[riceType];
  const { data: bundle, isLoading, isError } = useDishTemplate(slug);
  const { imageUrl, videoUrl } = useMemo(() => resolveMedia(bundle), [bundle]);
  const templateProducts = bundle?.products ?? [];

  const [currentStep, setCurrentStep] = useState<Step>("protein");
  const [selectedProtein, setSelectedProtein] = useState<string>("");
  const [selectedSauce, setSelectedSauce] = useState<string>("");
  const [selectedVegetables, setSelectedVegetables] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const proteins: ProteinOption[] = [
    { id: "pollo", name: t("protein_chicken"), price: 10.60 },
    { id: "ternera", name: t("protein_beef"), price: 10.80 },
    { id: "gambas", name: t("protein_shrimp"), price: 11.80 },
    { id: "pollo_ternera", name: t("protein_chicken_beef"), price: 12.90 },
    { id: "pollo_gambas", name: t("protein_chicken_shrimp"), price: 12.90 },
    { id: "ternera_gambas", name: t("protein_beef_shrimp"), price: 12.90 },
    { id: "pollo_ternera_gambas", name: t("protein_chicken_beef_shrimp"), price: 13.30 },
  ];

  const SAUCES_BY_RICE_TYPE: Record<RiceType, SauceOption[]> = {
    frito: [
      { id: "classic",  name: t("sauce_classic"),  dbSubcategory: "Classic",  color: "bg-amber-500" },
      { id: "original", name: t("sauce_original"), dbSubcategory: "Original", color: "bg-green-600" },
    ],
    curry: [
      { id: "curry-amarillo", name: t("yellow_curry_sauce"), dbSubcategory: "Curry Amarillo", color: "bg-yellow-400" },
      { id: "curry-verde",    name: t("green_curry_sauce"),  dbSubcategory: "Curry Verde",    color: "bg-emerald-500" },
      { id: "curry-rojo",     name: t("red_curry_sauce"),    dbSubcategory: "Curry Rojo",     color: "bg-red-500" },
    ],
  };
  const sauces = SAUCES_BY_RICE_TYPE[riceType];

  const vegetables: VegetableOption[] = [
    { id: "huevo", name: t("veg_egg"), price: 1.40 },
    { id: "cilantro", name: t("veg_cilantro"), price: 1.40 },
    { id: "albahaca", name: t("veg_basil"), price: 1.40 },
    { id: "brotes-soja", name: t("veg_bean_sprouts"), price: 1.40 },
    { id: "cebolla-roja", name: t("veg_red_onion"), price: 1.40 },
    { id: "maiz", name: t("veg_corn"), price: 1.40 },
    { id: "judia-verde", name: t("veg_green_beans"), price: 1.40 },
    { id: "zanahoria", name: t("veg_carrot"), price: 1.40 },
    { id: "cacahuete", name: t("veg_peanut"), price: 1.40 },
    { id: "brocoli", name: t("veg_broccoli"), price: 1.90 },
    { id: "cebolleta", name: t("veg_scallion"), price: 1.90 },
    { id: "champinones", name: t("veg_mushroom"), price: 1.90 },
    { id: "pimiento", name: t("veg_pepper"), price: 1.90 },
  ];

  const sauceExtras = allExtras.filter((e) => e.category === "sauce");
  const complementExtras = allExtras.filter((e) => e.category === "complement");

  const selectedProteinData = proteins.find((p) => p.id === selectedProtein);
  const selectedSauceData = sauces.find((s) => s.id === selectedSauce);

  const extrasTotal = useMemo(() => {
    const vegPrice = selectedVegetables.reduce((sum, id) => {
      const v = vegetables.find((vg) => vg.id === id);
      return sum + (v?.price || 0);
    }, 0);
    const extPrice = selectedExtras.reduce((sum, id) => {
      const e = allExtras.find((ex) => ex.id === id);
      return sum + (e?.price || 0);
    }, 0);
    return vegPrice + extPrice;
  }, [selectedVegetables, selectedExtras]);

  const totalPrice = (selectedProteinData?.price || 0) + extrasTotal;

  const stepIndex = STEP_ORDER.indexOf(currentStep);

  const goNext = useCallback(() => {
    const next = STEP_ORDER[stepIndex + 1];
    if (next) setCurrentStep(next);
  }, [stepIndex]);

  const goBack = useCallback(() => {
    const prev = STEP_ORDER[stepIndex - 1];
    if (prev) setCurrentStep(prev);
  }, [stepIndex]);

  const handleProteinSelect = (id: string) => {
    setSelectedProtein(id);
    setTimeout(() => setCurrentStep("sauce"), 200);
  };

  const handleSauceSelect = (id: string) => {
    setSelectedSauce(id);
    setTimeout(() => setCurrentStep("vegetables"), 200);
  };

  const toggleVegetable = (id: string) => {
    setSelectedVegetables((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleReset = useCallback(() => {
    setSelectedProtein("");
    setSelectedSauce("");
    setSelectedVegetables([]);
    setSelectedExtras([]);
    setCurrentStep("protein");
  }, []);

  // Reset al cambiar de tipo de arroz (las salsas no son compatibles entre tipos)
  useEffect(() => {
    if (editingItem) return;
    handleReset();
  }, [riceType, editingItem, handleReset]);

  // Precarga en modo edición
  useEffect(() => {
    if (!open) return;
    if (editingItem) {
      const cd = editingItem.customizationData;
      if (cd.customizerType !== 'rice') { handleReset(); return; }
      if (cd.drawerVariant !== riceType) { handleReset(); return; }
      setSelectedProtein(cd.selections.protein ?? "");
      setSelectedSauce(cd.selections.sauce ?? "");
      setSelectedVegetables(cd.selections.vegetables ?? []);
      setSelectedExtras(cd.selections.extras ?? []);
      setCurrentStep('summary');
    } else {
      handleReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingItem, bundle?.products?.length]);

  const handleClose = () => {
    onClose();
  };

  const findMatchingProduct = (): SupabaseProduct | null => {
    if (!selectedProtein || !selectedSauce) return null;
    if (templateProducts.length === 0) return null;

    const subcategory = selectedSauceData?.dbSubcategory || (riceType === "frito" ? "Classic" : "Curry Amarillo");

    const proteinMapFrito: Record<string, string> = {
      pollo: "con pollo",
      ternera: "con ternera",
      gambas: "con gambas",
      pollo_ternera: "mix 2 con pollo y ternera",
      pollo_gambas: "mix 2 con pollo y gambas",
      ternera_gambas: "mix 2 con ternera y gambas",
      pollo_ternera_gambas: "mix 3 con pollo, ternera y gambas",
    };
    const proteinMapCurry: Record<string, string> = {
      pollo: "y pollo",
      ternera: "y ternera",
      gambas: "y gambas",
      pollo_ternera: "mix 2 con pollo y ternera",
      pollo_gambas: "mix 2 con pollo y gambas",
      ternera_gambas: "mix 2 con ternera y gambas",
      pollo_ternera_gambas: "mix 3 con pollo, ternera y gambas",
    };
    const proteinMap = riceType === "curry" ? proteinMapCurry : proteinMapFrito;
    const pattern = proteinMap[selectedProtein] || "";

    return (
      templateProducts.find(
        (p) =>
          p.subcategory === subcategory &&
          p.name.toLowerCase().includes(pattern.toLowerCase())
      ) ?? null
    );
  };

  const handleAddToCart = () => {
    const baseProduct = findMatchingProduct();
    if (!baseProduct) {
      toast({ title: "Error", description: "Producto no encontrado", variant: "destructive" });
      return;
    }

    const vegNames = selectedVegetables.map((id) => vegetables.find((v) => v.id === id)?.name).filter(Boolean);
    const extNames = selectedExtras.map((id) => { const e = allExtras.find((ex) => ex.id === id); return e ? t(e.nameKey) : null; }).filter(Boolean);
    const allCustomizations = [...vegNames, ...extNames] as string[];

    const customizationData: CustomizationData = {
      customizerType: 'rice',
      drawerVariant: riceType,
      selections: {
        protein: selectedProtein || undefined,
        sauce: selectedSauce || undefined,
        vegetables: selectedVegetables.length ? selectedVegetables : undefined,
        extras: selectedExtras.length ? selectedExtras : undefined,
      },
    };

    const customProduct: SupabaseProductWithCustomization = {
      ...baseProduct,
      name: allCustomizations.length > 0
        ? `${baseProduct.name} + ${allCustomizations.join(", ")}`
        : baseProduct.name,
      price: baseProduct.price + extrasTotal,
      customizations: allCustomizations,
      customizationData,
      ...(editingItem ? { cartItemId: editingItem.cartItemId } : {}),
    };

    onAddToCart(customProduct);
    handleClose();
    toast({
      title: editingItem ? '✅ ' + t('update_item') : '✅ Añadido al carrito',
      description: customProduct.name,
    });
  };

  const stepLabels: Record<Step, string> = {
    protein: t("step_protein"),
    sauce: t("step_sauce"),
    vegetables: t("step_vegetables"),
    extras: t("step_extras"),
    summary: t("order_summary"),
  };

  const canAddToCart = !isLoading && !isError && templateProducts.length > 0;

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="max-h-[90dvh] bg-background">
        {/* Header */}
        <DrawerHeader className="flex items-center justify-between pb-2 border-b border-border">
          <DrawerTitle className="text-lg font-bold">
            {RICE_EMOJI[riceType]} {RICE_LABELS[riceType]}
          </DrawerTitle>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </DrawerHeader>

        {/* Hero multimedia resuelto desde el template */}
        <div className="relative aspect-video bg-black overflow-hidden">
          {videoUrl ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-contain bg-black"
              src={videoUrl}
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={`${RICE_EMOJI[riceType]} ${RICE_LABELS[riceType]}`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain bg-black"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <ImageOff className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto">
          {STEP_ORDER.map((step, i) => {
            const isActive = step === currentStep;
            const isDone = i < stepIndex;
            return (
              <button
                key={step}
                onClick={() => {
                  if (isDone) setCurrentStep(step);
                }}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                  isActive && "bg-primary text-primary-foreground",
                  isDone && "bg-primary/20 text-primary cursor-pointer",
                  !isActive && !isDone && "bg-muted text-muted-foreground"
                )}
              >
                {isDone && <Check className="w-3 h-3" />}
                {stepLabels[step]}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-4 pb-4" style={{ maxHeight: "60dvh" }}>
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

          {canAddToCart && (
            <>
              {/* PROTEIN STEP */}
              {currentStep === "protein" && (
                <div className="space-y-2 pt-2">
                  <p className="text-sm text-muted-foreground mb-3">{t("rice_customizer_description")}</p>
                  {proteins.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleProteinSelect(p.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all",
                        selectedProtein === p.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium text-sm">{p.name}</span>
                      <span className="font-bold text-primary">{p.price.toFixed(2)}€</span>
                    </button>
                  ))}
                </div>
              )}

              {/* SAUCE STEP */}
              {currentStep === "sauce" && (
                <div className="space-y-2 pt-2">
                  <p className="text-sm text-muted-foreground mb-3">{t("sauce_classic_desc")}</p>
                  {sauces.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleSauceSelect(s.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-xl border transition-all",
                        selectedSauce === s.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-full flex-shrink-0", s.color)} />
                      <span className="font-medium text-sm">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* VEGETABLES STEP */}
              {currentStep === "vegetables" && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-3">{t("extra_vegetables_desc")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {vegetables.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => toggleVegetable(v.id)}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-xl border text-center transition-all",
                          selectedVegetables.includes(v.id)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {selectedVegetables.includes(v.id) && (
                          <Check className="w-4 h-4 text-primary mb-1" />
                        )}
                        <span className="text-xs font-medium">{v.name}</span>
                        <span className="text-xs text-primary font-bold">+{v.price.toFixed(2)}€</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={goBack} className="flex-1">
                      ← {t("step_sauce")}
                    </Button>
                    <Button variant="default" size="sm" onClick={goNext} className="flex-1">
                      {t("step_extras")} →
                    </Button>
                  </div>
                </div>
              )}

              {/* EXTRAS STEP */}
              {currentStep === "extras" && (
                <div className="pt-2 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">🥫 {t("extras_title")} - Salsas</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {sauceExtras.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => toggleExtra(e.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-xs transition-all",
                            selectedExtras.includes(e.id)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="font-medium">{t(e.nameKey)}</span>
                          <span className="text-primary font-bold">+{e.price.toFixed(2)}€</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-2">🍱 Complementos</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {complementExtras.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => toggleExtra(e.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border text-xs transition-all",
                            selectedExtras.includes(e.id)
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <span className="font-medium">{t(e.nameKey)}</span>
                          <span className="text-primary font-bold">+{e.price.toFixed(2)}€</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" onClick={goBack} className="flex-1">
                      ← {t("step_vegetables")}
                    </Button>
                    <Button variant="default" size="sm" onClick={goNext} className="flex-1">
                      {t("order_summary")} →
                    </Button>
                  </div>
                </div>
              )}

              {/* SUMMARY STEP */}
              {currentStep === "summary" && (
                <div className="pt-2 space-y-3">
                  <div className="rounded-xl border border-border p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium">Arroz {RICE_LABELS[riceType]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("protein")}:</span>
                      <span className="font-medium">{selectedProteinData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("sauce")}:</span>
                      <span className="font-medium">{selectedSauceData?.name}</span>
                    </div>
                    {selectedVegetables.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("extra_vegetables_label")}:</span>
                        <span className="font-medium text-right max-w-[60%]">
                          {selectedVegetables.map((id) => vegetables.find((v) => v.id === id)?.name).join(", ")}
                        </span>
                      </div>
                    )}
                    {selectedExtras.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t("extras_label")}:</span>
                        <span className="font-medium text-right max-w-[60%]">
                          {selectedExtras.map((id) => { const e = allExtras.find((ex) => ex.id === id); return e ? t(e.nameKey) : ""; }).join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-border pt-2 flex justify-between text-base font-bold">
                      <span>{t("total")}:</span>
                      <span className="text-primary">{totalPrice.toFixed(2)}€</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={goBack} className="flex-1">
                      ← {t("step_extras")}
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      disabled={!canAddToCart}
                      className="flex-1 gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {t("add_to_cart")}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating total bar (visible during customization) */}
        {selectedProtein && currentStep !== "summary" && (
          <div className="sticky bottom-0 border-t border-border bg-background px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("total")}:</span>
            <span className="text-lg font-bold text-primary">{totalPrice.toFixed(2)}€</span>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};
