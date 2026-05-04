import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, UtensilsCrossed, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface Order {
  id: string;
  order_type: string;
  order_status: string;
  created_at: string;
  items: any;
}

interface WaiterDashboardProps {
  orders: Order[];
  onNavigate: (view: 'list' | 'floor') => void;
  calculatePriority: (order: { order_status: string; order_type: string; created_at: string; items: any }) => number;
}

const ACTIVE_STATES = ['received', 'confirmed', 'preparing', 'ready'];

const WaiterDashboard = ({ orders, onNavigate, calculatePriority }: WaiterDashboardProps) => {
  const { t } = useLanguage();

  const computeMetrics = (orderType: 'pickup' | 'dine_in') => {
    const filtered = orders.filter(
      o => o.order_type === orderType && ACTIVE_STATES.includes(o.order_status)
    );
    const count = filtered.length;
    const maxPriority = count > 0
      ? Math.max(...filtered.map(o => calculatePriority(o)))
      : 0;
    const oldestMinutes = count > 0
      ? Math.floor(
          (Date.now() - Math.min(...filtered.map(o => new Date(o.created_at).getTime()))) / 60000
        )
      : 0;
    return { count, maxPriority, oldestMinutes };
  };

  const pickup = computeMetrics('pickup');
  const dineIn = computeMetrics('dine_in');

  const getCardClasses = (count: number, priority: number): string => {
    if (count === 0) {
      return 'border-l-neutral-300 dark:border-l-neutral-700 bg-neutral-100/50 dark:bg-neutral-900/40';
    }
    const byPriority = [
      'border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
      'border-l-amber-500 bg-amber-50 dark:bg-amber-950/30',
      'border-l-orange-500 bg-orange-100 dark:bg-orange-950/40',
      'border-l-red-600 bg-red-100 dark:bg-red-950/50 animate-pulse',
    ];
    return byPriority[priority] ?? byPriority[0];
  };

  const getTimerColor = (count: number, priority: number): string => {
    if (count === 0) return 'text-muted-foreground';
    const colors = [
      'text-emerald-700 dark:text-emerald-300',
      'text-amber-700 dark:text-amber-300',
      'text-orange-700 dark:text-orange-300',
      'text-red-700 dark:text-red-300 font-bold',
    ];
    return colors[priority] ?? colors[0];
  };

  const renderCard = (
    titleKey: string,
    subtitleKey: string,
    Icon: typeof ShoppingBag,
    metrics: { count: number; maxPriority: number; oldestMinutes: number },
    ctaKey: string,
    targetView: 'list' | 'floor'
  ) => {
    const { count, maxPriority, oldestMinutes } = metrics;
    const isEmpty = count === 0;
    const pendingText = t('dashboard_pending_count').replace('{{count}}', String(count));

    return (
      <Card
        onClick={() => onNavigate(targetView)}
        className={`
          relative overflow-hidden rounded-2xl border border-border border-l-[12px]
          shadow-sm hover:shadow-md
          transition-all duration-200 cursor-pointer
          p-8 flex flex-col justify-between min-h-[420px]
          ${getCardClasses(count, maxPriority)}
          ${isEmpty ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800' : 'hover:scale-[1.01]'}
        `}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-foreground" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {t(titleKey)}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">{t(subtitleKey)}</p>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 gap-3 py-6">
          {isEmpty ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-muted-foreground/60" />
              <p className="text-base text-muted-foreground">
                {t('dashboard_empty')}
              </p>
            </>
          ) : (
            <>
              <span className={`text-7xl font-bold leading-none ${getTimerColor(count, maxPriority)}`}>
                {count}
              </span>
              <span className="text-base text-foreground/80">
                {pendingText}
              </span>
              {oldestMinutes > 0 && (
                <div className={`flex items-center gap-2 text-sm mt-2 ${getTimerColor(count, maxPriority)}`}>
                  <Clock className="h-4 w-4" />
                  <span>
                    {t('dashboard_oldest_label')}: {oldestMinutes} {t('dashboard_minutes_short')}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <Button
          variant="outline"
          className="w-full h-12 text-base"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(targetView);
          }}
        >
          {t(ctaKey)}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
      {renderCard(
        'dashboard_pickup_title',
        'dashboard_pickup_subtitle',
        ShoppingBag,
        pickup,
        'dashboard_view_list',
        'list'
      )}
      {renderCard(
        'dashboard_dine_in_title',
        'dashboard_dine_in_subtitle',
        UtensilsCrossed,
        dineIn,
        'dashboard_view_floor',
        'floor'
      )}
    </div>
  );
};

export default WaiterDashboard;
