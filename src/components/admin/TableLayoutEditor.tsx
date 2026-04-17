import { useEffect, useRef, useState } from 'react';
import { useTableLayout, TablePosition } from '@/hooks/useTableLayout';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RotateCcw, RefreshCw, Move } from 'lucide-react';
import { cn } from '@/lib/utils';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

interface DraggableTableProps {
  position: TablePosition;
  containerRef: React.RefObject<HTMLDivElement>;
  onCommit: (tableNumber: number, x: number, y: number) => void;
}

const DraggableTable = ({ position, containerRef, onCommit }: DraggableTableProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: position.x_percent, y: position.y_percent });

  // Sync from props when not dragging (e.g., after refetch / reset)
  useEffect(() => {
    if (!isDragging) {
      setPos({ x: position.x_percent, y: position.y_percent });
    }
  }, [position.x_percent, position.y_percent, isDragging]);

  const startDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
  };

  const moveDrag = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPos({ x: clamp(x, 5, 95), y: clamp(y, 5, 95) });
  };

  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);
    onCommit(position.table_number, Math.round(pos.x * 100) / 100, Math.round(pos.y * 100) / 100);
  };

  // Mouse listeners on window while dragging
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => endDrag();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault();
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => endDrag();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, pos.x, pos.y]);

  const borderClass =
    position.section === 'salon'
      ? 'border-primary shadow-[0_0_15px_hsl(var(--primary)/0.5)]'
      : 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]';

  return (
    <div
      className="absolute flex flex-col items-center select-none"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 50 : 1,
      }}
    >
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          startDrag(e.clientX, e.clientY);
        }}
        onTouchStart={(e) => {
          if (e.touches[0]) startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }}
        className={cn(
          'w-[60px] h-[60px] rounded-full bg-card border-2 flex items-center justify-center text-xl font-bold text-foreground transition-transform',
          borderClass,
          isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab hover:scale-105'
        )}
        aria-label={`Mover mesa ${position.table_number}`}
      >
        {position.table_number}
      </button>
      <span className="text-[11px] text-muted-foreground mt-1 font-medium">
        Mesa {position.table_number}
      </span>
    </div>
  );
};

const TableLayoutEditor = () => {
  const { layout, isLoading, updatePosition, resetToDefaults } = useTableLayout();
  const salonRef = useRef<HTMLDivElement>(null);
  const terrazaRef = useRef<HTMLDivElement>(null);

  const salonTables = layout.filter((p) => p.section === 'salon');
  const terrazaTables = layout.filter((p) => p.section === 'terraza');

  if (isLoading && layout.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions + Reset */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Move className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <p>Arrastra las mesas para colocarlas según su posición real en el local. Los cambios se guardan automáticamente.</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar posiciones por defecto
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Restaurar posiciones?</AlertDialogTitle>
              <AlertDialogDescription>
                Se sobrescribirán las posiciones actuales de las 14 mesas con las posiciones por defecto. Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => resetToDefaults()}>Restaurar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* SALÓN */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          🍽️ <span>Salón</span>
          <span className="text-sm text-muted-foreground font-normal">({salonTables.length} mesas)</span>
        </h3>
        <div
          ref={salonRef}
          className="relative w-full h-[300px] rounded-xl bg-muted/30 border-2 border-primary/30"
        >
          {salonTables.map((p) => (
            <DraggableTable
              key={p.table_number}
              position={p}
              containerRef={salonRef}
              onCommit={updatePosition}
            />
          ))}
        </div>
      </section>

      {/* TERRAZA */}
      <section>
        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          🌿 <span>Terraza</span>
          <span className="text-sm text-muted-foreground font-normal">({terrazaTables.length} mesas)</span>
        </h3>
        <div
          ref={terrazaRef}
          className="relative w-full h-[300px] rounded-xl bg-muted/30 border-2 border-green-500/30"
        >
          {terrazaTables.map((p) => (
            <DraggableTable
              key={p.table_number}
              position={p}
              containerRef={terrazaRef}
              onCommit={updatePosition}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default TableLayoutEditor;