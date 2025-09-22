import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { t } = useLanguage();
  const [orderSent, setOrderSent] = useState(false);

  useEffect(() => {
    // Auto-send WhatsApp message with order confirmation
    if (sessionId && !orderSent) {
      const sendWhatsAppOrder = () => {
        const phoneNumber = "34612345678"; // Replace with actual restaurant phone
        const message = `🎉 ¡Pago confirmado!\n\nID de sesión: ${sessionId}\n\nGracias por tu pedido. Pronto nos pondremos en contacto contigo para confirmar la entrega.\n\n¡Esperamos que disfrutes tu comida! 🍜`;
        
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
        setOrderSent(true);
      };

      // Send WhatsApp message after a short delay
      const timer = setTimeout(sendWhatsAppOrder, 2000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, orderSent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header cartItemsCount={0} onCartClick={() => {}} />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-green-200">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-green-800 mb-2">
                ¡Pago Exitoso!
              </CardTitle>
              <CardDescription className="text-lg">
                Tu pedido ha sido procesado correctamente
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {sessionId && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">ID de transacción:</p>
                  <p className="font-mono text-sm break-all">{sessionId}</p>
                </div>
              )}
              
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">¿Qué pasa ahora?</h3>
                  <div className="text-left space-y-2 max-w-md mx-auto">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                      <p className="text-sm">Tu pago ha sido confirmado y procesado</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                      <p className="text-sm">Se abrirá WhatsApp para confirmar tu pedido</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                      <p className="text-sm">Nos pondremos en contacto contigo para la entrega</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  {!orderSent && (
                    <Button 
                      onClick={() => {
                        const phoneNumber = "34612345678"; // Replace with actual restaurant phone
                        const message = `🎉 ¡Pago confirmado!\n\nID de sesión: ${sessionId}\n\nGracias por tu pedido. Pronto nos pondremos en contacto contigo para confirmar la entrega.\n\n¡Esperamos que disfrutes tu comida! 🍜`;
                        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                        setOrderSent(true);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Confirmar Pedido por WhatsApp
                    </Button>
                  )}
                  
                  <Link to="/" className="block">
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al Menú
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

export default PaymentSuccess;