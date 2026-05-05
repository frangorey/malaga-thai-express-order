import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MainCategoriesNav } from "@/components/MainCategoriesNav";
import { TikTokStyleMenu, FeaturedItem } from "@/components/TikTokStyleMenu";
import { Cart, SupabaseCartItem, SupabaseProductWithCustomization } from "@/components/Cart";
// import { Footer } from "@/components/Footer";
import { RiceCustomizerDrawer, RiceType } from "@/components/RiceCustomizerDrawer";
import { NoodleCustomizerDrawer, NoodleType } from "@/components/NoodleCustomizerDrawer";
import { SaladCustomizerDrawer, SaladType } from "@/components/SaladCustomizerDrawer";
import { TonkatsuCustomizerDrawer } from "@/components/TonkatsuCustomizerDrawer";
import { PolloCoreanoCustomizerDrawer } from "@/components/PolloCoreanoCustomizerDrawer";
import { PadKaPraoCustomizerDrawer } from "@/components/PadKaPraoCustomizerDrawer";
import { SupabaseProduct } from "@/types/menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { useDishTemplates } from "@/hooks/useDishTemplates";
import type { DishTemplate } from "@/hooks/useDishTemplate";

const FALLBACK_VIDEO_URL =
  "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/video-hero-web%20(1).mp4";

const CATEGORY_MAP: Record<string, string> = {
  entrantes: "Entrantes",
  arroz: "Arroces",
  tallarines: "Tallarines",
  sopas: "Sopas",
  pokes: "Pokes",
  postres: "Postres",
  ensaladas: "Ensaladas",
  otras: "Otras del Mundo",
  bebidas: "Bebidas",
};

function toSupabaseProduct(p: ReturnType<typeof useProducts>["products"][number]): SupabaseProduct {
  return {
    ...p,
    description: p.description ?? "",
    is_vegetarian: p.is_vegetarian ?? false,
    is_spicy: p.is_spicy ?? false,
    is_available: p.is_available ?? true,
    created_at: p.created_at ?? new Date().toISOString(),
    updated_at: p.updated_at ?? new Date().toISOString(),
  } as SupabaseProduct;
}

const PLACEHOLDER_POSTER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23222'/%3E%3C/svg%3E";

const Index = () => {
  const { t } = useLanguage();
  const [cartItems, setCartItems] = useState<SupabaseCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("arroz");
  const [isViewingFeed, setIsViewingFeed] = useState(false);
  const [riceCustomizer, setRiceCustomizer] = useState<{ open: boolean; type: RiceType }>({ open: false, type: "frito" });
  const [noodleCustomizer, setNoodleCustomizer] = useState<{ open: boolean; type: NoodleType }>({ open: false, type: "Anchos" });
  const [saladCustomizer, setSaladCustomizer] = useState<{ open: boolean; type: SaladType }>({ open: false, type: "cesar" });
  const [tonkatsuDrawerOpen, setTonkatsuDrawerOpen] = useState(false);
  const [polloCoreanoDrawerOpen, setPolloCoreanoDrawerOpen] = useState(false);
  const [padKaPraoDrawerOpen, setPadKaPraoDrawerOpen] = useState(false);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const EDIT_ENABLED: Record<'noodle'|'rice'|'salad'|'tonkatsu'|'pollo_coreano'|'pad_ka_prao', boolean> = {
    noodle: true, rice: true, salad: true, tonkatsu: true, pollo_coreano: true, pad_ka_prao: true,
  };
  const [searchParams] = useSearchParams();
  const { products, loading } = useProducts();
  const { data: dishTemplates } = useDishTemplates();

  const templatesBySlug = useMemo(() => {
    const map = new Map<string, DishTemplate>();
    (dishTemplates ?? []).forEach((tpl) => map.set(tpl.slug, tpl));
    return map;
  }, [dishTemplates]);

  const mesaParam = searchParams.get('mesa');
  const tableNumber = mesaParam ? parseInt(mesaParam, 10) : null;
  const validTableNumber = tableNumber && tableNumber >= 1 && tableNumber <= 14 ? tableNumber : null;

  const NOODLE_CARDS: { type: NoodleType; displayNameKey: string; videoUrl: string | null; emoji: string }[] = [
    { type: "Anchos", displayNameKey: "noodles_pad_thai", videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/padthaii-video.mp4", emoji: "🍜" },
    { type: "Finos", displayNameKey: "noodles_finos_card", videoUrl: FALLBACK_VIDEO_URL, emoji: "🥢" },
    { type: "Glass", displayNameKey: "noodles_glass_card", videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/glass-videotiktok.mp4", emoji: "✨" },
    { type: "Udon", displayNameKey: "noodles_udon_card", videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/udon-video.mp4", emoji: "🍲" },
  ];

  const RICE_CARDS: { type: RiceType; subcategoryAnchor: string; displayNameKey: string; emoji: string; videoUrl: string | null }[] = [
    { type: "frito", subcategoryAnchor: "Classic",        displayNameKey: "rice_fried_card", emoji: "🍚", videoUrl: "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/arroz-video.mp4" },
    { type: "curry", subcategoryAnchor: "Curry Amarillo", displayNameKey: "rice_curry_card", emoji: "🍛", videoUrl: null },
  ];

  const VARIANT_GROUPS: Record<string, { displayNameKey: string; ids: number[]; labelKeys: Record<number, string> }> = {
    edamame: { displayNameKey: "variant_edamame", ids: [206, 207], labelKeys: { 206: "variant_edamame", 207: "variant_edamame_spicy" } },
    gyozas: { displayNameKey: "variant_gyozas", ids: [202, 203], labelKeys: { 202: "variant_fried", 203: "variant_grilled" } },
    pinchito_langostino: { displayNameKey: "variant_pinchito_shrimp", ids: [194, 195], labelKeys: { 194: "variant_1_unit", 195: "variant_2_units" } },
    pinchito_pollo: { displayNameKey: "variant_pinchito_chicken", ids: [192, 193], labelKeys: { 192: "variant_1_unit", 193: "variant_2_units" } },
  };

  const SOUP_CARDS: { slug: string; displayNameKey: string; emoji: string }[] = [
    { slug: "sopa_tom_yam", displayNameKey: "soup_tom_yam", emoji: "🍲" },
    { slug: "sopa_miso",    displayNameKey: "soup_miso",    emoji: "🍜" },
  ];

  type WorldCard =
    | { kind: "template"; slug: string; displayNameKey: string; emoji: string; onCustomize: () => void }
    | { kind: "standalone"; productId: number; displayNameKey: string; emoji: string };

  const WORLD_CARDS: WorldCard[] = [
    { kind: "template", slug: "tonkatsu", displayNameKey: "world_tonkatsu_card", emoji: "🍱", onCustomize: () => setTonkatsuDrawerOpen(true) },
    { kind: "template", slug: "pollo_coreano", displayNameKey: "world_pollo_coreano_card", emoji: "🍗", onCustomize: () => setPolloCoreanoDrawerOpen(true) },
    { kind: "template", slug: "pad_ka_prao", displayNameKey: "world_pad_ka_prao_card", emoji: "🌶️", onCustomize: () => setPadKaPraoDrawerOpen(true) },
    { kind: "standalone", productId: 269, displayNameKey: "world_curry_pina_card", emoji: "🍍" },
  ];

  const SALAD_CARDS: { type: SaladType; slug: string; displayNameKey: string; emoji: string }[] = [
    { type: "cesar",      slug: "ensalada_cesar",      displayNameKey: "salad_cesar_card",      emoji: "🥗" },
    { type: "classic",    slug: "ensalada_classic",    displayNameKey: "salad_classic_card",    emoji: "🥗" },
    { type: "crispy",     slug: "ensalada_crispy",     displayNameKey: "salad_crispy_card",     emoji: "🥗" },
    { type: "fruta",      slug: "ensalada_fruta",      displayNameKey: "salad_fruta_card",      emoji: "🥗" },
    { type: "malaysia",   slug: "ensalada_malaysia",   displayNameKey: "salad_malaysia_card",   emoji: "🥗" },
    { type: "thailandia", slug: "ensalada_thailandia", displayNameKey: "salad_thailandia_card", emoji: "🥗" },
  ];

  const videoItems = useMemo(() => {
    const dbCategory = CATEGORY_MAP[activeCategory];
    if (!dbCategory) return [];

    const categoryProducts = products.filter((p) => p.category === dbCategory);

    // ARROCES: 2 cards (Frito, Curry) — patrón análogo a NOODLE_CARDS
    if (dbCategory === "Arroces") {
      return RICE_CARDS.map((rc) => {
        const anchor = categoryProducts.find((p) => p.subcategory === rc.subcategoryAnchor);
        if (!anchor) return null;
        return {
          product: toSupabaseProduct(anchor),
          videoUrl: rc.videoUrl,
          posterUrl: anchor.image_url || PLACEHOLDER_POSTER,
          imageUrl: anchor.image_url,
          tags: [] as string[],
          displayName: `${rc.emoji} ${t(rc.displayNameKey)}`,
          onCustomize: () => setRiceCustomizer({ open: true, type: rc.type }),
          customizeLabel: `${t("customize")} ${rc.emoji}`,
        } as FeaturedItem;
      }).filter(Boolean) as FeaturedItem[];
    }

    // TALLARINES: 4 cards, one per noodle type
    if (dbCategory === "Tallarines") {
      return NOODLE_CARDS.map((nc) => {
        const firstProduct = categoryProducts.find((p) => p.subcategory === nc.type);
        const product = firstProduct ? toSupabaseProduct(firstProduct) : toSupabaseProduct(categoryProducts[0]);
        return {
          product,
          videoUrl: nc.videoUrl,
          posterUrl: firstProduct?.image_url || PLACEHOLDER_POSTER,
          imageUrl: firstProduct?.image_url ?? null,
          tags: [],
          displayName: `${nc.emoji} ${t('tallarines')} ${t(nc.displayNameKey)}`,
          onCustomize: () => setNoodleCustomizer({ open: true, type: nc.type }),
          customizeLabel: `${t('customize')} ${nc.emoji}`,
        } as FeaturedItem;
      }).filter(Boolean);
    }

    // SOPAS: 2 cards with protein variants
    if (dbCategory === "Sopas") {
      const items: FeaturedItem[] = [];
      for (const sc of SOUP_CARDS) {
        const template = templatesBySlug.get(sc.slug);
        if (!template) continue;
        const groupProducts = categoryProducts.filter((p) => p.template_id === template.id);
        if (groupProducts.length === 0) continue;
        const primary = groupProducts[0];
        items.push({
          product: toSupabaseProduct(primary),
          videoUrl: template.video_url ?? primary.video_url ?? null,
          posterUrl: template.image_url || primary.image_url || PLACEHOLDER_POSTER,
          imageUrl: template.image_url ?? primary.image_url,
          tags: [],
          displayName: `${sc.emoji} ${t(sc.displayNameKey)}`,
          variants: groupProducts.map((p) => {
            let proteinKey = "";
            if (p.is_vegetarian === true) proteinKey = "soup_veggie_label";
            else if (p.name.toLowerCase().includes("langostino")) proteinKey = "soup_prawn_label";
            else if (p.name.toLowerCase().includes("pollo")) proteinKey = "soup_chicken_label";
            return {
              product: toSupabaseProduct(p),
              label: proteinKey
                ? `${t(proteinKey)} — ${p.price.toFixed(2)}€`
                : `${p.name} — ${p.price.toFixed(2)}€`,
            };
          }),
        });
      }
      return items;
    }

    // ENTRANTES: grouped variants
    if (dbCategory === "Entrantes") {
      const items: FeaturedItem[] = [];
      const processedIds = new Set<number>();

      for (const group of Object.values(VARIANT_GROUPS)) {
        const groupProducts = categoryProducts.filter((p) => group.ids.includes(p.id));
        if (groupProducts.length === 0) continue;
        groupProducts.forEach((p) => processedIds.add(p.id));
        const primary = groupProducts[0];
        items.push({
          product: toSupabaseProduct(primary),
          videoUrl: primary.video_url ?? null,
          posterUrl: primary.image_url || PLACEHOLDER_POSTER,
          imageUrl: primary.image_url,
          tags: [],
          displayName: t(group.displayNameKey),
          variants: groupProducts.map((p) => ({
            product: toSupabaseProduct(p),
            label: t(group.labelKeys[p.id] || ''),
          })),
        });
      }

      for (const p of categoryProducts) {
        if (processedIds.has(p.id)) continue;
        items.push({
          product: toSupabaseProduct(p),
          videoUrl: p.video_url ?? null,
          posterUrl: p.image_url || PLACEHOLDER_POSTER,
          imageUrl: p.image_url,
          tags: [],
        });
      }
      return items;
    }

    // ENSALADAS: 6 cards (one per subcategoría) con drawer de proteína
    if (dbCategory === "Ensaladas") {
      const items: FeaturedItem[] = [];
      for (const sc of SALAD_CARDS) {
        const template = templatesBySlug.get(sc.slug);
        if (!template) continue;
        const groupProducts = categoryProducts.filter((p) => p.template_id === template.id);
        if (groupProducts.length === 0) continue;
        const primary = groupProducts.find((p) => p.is_vegetarian === true) ?? groupProducts[0];
        items.push({
          product: toSupabaseProduct(primary),
          videoUrl: null,
          posterUrl: template.image_url || primary.image_url || PLACEHOLDER_POSTER,
          imageUrl: template.image_url ?? primary.image_url,
          tags: [],
          displayName: `${sc.emoji} ${t(sc.displayNameKey)}`,
          onCustomize: () => setSaladCustomizer({ open: true, type: sc.type }),
          customizeLabel: `${t("customize")} ${sc.emoji}`,
        } as FeaturedItem);
      }
      return items;
    }

    // OTRAS DEL MUNDO: 4 cards (2 templates + 2 standalone)
    if (dbCategory === "Otras del Mundo") {
      const items: FeaturedItem[] = [];
      for (const wc of WORLD_CARDS) {
        if (wc.kind === "template") {
          const template = templatesBySlug.get(wc.slug);
          if (!template) continue;
          const groupProducts = categoryProducts.filter((p) => p.template_id === template.id);
          if (groupProducts.length === 0) continue;
          const primary = groupProducts[0];
          items.push({
            product: toSupabaseProduct(primary),
            videoUrl: template.video_url ?? null,
            posterUrl: template.image_url || primary.image_url || PLACEHOLDER_POSTER,
            imageUrl: template.image_url ?? primary.image_url,
            tags: [],
            displayName: `${wc.emoji} ${t(wc.displayNameKey)}`,
            onCustomize: wc.onCustomize,
            customizeLabel: `${t("customize")} ${wc.emoji}`,
          } as FeaturedItem);
        } else {
          const product = categoryProducts.find((p) => p.id === wc.productId);
          if (!product) continue;
          items.push({
            product: toSupabaseProduct(product),
            videoUrl: product.video_url ?? null,
            posterUrl: product.image_url || PLACEHOLDER_POSTER,
            imageUrl: product.image_url,
            tags: [],
            displayName: `${wc.emoji} ${t(wc.displayNameKey)}`,
          } as FeaturedItem);
        }
      }
      return items;
    }

    // Default: one card per product
    return categoryProducts.map((p) => ({
      product: toSupabaseProduct(p),
      videoUrl: p.video_url ?? null,
      posterUrl: p.image_url || PLACEHOLDER_POSTER,
      imageUrl: p.image_url,
      tags: [] as string[],
    }));
  }, [products, activeCategory, t, templatesBySlug]);

  const customizationsEqual = (a?: string[], b?: string[]): boolean => {
    const arrA = (a || []).slice().sort();
    const arrB = (b || []).slice().sort();
    if (arrA.length !== arrB.length) return false;
    return arrA.every((v, i) => v === arrB[i]);
  };

  const handleEditItem = (cartItemId: string) => {
    const item = cartItems.find(i => i.cartItemId === cartItemId);
    if (!item?.customizationData) return;
    const cd = item.customizationData;
    if (!EDIT_ENABLED[cd.customizerType]) return;
    setEditingCartItemId(cartItemId);
    setIsCartOpen(false);
    switch (cd.customizerType) {
      case 'noodle':
        setNoodleCustomizer({ open: true, type: ((cd.drawerVariant as NoodleType) ?? 'Anchos') });
        break;
      case 'rice':
        setRiceCustomizer({ open: true, type: ((cd.drawerVariant as RiceType) ?? 'frito') });
        break;
      case 'salad':
        setSaladCustomizer({ open: true, type: ((cd.drawerVariant as SaladType) ?? 'cesar') });
        break;
      case 'tonkatsu':
        setTonkatsuDrawerOpen(true);
        break;
      case 'pollo_coreano':
        setPolloCoreanoDrawerOpen(true);
        break;
      case 'pad_ka_prao':
        setPadKaPraoDrawerOpen(true);
        break;
    }
  };

  const handleCancelEdit = () => {
    setEditingCartItemId(null);
    setIsCartOpen(true);
  };

  const addToCart = (product: SupabaseProductWithCustomization) => {
    setCartItems(prev => {
      if (editingCartItemId) {
        const original = prev.find(i => i.cartItemId === editingCartItemId);
        const preservedQty = original?.quantity ?? 1;
        return prev.map(item =>
          item.cartItemId === editingCartItemId
            ? {
                ...product,
                quantity: preservedQty,
                customizations: product.customizations,
                customizationData: product.customizationData,
                cartItemId: editingCartItemId,
              } as SupabaseCartItem
            : item
        );
      }
      const incomingCustomizations = product.customizations;
      const incomingCustomizationData = product.customizationData;
      const existing = prev.find(item =>
        item.id === product.id &&
        item.name === product.name &&
        item.price === product.price &&
        customizationsEqual(item.customizations, incomingCustomizations)
      );
      if (existing) {
        return prev.map(item =>
          item.cartItemId === existing.cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          customizations: incomingCustomizations,
          customizationData: incomingCustomizationData,
          cartItemId: crypto.randomUUID(),
        } as SupabaseCartItem,
      ];
    });
    if (editingCartItemId) {
      setEditingCartItemId(null);
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(cartItemId); return; }
    setCartItems(prev => prev.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    ));
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const handleOrderClick = () => {
    setActiveCategory("arroz");
    setIsViewingFeed(true);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setIsViewingFeed(true);
  };

  const handleGoHome = () => {
    setIsViewingFeed(false);
  };

  return (
    <main className="h-[100dvh] w-full flex flex-col bg-background overflow-hidden">
      {/* Header — always visible */}
      <div className="flex-none z-50">
        <Header
          cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          onCartClick={() => setIsCartOpen(true)}
          onLogoClick={isViewingFeed ? handleGoHome : undefined}
        />

        {validTableNumber && (
          <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
            🍽️ {t('ordering_from_table')} {validTableNumber}
          </div>
        )}
      </div>

      {/* Conditional view: Home vs Immersive Feed */}
      {!isViewingFeed ? (
        /* HOME VIEW */
        <div className="flex-1 overflow-y-auto">
          <Hero onOrderClick={handleOrderClick} />

          <MainCategoriesNav
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      ) : (
        /* IMMERSIVE FEED VIEW */
        <div className="flex-1 min-h-0 w-full bg-black relative">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
          ) : (
            <TikTokStyleMenu
              items={videoItems}
              onAddToCart={addToCart}
              activeCategory={activeCategory}
              onCategoryChange={handleCategoryChange}
            />
          )}
        </div>
      )}

      {/* Footer hidden for app-like layout */}

      {isCartOpen && (
        <Cart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          tableNumber={validTableNumber}
          onEditItem={handleEditItem}
        />
      )}

      <RiceCustomizerDrawer
        open={riceCustomizer.open}
        onClose={() => { setRiceCustomizer((prev) => ({ ...prev, open: false })); if (editingCartItemId) handleCancelEdit(); }}
        onAddToCart={addToCart}
        riceType={riceCustomizer.type}
      />

      <NoodleCustomizerDrawer
        open={noodleCustomizer.open}
        onClose={() => { setNoodleCustomizer((prev) => ({ ...prev, open: false })); if (editingCartItemId) handleCancelEdit(); }}
        onAddToCart={addToCart}
        noodleType={noodleCustomizer.type}
      />

      <SaladCustomizerDrawer
        open={saladCustomizer.open}
        onClose={() => { setSaladCustomizer((prev) => ({ ...prev, open: false })); if (editingCartItemId) handleCancelEdit(); }}
        onAddToCart={addToCart}
        saladType={saladCustomizer.type}
      />

      <TonkatsuCustomizerDrawer
        open={tonkatsuDrawerOpen}
        onClose={() => { setTonkatsuDrawerOpen(false); if (editingCartItemId) handleCancelEdit(); }}
        onAddToCart={addToCart}
      />

      <PolloCoreanoCustomizerDrawer
        open={polloCoreanoDrawerOpen}
        onClose={() => { setPolloCoreanoDrawerOpen(false); if (editingCartItemId) handleCancelEdit(); }}
        onAddToCart={addToCart}
      />

      <PadKaPraoCustomizerDrawer
        open={padKaPraoDrawerOpen}
        onClose={() => { setPadKaPraoDrawerOpen(false); if (editingCartItemId) handleCancelEdit(); }}
        onAddToCart={addToCart}
      />

      {validTableNumber && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-primary/30 py-3 px-4">
          <div className="flex items-center justify-between gap-3 max-w-2xl mx-auto">
            <span className="neon-text font-bold text-sm sm:text-base">
              🍽️ {t('ordering_from_table') ? `Mesa ${validTableNumber}` : `Mesa ${validTableNumber}`}
            </span>
            <Link to={`/mesa/${validTableNumber}`}>
              <Button variant="neon" size="sm">
                Ver pedidos y cuenta →
              </Button>
            </Link>
          </div>
        </div>
      )}
    </main>
  );
};

export default Index;
