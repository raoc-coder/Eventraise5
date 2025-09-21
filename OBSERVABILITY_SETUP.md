# Observability Setup Guide

This guide covers the comprehensive observability setup for EventRaise, including error monitoring, analytics, database monitoring, and alerting.

## 🚨 Error Monitoring with Sentry

### Setup
1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for your Next.js application
3. Get your DSN from the project settings
4. Set environment variables:

```bash
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### Features
- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: Track slow queries and API calls
- **Session Replay**: Record user sessions for debugging
- **Release Tracking**: Monitor errors by application version
- **Custom Alerts**: Set up alerts for critical errors

### Configuration Files
- `sentry.client.config.ts` - Client-side error tracking
- `sentry.server.config.ts` - Server-side error tracking
- `sentry.edge.config.ts` - Edge runtime error tracking

## 📊 Analytics with PostHog

### Setup
1. Create a PostHog account at [posthog.com](https://posthog.com)
2. Get your project API key
3. Set environment variables:

```bash
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Tracked Events
- **Donation Events**:
  - `donation_started` - When user begins donation process
  - `donation_completed` - When donation is successfully processed
  - `donation_failed` - When donation fails

- **User Events**:
  - `user_registration` - New user signup
  - `user_login` - User authentication
  - `event_registration` - User registers for an event

- **Campaign Events**:
  - `campaign_created` - New campaign created
  - `campaign_viewed` - Campaign page viewed

### Implementation
The analytics are automatically initialized in `app/analytics-provider.tsx` and tracked throughout the application.

## 🗄️ Database Monitoring

### Supabase Monitoring
- **Built-in Metrics**: Access via Supabase Dashboard
- **Query Performance**: Monitor slow queries
- **Connection Pooling**: Track connection usage
- **Storage Usage**: Monitor database size

### Custom Monitoring
- **Health Checks**: `/api/health` endpoint
- **Query Performance**: Tracked via `DatabaseMonitoring.trackQueryPerformance()`
- **Error Tracking**: Database errors sent to Sentry

## 🔔 Alerting System

### Sentry Alerts
1. **Critical Errors**: Immediate alerts for payment failures
2. **Performance Issues**: Alerts for slow database queries
3. **Error Rate Spikes**: Alerts when error rates exceed thresholds

### Health Check Monitoring
- **Database Health**: Connection and query performance
- **Stripe Health**: Payment processing availability
- **Authentication Health**: Supabase auth service status

### Alert Channels
- **Email**: Configured via `MONITORING_EMAIL`
- **Webhooks**: Slack/Discord via `ALERT_WEBHOOK_URL`
- **Sentry**: Built-in alerting system

## 📈 Business Metrics

### Key Performance Indicators (KPIs)
- **Donation Volume**: Total donations per day/week/month
- **Conversion Rate**: Donation completion rate
- **Average Donation**: Mean donation amount
- **Campaign Success**: Goal achievement rate

### Custom Metrics
Tracked via `MonitoringService.trackBusinessMetric()`:
- `donation_completed` - Successful donations
- `campaign_created` - New campaigns
- `user_registration` - New user signups

## 🛠️ Monitoring Tools

### Health Check Endpoint
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "stripe": "healthy",
    "auth": "healthy"
  },
  "version": "1.0.0"
}
```

### Monitoring Service Usage

```typescript
import { MonitoringService } from '@/lib/monitoring'

// Track critical errors
MonitoringService.trackCriticalError(error, { context: 'payment' })

// Track payment errors
MonitoringService.trackPaymentError(error, {
  campaignId: 'camp_123',
  amount: 100,
  donorEmail: 'donor@example.com'
})

// Track business metrics
MonitoringService.trackBusinessMetric('donation_completed', 100, {
  campaign_id: 'camp_123'
})
```

## 🔧 Configuration

### Environment Variables
```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token

# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Monitoring Configuration
MONITORING_EMAIL=admin@yourdomain.com
ALERT_WEBHOOK_URL=your_slack_or_discord_webhook_url
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Next.js Configuration
The `next.config.js` file includes Sentry webpack plugin configuration for automatic source map uploads and error tracking.

## 📋 Monitoring Checklist

### Setup Checklist
- [ ] Sentry project created and configured
- [ ] PostHog project created and configured
- [ ] Environment variables set
- [ ] Health check endpoint tested
- [ ] Error tracking verified
- [ ] Analytics events firing
- [ ] Alerts configured

### Daily Monitoring
- [ ] Check Sentry for new errors
- [ ] Review PostHog analytics dashboard
- [ ] Monitor health check endpoint
- [ ] Review business metrics
- [ ] Check alert notifications

### Weekly Review
- [ ] Analyze error trends
- [ ] Review performance metrics
- [ ] Check database performance
- [ ] Review user behavior analytics
- [ ] Update monitoring thresholds

## 🚀 Production Deployment

### Vercel Configuration
1. Set all environment variables in Vercel dashboard
2. Enable Sentry source map uploads
3. Configure PostHog for production
4. Set up monitoring alerts

### Monitoring Best Practices
1. **Error Budgets**: Set error rate thresholds
2. **Performance Budgets**: Monitor response times
3. **Business Metrics**: Track key business indicators
4. **User Experience**: Monitor user journey metrics
5. **Security**: Monitor for security-related errors

## 📞 Support

For monitoring issues:
1. Check Sentry dashboard for error details
2. Review PostHog analytics for user behavior
3. Use health check endpoint for service status
4. Check Vercel logs for deployment issues
5. Monitor Supabase dashboard for database issues

This observability setup provides comprehensive monitoring for production-ready deployment with real-time error tracking, user analytics, and business metrics.
