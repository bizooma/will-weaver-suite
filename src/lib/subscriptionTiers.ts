// Subscription tier mapping: maps Stripe product IDs to plan names and price IDs
// Used across AuthContext and PricingTable for consistent tier resolution
export const SUBSCRIPTION_TIERS = {
  basic: {
    product_id: "prod_TzSemdFaIx9mTj",
    price_id: "price_1T1TipEV6sbsDlR8A28XSSJ3",
    name: "Basic",
  },
  standard: {
    product_id: "prod_TzSeEDXnz7YEOF",
    price_id: "price_1T1TjAEV6sbsDlR8BbbvXtDy",
    name: "Standard",
  },
  pro_pi: {
    product_id: "prod_TzSe7PjbiLW5HT",
    price_id: "price_1T1TjVEV6sbsDlR82m0egxS4",
    name: "Pro PI",
  },
  pro_estate: {
    product_id: "prod_TzShJgqupFAiXM",
    price_id: "price_1T1TlrEV6sbsDlR8iLbCem1d",
    name: "Pro Estate",
  },
} as const;

// Helper to resolve a Stripe product ID to a tier key
export function getTierByProductId(
  productId: string
): keyof typeof SUBSCRIPTION_TIERS | null {
  for (const [key, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tier.product_id === productId) {
      return key as keyof typeof SUBSCRIPTION_TIERS;
    }
  }
  return null;
}
