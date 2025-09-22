# Donation Flow Setup Guide

This guide covers the complete donation flow implementation with Stripe integration, SendGrid email notifications, and optimized UI components.

## 🚀 Features

### Payment Processing
- **Stripe Checkout**: Secure, PCI-compliant payment processing
- **Webhook Handling**: Automatic donation processing and database updates
- **Transaction Safety**: Database transactions ensure data consistency

### Email Notifications
- **Confirmation Emails**: Immediate donation confirmation with campaign details
- **Receipt Emails**: Tax-deductible receipts for donors
- **SendGrid Integration**: Professional email templates and delivery

### User Experience
- **Enhanced UI**: Modern, responsive donation forms
- **Real-time Validation**: Client-side form validation
- **Success Confirmation**: Beautiful confirmation pages with sharing options
- **Progress Tracking**: Campaign progress visualization

## 📋 Prerequisites

### Required Services
1. **Stripe Account**: For payment processing
2. **SendGrid Account**: For email delivery
3. **Supabase Project**: For database and authentication

### Environment Variables
```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid Configuration
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=noreply@eventraisehub.com
SENDGRID_RECEIPT_TEMPLATE_ID=d-xxx...
SENDGRID_CONFIRMATION_TEMPLATE_ID=d-xxx...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 🔧 Setup Instructions

### 1. Stripe Configuration

#### Create Stripe Account
1. Sign up at [stripe.com](https://stripe.com)
2. Complete account verification
3. Get your API keys from the dashboard

#### Configure Webhooks
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret

### 2. SendGrid Configuration

#### Create SendGrid Account
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your sender identity
3. Create API key with "Mail Send" permissions

#### Create Email Templates (Optional)
1. Go to SendGrid → Email API → Dynamic Templates
2. Create templates for:
   - Donation confirmation
   - Tax receipt
3. Use the template IDs in environment variables

### 3. Database Setup

#### Required Tables
The following tables should exist in your Supabase database:

```sql
-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  goal_amount DECIMAL(10,2),
  current_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  profile_id UUID,
  amount DECIMAL(10,2) NOT NULL,
  donor_name TEXT,
  donor_email TEXT,
  payment_intent_id TEXT,
  checkout_session_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to increment campaign amount
CREATE OR REPLACE FUNCTION increment_campaign_amount(
  campaign_id UUID,
  amount DECIMAL(10,2)
) RETURNS VOID AS $$
BEGIN
  UPDATE campaigns 
  SET current_amount = current_amount + amount 
  WHERE id = campaign_id;
END;
$$ LANGUAGE plpgsql;
```

## 🎯 API Endpoints

### Create Checkout Session
**POST** `/api/create-checkout`

Creates a Stripe Checkout session for donations.

**Request Body:**
```json
{
  "amount": 50.00,
  "campaign_id": "uuid",
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "success_url": "https://app.com/success",
  "cancel_url": "https://app.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "sessionUrl": "https://checkout.stripe.com/..."
}
```

### Stripe Webhook
**POST** `/api/webhooks/stripe`

Handles Stripe webhook events for payment processing.

**Events Handled:**
- `checkout.session.completed`: Processes successful donations
- `payment_intent.succeeded`: Updates donation status
- `payment_intent.payment_failed`: Handles failed payments

## 📧 Email Templates

### Confirmation Email
Sent immediately after successful donation:
- Donation amount and campaign details
- Campaign progress visualization
- Social sharing options
- Next steps for engagement

### Receipt Email
Tax-deductible receipt for donors:
- Transaction details
- Organization information
- Tax deduction eligibility
- Printable format

## 🎨 UI Components

### DonationForm
Enhanced donation form with:
- Preset amount buttons
- Custom amount input
- Email validation
- Loading states
- Error handling

### DonationConfirmation
Reusable confirmation component:
- Success animation
- Transaction details
- Social sharing
- Next steps guidance

## 🔒 Security Features

### Payment Security
- **PCI Compliance**: Using Stripe Checkout (no card data handling)
- **Webhook Verification**: Stripe signature validation
- **HTTPS Only**: All payment flows use secure connections

### Data Protection
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Sanitized user inputs

## 📊 Monitoring & Analytics

### Error Tracking
- **Sentry Integration**: Automatic error reporting
- **Payment Failures**: Detailed error logging
- **Webhook Monitoring**: Failed webhook tracking

### Business Metrics
- **Donation Tracking**: Success/failure rates
- **Revenue Analytics**: Campaign performance
- **User Behavior**: Donation flow analytics

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

## 🚀 Deployment

### Vercel Deployment
1. Set environment variables in Vercel dashboard
2. Configure Stripe webhook endpoint
3. Test payment flow in production
4. Monitor error logs and analytics

### Environment Variables
Ensure all required environment variables are set:
- Stripe keys and webhook secret
- SendGrid API key and templates
- Supabase connection details
- App URL for redirects

## 🔧 Troubleshooting

### Common Issues

#### Webhook Not Receiving Events
1. Check webhook endpoint URL
2. Verify webhook secret
3. Check Stripe dashboard for failed deliveries
4. Review server logs for errors

#### Emails Not Sending
1. Verify SendGrid API key
2. Check sender email verification
3. Review SendGrid activity feed
4. Check template IDs

#### Payment Failures
1. Verify Stripe keys are correct
2. Check card details and limits
3. Review Stripe dashboard for declined payments
4. Monitor error logs

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
DEBUG=stripe:*
```

## 📈 Performance Optimization

### Database Optimization
- Indexed foreign keys
- Efficient queries
- Connection pooling

### Email Optimization
- Template caching
- Batch processing
- Delivery optimization

### Frontend Optimization
- Lazy loading
- Image optimization
- Bundle splitting

## 🔄 Maintenance

### Regular Tasks
1. **Monitor webhook health**
2. **Review failed payments**
3. **Update email templates**
4. **Check security updates**

### Key Rotation
1. **Stripe keys**: Rotate annually
2. **SendGrid API keys**: Rotate every 90 days
3. **Webhook secrets**: Rotate if compromised

## 📞 Support

For technical support:
- Check error logs in Sentry
- Review Stripe dashboard
- Monitor SendGrid activity
- Contact development team

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Maintainer**: EventraiseHUB Development Team
