

# Wire Up Stripe Subscriptions for Amicus Edge

## Overview
This plan connects your existing pricing table to real Stripe checkout sessions, adds subscription verification, and enables plan-based feature gating -- so law firms can actually purchase and manage their subscription plans.

## Step 1: Create Stripe Products and Prices
Create four subscription products in Stripe matching your current pricing tiers:

| Plan | Monthly Price | Stripe Product |
|------|-------------|----------------|
| Basic | $1,500/mo | New product + recurring price |
| Standard | $2,500/mo | New product + recurring price |
| Pro PI | $3,500/mo | New product + recurring price |
| Pro Estate | $4,500/mo | New product + recurring price |

## Step 2: Create Edge Functions (3 new functions)

### `create-checkout`
- Accepts a `priceId` from the frontend
- Authenticates the user via Supabase auth token
- Looks up or creates a Stripe customer by email
- Creates a Stripe Checkout session in `subscription` mode
- Returns the checkout URL to redirect the user

### `check-subscription`
- Authenticates the user, looks up their Stripe customer by email
- Queries Stripe for active subscriptions
- Returns subscription status, product ID, and end date
- Called on login, page load, and periodically from the frontend

### `customer-portal`
- Authenticates the user, finds their Stripe customer
- Creates a Stripe Billing Portal session
- Returns the portal URL so users can manage/cancel their subscription

## Step 3: Add Subscription State to AuthContext
- Add `subscriptionStatus`, `subscriptionTier`, and `subscriptionEnd` to the auth context
- Call `check-subscription` after login and on initial page load
- Auto-refresh subscription status every 60 seconds
- Store a tier mapping constant linking Stripe product IDs to plan names

## Step 4: Update PricingTable Component
- Replace placeholder `priceId` values with real Stripe price IDs
- Highlight the user's current active plan with a visual badge
- Add a "Manage Subscription" button for existing subscribers that opens the Stripe Customer Portal

## Step 5: Create Success Page
- Add a `/subscription-success` route
- Show a confirmation message after successful checkout
- Auto-refresh subscription status on this page

## Step 6: Update `supabase/config.toml`
- Register the three new edge functions with `verify_jwt = false` (JWT validated in code)

## Files to Create
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/check-subscription/index.ts`
- `supabase/functions/customer-portal/index.ts`
- `src/pages/SubscriptionSuccess.tsx`

## Files to Modify
- `src/contexts/AuthContext.tsx` -- add subscription state and check-subscription calls
- `src/components/PricingTable.tsx` -- use real price IDs, show current plan, add manage button
- `src/App.tsx` -- add `/subscription-success` route
- `supabase/config.toml` -- register new edge functions

## Technical Notes
- The `STRIPE_SECRET_KEY` secret is already configured in Supabase -- no additional secrets needed.
- No webhooks are used; subscription status is verified by querying Stripe directly via the `check-subscription` function.
- The existing `user_roles` table continues to control feature access; subscription tier is tracked separately via Stripe and surfaced in the UI.
