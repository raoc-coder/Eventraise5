# 🔑 Key Rotation Guide

This guide outlines the procedures for rotating security keys and secrets in the Event Raise platform.

## 🔄 Rotation Schedule

### Recommended Rotation Frequency
- **Stripe Keys**: Every 6 months
- **Supabase Keys**: Every 3 months
- **Webhook Secrets**: Every 6 months
- **API Keys**: Every 3 months
- **Database Passwords**: Every 6 months

## 🔐 Keys Requiring Rotation

### Stripe Keys
```bash
# Current keys to rotate
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Supabase Keys
```bash
# Current keys to rotate
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 📋 Rotation Procedures

### 1. Stripe Key Rotation

#### Step 1: Generate New Keys
1. Log into Stripe Dashboard
2. Navigate to **Developers** > **API Keys**
3. Generate new secret key
4. Update webhook endpoint secret if needed

#### Step 2: Update Environment Variables
```bash
# Update in Vercel Dashboard
STRIPE_SECRET_KEY=sk_live_NEW_KEY
STRIPE_WEBHOOK_SECRET=whsec_NEW_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_NEW_KEY
```

#### Step 3: Test Payment Processing
1. Test donation flow in staging environment
2. Verify webhook processing
3. Check payment success/failure scenarios

#### Step 4: Deploy to Production
1. Update production environment variables
2. Monitor for any payment issues
3. Keep old keys active for 24 hours as backup

### 2. Supabase Key Rotation

#### Step 1: Generate New Keys
1. Log into Supabase Dashboard
2. Navigate to **Settings** > **API**
3. Generate new anon key
4. Generate new service role key

#### Step 2: Update Environment Variables
```bash
# Update in Vercel Dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY=NEW_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=NEW_SERVICE_KEY
```

#### Step 3: Test Database Operations
1. Test user authentication
2. Verify database queries
3. Check RLS policies
4. Test admin functions

#### Step 4: Deploy to Production
1. Update production environment variables
2. Monitor application logs
3. Verify all features working

### 3. Webhook Secret Rotation

#### Step 1: Generate New Webhook Secret
1. In Stripe Dashboard, go to **Webhooks**
2. Select your webhook endpoint
3. Generate new signing secret
4. Copy the new secret

#### Step 2: Update Environment Variables
```bash
# Update in Vercel Dashboard
STRIPE_WEBHOOK_SECRET=whsec_NEW_SECRET
```

#### Step 3: Test Webhook Processing
1. Send test webhook from Stripe Dashboard
2. Verify webhook signature validation
3. Check webhook event processing

#### Step 4: Deploy to Production
1. Update production environment variables
2. Monitor webhook processing
3. Verify payment completion

## 🚨 Emergency Rotation

### Immediate Key Compromise
If keys are compromised, follow these steps immediately:

1. **Immediate Actions**:
   - Disable compromised keys in respective dashboards
   - Generate new keys immediately
   - Update all environment variables
   - Deploy to production immediately

2. **Investigation**:
   - Review access logs for suspicious activity
   - Check for unauthorized transactions
   - Monitor for data breaches
   - Document incident details

3. **Communication**:
   - Notify security team immediately
   - Inform stakeholders if necessary
   - Update incident response documentation

## 📊 Rotation Checklist

### Pre-Rotation
- [ ] Schedule maintenance window
- [ ] Notify team of rotation
- [ ] Backup current configuration
- [ ] Prepare rollback plan
- [ ] Test rotation in staging

### During Rotation
- [ ] Generate new keys
- [ ] Update environment variables
- [ ] Test all functionality
- [ ] Monitor for errors
- [ ] Verify security measures

### Post-Rotation
- [ ] Monitor system for 24 hours
- [ ] Verify all features working
- [ ] Update documentation
- [ ] Schedule next rotation
- [ ] Archive old keys securely

## 🔍 Testing Procedures

### Payment Testing
```bash
# Test donation flow
1. Create test campaign
2. Make test donation
3. Verify payment processing
4. Check webhook processing
5. Verify database updates
```

### Authentication Testing
```bash
# Test user authentication
1. Register new user
2. Login with credentials
3. Test password reset
4. Verify session management
5. Test logout functionality
```

### Database Testing
```bash
# Test database operations
1. Test RLS policies
2. Verify data access controls
3. Test admin functions
4. Check audit logging
5. Verify data integrity
```

## 📝 Documentation Updates

### After Each Rotation
1. Update environment variable documentation
2. Update deployment procedures
3. Update security documentation
4. Update incident response procedures
5. Schedule next rotation

### Key Inventory
Maintain an inventory of all keys and their rotation status:

| Key Type | Current Key | Last Rotation | Next Rotation | Status |
|----------|-------------|---------------|---------------|---------|
| Stripe Secret | sk_live_... | 2024-01-01 | 2024-07-01 | Active |
| Stripe Webhook | whsec_... | 2024-01-01 | 2024-07-01 | Active |
| Supabase Anon | eyJ... | 2024-01-01 | 2024-04-01 | Active |
| Supabase Service | eyJ... | 2024-01-01 | 2024-04-01 | Active |

## 🛡️ Security Best Practices

### Key Management
- Store keys in secure environment variables
- Never commit keys to version control
- Use different keys for different environments
- Monitor key usage and access

### Rotation Best Practices
- Rotate keys during low-traffic periods
- Keep old keys active for 24 hours as backup
- Test thoroughly before production deployment
- Document all rotation activities

### Incident Response
- Have emergency rotation procedures ready
- Maintain contact information for key providers
- Keep backup access methods available
- Document all security incidents

## 📞 Support Contacts

### Stripe Support
- **Email**: support@stripe.com
- **Phone**: [Stripe Support Number]
- **Documentation**: https://stripe.com/docs

### Supabase Support
- **Email**: support@supabase.com
- **Discord**: [Supabase Discord]
- **Documentation**: https://supabase.com/docs

### Internal Support
- **Security Team**: security@eventraise.com
- **DevOps Team**: devops@eventraise.com
- **Emergency**: [Emergency Contact]

---

**Last Updated**: [Current Date]
**Next Review**: [Next Review Date]
**Version**: 1.0
