import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  customizations?: string[];
}

interface CustomerInfo {
  name: string;
  phonePrefix: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
}

interface OrderRequest {
  items: CartItem[];
  customerInfo: CustomerInfo;
  orderType: 'pickup' | 'delivery';
  deliveryFee: number;
}

// Server-side validation
function validateOrderRequest(data: unknown): { valid: boolean; error?: string; data?: OrderRequest } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const req = data as Record<string, unknown>;

  // Validate items
  if (!Array.isArray(req.items) || req.items.length === 0) {
    return { valid: false, error: 'Cart is empty' };
  }

  // Validate customerInfo
  const info = req.customerInfo as Record<string, unknown>;
  if (!info || typeof info !== 'object') {
    return { valid: false, error: 'Missing customer info' };
  }

  // Name validation
  if (typeof info.name !== 'string' || info.name.trim().length < 2 || info.name.length > 100) {
    return { valid: false, error: 'Invalid customer name' };
  }

  // Phone validation
  if (typeof info.phonePrefix !== 'string' || info.phonePrefix.length === 0) {
    return { valid: false, error: 'Missing phone prefix' };
  }
  if (typeof info.phone !== 'string' || !/^[0-9\s\-()]{6,15}$/.test(info.phone)) {
    return { valid: false, error: 'Invalid phone number' };
  }

  // Order type validation
  if (req.orderType !== 'pickup' && req.orderType !== 'delivery') {
    return { valid: false, error: 'Invalid order type' };
  }

  // Address validation for delivery
  if (req.orderType === 'delivery') {
    if (typeof info.address !== 'string' || info.address.trim().length < 10 || info.address.length > 500) {
      return { valid: false, error: 'Invalid delivery address' };
    }
  }

  // Optional fields validation
  if (info.email && typeof info.email === 'string' && info.email.length > 255) {
    return { valid: false, error: 'Email too long' };
  }
  if (info.notes && typeof info.notes === 'string' && info.notes.length > 500) {
    return { valid: false, error: 'Notes too long' };
  }

  // Sanitize strings (basic HTML stripping)
  const sanitize = (str: string): string => str.replace(/<[^>]*>/g, '').trim();

  return {
    valid: true,
    data: {
      items: req.items as CartItem[],
      customerInfo: {
        name: sanitize(info.name as string),
        phonePrefix: (info.phonePrefix as string).trim(),
        phone: (info.phone as string).trim(),
        address: info.address ? sanitize(info.address as string) : undefined,
        email: info.email ? (info.email as string).trim() : undefined,
        notes: info.notes ? sanitize(info.notes as string) : undefined,
      },
      orderType: req.orderType as 'pickup' | 'delivery',
      deliveryFee: typeof req.deliveryFee === 'number' ? req.deliveryFee : 0,
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Validate request
    const validation = validateOrderRequest(requestData);
    if (!validation.valid || !validation.data) {
      console.error('Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { items, customerInfo, orderType, deliveryFee } = validation.data;

    // Calculate totals
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const finalTotal = total + deliveryFee;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user if authenticated
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Save order to database
    const { data: order, error: dbError } = await supabase.from('orders').insert({
      user_id: userId,
      customer_name: customerInfo.name,
      customer_phone: `${customerInfo.phonePrefix} ${customerInfo.phone}`,
      customer_email: customerInfo.email || null,
      delivery_address: orderType === 'delivery' ? customerInfo.address : null,
      order_type: orderType,
      items: items,
      total_amount: finalTotal,
      delivery_fee: deliveryFee,
      payment_method: 'cash',
      payment_status: 'pending',
      order_status: 'received',
      notes: customerInfo.notes || null
    }).select().single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save order' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Order saved:', order.id);

    // Send to Relevance AI (server-to-server, internal call)
    try {
      const orderSummary = `
NUEVO PEDIDO THAI EXPRESS
Tipo: ${orderType === 'pickup' ? 'Recoger en restaurante' : 'Entrega a domicilio'}

DATOS DEL CLIENTE:
Nombre: ${customerInfo.name}
Teléfono: ${customerInfo.phonePrefix} ${customerInfo.phone}
${customerInfo.email ? `Email: ${customerInfo.email}` : ''}
${orderType === 'delivery' ? `Dirección: ${customerInfo.address}` : ''}
${customerInfo.notes ? `Notas: ${customerInfo.notes}` : ''}

PEDIDO:
${items.map(item => `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

Subtotal: ${total.toFixed(2)}€
Gastos de envío: ${deliveryFee === 0 ? 'GRATIS' : `${deliveryFee.toFixed(2)}€`}
TOTAL: ${finalTotal.toFixed(2)}€
      `.trim();

      await fetch(
        "https://api-d7b62b.stack.tryrelevance.com/latest/agents/hooks/custom-trigger/abb98214-e292-4708-8d0f-0a7fd2b6ceea/be093897-52b1-4578-bd6c-c37b2a13273e",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            order_summary: orderSummary,
            customer_name: customerInfo.name,
            customer_phone: `${customerInfo.phonePrefix} ${customerInfo.phone}`,
            customer_email: customerInfo.email || "",
            customer_address: customerInfo.address || "",
            order_type: orderType === 'pickup' ? 'Recoger en restaurante' : 'Entrega a domicilio',
            total_amount: finalTotal,
            items_json: JSON.stringify(items),
            notes: customerInfo.notes || ""
          }),
        }
      );
      console.log('Sent to Relevance AI');
    } catch (relevanceError) {
      // Log but don't fail - order is already saved
      console.error('Relevance AI error (non-fatal):', relevanceError);
    }

    // Build WhatsApp URL
    const orderDetails = `
NUEVO PEDIDO THAI EXPRESS - PAGO CONTRA REEMBOLSO
TIPO: ${orderType === 'pickup' ? '🏪 RECOGER EN RESTAURANTE' : '🚚 DOMICILIO'}

Cliente: ${customerInfo.name}
Teléfono: ${customerInfo.phonePrefix} ${customerInfo.phone}
${customerInfo.email ? `Email: ${customerInfo.email}` : ''}
${orderType === 'delivery' ? `Dirección: ${customerInfo.address}` : ''}
${customerInfo.notes ? `Observaciones: ${customerInfo.notes}` : ''}

PEDIDO:
${items.map(item => `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)}€`).join('\n')}

Subtotal: ${total.toFixed(2)}€
${deliveryFee > 0 ? `Gastos de envío: ${deliveryFee.toFixed(2)}€` : 'Envío GRATIS (pedido > 15€)'}
TOTAL: ${finalTotal.toFixed(2)}€

💳 FORMA DE PAGO: Contra reembolso (efectivo)
    `.trim();

    const whatsappMessage = encodeURIComponent(orderDetails);
    const whatsappUrl = `https://wa.me/34951401937?text=${whatsappMessage}`;

    return new Response(
      JSON.stringify({ 
        success: true,
        whatsappUrl,
        orderId: order.id,
        orderNumber: order.order_number
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
