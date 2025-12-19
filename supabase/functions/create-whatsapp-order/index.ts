import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

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
      order_status: 'preparing', // Set to preparing since order is confirmed
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

    // Send email notification to restaurant
    try {
      const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
      
      const itemsHtml = items.map(item => 
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}x</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)}€</td>
        </tr>`
      ).join('');

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Nuevo Pedido - Thai Express</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #e11d48; margin-bottom: 20px; text-align: center;">🍜 NUEVO PEDIDO - THAI EXPRESS</h1>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #e11d48; padding: 15px; margin-bottom: 20px;">
              <strong>Nº Pedido:</strong> ${order.order_number}<br>
              <strong>Tipo:</strong> ${orderType === 'pickup' ? '🏪 Recoger en restaurante' : '🚚 Entrega a domicilio'}<br>
              <strong>Pago:</strong> Contra reembolso (efectivo)
            </div>

            <h2 style="color: #333; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">👤 Datos del Cliente</h2>
            <table style="width: 100%; margin-bottom: 20px;">
              <tr><td style="padding: 5px 0;"><strong>Nombre:</strong></td><td>${customerInfo.name}</td></tr>
              <tr><td style="padding: 5px 0;"><strong>Teléfono:</strong></td><td>${customerInfo.phonePrefix} ${customerInfo.phone}</td></tr>
              ${customerInfo.email ? `<tr><td style="padding: 5px 0;"><strong>Email:</strong></td><td>${customerInfo.email}</td></tr>` : ''}
              ${orderType === 'delivery' && customerInfo.address ? `<tr><td style="padding: 5px 0;"><strong>Dirección:</strong></td><td>${customerInfo.address}</td></tr>` : ''}
              ${customerInfo.notes ? `<tr><td style="padding: 5px 0;"><strong>Notas:</strong></td><td>${customerInfo.notes}</td></tr>` : ''}
            </table>

            <h2 style="color: #333; border-bottom: 2px solid #e11d48; padding-bottom: 10px;">🛒 Detalle del Pedido</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f8f8f8;">
                  <th style="padding: 10px; text-align: left;">Cant.</th>
                  <th style="padding: 10px; text-align: left;">Producto</th>
                  <th style="padding: 10px; text-align: right;">Precio</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background-color: #f0fdf4; border-radius: 8px; padding: 15px; text-align: right;">
              <p style="margin: 5px 0; font-size: 18px;"><strong>TOTAL: ${finalTotal.toFixed(2)}€</strong></p>
            </div>

            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
              Este email fue generado automáticamente por el sistema de pedidos de Thai Express.
            </p>
          </div>
        </body>
        </html>
      `;

      const emailResponse = await resend.emails.send({
        from: "Panda Poke <pedidos@aientik.es>",
        to: ["f.gonzalez@aientik.es"],
        subject: `🍜 Nuevo Pedido #${order.order_number} - Thai Express`,
        html: emailHtml,
      });

      console.log("Email sent successfully:", emailResponse);
    } catch (emailError) {
      // Log but don't fail - order is already saved
      console.error("Email error (non-fatal):", emailError);
    }

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

    return new Response(
      JSON.stringify({ 
        success: true,
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
