// create-checkout: Creates a Stripe Checkout session for authenticated users
// Looks up or creates a Stripe customer, then returns a checkout URL
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// === Server-side allowlists ===
// Only these Stripe price IDs may be checked out. Sourced from
// src/lib/subscriptionTiers.ts. Anything else the client sends is rejected
// so callers can't smuggle in a $0 test price or a different product's ID.
const ALLOWED_PRICE_IDS = new Set<string>([
  "price_1T1TipEV6sbsDlR8A28XSSJ3",
  "price_1T1TjAEV6sbsDlR8BbbvXtDy",
  "price_1T1TjVEV6sbsDlR82m0egxS4",
  "price_1T1TlrEV6sbsDlR8iLbCem1d",
]);

// Coupons the app is allowed to apply. Currently just the JAX Bar promo
// (see src/pages/JaxBar.tsx). Users can't tack on arbitrary discounts by
// guessing coupon IDs in DevTools — anything not on this list is rejected.
const ALLOWED_COUPON_IDS = new Set<string>([
  "YDW7b7eh", // JAX Bar 50% off
]);


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Verify Stripe key is available
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Initialize Supabase client for auth verification
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate the user via Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser(token);
    if (userError)
      throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email)
      throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse the request body to get the priceId and optional couponId
    const { priceId, couponId } = await req.json();
    if (!priceId) throw new Error("priceId is required");

    // Enforce allowlists so callers can't inject arbitrary price/coupon IDs
    if (!ALLOWED_PRICE_IDS.has(String(priceId))) {
      logStep("Rejected priceId not on allowlist", { priceId });
      return new Response(JSON.stringify({ error: "Invalid price" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (couponId && !ALLOWED_COUPON_IDS.has(String(couponId))) {
      logStep("Rejected couponId not on allowlist", { couponId });
      return new Response(JSON.stringify({ error: "Invalid coupon" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    logStep("Price ID received", { priceId, couponId });


    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Look up existing Stripe customer by email, or create one
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    } else {
      logStep("No existing customer, will create via checkout");
    }

    // Determine origin for success/cancel URLs
    const origin = req.headers.get("origin") || "https://will-weaver-suite.lovable.app";

    // Build the Stripe Checkout session options
    const sessionOptions: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/subscription-success`,
      cancel_url: `${origin}/`,
    };

    // Apply coupon discount if provided (e.g. JAX Bar 50% off)
    if (couponId) {
      sessionOptions.discounts = [{ coupon: couponId }];
      logStep("Applying coupon", { couponId });
    }

    // Create the Stripe Checkout session in subscription mode
    const session = await stripe.checkout.sessions.create(sessionOptions);

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
