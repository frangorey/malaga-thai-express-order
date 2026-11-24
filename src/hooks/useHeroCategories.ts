import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hero v2 - fuente de verdad de las 9 imagenes top-down del SushiConveyorMenu.
 *
 * Tabla hero_categories: 1 fila por categoria (slug = HeroV2CategoryId).
 * image_url NULL = aun no subida -> HeroV2 hace fallback a dish_templates.image_url.
 *
 * Nota: tipo local hasta que supabase gen types regenere Database["public"]["Tables"]["hero_categories"].
 */
export interface HeroCategoryRow {
  slug: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
}

export function useHeroCategories() {
  return useQuery({
    queryKey: ["hero_categories", "active"],
    queryFn: async (): Promise<HeroCategoryRow[]> => {
      const { data, error } = await supabase
        .from("hero_categories" as never)
        .select("slug, image_url, display_order, is_active")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as HeroCategoryRow[];
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });
}
