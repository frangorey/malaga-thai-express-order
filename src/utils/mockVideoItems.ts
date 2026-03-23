import { SupabaseProduct } from "@/types/menu";

const TEMP_VIDEO_URL =
  "https://xqqffccvnpnmdoqowdlc.supabase.co/storage/v1/object/public/Fotos_Thaii/video-hero-web%20(1).mp4";
const TEMP_POSTER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3Crect fill='%23222'/%3E%3C/svg%3E";

interface FeaturedItem {
  product: SupabaseProduct;
  videoUrl: string;
  posterUrl: string;
  tags?: string[];
}

const CATEGORY_CONFIG: Record<string, { count: number; label: string }> = {
  entrantes: { count: 12, label: "Entrantes" },
  arroz: { count: 2, label: "Arroz" },
  tallarines: { count: 4, label: "Tallarines" },
  sopas: { count: 2, label: "Sopas" },
  pokes: { count: 6, label: "Pokes" },
  postres: { count: 2, label: "Postres" },
  ensaladas: { count: 6, label: "Ensaladas" },
  otras: { count: 4, label: "Otras del Mundo" },
  bebidas: { count: 4, label: "Bebidas" },
};

export function getCategoryVideoItems(categoryName: string): FeaturedItem[] {
  const config = CATEGORY_CONFIG[categoryName];
  if (!config) return [];

  return Array.from({ length: config.count }, (_, i) => ({
    product: {
      id: i + 1 + categoryName.charCodeAt(0) * 100,
      name: `${config.label} #${i + 1}`,
      description: `Delicioso plato de ${config.label.toLowerCase()}`,
      price: +(8 + Math.random() * 6).toFixed(2),
      image_url: null,
      category: config.label,
      subcategory: null,
      is_vegetarian: i % 3 === 0,
      is_spicy: i % 4 === 0,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    videoUrl: TEMP_VIDEO_URL,
    posterUrl: TEMP_POSTER,
    tags: i === 0 ? ["⭐ Novedades"] : [],
  }));
}
