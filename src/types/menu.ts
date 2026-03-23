export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  spicy?: boolean;
  vegetarian?: boolean;
  customizable?: boolean;
}

// Nueva interfaz para productos de Supabase
export interface SupabaseProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  video_url: string | null;
  category: string;
  subcategory: string | null;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  customizations?: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  customizations?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  items: MenuItem[];
}