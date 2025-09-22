import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

interface PaymentRequest {
  items: CartItem[];
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  deliveryFee: number;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Payment request started");

    // Initialize Stripe with secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });
    logStep("Stripe initialized");

    // Parse request body
    const { items, customerInfo, deliveryFee }: PaymentRequest = await req.json();
    logStep("Request parsed", { itemCount: items.length, deliveryFee });

    // Validate request data
    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      throw new Error("Customer information incomplete");
    }

    // Create Stripe customer (for guest checkout)
    const customer = await stripe.customers.create({
      name: customerInfo.name,
      phone: customerInfo.phone,
      address: {
        line1: customerInfo.address,
        country: 'ES', // Spain
      },
      metadata: {
        notes: customerInfo.notes || '',
      }
    });
    logStep("Stripe customer created", { customerId: customer.id });

    // Prepare line items for checkout
    const lineItems = items.map(item => {
      const unitAmount = Math.round(item.price * 100); // Convert to cents
      const customizationText = item.customizations?.length 
        ? ` (${item.customizations.join(', ')})` 
        : '';
      
      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${item.name}${customizationText}`,
            metadata: {
              product_id: item.id.toString(),
              customizations: item.customizations?.join(', ') || '',
            }
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    // Add delivery fee if applicable
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Gastos de envío',
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    logStep("Line items prepared", { count: lineItems.length });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      metadata: {
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        customer_notes: customerInfo.notes || '',
      }
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-payment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});