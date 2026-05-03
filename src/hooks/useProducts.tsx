import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
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
}

const CACHE_KEY = 'thaii_menu_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  data: Product[];
  timestamp: number;
}

function readCache(): Product[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CacheEntry = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: Product[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // ignore quota errors
  }
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(() => readCache() || []);
  const [loading, setLoading] = useState(() => readCache() === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cached = readCache();

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('category', { ascending: true })
          .order('subcategory', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;
        if (cancelled) return;

        const fresh = data || [];
        setProducts(fresh);
        writeCache(fresh);
      } catch (err) {
        if (cancelled) return;
        // Si hay cache, no pisar la UI con error
        if (!cached) {
          setError(err instanceof Error ? err.message : 'Error al cargar productos');
        }
        console.error('Error fetching products:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, []);

  const categories = [...new Set(products.map(product => product.category))];
  const getProductsByCategory = (category: string) => products.filter(p => p.category === category);

  return { products, categories, loading, error, getProductsByCategory };
};
