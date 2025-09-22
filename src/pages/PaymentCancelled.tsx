import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";

const PaymentCancelled = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header cartItemsCount={0} onCartClick={() => {}} />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-orange-200">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <XCircle className="w-10 h-10 text-orange-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-orange-800 mb-2">
                Pago Cancelado
              </CardTitle>
              <CardDescription className="text-lg">
                Tu pedido no ha sido procesado
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  No te preocupes, no se ha realizado ningún cargo a tu tarjeta.
                  Puedes volver al menú y intentar realizar tu pedido nuevamente.
                </p>
                
                <div className="pt-4 space-y-3">
                  <Link to="/" className="block">
                    <Button className="w-full">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Volver al Menú
                    </Button>
                  </Link>
                  
                  <Link to="/" className="block">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Página Principal
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentCancelled;