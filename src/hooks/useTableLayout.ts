import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TablePosition {
  table_number: number;
  x_percent: number;
  y_percent: number;
  section: 'salon' | 'terraza';
  bill_requested: boolean;
  bill_requested_at: string | null;
}

// Default positions (match initial INSERT in DB)
export const DEFAULT_POSITIONS: TablePosition[] = [
  { table_number: 1, x_percent: 10, y_percent: 20, section: 'salon', bill_requested: false, bill_requested_at: null },
  { table_number: 2, x_percent: 30, y_percent: 20, section: 'salon', bill_requested: false, bill_requested_at: null },
  { table_number: 3, x_percent: 50, y_percent: 20, section: 'salon', bill_requested: false, bill_requested_at: null },
  { table_number: 4, x_percent: 70, y_percent: 20, section: 'salon', bill_requested: false, bill_requested_at: null },
  { table_number: 5, x_percent: 90, y_percent: 20, section: 'salon', bill_requested: false, bill_requested_at: null },
  { table_number: 6, x_percent: 10, y_percent: 20, section: 'terraza', bill_requested: false, bill_requested_at: null },
  { table_number: 7, x_percent: 22, y_percent: 20, section: 'terraza', bill_requested: false, bill_requested_at: null },
  { table_number: 8, x_percent: 34, y_percent: 20, section: 'terraza', bill_requested: false, bill_requested_at: null },
  { table_number: 9, x_percent: 46, y_percent: 20, section: 'terraza', bill_requested: false, bill_requested_at: null },
  { table_number: 10, x_percent: 58, y_percent: 20, section: 'terraza', bill_requested: false, bill_requested_at: null },
  { table_number: 11, x_percent: 70, y_percent: 20, section: 'terraza', bill_requested: false, bill_requested_at: null },
  { table_number: 12, x_percent: 82, y_percent: 20, section: 'terraza', bill_requested: false, bill_requested_at: null },
  { table_number: 13, x_percent: 10, y_percent: 60, section: 'terraza', bill_requested: false, bill_requested_at: null },
  { table_number: 14, x_percent: 22, y_percent: 60, section: 'terraza', bill_requested: false, bill_requested_at: null },
];

export const useTableLayout = (options?: { realtime?: boolean }) => {
  const [layout, setLayout] = useState<TablePosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLayout = useCallback(async () => {
    const { data, error } = await supabase
      .from('table_layout')
      .select('table_number, x_percent, y_percent, section, bill_requested, bill_requested_at')
      .order('table_number');

    if (error) {
      console.error('Error fetching table layout:', error);
      toast.error('Error al cargar el plano de mesas');
      setLayout(DEFAULT_POSITIONS);
    } else {
      setLayout(
        ((data || []) as any[]).map((r) => ({
          table_number: r.table_number,
          x_percent: Number(r.x_percent),
          y_percent: Number(r.y_percent),
          section: r.section as 'salon' | 'terraza',
          bill_requested: !!r.bill_requested,
          bill_requested_at: r.bill_requested_at,
        }))
      );
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  // Optional realtime subscription on table_layout
  useEffect(() => {
    if (!options?.realtime) return;
    const channel = supabase
      .channel('table-layout-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'table_layout' },
        () => fetchLayout()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [options?.realtime, fetchLayout]);

  const updatePosition = useCallback(
    async (tableNumber: number, x: number, y: number) => {
      // Optimistic update
      setLayout((prev) =>
        prev.map((p) =>
          p.table_number === tableNumber ? { ...p, x_percent: x, y_percent: y } : p
        )
      );

      const { error } = await supabase
        .from('table_layout')
        .update({ x_percent: x, y_percent: y, updated_at: new Date().toISOString() })
        .eq('table_number', tableNumber);

      if (error) {
        console.error('Error updating table position:', error);
        toast.error(`Error al guardar mesa ${tableNumber}`);
        fetchLayout();
      }
    },
    [fetchLayout]
  );

  const resetToDefaults = useCallback(async () => {
    setIsLoading(true);
    const updates = await Promise.all(
      DEFAULT_POSITIONS.map((p) =>
        supabase
          .from('table_layout')
          .update({
            x_percent: p.x_percent,
            y_percent: p.y_percent,
            updated_at: new Date().toISOString(),
          })
          .eq('table_number', p.table_number)
      )
    );

    const failed = updates.filter((u) => u.error);
    if (failed.length > 0) {
      toast.error('Error al restaurar algunas mesas');
    } else {
      toast.success('Posiciones restauradas');
    }
    await fetchLayout();
  }, [fetchLayout]);

  const getPosition = useCallback(
    (tableNumber: number): TablePosition => {
      return (
        layout.find((p) => p.table_number === tableNumber) ||
        DEFAULT_POSITIONS.find((p) => p.table_number === tableNumber) || {
          table_number: tableNumber,
          x_percent: 50,
          y_percent: 50,
          section: 'salon',
          bill_requested: false,
          bill_requested_at: null,
        }
      );
    },
    [layout]
  );

  const clearBillRequest = useCallback(
    async (tableNumber: number) => {
      const { error } = await supabase
        .from('table_layout')
        .update({ bill_requested: false, bill_requested_at: null })
        .eq('table_number', tableNumber);
      if (error) {
        toast.error(`Error al limpiar mesa ${tableNumber}`);
      } else {
        fetchLayout();
      }
    },
    [fetchLayout]
  );

  return { layout, isLoading, updatePosition, resetToDefaults, getPosition, refetch: fetchLayout, clearBillRequest };
};
