# 💳 Stripe Payment Integration Setup

## Overview
This guide covers setting up Stripe payments for the EventraiseHub platform using Stripe Checkout.

## 🔧 Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📋 Setup Steps

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Create an account or sign in
3. Complete account verification

### 2. Get API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API Keys**
3. Copy your **Publishable key** and **Secret key**
4. Add them to your `.env.local` file

### 3. Set Up Webhooks
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** and add to `STRIPE_WEBHOOK_SECRET`

### 4. Configure Vercel Environment Variables
```bash
# Add to Vercel dashboard or use CLI
npx vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
npx vercel env add STRIPE_SECRET_KEY
npx vercel env add STRIPE_WEBHOOK_SECRET
```

## 🚀 Payment Flow

### 1. User Donation Process
```
User clicks "Donate" → 
DonationForm component → 
POST /api/create-checkout → 
Stripe Checkout session → 
User completes payment → 
Webhook processes payment → 
Database updated
```

### 2. API Endpoints

#### `POST /api/create-checkout`
Creates a Stripe Checkout session.

**Request:**
```json
{
  "amount": 100,
  "campaign_id": "uuid",
  "profile_id": "uuid",
  "donor_name": "John Doe",
  "donor_email": "john@example.com"
}
```

**Response:**
```json
{
  "sessionId": "cs_...",
  "sessionUrl": "https://checkout.stripe.com/..."
}
```

#### `POST /api/webhooks/stripe`
Handles Stripe webhooks for payment events.

## 🗄️ Database Schema

### Donations Table
```sql
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  profile_id UUID REFERENCES profiles(id),
  amount DECIMAL NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  payment_intent_id TEXT,
  checkout_session_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Database Functions
```sql
-- Increment campaign amount safely
CREATE OR REPLACE FUNCTION increment_campaign_amount(
  campaign_id UUID,
  amount DECIMAL
) RETURNS VOID;

-- Get campaign statistics
CREATE OR REPLACE FUNCTION get_campaign_stats(campaign_id UUID)
RETURNS TABLE(
  total_donations BIGINT,
  total_amount DECIMAL,
  average_donation DECIMAL,
  last_donation TIMESTAMPTZ
);
```

## 🧩 Components

### DonationForm
```tsx
<DonationForm
  campaignId="uuid"
  campaignTitle="Campaign Name"
  goalAmount={10000}
  currentAmount={5000}
  onSuccess={() => {}}
/>
```

### useStripeCheckout Hook
```tsx
const { createCheckout, isLoading } = useStripeCheckout()

await createCheckout({
  amount: 100,
  campaignId: 'uuid',
  donorName: 'John Doe',
  donorEmail: 'john@example.com'
})
```

## 🎨 UI Features

- **Preset Amounts**: Quick selection buttons ($25, $50, $100, $250, $500)
- **Custom Amount**: Input field for any amount
- **Progress Bar**: Visual campaign progress
- **Form Validation**: Client-side validation
- **Loading States**: User feedback during processing
- **Success/Cancel Pages**: Post-payment experience

## 🔒 Security

### Webhook Verification
- Stripe signature verification
- Event type validation
- Database transactions for consistency

### Data Protection
- PCI compliance through Stripe
- No card data stored locally
- Encrypted communication

## 🧪 Testing

### Test Cards
```
# Successful payment
4242 4242 4242 4242

# Declined payment
4000 0000 0000 0002

# Requires authentication
4000 0025 0000 3155
```

### Test Mode
- Use test API keys (`pk_test_...`, `sk_test_...`)
- Test webhook endpoints
- Verify database updates

## 📊 Monitoring

### Stripe Dashboard
- Monitor payments in real-time
- View webhook logs
- Check for failed payments

### Database Monitoring
- Track donation records
- Monitor campaign totals
- Verify webhook processing

## 🚨 Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check endpoint URL
   - Verify webhook secret
   - Test with Stripe CLI

2. **Payment not completing**
   - Check API keys
   - Verify webhook processing
   - Check database connections

3. **Database errors**
   - Verify RLS policies
   - Check function permissions
   - Monitor transaction logs

### Debug Commands
```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test payment intent
stripe payment_intents create --amount 2000 --currency usd
```

## 📈 Production Checklist

- [ ] Switch to live API keys
- [ ] Update webhook endpoint URL
- [ ] Test with real payment methods
- [ ] Verify database transactions
- [ ] Monitor error rates
- [ ] Set up alerts for failures

## 🔗 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout](https://stripe.com/docs/checkout)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)
