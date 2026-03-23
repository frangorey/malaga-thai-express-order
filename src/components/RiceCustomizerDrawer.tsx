import { useState, useCallback, useMemo } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, ShoppingCart, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SupabaseProduct } from "@/types/menu";
import { useProducts } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { allExtras } from "@/data/extrasData";
import { cn } from "@/lib/utils";

interface RiceCustomizerDrawerProps {
  open: boolean;
  onClose: () => void;
  onAddToCart: (product: SupabaseProduct) => void;
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

export const RiceCustomizerDrawer = ({ open, onClose, onAddToCart }: RiceCustomizerDrawerProps) => {
  const { t } = useLanguage();
  const { products } = useProducts();
  const { toast } = useToast();

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

  const sauces: SauceOption[] = [
    { id: "classic", name: t("sauce_classic"), dbSubcategory: "Classic", color: "bg-amber-500" },
    { id: "original", name: t("sauce_original"), dbSubcategory: "Original", color: "bg-green-600" },
    { id: "curry-amarillo", name: t("yellow_curry_sauce"), dbSubcategory: "Curry Amarillo", color: "bg-yellow-400" },
    { id: "curry-verde", name: t("green_curry_sauce"), dbSubcategory: "Curry Verde", color: "bg-emerald-500" },
    { id: "curry-rojo", name: t("red_curry_sauce"), dbSubcategory: "Curry Rojo", color: "bg-red-500" },
  ];

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

  const handleReset = () => {
    setSelectedProtein("");
    setSelectedSauce("");
    setSelectedVegetables([]);
    setSelectedExtras([]);
    setCurrentStep("protein");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const findMatchingProduct = (): SupabaseProduct | null => {
    if (!selectedProtein || !selectedSauce) return null;

    const subcategory = selectedSauceData?.dbSubcategory || "Classic";
    const proteinMap: Record<string, string> = {
      pollo: "pollo",
      ternera: "ternera",
      gambas: "gambas",
      pollo_ternera: "Mix 2 con pollo y ternera",
      pollo_gambas: "Mix 2 con pollo y gambas",
      ternera_gambas: "Mix 2 con ternera y gambas",
      pollo_ternera_gambas: "Mix 3 con pollo, ternera y gambas",
    };
    const pattern = proteinMap[selectedProtein] || "";

    return (
      products.find(
        (p) =>
          p.category === "Arroces" &&
          p.subcategory === subcategory &&
          p.name.toLowerCase().includes(pattern.toLowerCase())
      ) as SupabaseProduct | null
    ) || null;
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

    const customProduct: SupabaseProduct = {
      ...baseProduct,
      name: allCustomizations.length > 0
        ? `${baseProduct.name} + ${allCustomizations.join(", ")}`
        : baseProduct.name,
      price: baseProduct.price + extrasTotal,
      customizations: allCustomizations,
    };

    onAddToCart(customProduct);
    handleClose();
    toast({ title: "✅ Añadido al carrito", description: customProduct.name });
  };

  const stepLabels: Record<Step, string> = {
    protein: t("step_protein"),
    sauce: t("step_sauce"),
    vegetables: t("step_vegetables"),
    extras: t("step_extras"),
    summary: t("order_summary"),
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && handleClose()}>
      <DrawerContent className="max-h-[90dvh] bg-background">
        {/* Header */}
        <DrawerHeader className="flex items-center justify-between pb-2 border-b border-border">
          <DrawerTitle className="text-lg font-bold">
            🍚 {t("rice_customizer_title")}
          </DrawerTitle>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </DrawerHeader>

        {/* Progress steps */}
        <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto">
          {STEP_ORDER.map((step, i) => {
            const isActive = step === currentStep;
            const isDone = i < stepIndex;
            return (
              <button
                key={step}
                onClick={() => {
                  // Only allow going to completed steps or current
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
                <Button onClick={handleAddToCart} className="flex-1 gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  {t("add_to_cart")}
                </Button>
              </div>
            </div>
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
