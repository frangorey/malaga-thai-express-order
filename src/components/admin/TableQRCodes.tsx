import { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';

const BASE_URL = 'https://www.thaiiexpress.es';
const SALON = [1, 2, 3, 4, 5];
const TERRAZA = [6, 7, 8, 9, 10, 11, 12, 13, 14];
const ALL_TABLES = [...SALON, ...TERRAZA];

const tableUrl = (n: number) => `${BASE_URL}/?mesa=${n}`;
const tableLabel = (n: number) => (n <= 5 ? `Salón · Mesa ${n}` : `Terraza · Mesa ${n}`);

const downloadQR = (n: number) => {
  const canvas = document.getElementById(`qr-canvas-${n}`) as HTMLCanvasElement | null;
  if (!canvas) return;
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `mesa-${n}-qr.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const TableQRCodes = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  return (
    <>
      {/* Print-only stylesheet */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .qr-print-area, .qr-print-area * { visibility: visible !important; }
          .qr-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .qr-no-print { display: none !important; }
          .qr-print-card {
            page-break-inside: avoid;
            break-inside: avoid;
            border: 2px dashed #000 !important;
            padding: 16px !important;
            margin: 8px !important;
          }
          .qr-print-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 qr-no-print">
          <div>
            <h2 className="text-xl font-bold">QRs de Mesa</h2>
            <p className="text-sm text-muted-foreground">
              Cada QR enlaza a <code className="text-xs">{BASE_URL}/?mesa=N</code> y autoselecciona la mesa al escanearlo.
            </p>
          </div>
          <Button onClick={handlePrint} variant="default">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir todos
          </Button>
        </div>

        <div ref={printRef} className="qr-print-area">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 qr-print-grid">
            {ALL_TABLES.map(n => (
              <Card
                key={n}
                className="qr-print-card flex flex-col items-center gap-3 p-5 border-2 hover:border-primary/50 transition-colors"
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {tableLabel(n)}
                </div>
                <div className="text-5xl font-bold neon-text leading-none">{n}</div>

                <div className="bg-white p-2 rounded">
                  <QRCodeSVG
                    value={tableUrl(n)}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                  {/* Hidden canvas used for PNG download */}
                  <div className="hidden">
                    <QRCodeCanvas
                      id={`qr-canvas-${n}`}
                      value={tableUrl(n)}
                      size={512}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-semibold">Escanea para pedir</div>
                  <div className="text-[10px] text-muted-foreground break-all">{tableUrl(n)}</div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full qr-no-print"
                  onClick={() => downloadQR(n)}
                >
                  <Download className="w-3 h-3 mr-2" />
                  Descargar PNG
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TableQRCodes;
