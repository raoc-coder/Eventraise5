# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1-beta.2] - 2025-10-02

### Added
- PayPal Live integration for donations (create/capture via REST API)
- `paypal_orders` table and linkage to `donation_requests` (UUID reference)
- Basic PayPal webhook signature verification and handlers
- Global mobile-friendly CSS utilities to prevent overflows

### Changed
- Removed remaining Stripe/Braintree references from home, terms, privacy
- Updated pricing copy to reflect 8.99% platform fee only
- Unified My Events card design with Events; improved responsiveness
- Owner registrations table made compact/responsive; no horizontal bleed
- Event detail donation notes clarified

### Fixed
- Donation insert failing due to UUID mismatch; now stores internal UUID
- CHECK constraint violation on donation status (uses table default)
- Build/lint issues on My Events imports

### Notes
- Webhook verification is best‑effort and can be tightened further
- Preview environments may still point to sandbox; production uses Live creds

## [0.1.0] - 2024-01-XX

### Added
- Initial release of EventraiseHUB platform
- Stripe payment integration
- Event management and registration system
- Volunteer management system
- Admin dashboard with analytics
- Comprehensive testing suite
- Monitoring and observability features
- Performance optimization
- Security and compliance measures
