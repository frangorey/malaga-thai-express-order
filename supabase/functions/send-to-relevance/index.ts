import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderData {
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    customizations?: string[];
  }>;
  customerInfo: {
    name: string;
    phonePrefix: string;
    phone: string;
    address?: string;
    email?: string;
    notes?: string;
  };
  orderType: 'pickup' | 'delivery';
  total: number;
  deliveryFee: number;
  finalTotal: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderData = await req.json();

    // Preparar el mensaje para el agente de Relevance AI
    const itemsList = orderData.items.map(item => 
      `${item.quantity}x ${item.name} - ${(item.price * item.quantity).toFixed(2)}€`
    ).join('\n');

    const orderSummary = `
NUEVO PEDIDO THAI EXPRESS
Tipo: ${orderData.orderType === 'pickup' ? 'Recoger en restaurante' : 'Entrega a domicilio'}

DATOS DEL CLIENTE:
Nombre: ${orderData.customerInfo.name}
Teléfono: ${orderData.customerInfo.phonePrefix} ${orderData.customerInfo.phone}
${orderData.customerInfo.email ? `Email: ${orderData.customerInfo.email}` : ''}
${orderData.orderType === 'delivery' ? `Dirección: ${orderData.customerInfo.address}` : ''}
${orderData.customerInfo.notes ? `Notas: ${orderData.customerInfo.notes}` : ''}

PEDIDO:
${itemsList}

Subtotal: ${orderData.total.toFixed(2)}€
Gastos de envío: ${orderData.deliveryFee === 0 ? 'GRATIS' : `${orderData.deliveryFee.toFixed(2)}€`}
TOTAL: ${orderData.finalTotal.toFixed(2)}€
    `.trim();

    // Enviar al webhook de Relevance AI con formato simplificado
    const relevanceResponse = await fetch(
      "https://api-d7b62b.stack.tryrelevance.com/latest/agents/hooks/custom-trigger/abb98214-e292-4708-8d0f-0a7fd2b6ceea/be093897-52b1-4578-bd6c-c37b2a13273e",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Campos simples que el agente puede mapear
          order_summary: orderSummary,
          customer_name: orderData.customerInfo.name,
          customer_phone: `${orderData.customerInfo.phonePrefix} ${orderData.customerInfo.phone}`,
          customer_email: orderData.customerInfo.email || "",
          customer_address: orderData.customerInfo.address || "",
          order_type: orderData.orderType === 'pickup' ? 'Recoger en restaurante' : 'Entrega a domicilio',
          total_amount: orderData.finalTotal,
          items_json: JSON.stringify(orderData.items),
          notes: orderData.customerInfo.notes || ""
        }),
      }
    );

    if (!relevanceResponse.ok) {
      const errorText = await relevanceResponse.text();
      throw new Error(`Relevance AI error: ${relevanceResponse.status}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Pedido enviado al agente IA correctamente"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido",
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
