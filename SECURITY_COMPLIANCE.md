# 🔒 Security & Compliance Guide

This document outlines the comprehensive security and compliance measures implemented in the Event Raise platform.

## 🛡️ Security Overview

### HTTPS Security
- **Automatic HTTPS**: All traffic is encrypted via Vercel's automatic HTTPS
- **SSL/TLS**: End-to-end encryption for all data transmission
- **Secure Headers**: Security headers configured for protection against common attacks

### Secret Management
- **Environment Variables**: All secrets stored in Vercel environment variables
- **No Hardcoded Secrets**: Zero secrets in codebase
- **Rotation Policy**: Regular key rotation recommended (quarterly)

## 🔐 Authentication & Authorization

### Supabase Authentication
- **Phone OTP**: Twilio Verify for organizers/bidders (ADR-0017)
- **Platform admin**: Separate `/admin/login` — cookie-only sessions; phone OTP never elevates to admin (ADR-0018)
- **Session Management**: Secure session handling with httpOnly cookies
- **Password Policies**: Platform admin password (and optional Twilio OTP second factor)

### Row Level Security (RLS)
- **Database-level Security**: All tables protected with RLS policies
- **Profile role lock**: Trigger blocks self-escalation of `profiles.role` (migration 033)
- **User Isolation**: Users can only access their own data
- **Campaign Access**: Campaign owners can manage their campaigns
- **Donation Privacy**: Donor information protected appropriately

### Edge & abuse controls
- **Middleware**: Rate limits on `/api/auth/*`, `/api/admin/auth/*`, `/api/donations/share`
- **Durable rate limit**: Upstash Redis REST when configured; in-memory fallback
- **CORS**: Exact `NEXT_PUBLIC_APP_URL` origin only (`npm run audit:cors`)
- **Health**: `/api/health` public liveness; `/api/health/advanced` details require ops/admin auth

## 💳 Payment Security

### PCI Compliance
- **PayPal Checkout / Vault**: Card data handled by PayPal (ADR-0016 — Braintree/Stripe sunset)
- **No Card Storage**: Zero card data stored on our servers
- **Tokenized Payments**: Vaulted payment methods for auction capture-on-win
- **Webhook Validation**: PayPal signature verification (`PAYPAL_WEBHOOK_ID`); skip only via explicit non-prod flag

### Payment Processing
- **Secure API**: All payment APIs use HTTPS
- **Server-priced tickets**: Ticket amounts come from `event_tickets.price_cents`, never client input
- **Capture reconcile**: Captured amount must match stored `paypal_orders.amount_cents`
- **Idempotent settlement**: Shared `settlePaypalCapture` for capture API + webhook; unique `paypal_capture_id`
- **Audit Logging**: Payment lifecycle events logged for compliance

## 🗄️ Data Protection

### Data Encryption
- **At Rest**: Database encryption via Supabase
- **In Transit**: HTTPS for all communications
- **Backup Encryption**: Encrypted database backups

### Data Retention
- **User Data**: Retained while account is active
- **Donation Records**: Permanent retention for tax/legal compliance
- **Audit Logs**: 7-year retention for compliance
- **Export Capability**: Admin can export data for users

### Privacy Controls
- **Anonymous Donations**: Option for anonymous giving
- **Data Minimization**: Only collect necessary information
- **User Control**: Users can view, update, and delete their data

## 🔍 Monitoring & Auditing

### Security Monitoring
- **Access Logs**: All authentication attempts logged
- **Payment Logs**: All transactions tracked and logged
- **Error Monitoring**: Comprehensive error tracking
- **Performance Monitoring**: Real-time performance metrics

### Audit Trail
- **User Actions**: All user actions logged with timestamps
- **Admin Actions**: Special logging for administrative operations
- **Payment Events**: Complete payment lifecycle tracking
- **Security Events**: Failed login attempts and suspicious activity

## 🚨 Incident Response

### Security Incident Procedures
1. **Detection**: Automated monitoring and alerting
2. **Assessment**: Rapid impact assessment
3. **Containment**: Immediate threat containment
4. **Investigation**: Detailed forensic analysis
5. **Recovery**: Secure system restoration
6. **Lessons Learned**: Process improvement

### Contact Information
- **Security Team**: security@eventraise.com
- **Emergency Contact**: [Emergency Phone Number]
- **Incident Reporting**: [Incident Reporting System]

## 📋 Compliance Standards

### Data Protection Regulations
- **GDPR Compliance**: European data protection standards
- **CCPA Compliance**: California privacy rights
- **SOC 2**: Security and availability controls
- **PCI DSS**: Payment card industry standards

### Industry Standards
- **OWASP Top 10**: Protection against common vulnerabilities
- **Security Headers**: Comprehensive security header implementation
- **Input Validation**: All user inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries and RLS

## 🔧 Security Implementation

### API Security
```typescript
// Webhook signature validation
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
)
```

### Database Security
```sql
-- Row Level Security example
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
```

### Environment Security
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_SECRET_KEY=sk_live_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## 🛠️ Security Tools & Practices

### Development Security
- **Code Reviews**: All code changes reviewed for security
- **Dependency Scanning**: Regular vulnerability scanning
- **Static Analysis**: Automated security code analysis
- **Testing**: Comprehensive security testing suite

### Deployment Security
- **Secure Deployment**: Automated secure deployment pipeline
- **Environment Isolation**: Separate dev/staging/production environments
- **Access Controls**: Limited access to production systems
- **Monitoring**: Real-time security monitoring

## 📊 Security Metrics

### Key Performance Indicators
- **Security Incidents**: Zero tolerance for security breaches
- **Response Time**: < 1 hour for critical security issues
- **Compliance Score**: 100% compliance with security standards
- **User Trust**: High user confidence in platform security

### Regular Assessments
- **Monthly**: Security vulnerability scans
- **Quarterly**: Penetration testing
- **Annually**: Full security audit
- **Continuous**: Real-time monitoring and alerting

## 🔄 Security Updates

### Regular Maintenance
- **Security Patches**: Immediate application of security updates
- **Dependency Updates**: Regular updates of all dependencies
- **Configuration Reviews**: Quarterly security configuration reviews
- **Training**: Regular security awareness training

### Incident Response
- **24/7 Monitoring**: Continuous security monitoring
- **Rapid Response**: Quick incident response procedures
- **Communication**: Transparent communication during incidents
- **Recovery**: Fast and secure system recovery

## 📞 Contact & Support

### Security Concerns
- **Email**: security@eventraise.com
- **Phone**: [Security Hotline]
- **Emergency**: [Emergency Contact]

### General Support
- **Email**: support@eventraise.com
- **Help Center**: [Help Center URL]
- **Documentation**: [Security Documentation]

---

## Platform audit hardening (2026-08-07)

Engineering closeout for [`docs/phase-audit-hardening.md`](docs/phase-audit-hardening.md) / [`docs/PLATFORM_AUDIT_2026-08-07.md`](docs/PLATFORM_AUDIT_2026-08-07.md):

- Critical authz/payment fixes on `main` (privilege escalation, ticket pricing, unpaid tickets, payout completion, cashout ownership)
- Sprint 6 auth/edge (ADR-0018, middleware, durable rate limits)
- Sprint 7 money integrity (settle writer, migration 034)
- Sprint 8 defense in depth (CORS check, health gating, stub 410s, authz regression tests)

**Ops (owner-confirmed 2026-08-07):** migrations `033` + `034` applied; `PAYPAL_WEBHOOK_ID` set; `PLATFORM_ADMIN_PASSWORD` rotated. Optional: Upstash for durable rate limits.

---

**Last Updated**: 2026-08-07  
**Version**: 1.2  
**Review Schedule**: Quarterly  
**Related**: ADR-0016, ADR-0018, Phase Audit Hardening
