import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type TableStatus = 'free' | 'received' | 'confirmed' | 'preparing' | 'ready';

interface TableCardProps {
  tableNumber: number;
  status: TableStatus;
  ordersCount: number;
  total: number;
  latestTime: string | null;
  pendingCount: number;
  onClick: () => void;
}

const STATUS_STYLES: Record<TableStatus, { border: string; shadow: string; emoji: string; pulse: boolean }> = {
  free:      { border: 'border-border',         shadow: '',                                              emoji: '⚪', pulse: false },
  received:  { border: 'border-destructive',    shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.5)]',         emoji: '🔴', pulse: true  },
  confirmed: { border: 'border-yellow-500',     shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.35)]',        emoji: '🟡', pulse: false },
  preparing: { border: 'border-orange-500',     shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.35)]',       emoji: '🔥', pulse: false },
  ready:     { border: 'border-green-500',      shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]',         emoji: '✅', pulse: false },
};

export const TableCard = ({
  tableNumber,
  status,
  ordersCount,
  total,
  latestTime,
  pendingCount,
  onClick,
}: TableCardProps) => {
  const style = STATUS_STYLES[status];
  const isFree = status === 'free';

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-[130px] h-[130px] rounded-2xl border-2 bg-card flex flex-col items-center justify-center gap-1 p-2',
        'transition-all duration-200 hover:scale-105 cursor-pointer',
        style.border,
        style.shadow,
        style.pulse && 'animate-pulse',
        isFree && 'opacity-70 hover:opacity-100'
      )}
      aria-label={`Mesa ${tableNumber}`}
    >
      {pendingCount > 0 && (
        <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground h-6 min-w-6 px-1.5 rounded-full text-xs font-bold border-2 border-background">
          {pendingCount}
        </Badge>
      )}

      <span
        className={cn(
          'text-4xl font-bold leading-none',
          !isFree && 'neon-text'
        )}
      >
        {tableNumber}
      </span>
      <span className="text-lg leading-none">{style.emoji}</span>

      {!isFree && (
        <div className="flex flex-col items-center gap-0.5 mt-0.5">
          <span className="text-sm font-mono font-semibold text-foreground">
            {total.toFixed(2)}€
          </span>
          {latestTime && (
            <span className="text-[10px] text-muted-foreground leading-none">
              🕐 {latestTime}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default TableCard;
