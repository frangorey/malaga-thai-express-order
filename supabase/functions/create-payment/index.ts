import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 5; // 5 orders per hour for guest checkout

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  record.count++;
  return { allowed: true };
}

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
    phonePrefix?: string;
    phone: string;
    address: string;
    email?: string;
    notes?: string;
  };
  deliveryFee: number;
  orderType: 'pickup' | 'delivery';
}

// Prices for vegetables extras (in euros)
const VEGETABLE_PRICES: Record<string, number> = {
  "Huevo": 1.40,
  "Cilantro": 1.40,
  "Albahaca": 1.40,
  "Brotes de soja": 1.40,
  "Cebolla roja": 1.40,
  "Maíz": 1.40,
  "Judía verde": 1.40,
  "Zanahoria": 1.40,
  "Cacahuete": 1.40,
  "Brócoli": 1.90,
  "Cebolleta": 1.90,
  "Champiñones": 1.90,
  "Pimiento": 1.90,
  // English versions
  "Egg": 1.40,
  "Cilantro": 1.40,
  "Basil": 1.40,
  "Bean sprouts": 1.40,
  "Red onion": 1.40,
  "Corn": 1.40,
  "Green beans": 1.40,
  "Carrot": 1.40,
  "Peanut": 1.40,
  "Broccoli": 1.90,
  "Scallion": 1.90,
  "Mushrooms": 1.90,
  "Pepper": 1.90,
  // French versions
  "Oeuf": 1.40,
  "Coriandre": 1.40,
  "Basilic": 1.40,
  "Pousses de soja": 1.40,
  "Oignon rouge": 1.40,
  "Maïs": 1.40,
  "Haricots verts": 1.40,
  "Carotte": 1.40,
  "Cacahuète": 1.40,
  "Brocoli": 1.90,
  "Ciboule": 1.90,
  "Champignons": 1.90,
  "Poivron": 1.90,
};

function calculateCustomizationsPrice(customizations?: string[]): number {
  if (!customizations || customizations.length === 0) return 0;
  
  return customizations.reduce((sum, item) => {
    // Try to find exact match or partial match in prices
    const price = VEGETABLE_PRICES[item] || 
                  Object.entries(VEGETABLE_PRICES).find(([key]) => 
                    item.toLowerCase().includes(key.toLowerCase())
                  )?.[1] || 0;
    return sum + price;
  }, 0);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting: Extract client IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0].trim() 
                   || req.headers.get("x-real-ip") 
                   || "unknown";

    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientIP);
    if (!rateLimitCheck.allowed) {
      return new Response(JSON.stringify({ 
        error: "Demasiadas solicitudes. Por favor, inténtalo más tarde.",
        code: "RATE_LIMIT_EXCEEDED"
      }), {
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Retry-After": rateLimitCheck.retryAfter?.toString() || "3600"
        },
        status: 429,
      });
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("CONFIG_ERROR");
    }
    
    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"); // Use service role for admin access
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("CONFIG_ERROR");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { items, customerInfo, deliveryFee, orderType }: PaymentRequest = await req.json();

    // Validate request data
    if (!items || items.length === 0) {
      throw new Error("INVALID_CART");
    }
    if (!customerInfo.name || !customerInfo.phone) {
      throw new Error("INVALID_CUSTOMER_INFO");
    }

    // Security: Fetch actual prices from database
    const productIds = items.map(item => item.id);
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('id, price, name, is_available')
      .in('id', productIds);

    if (dbError) {
      throw new Error("DB_ERROR");
    }

    if (!products || products.length === 0) {
      throw new Error("INVALID_PRODUCTS");
    }

    // Validate prices and availability
    const validatedItems = items.map(item => {
      const dbProduct = products.find(p => p.id === item.id);
      if (!dbProduct) {
        throw new Error("INVALID_PRODUCT");
      }
      if (!dbProduct.is_available) {
        throw new Error("PRODUCT_UNAVAILABLE");
      }
      
      // Calculate total price: base product + customizations
      const basePrice = Number(dbProduct.price);
      const customizationsPrice = calculateCustomizationsPrice(item.customizations);
      const totalPrice = basePrice + customizationsPrice;
      
      return {
        ...item,
        price: totalPrice,
        name: item.customizations && item.customizations.length > 0
          ? `${dbProduct.name} + ${item.customizations.join(", ")}`
          : dbProduct.name,
        baseProductName: dbProduct.name
      };
    });

    // Calculate total amount
    const totalAmount = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) + deliveryFee;

    // Get current user (if authenticated)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Save order to database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phonePrefix 
          ? `${customerInfo.phonePrefix} ${customerInfo.phone}` 
          : customerInfo.phone,
        customer_email: customerInfo.email || null,
        delivery_address: orderType === 'delivery' ? customerInfo.address : null,
        order_type: orderType,
        items: validatedItems,
        total_amount: totalAmount,
        delivery_fee: deliveryFee,
        payment_method: 'stripe',
        payment_status: 'pending',
        order_status: 'received',
        notes: customerInfo.notes || null
      })
      .select()
      .single();

    if (orderError) {
      throw new Error("DB_INSERT_ERROR");
    }

    // Create Stripe customer (for guest checkout)
    const customer = await stripe.customers.create({
      name: customerInfo.name,
      phone: customerInfo.phone,
      address: {
        line1: customerInfo.address,
        country: 'ES',
      },
      metadata: {
        notes: customerInfo.notes || '',
        order_id: orderData.id
      }
    });

    // Prepare line items for checkout
    const lineItems = validatedItems.map(item => {
      const unitAmount = Math.round(item.price * 100);
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
        order_id: orderData.id,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        customer_notes: customerInfo.notes || '',
      }
    });

    // Update order with Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderData.id);

    // Send order to Relevance AI (don't block on this)
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-to-relevance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
        },
        body: JSON.stringify({
          items: validatedItems,
          customerInfo: customerInfo,
          orderType: orderType,
          total: totalAmount - deliveryFee,
          deliveryFee: deliveryFee,
          finalTotal: totalAmount
        })
      });
    } catch (error) {
      // Log error but don't fail the payment
      console.error("Failed to send to Relevance AI:", error);
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
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
    } else if (errorMessage === "DB_INSERT_ERROR") {
      userMessage = "No se pudo guardar el pedido. Por favor, inténtalo de nuevo.";
      statusCode = 500;
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
