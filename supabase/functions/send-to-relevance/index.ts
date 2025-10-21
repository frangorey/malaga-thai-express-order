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

    console.log("Enviando pedido a Relevance AI:", orderSummary);

    // Enviar al webhook de Relevance AI
    const relevanceResponse = await fetch(
      "https://api-d7b62b.stack.tryrelevance.com/latest/agents/hooks/custom-trigger/abb98214-e292-4708-8d0f-0a7fd2b6ceea/be093897-52b1-4578-bd6c-c37b2a13273e",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: orderSummary,
          customerData: {
            name: orderData.customerInfo.name,
            phone: `${orderData.customerInfo.phonePrefix} ${orderData.customerInfo.phone}`,
            email: orderData.customerInfo.email || "",
            address: orderData.customerInfo.address || "",
            orderType: orderData.orderType
          },
          orderDetails: {
            items: orderData.items,
            total: orderData.finalTotal
          }
        }),
      }
    );

    if (!relevanceResponse.ok) {
      const errorText = await relevanceResponse.text();
      console.error("Error from Relevance AI:", errorText);
      throw new Error(`Relevance AI error: ${relevanceResponse.status}`);
    }

    const relevanceData = await relevanceResponse.json();
    console.log("Respuesta de Relevance AI:", relevanceData);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Pedido enviado al agente IA correctamente",
        relevanceResponse: relevanceData
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error en send-to-relevance:", error);
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
