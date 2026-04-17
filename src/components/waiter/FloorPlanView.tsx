import { useMemo } from 'react';
import { format } from 'date-fns';
import TableCard, { TableStatus } from './TableCard';
import { useTableLayout } from '@/hooks/useTableLayout';

interface Order {
  id: string;
  order_number: string;
  order_type: string;
  order_status: string;
  table_number: number | null;
  total_amount: number;
  confirmed_at: string | null;
  created_at: string;
  [key: string]: any;
}

interface FloorPlanViewProps {
  orders: Order[];
  onSelectTable: (n: number) => void;
}

const SALON = [1, 2, 3, 4, 5];
const TERRAZA = [6, 7, 8, 9, 10, 11, 12, 13, 14];

// Worse status wins
const STATUS_PRIORITY: Record<TableStatus, number> = {
  received: 5,
  confirmed: 4,
  preparing: 3,
  ready: 2,
  free: 1,
};

const FloorPlanView = ({ orders, onSelectTable }: FloorPlanViewProps) => {
  const { getPosition } = useTableLayout();

  const tableMap = useMemo(() => {
    const map = new Map<number, {
      status: TableStatus;
      ordersCount: number;
      total: number;
      latestTime: string | null;
      pendingCount: number;
    }>();

    const dineIn = orders.filter(o => o.order_type === 'dine_in' && o.table_number);

    for (const o of dineIn) {
      const t = o.table_number!;
      const current = map.get(t) || {
        status: 'free' as TableStatus,
        ordersCount: 0,
        total: 0,
        latestTime: null as string | null,
        pendingCount: 0,
      };

      const orderStatus = (['received', 'confirmed', 'preparing', 'ready'].includes(o.order_status)
        ? o.order_status
        : 'free') as TableStatus;

      if (STATUS_PRIORITY[orderStatus] > STATUS_PRIORITY[current.status]) {
        current.status = orderStatus;
      }
      current.ordersCount += 1;
      current.total += Number(o.total_amount) || 0;
      if (o.order_status === 'received' && !o.confirmed_at) current.pendingCount += 1;

      const t2 = format(new Date(o.created_at), 'HH:mm');
      if (!current.latestTime || new Date(o.created_at) > new Date(`1970-01-01T${current.latestTime}`)) {
        current.latestTime = t2;
      }
      map.set(t, current);
    }

    return map;
  }, [orders]);

  const renderTable = (n: number) => {
    const data = tableMap.get(n) || {
      status: 'free' as TableStatus,
      ordersCount: 0,
      total: 0,
      latestTime: null,
      pendingCount: 0,
    };
    const pos = getPosition(n);
    return (
      <div
        key={n}
        className="absolute"
        style={{
          left: `${pos.x_percent}%`,
          top: `${pos.y_percent}%`,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <TableCard
          tableNumber={n}
          status={data.status}
          ordersCount={data.ordersCount}
          total={data.total}
          latestTime={data.latestTime}
          pendingCount={data.pendingCount}
          onClick={() => onSelectTable(n)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* SALÓN */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          🍽️ <span>Salón</span>
          <span className="text-sm text-muted-foreground font-normal">({SALON.length} mesas)</span>
        </h2>
        <div className="relative w-full h-[300px] rounded-xl bg-muted/30 border border-border">
          {SALON.map(renderTable)}
        </div>
      </section>

      {/* TERRAZA */}
      <section>
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          🌿 <span>Terraza</span>
          <span className="text-sm text-muted-foreground font-normal">({TERRAZA.length} mesas)</span>
        </h2>
        <div className="relative w-full h-[300px] rounded-xl bg-muted/30 border border-border">
          {TERRAZA.map(renderTable)}
        </div>
      </section>

      {/* Leyenda */}
      <section className="border-t border-border pt-4">
        <div className="flex flex-wrap gap-4 text-sm justify-center">
          <span className="flex items-center gap-1.5">⚪ <span className="text-muted-foreground">Libre</span></span>
          <span className="flex items-center gap-1.5">🔴 <span className="text-muted-foreground">Sin tramitar</span></span>
          <span className="flex items-center gap-1.5">🟡 <span className="text-muted-foreground">Confirmado</span></span>
          <span className="flex items-center gap-1.5">🔥 <span className="text-muted-foreground">Preparando</span></span>
          <span className="flex items-center gap-1.5">✅ <span className="text-muted-foreground">Listo</span></span>
        </div>
      </section>
    </div>
  );
};

export default FloorPlanView;
