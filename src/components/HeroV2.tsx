import { useMemo } from "react";
import { SushiConveyorMenu, ConveyorDish, DishTier } from "@/components/ui/sushi-conveyor-menu";
import { useDishTemplates } from "@/hooks/useDishTemplates";
import { useHeroCategories } from "@/hooks/useHeroCategories";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * HeroV2 - cinta transportadora de las 9 categorias de Thaii Express.
 *
 * Decisiones cerradas (Arquitecto Thaii v2.1 + Musa + Fran, 2026-11-24):
 *  - 9 platos = 9 categorias reales de MainCategoriesNav (NO modifica esa nav).
 *  - Opcion B (mixta): Tallarines / Arroz / Ensaladas abren CustomizerDrawer directo (2 taps al pedido).
 *    Resto (Entrantes, Sopas, Pokes, Postres, Otras del Mundo, Bebidas) van a feed inmersivo filtrado.
 *  - Tier 1..5 usado solo como identidad visual por categoria (sin leyenda de picante).
 *    Elimina riesgo WCAG 1.4.1 y confusion por categoria.
 *  - Dialog interno del template eliminado (ver sushi-conveyor-menu.tsx): 1 tap = accion directa.
 *  - Imagenes: fuente de verdad en tabla hero_categories (1 fila por slug).
 *    Orden de fallback:
 *      1) hero_categories.image_url (PNG top-down transparent en Storage Fotos_Thaii/hero-v2/)
 *      2) dish_templates.image_url (via REPRESENTATIVE_SLUG, para transicion)
 *      3) /placeholder.svg (ultimo recurso)
 *  - Feature flag HERO_V2_ENABLED en Index.tsx (VITE_HERO_V2_ENABLED): por defecto OFF en produccion.
 */

export type HeroV2CategoryId =
  | "entrantes"
  | "arroz"
  | "tallarines"
  | "sopas"
  | "pokes"
  | "postres"
  | "ensaladas"
  | "otras"
  | "bebidas";

interface HeroV2Props {
  onCategoryClick: (id: HeroV2CategoryId) => void;
}

// Slug representativo en dish_templates por categoria (fallback cuando hero_categories.image_url es NULL).
// null = aun no hay template con imagen propia para esa categoria -> cae al placeholder.
const REPRESENTATIVE_SLUG: Record<HeroV2CategoryId, string | null> = {
  entrantes: null,
  arroz: "arroz_frito",
  tallarines: "tallarines_anchos",
  sopas: null,
  pokes: null,
  postres: null,
  ensaladas: "ensalada_classic",
  otras: "tonkatsu", // Tonkatsu como representante visual de "Otras del Mundo"
  bebidas: null,
};

// Tier por categoria (identidad visual, NO picante). Rotamos 1..5 para contraste visual entre vecinos.
const TIER_BY_CATEGORY: Record<HeroV2CategoryId, DishTier> = {
  entrantes: 2,
  arroz: 1,
  tallarines: 3,
  sopas: 4,
  pokes: 2,
  postres: 5,
  ensaladas: 1,
  otras: 3,
  bebidas: 4,
};

const CATEGORY_ORDER: HeroV2CategoryId[] = [
  "entrantes",
  "arroz",
  "tallarines",
  "sopas",
  "pokes",
  "postres",
  "ensaladas",
  "otras",
  "bebidas",
];

// Fallback final cuando ni hero_categories ni dish_templates tienen imagen.
const FALLBACK_IMG = "/placeholder.svg";

export function HeroV2({ onCategoryClick }: HeroV2Props) {
  const { t } = useLanguage();
  const { data: templates } = useDishTemplates();
  const { data: heroCats } = useHeroCategories();

  const items: ConveyorDish[] = useMemo(() => {
    // Indexar hero_categories por slug para resolver imagen top-down
    const heroBySlug = new Map(
      (heroCats ?? []).map((row) => [row.slug, row])
    );

    // Indexar dish_templates por slug para fallback
    const templatesBySlug = new Map(
      (templates ?? []).map((tpl: { slug: string; image_url: string | null }) => [tpl.slug, tpl])
    );

    // Orden de fallback:
    //   1) hero_categories.image_url (imagen top-down transparent definitiva)
    //   2) dish_templates.image_url via REPRESENTATIVE_SLUG (temporal)
    //   3) /placeholder.svg
    const resolveImg = (categoryId: HeroV2CategoryId): string => {
      const heroImg = heroBySlug.get(categoryId)?.image_url;
      if (heroImg) return heroImg;

      const templateSlug = REPRESENTATIVE_SLUG[categoryId];
      if (templateSlug) {
        const tplImg = templatesBySlug.get(templateSlug)?.image_url;
        if (tplImg) return tplImg;
      }

      return FALLBACK_IMG;
    };

    return CATEGORY_ORDER.map((id) => ({
      id,
      tier: TIER_BY_CATEGORY[id],
      name: t(`hero_v2_cat_${id}`),
      description: t(`hero_v2_desc_${id}`),
      price: t(`hero_v2_price_from_${id}`),
      image: resolveImg(id),
    }));
  }, [templates, heroCats, t]);

  return (
    <section className="w-full bg-background">
      <SushiConveyorMenu
        items={items}
        eyebrow={t("hero_v2_eyebrow")}
        heading={t("hero_v2_heading")}
        caption={t("hero_v2_caption")}
        speed={26}
        autoplay
        interval={5000}
        onAdd={(dish) => onCategoryClick(dish.id as HeroV2CategoryId)}
        labels={{
          add: t("hero_v2_label_add"),
          close: t("hero_v2_label_close"),
          previous: t("hero_v2_label_prev"),
          next: t("hero_v2_label_next"),
          pause: t("hero_v2_label_pause"),
        }}
      />
    </section>
  );
}

export default HeroV2;
