import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, CreditCard, MessageCircle, Store, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartItem, SupabaseProduct } from "@/types/menu";
import { validateCustomerInfo } from "@/lib/security";
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
  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phonePrefix: "",
    phone: "",
    address: "",
    email: "",
    notes: ""
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { toast } = useToast();

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = total > 15 ? 0 : 2.50;
  const finalTotal = total + deliveryFee;

  const handleStripePayment = async () => {
    if (!orderType) {
      toast({
        title: "Error",
        description: "Por favor, selecciona si es para recoger o para domicilio",
        variant: "destructive",
      });
      return;
    }

    // Validate customer info based on order type
    const infoToValidate = orderType === 'pickup' 
      ? { ...customerInfo, address: 'N/A' } // Don't require address for pickup
      : customerInfo;

    const validation = validateCustomerInfo(infoToValidate);
    
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.errors[0],
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
      // Use the sanitized and validated data from validation result
      const sanitizedInfo = validation.data!;

      // Preparar items para Stripe
      const cartItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations || []
      }));

      // Enviar datos al agente de Relevance AI
      try {
        const orderData = {
          items: cartItems,
          customerInfo: sanitizedInfo,
          orderType: orderType,
          total: total,
          deliveryFee: deliveryFee,
          finalTotal: finalTotal
        };

        const { error: relevanceError } = await supabase.functions.invoke('send-to-relevance', {
          body: orderData
        });

        if (relevanceError) {
          console.error('Error enviando a Relevance AI:', relevanceError);
        }
      } catch (error) {
        console.error('Error al enviar a Relevance AI:', error);
      }

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

  const handleWhatsAppOrder = async () => {
    if (!orderType) {
      toast({
        title: "Error",
        description: "Por favor, selecciona si es para recoger o para domicilio",
        variant: "destructive",
      });
      return;
    }

    // Validate customer info based on order type
    const infoToValidate = orderType === 'pickup' 
      ? { ...customerInfo, address: 'N/A' } // Don't require address for pickup
      : customerInfo;

    const validation = validateCustomerInfo(infoToValidate);
    
    if (!validation.isValid) {
      toast({
        title: "Error",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }

    // Use the sanitized and validated data from validation result
    const sanitizedInfo = validation.data!;

    // Enviar datos al agente de Relevance AI
    try {
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations || []
        })),
        customerInfo: sanitizedInfo,
        orderType: orderType,
        total: total,
        deliveryFee: deliveryFee,
        finalTotal: finalTotal
      };

      const { error: relevanceError } = await supabase.functions.invoke('send-to-relevance', {
        body: orderData
      });

      if (relevanceError) {
        console.error('Error enviando a Relevance AI:', relevanceError);
      }
    } catch (error) {
      console.error('Error al enviar a Relevance AI:', error);
    }

    const orderDetails = `
NUEVO PEDIDO THAI EXPRESS - PAGO CONTRA REEMBOLSO
TIPO: ${orderType === 'pickup' ? '🏪 RECOGER EN RESTAURANTE' : '🚚 DOMICILIO'}

Cliente: ${sanitizedInfo.name}
Teléfono: ${sanitizedInfo.phonePrefix} ${sanitizedInfo.phone}
${sanitizedInfo.email ? `Email: ${sanitizedInfo.email}` : ''}
${orderType === 'delivery' ? `Dirección: ${sanitizedInfo.address}` : ''}
${sanitizedInfo.notes ? `Observaciones: ${sanitizedInfo.notes}` : ''}

PEDIDO:
${items.map(item => `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

Subtotal: ${total.toFixed(2)}€
${deliveryFee > 0 ? `Gastos de envío: ${deliveryFee.toFixed(2)}€` : 'Envío GRATIS (pedido > 15€)'}
TOTAL: ${finalTotal.toFixed(2)}€

💳 FORMA DE PAGO: Contra reembolso (efectivo)
    `;

    const whatsappMessage = encodeURIComponent(orderDetails.trim());
    const fullUrl = `https://wa.me/34951401937?text=${whatsappMessage}`;
    
    // Validate URL length to prevent truncation (browsers have ~2000-8000 char limits)
    if (fullUrl.length > 2000) {
      toast({
        title: "Pedido muy grande",
        description: "Tu pedido es demasiado grande para WhatsApp. Por favor, usa el pago con tarjeta o reduce el número de productos.",
        variant: "destructive",
      });
      return;
    }
    
    window.open(fullUrl, '_blank');
    
    // Limpiar formulario después de enviar
    setOrderType(null);
    setCustomerInfo({
      name: "",
      phonePrefix: "",
      phone: "",
      address: "",
      email: "",
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

              {/* Order Type Selection */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Tipo de Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={orderType === 'pickup' ? 'default' : 'outline'}
                      className="h-auto py-6 flex flex-col gap-2"
                      onClick={() => setOrderType('pickup')}
                    >
                      <Store className="w-6 h-6" />
                      <span className="font-semibold">Recoger</span>
                      <span className="text-xs opacity-80">En restaurante</span>
                    </Button>
                    <Button
                      variant={orderType === 'delivery' ? 'default' : 'outline'}
                      className="h-auto py-6 flex flex-col gap-2"
                      onClick={() => setOrderType('delivery')}
                    >
                      <Truck className="w-6 h-6" />
                      <span className="font-semibold">Domicilio</span>
                      <span className="text-xs opacity-80">A tu dirección</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info Form */}
              {orderType && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Tus Datos</CardTitle>
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
                      <Label htmlFor="phone">Teléfono de contacto *</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={customerInfo.phonePrefix} 
                          onValueChange={(value) => setCustomerInfo({...customerInfo, phonePrefix: value})}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Prefijo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+34">🇪🇸 +34</SelectItem>
                            <SelectItem value="+1">🇺🇸 +1</SelectItem>
                            <SelectItem value="+44">🇬🇧 +44</SelectItem>
                            <SelectItem value="+33">🇫🇷 +33</SelectItem>
                            <SelectItem value="+49">🇩🇪 +49</SelectItem>
                            <SelectItem value="+39">🇮🇹 +39</SelectItem>
                            <SelectItem value="+351">🇵🇹 +351</SelectItem>
                            <SelectItem value="+31">🇳🇱 +31</SelectItem>
                            <SelectItem value="+32">🇧🇪 +32</SelectItem>
                            <SelectItem value="+41">🇨🇭 +41</SelectItem>
                            <SelectItem value="+43">🇦🇹 +43</SelectItem>
                            <SelectItem value="+45">🇩🇰 +45</SelectItem>
                            <SelectItem value="+46">🇸🇪 +46</SelectItem>
                            <SelectItem value="+47">🇳🇴 +47</SelectItem>
                            <SelectItem value="+358">🇫🇮 +358</SelectItem>
                            <SelectItem value="+30">🇬🇷 +30</SelectItem>
                            <SelectItem value="+48">🇵🇱 +48</SelectItem>
                            <SelectItem value="+420">🇨🇿 +420</SelectItem>
                            <SelectItem value="+36">🇭🇺 +36</SelectItem>
                            <SelectItem value="+40">🇷🇴 +40</SelectItem>
                            <SelectItem value="+353">🇮🇪 +353</SelectItem>
                            <SelectItem value="+52">🇲🇽 +52</SelectItem>
                            <SelectItem value="+54">🇦🇷 +54</SelectItem>
                            <SelectItem value="+55">🇧🇷 +55</SelectItem>
                            <SelectItem value="+56">🇨🇱 +56</SelectItem>
                            <SelectItem value="+57">🇨🇴 +57</SelectItem>
                            <SelectItem value="+51">🇵🇪 +51</SelectItem>
                            <SelectItem value="+86">🇨🇳 +86</SelectItem>
                            <SelectItem value="+81">🇯🇵 +81</SelectItem>
                            <SelectItem value="+82">🇰🇷 +82</SelectItem>
                            <SelectItem value="+91">🇮🇳 +91</SelectItem>
                            <SelectItem value="+61">🇦🇺 +61</SelectItem>
                            <SelectItem value="+64">🇳🇿 +64</SelectItem>
                            <SelectItem value="+27">🇿🇦 +27</SelectItem>
                            <SelectItem value="+20">🇪🇬 +20</SelectItem>
                            <SelectItem value="+234">🇳🇬 +234</SelectItem>
                            <SelectItem value="+90">🇹🇷 +90</SelectItem>
                            <SelectItem value="+971">🇦🇪 +971</SelectItem>
                            <SelectItem value="+966">🇸🇦 +966</SelectItem>
                            <SelectItem value="+60">🇲🇾 +60</SelectItem>
                            <SelectItem value="+65">🇸🇬 +65</SelectItem>
                            <SelectItem value="+66">🇹🇭 +66</SelectItem>
                            <SelectItem value="+84">🇻🇳 +84</SelectItem>
                            <SelectItem value="+62">🇮🇩 +62</SelectItem>
                            <SelectItem value="+63">🇵🇭 +63</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          id="phone"
                          className="flex-1"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                          placeholder="Número de teléfono"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email (opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        placeholder="tu@email.com"
                      />
                    </div>
                    
                    {orderType === 'delivery' && (
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
                    )}
                    
                    <div>
                      <Label htmlFor="notes">Observaciones</Label>
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
              )}

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