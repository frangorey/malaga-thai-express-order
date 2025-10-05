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
      throw new Error("CONFIG_ERROR");
    }
    
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });
    logStep("Stripe initialized");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("CONFIG_ERROR");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { items, customerInfo, deliveryFee }: PaymentRequest = await req.json();
    logStep("Request parsed", { itemCount: items.length, deliveryFee });

    // Validate request data
    if (!items || items.length === 0) {
      throw new Error("INVALID_CART");
    }
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      throw new Error("INVALID_CUSTOMER_INFO");
    }

    // Security: Fetch actual prices from database
    const productIds = items.map(item => item.id);
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('id, price, name, is_available')
      .in('id', productIds);

    if (dbError) {
      logStep("Database error", { error: dbError });
      throw new Error("DB_ERROR");
    }

    if (!products || products.length === 0) {
      throw new Error("INVALID_PRODUCTS");
    }

    // Validate prices against database and availability
    const validatedItems = items.map(item => {
      const dbProduct = products.find(p => p.id === item.id);
      if (!dbProduct) {
        logStep("Product not found", { productId: item.id });
        throw new Error("INVALID_PRODUCT");
      }
      if (!dbProduct.is_available) {
        logStep("Product not available", { productId: item.id, name: dbProduct.name });
        throw new Error("PRODUCT_UNAVAILABLE");
      }
      
      // Use database price, ignore client-provided price
      return {
        ...item,
        price: Number(dbProduct.price),
        name: dbProduct.name
      };
    });

    logStep("Prices validated against database", { validatedCount: validatedItems.length });

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

    // Prepare line items for checkout using validated prices
    const lineItems = validatedItems.map(item => {
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
    
    // Map internal errors to user-friendly messages
    let userMessage = "Error procesando el pago. Por favor, inténtalo de nuevo.";
    let statusCode = 500;
    
    if (errorMessage === "INVALID_CART") {
      userMessage = "El carrito está vacío.";
      statusCode = 400;
    } else if (errorMessage === "INVALID_CUSTOMER_INFO") {
      userMessage = "Por favor, completa todos los datos de entrega.";
      statusCode = 400;
    } else if (errorMessage === "INVALID_PRODUCTS" || errorMessage === "INVALID_PRODUCT") {
      userMessage = "Algunos productos ya no están disponibles.";
      statusCode = 400;
    } else if (errorMessage === "PRODUCT_UNAVAILABLE") {
      userMessage = "Algunos productos no están disponibles actualmente.";
      statusCode = 400;
    }
    
    return new Response(JSON.stringify({ 
      error: userMessage,
      code: "PAYMENT_ERROR"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});