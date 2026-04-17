import { useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
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

const STATUS_PRIORITY: Record<TableStatus, number> = {
  received: 5,
  confirmed: 4,
  preparing: 3,
  ready: 2,
  free: 1,
};

const playBillChime = () => {
  try {
    const audioCtx = new AudioContext();
    const now = audioCtx.currentTime;
    // Two ascending soft beeps
    [0, 0.18].forEach((offset, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.value = i === 0 ? 880 : 1320;
      const start = now + offset;
      gain.gain.setValueAtTime(0.5, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.35);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  } catch {
    // ignore
  }
};

const FloorPlanView = ({ orders, onSelectTable }: FloorPlanViewProps) => {
  const { layout, getPosition } = useTableLayout({ realtime: true });
  const prevBillRef = useRef<Record<number, boolean>>({});

  // Detect transitions false -> true on bill_requested
  useEffect(() => {
    if (!layout.length) return;
    const prev = prevBillRef.current;
    const next: Record<number, boolean> = {};
    layout.forEach((p) => {
      next[p.table_number] = p.bill_requested;
      const wasRequested = prev[p.table_number];
      if (p.bill_requested && !wasRequested) {
        toast.warning(`💳 Mesa ${p.table_number} solicita la cuenta`, {
          duration: 8000,
        });
        playBillChime();
      }
    });
    prevBillRef.current = next;
  }, [layout]);

  const billRequestedSet = useMemo(
    () => new Set(layout.filter((p) => p.bill_requested).map((p) => p.table_number)),
    [layout]
  );

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
    const billRequested = billRequestedSet.has(n);
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
        <div className="relative">
          {billRequested && (
            <div className="absolute -top-3 -left-3 z-10 animate-pulse">
              <div className="bg-yellow-400 text-black rounded-full w-9 h-9 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(250,204,21,0.7)] border-2 border-background">
                💳
              </div>
            </div>
          )}
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
          <span className="flex items-center gap-1.5">💳 <span className="text-muted-foreground">Pide cuenta</span></span>
        </div>
      </section>
    </div>
  );
};

export default FloorPlanView;
