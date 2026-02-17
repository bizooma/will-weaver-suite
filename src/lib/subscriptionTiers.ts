// Subscription tier mapping: maps Stripe product IDs to plan names and price IDs
// Used across AuthContext, PricingTable, and feature gating for consistent tier resolution

/** Ordered tier levels — higher index = more access */
export const TIER_LEVELS = ["basic", "standard", "pro_pi", "pro_estate"] as const;
export type TierKey = (typeof TIER_LEVELS)[number];

export const SUBSCRIPTION_TIERS: Record<TierKey, { product_id: string; price_id: string; name: string }> = {
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
};

// Helper to resolve a Stripe product ID to a tier key
export function getTierByProductId(
  productId: string
): TierKey | null {
  for (const [key, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tier.product_id === productId) {
      return key as TierKey;
    }
  }
  return null;
}

// Helper to resolve a tier display name (e.g. "Pro PI") back to a tier key
export function getTierKeyByName(name: string | null): TierKey | null {
  if (!name) return null;
  for (const [key, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tier.name === name) return key as TierKey;
  }
  return null;
}

/**
 * Check whether the user's active tier meets or exceeds a required tier.
 * Returns true when activeTier >= requiredTier in the TIER_LEVELS hierarchy.
 */
export function hasTierAccess(activeTierName: string | null, requiredTier: TierKey): boolean {
  const activeKey = getTierKeyByName(activeTierName);
  if (!activeKey) return false;
  return TIER_LEVELS.indexOf(activeKey) >= TIER_LEVELS.indexOf(requiredTier);
}
