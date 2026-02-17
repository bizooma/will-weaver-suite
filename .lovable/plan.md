

## Fix "Get Started" Buttons to Enable Signup and Stripe Checkout

### Problem
The four "Get Started" buttons on the homepage pricing section all link to `/contact` instead of initiating the proper subscription flow: **Create Account -> Pay via Stripe -> Access Dashboard**.

### Solution

**1. Update the Auth page to accept a `plan` query parameter**

When a user clicks "Get Started" on a pricing card, they'll be sent to `/auth?plan=basic` (or `standard`, `pro_pi`, `pro_estate`). The Auth page will:
- Store the selected plan in local state
- After successful signup or signin, automatically trigger the Stripe checkout for that plan instead of navigating directly to the dashboard

**2. Replace all four "Get Started" buttons on the homepage**

Change the links from `/contact` to `/auth?plan=<tier_key>`:
- Basic: `/auth?plan=basic`
- Standard: `/auth?plan=standard`
- Pro PI: `/auth?plan=pro_pi`
- Pro Estate: `/auth?plan=pro_estate`

If the user is already logged in, clicking "Get Started" will skip auth and go straight to Stripe checkout.

**3. Update the SubscriptionSuccess page redirect**

After a successful checkout, the user lands on `/subscription-success`, which already refreshes their subscription status and shows a "Go to Dashboard" button. No changes needed here.

### User Flow

```text
Homepage "Get Started" (Basic)
       |
       v
  Is user logged in?
    YES --> Trigger Stripe Checkout immediately
    NO  --> /auth?plan=basic (Sign Up or Sign In)
              |
              v
         After auth success
              |
              v
       Stripe Checkout opens (new tab)
              |
              v
       /subscription-success
              |
              v
         "Go to Dashboard" button
```

### Technical Details

**File: `src/pages/Index.tsx`** (4 button changes)
- Replace `<Link to="/contact">Get Started</Link>` with links to `/auth?plan=basic`, `/auth?plan=standard`, `/auth?plan=pro_pi`, `/auth?plan=pro_estate`
- For logged-in users, the button will instead call the `create-checkout` edge function directly and open Stripe checkout

**File: `src/pages/Auth.tsx`** (add plan-aware checkout trigger)
- Read `plan` from URL search params on mount
- After successful sign-in or sign-up (and email confirmation), if a `plan` param exists, invoke `create-checkout` with the corresponding `price_id` from `SUBSCRIPTION_TIERS` and redirect to Stripe
- If no `plan` param, navigate to `/dashboard` as before

**File: `src/pages/Index.tsx`** (add checkout helper for logged-in users)
- Import `useAuth`, `supabase`, and `SUBSCRIPTION_TIERS`
- Create a `handleGetStarted(tierKey)` function that:
  - If logged in: calls `create-checkout` and opens Stripe in a new tab
  - If not logged in: navigates to `/auth?plan=tierKey`

