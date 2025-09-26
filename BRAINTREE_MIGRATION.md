# Braintree Migration Guide

This guide documents the migration from Stripe to Braintree payment processing.

## Overview

The application has been migrated from Stripe to Braintree for payment processing. This includes:
- Payment forms and components
- API routes for payment processing
- Webhook handling
- Client-side payment flows

## New Components

### 1. Braintree Configuration (`lib/braintree.ts`)
- Server-side Braintree Gateway configuration
- Client-side Braintree client setup
- Transaction creation utilities
- Client token generation

### 2. Braintree Payment Component (`components/payment/BraintreeCheckout.tsx`)
- Drop-in UI integration
- Payment form with donor information
- Support for multiple payment methods (cards, PayPal, Venmo, Apple Pay, Google Pay)
- Error handling and validation

### 3. Braintree Checkout Hook (`hooks/use-braintree-checkout.ts`)
- Payment processing utilities
- Checkout session creation
- Transaction handling

## New API Routes

### 1. Client Token (`/api/braintree/client-token`)
- Generates client tokens for frontend authentication
- Rate limited for security

### 2. Transaction (`/api/braintree/transaction`)
- Processes payment transactions
- Handles payment method nonces
- Updates donation records in database

### 3. Checkout (`/api/braintree/checkout`)
- Creates checkout sessions
- Manages donation requests
- Returns payment URLs or client tokens

### 4. Payment Request (`/api/braintree/payment-request/[id]`)
- Fetches payment request details
- Validates payment status

### 5. Webhooks (`/api/webhooks/braintree`)
- Handles Braintree webhook notifications
- Updates transaction statuses
- Manages subscription events

## Updated Components

### 1. Event Registration (`components/events/event-registration.tsx`)
- Updated to use Braintree checkout API
- Redirects to Braintree payment page

### 2. Donation Form (`app/donations/new/page.tsx`)
- Replaced Stripe Elements with Braintree component
- Simplified payment flow
- Updated fee calculations

### 3. Payment Pages
- New Braintree payment page (`app/payment/braintree/page.tsx`)
- Updated success/cancel pages to handle Braintree transactions

## Environment Variables

Add these to your `.env.local` file:

```env
# Braintree Configuration
NEXT_PUBLIC_BRAINTREE_CLIENT_TOKEN=your_braintree_client_token
BRAINTREE_MERCHANT_ID=your_braintree_merchant_id
BRAINTREE_PUBLIC_KEY=your_braintree_public_key
BRAINTREE_PRIVATE_KEY=your_braintree_private_key
BRAINTREE_ENVIRONMENT=sandbox
```

## Database Changes

The following fields have been added to support Braintree:
- `braintree_transaction_id` - Braintree transaction ID
- `payment_method` - Payment method type (card, paypal, etc.)
- `settled_at` - Transaction settlement timestamp
- `failure_reason` - Transaction failure reason

## Migration Steps

1. **Install Dependencies**
   ```bash
   npm install braintree-web braintree-web-drop-in braintree
   ```

2. **Set Environment Variables**
   - Add Braintree credentials to `.env.local`
   - Update production environment variables

3. **Update Database Schema**
   - Add new fields to `donation_requests` table
   - Run database migrations if needed

4. **Configure Braintree Account**
   - Set up Braintree merchant account
   - Configure webhook endpoints
   - Test in sandbox environment

5. **Test Payment Flows**
   - Test donation payments
   - Test event registration payments
   - Verify webhook handling

## Testing

### Sandbox Testing
- Use Braintree sandbox environment for testing
- Test with various payment methods
- Verify webhook notifications

### Test Cards
Use Braintree test card numbers:
- Visa: 4111111111111111
- Mastercard: 5555555555554444
- American Express: 378282246310005

## Rollback Plan

If rollback is needed:
1. Revert component changes
2. Restore Stripe API routes
3. Update environment variables
4. Test payment flows

## Support

For issues with the Braintree integration:
1. Check Braintree dashboard for transaction logs
2. Review webhook notifications
3. Check application logs for errors
4. Verify environment variables

## Security Considerations

- Client tokens are generated server-side
- Payment method nonces are validated
- Webhook signatures are verified
- Rate limiting is implemented
- PCI compliance is maintained through Braintree

## Performance

- Braintree Drop-in UI loads asynchronously
- Client tokens are cached when possible
- Webhook processing is optimized
- Error handling is comprehensive