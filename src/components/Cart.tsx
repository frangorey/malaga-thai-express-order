import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, CreditCard, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CartItem, SupabaseProduct } from "@/types/menu";
import { sanitizeInput, validateCustomerInfo } from "@/lib/security";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Nuevo tipo para el carrito con productos de Supabase
export interface SupabaseCartItem extends SupabaseProduct {
  quantity: number;
  customizations?: string[];
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: SupabaseCartItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
}

export const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem }: CartProps) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = total > 15 ? 0 : 2.50;
  const finalTotal = total + deliveryFee;

  const handleStripePayment = async () => {
    // Validate and sanitize customer information
    const validation = validateCustomerInfo(customerInfo);
    
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: `Por favor, corrige los siguientes errores:\n${validation.errors.join('\n')}`,
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error", 
        description: "El carrito está vacío",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Sanitize all inputs before sending
      const sanitizedInfo = {
        name: sanitizeInput(customerInfo.name),
        phone: sanitizeInput(customerInfo.phone),
        address: sanitizeInput(customerInfo.address),
        notes: sanitizeInput(customerInfo.notes)
      };

      // Preparar items para Stripe
      const cartItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations || []
      }));

      // Llamar al edge function para crear el pago
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          items: cartItems,
          customerInfo: sanitizedInfo,
          deliveryFee: deliveryFee
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirigir a Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No se recibió URL de pago');
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Error en el pago",
        description: "Hubo un problema al procesar tu pago. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleWhatsAppOrder = () => {
    // Validate and sanitize customer information
    const validation = validateCustomerInfo(customerInfo);
    
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: `Por favor, corrige los siguientes errores:\n${validation.errors.join('\n')}`,
        variant: "destructive",
      });
      return;
    }

    // Sanitize all inputs before sending
    const sanitizedInfo = {
      name: sanitizeInput(customerInfo.name),
      phone: sanitizeInput(customerInfo.phone),
      address: sanitizeInput(customerInfo.address),
      notes: sanitizeInput(customerInfo.notes)
    };

    const orderDetails = `
NUEVO PEDIDO THAI EXPRESS - PAGO CONTRA REEMBOLSO

Cliente: ${sanitizedInfo.name}
Teléfono: ${sanitizedInfo.phone}
Dirección: ${sanitizedInfo.address}
${sanitizedInfo.notes ? `Notas: ${sanitizedInfo.notes}` : ''}

PEDIDO:
${items.map(item => `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

Subtotal: ${total.toFixed(2)}€
${deliveryFee > 0 ? `Gastos de envío: ${deliveryFee.toFixed(2)}€` : 'Envío GRATIS (pedido > 15€)'}
TOTAL: ${finalTotal.toFixed(2)}€

💳 FORMA DE PAGO: Contra reembolso (efectivo)
    `;

    const whatsappMessage = encodeURIComponent(orderDetails.trim());
    window.open(`https://wa.me/34951401937?text=${whatsappMessage}`, '_blank');
    
    // Limpiar formulario después de enviar
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      notes: ""
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold neon-text">Tu Pedido</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Cart Items */}
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Tu carrito está vacío</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <Card key={item.id} className="bg-card/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                <img 
                  src={item.image_url || '/placeholder.svg'} 
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.price.toFixed(2)}€</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => onRemoveItem(item.id)}
                              className="ml-auto"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{(item.price * item.quantity).toFixed(2)}€</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <Card className="mb-6 neon-border">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{total.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gastos de envío:</span>
                      <span className={deliveryFee === 0 ? "text-green-500 font-bold" : ""}>
                        {deliveryFee === 0 ? "GRATIS" : `${deliveryFee.toFixed(2)}€`}
                      </span>
                    </div>
                    {deliveryFee > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Envío gratis en pedidos superiores a 15€
                      </p>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-bold text-lg neon-text">
                        <span>TOTAL:</span>
                        <span>{finalTotal.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info Form */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Datos de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="Tu número de teléfono"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Dirección de entrega *</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                      placeholder="Calle, número, piso, código postal..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notas adicionales</Label>
                    <Textarea
                      id="notes"
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                      placeholder="Sin cebolla, extra picante, etc..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Options */}
              <div className="space-y-3">
                <Button 
                  variant="neon" 
                  className="w-full text-lg py-6"
                  onClick={handleStripePayment}
                  disabled={isProcessingPayment}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isProcessingPayment ? "PROCESANDO..." : "PAGAR CON TARJETA"}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">O</span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full text-lg py-6"
                  onClick={handleWhatsAppOrder}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  PAGAR CONTRA REEMBOLSO
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                💳 Pago seguro con tarjeta vía Stripe<br />
                💰 O paga en efectivo al recibir tu pedido
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};