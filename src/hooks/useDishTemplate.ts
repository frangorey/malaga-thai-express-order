import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseProduct } from "@/types/menu";
import type { Database } from "@/integrations/supabase/types";

export type DishTemplate = Database["public"]["Tables"]["dish_templates"]["Row"];

export type ProteinKey = "pollo" | "langostino" | "veggie";

export interface DishTemplateBundle {
  template: DishTemplate;
  products: SupabaseProduct[];
}

async function fetchTemplateBundle(slug: string): Promise<DishTemplateBundle | null> {
  const { data: template, error: tErr } = await supabase
    .from("dish_templates")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (tErr) throw tErr;
  if (!template) return null;

  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("*")
    .eq("template_id", template.id)
    .eq("is_available", true);
  if (pErr) throw pErr;

  return { template, products: (products ?? []) as SupabaseProduct[] };
}

export function useDishTemplate(slug: string | null) {
  return useQuery({
    queryKey: ["dish_template", slug],
    queryFn: () => fetchTemplateBundle(slug as string),
    enabled: !!slug,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });
}

export function resolveVariant(
  bundle: DishTemplateBundle | null | undefined,
  protein: ProteinKey,
): SupabaseProduct | null {
  if (!bundle) return null;
  const { products } = bundle;
  if (protein === "veggie") {
    return products.find((p) => p.is_vegetarian === true) ?? null;
  }
  const needle = protein.toLowerCase();
  return products.find((p) => p.name.toLowerCase().includes(needle)) ?? null;
}

export function resolveMedia(bundle: DishTemplateBundle | null | undefined): {
  imageUrl: string | null;
  videoUrl: string | null;
} {
  if (!bundle) return { imageUrl: null, videoUrl: null };
  const { template, products } = bundle;
  const imageUrl =
    template.image_url ??
    products.find((p) => !!p.image_url)?.image_url ??
    null;
  const videoUrl = template.video_url ?? null;
  return { imageUrl, videoUrl };
}
