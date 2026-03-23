import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingBag, CreditCard, MessageCircle, Store, Truck, UtensilsCrossed } from "lucide-react";
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
import { trackOrder } from "@/hooks/useOrderRealtime";
import { useLanguage } from "@/contexts/LanguageContext";

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
  tableNumber?: number | null;
}

export const Cart = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, tableNumber }: CartProps) => {
  const { t } = useLanguage();
  const [orderType, setOrderType] = useState<'pickup' | 'delivery' | 'dine_in' | null>(
    tableNumber ? 'dine_in' : null
  );
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

  // Auto-select dine_in when table number is present
  useEffect(() => {
    if (tableNumber) {
      setOrderType('dine_in');
    }
  }, [tableNumber]);

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleOrder = async () => {
    if (!orderType) {
      toast({
        title: "Error",
        description: t('select_order_type'),
        variant: "destructive",
      });
      return;
    }

    // Validate customer info - address not needed for pickup/dine_in
    const infoToValidate = { ...customerInfo, address: 'N/A' };
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
        description: t('cart_empty_error'),
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      const sanitizedInfo = validation.data!;
      const cartItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations || []
      }));

      const { data, error } = await supabase.functions.invoke('create-whatsapp-order', {
        body: {
          items: cartItems,
          customerInfo: sanitizedInfo,
          orderType: orderType,
          deliveryFee: 0,
          tableNumber: orderType === 'dine_in' ? tableNumber : null
        }
      });

      if (error) throw error;

      if (data?.success) {
        if (data.orderNumber) {
          trackOrder(data.orderNumber);
        }
        
        const typeMsg = orderType === 'dine_in' 
          ? t('order_received_table').replace('{table}', String(tableNumber))
          : t('order_received');

        toast({
          title: t('order_processed'),
          description: `${typeMsg} ${t('order_notify')}`,
        });
        
        setOrderType(tableNumber ? 'dine_in' : null);
        setCustomerInfo({ name: "", phonePrefix: "", phone: "", address: "", email: "", notes: "" });
        items.forEach(item => onRemoveItem(item.id));
        onClose();
      } else {
      throw new Error(data?.error || t('order_error'));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: t('order_error'),
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold neon-text">{t('your_order')}</h2>
            <Button variant="ghost" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Table indicator */}
          {tableNumber && (
            <Card className="mb-4 border-primary bg-primary/10">
              <CardContent className="p-3 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">{t('table')} {tableNumber}</span>
              </CardContent>
            </Card>
          )}

          {/* Cart Items */}
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{t('empty_cart')}</p>
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
                    <div className="flex justify-between font-bold text-lg neon-text">
                      <span>TOTAL:</span>
                      <span>{total.toFixed(2)}€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Type Selection - only if not dine_in via QR */}
              {!tableNumber && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('order_type')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={orderType === 'pickup' ? 'default' : 'outline'}
                        className="h-auto py-6 flex flex-col gap-2"
                        onClick={() => setOrderType('pickup')}
                      >
                        <Store className="w-6 h-6" />
                        <span className="font-semibold">{t('pickup')}</span>
                        <span className="text-xs opacity-80">{t('at_restaurant')}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-6 flex flex-col gap-2 opacity-60"
                        onClick={() => {
                          toast({
                            title: t('service_unavailable'),
                            description: t('service_unavailable_desc'),
                            variant: "destructive",
                          });
                        }}
                      >
                        <Truck className="w-6 h-6" />
                        <span className="font-semibold">{t('delivery')}</span>
                        <span className="text-xs opacity-80">{t('not_available')}</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Customer Info Form */}
              {orderType && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg">{t('your_details')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t('name')} *</Label>
                      <Input
                        id="name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        placeholder={t('your_full_name')}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">{t('contact_phone')} *</Label>
                      <div className="flex gap-2">
                        <Select 
                          value={customerInfo.phonePrefix} 
                          onValueChange={(value) => setCustomerInfo({...customerInfo, phonePrefix: value})}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder={t('prefix')} />
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
                          placeholder={t('phone_placeholder')}
                        />
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

              {/* Payment - Only pay in store */}
              <div className="space-y-3">
                <Button 
                  variant="neon" 
                  className="w-full text-lg py-6"
                  onClick={handleOrder}
                  disabled={isProcessingPayment || !orderType}
                >
                  <Store className="w-5 h-5 mr-2" />
                  {isProcessingPayment 
                    ? "PROCESANDO..." 
                    : orderType === 'dine_in' 
                      ? `PEDIR A MESA ${tableNumber}` 
                      : "REALIZAR PEDIDO"}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                {orderType === 'dine_in' 
                  ? '🍽️ Tu pedido se enviará directamente a cocina · Paga al camarero' 
                  : '💰 Paga en el restaurante al recoger tu pedido'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
