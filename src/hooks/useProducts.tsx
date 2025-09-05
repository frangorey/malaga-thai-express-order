import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  subcategory: string | null;
  is_vegetarian: boolean;
  is_spicy: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('category', { ascending: true })
          .order('subcategory', { ascending: true })
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        setProducts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Obtener categorías únicas
  const categories = [...new Set(products.map(product => product.category))];

  // Obtener productos por categoría
  const getProductsByCategory = (category: string) => {
    return products.filter(product => product.category === category);
  };

  return {
    products,
    categories,
    loading,
    error,
    getProductsByCategory,
  };
};