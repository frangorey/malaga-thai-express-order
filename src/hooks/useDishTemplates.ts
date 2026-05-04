import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DishTemplate } from "@/hooks/useDishTemplate";

export function useDishTemplates() {
  return useQuery({
    queryKey: ["dish_templates", "all"],
    queryFn: async (): Promise<DishTemplate[]> => {
      const { data, error } = await supabase
        .from("dish_templates")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []) as DishTemplate[];
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
  });
}
