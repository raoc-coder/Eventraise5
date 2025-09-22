# EventraiseHUB API Documentation

## 🔗 Base URL
```
Production: https://eventraisehub.com/api
Development: http://localhost:3000/api
```

## 🔐 Authentication

### Authentication Methods
- **Supabase Auth**: JWT tokens for user authentication
- **API Keys**: For admin operations
- **Webhook Signatures**: For Stripe webhook validation

### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
X-API-Key: <api_key> (for admin endpoints)
```

## 📊 Campaign Endpoints

### Create Campaign
```http
POST /campaigns
```

**Request Body:**
```json
{
  "title": "Spring Fundraising Gala",
  "description": "Annual fundraising event for school programs",
  "goal_amount": 50000,
  "start_date": "2024-04-01T00:00:00Z",
  "end_date": "2024-04-30T23:59:59Z",
  "organization_name": "EventraiseHUB Foundation",
  "category": "education",
  "image_url": "https://example.com/image.jpg"
}
```

**Response:**
```json
{
  "id": "campaign-123",
  "title": "Spring Fundraising Gala",
  "description": "Annual fundraising event for school programs",
  "goal_amount": 50000,
  "current_amount": 0,
  "progress_percentage": 0,
  "start_date": "2024-04-01T00:00:00Z",
  "end_date": "2024-04-30T23:59:59Z",
  "organization_name": "EventraiseHUB Foundation",
  "category": "education",
  "image_url": "https://example.com/image.jpg",
  "status": "active",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Get Campaign
```http
GET /campaigns/{id}
```

**Response:**
```json
{
  "id": "campaign-123",
  "title": "Spring Fundraising Gala",
  "description": "Annual fundraising event for school programs",
  "goal_amount": 50000,
  "current_amount": 15000,
  "progress_percentage": 30,
  "start_date": "2024-04-01T00:00:00Z",
  "end_date": "2024-04-30T23:59:59Z",
  "organization_name": "EventraiseHUB Foundation",
  "category": "education",
  "image_url": "https://example.com/image.jpg",
  "status": "active",
  "donation_count": 45,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### List Campaigns
```http
GET /campaigns?page=1&limit=10&category=education&status=active
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category
- `status` (optional): Filter by status (active, completed, cancelled)
- `search` (optional): Search by title or description

**Response:**
```json
{
  "campaigns": [
    {
      "id": "campaign-123",
      "title": "Spring Fundraising Gala",
      "description": "Annual fundraising event for school programs",
      "goal_amount": 50000,
      "current_amount": 15000,
      "progress_percentage": 30,
      "start_date": "2024-04-01T00:00:00Z",
      "end_date": "2024-04-30T23:59:59Z",
      "organization_name": "EventraiseHUB Foundation",
      "category": "education",
      "image_url": "https://example.com/image.jpg",
      "status": "active",
      "donation_count": 45,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## 💰 Donation Endpoints

### Create Donation
```http
POST /donations
```

**Request Body:**
```json
{
  "campaign_id": "campaign-123",
  "amount": 100,
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "is_anonymous": false,
  "message": "Great cause!",
  "payment_method": "card"
}
```

**Response:**
```json
{
  "id": "donation-456",
  "campaign_id": "campaign-123",
  "amount": 100,
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "is_anonymous": false,
  "message": "Great cause!",
  "status": "pending",
  "payment_intent_id": "pi_1234567890",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Get Donation
```http
GET /donations/{id}
```

**Response:**
```json
{
  "id": "donation-456",
  "campaign_id": "campaign-123",
  "amount": 100,
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "is_anonymous": false,
  "message": "Great cause!",
  "status": "completed",
  "payment_intent_id": "pi_1234567890",
  "stripe_charge_id": "ch_1234567890",
  "created_at": "2024-01-15T10:00:00Z",
  "completed_at": "2024-01-15T10:05:00Z"
}
```

### List Donations
```http
GET /donations?campaign_id=campaign-123&page=1&limit=10
```

**Query Parameters:**
- `campaign_id` (optional): Filter by campaign
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (pending, completed, failed, refunded)
- `start_date` (optional): Filter by start date (ISO 8601)
- `end_date` (optional): Filter by end date (ISO 8601)

**Response:**
```json
{
  "donations": [
    {
      "id": "donation-456",
      "campaign_id": "campaign-123",
      "amount": 100,
      "donor_name": "John Doe",
      "donor_email": "john@example.com",
      "is_anonymous": false,
      "message": "Great cause!",
      "status": "completed",
      "payment_intent_id": "pi_1234567890",
      "stripe_charge_id": "ch_1234567890",
      "created_at": "2024-01-15T10:00:00Z",
      "completed_at": "2024-01-15T10:05:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

## 🎫 Event Endpoints

### Create Event
```http
POST /events
```

**Request Body:**
```json
{
  "title": "Spring Fundraising Gala",
  "description": "Annual fundraising event for school programs",
  "start_date": "2024-04-15T18:00:00Z",
  "end_date": "2024-04-15T23:00:00Z",
  "location": "Grand Ballroom, 123 Main St, City, State",
  "max_participants": 200,
  "ticket_price": 150,
  "goal_amount": 50000,
  "organization_name": "EventraiseHUB Foundation",
  "category": "fundraising",
  "image_url": "https://example.com/event-image.jpg"
}
```

**Response:**
```json
{
  "id": "event-789",
  "title": "Spring Fundraising Gala",
  "description": "Annual fundraising event for school programs",
  "start_date": "2024-04-15T18:00:00Z",
  "end_date": "2024-04-15T23:00:00Z",
  "location": "Grand Ballroom, 123 Main St, City, State",
  "max_participants": 200,
  "current_participants": 0,
  "ticket_price": 150,
  "goal_amount": 50000,
  "current_amount": 0,
  "organization_name": "EventraiseHUB Foundation",
  "category": "fundraising",
  "image_url": "https://example.com/event-image.jpg",
  "status": "active",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Get Event
```http
GET /events/{id}
```

**Response:**
```json
{
  "id": "event-789",
  "title": "Spring Fundraising Gala",
  "description": "Annual fundraising event for school programs",
  "start_date": "2024-04-15T18:00:00Z",
  "end_date": "2024-04-15T23:00:00Z",
  "location": "Grand Ballroom, 123 Main St, City, State",
  "max_participants": 200,
  "current_participants": 150,
  "ticket_price": 150,
  "goal_amount": 50000,
  "current_amount": 22500,
  "organization_name": "EventraiseHUB Foundation",
  "category": "fundraising",
  "image_url": "https://example.com/event-image.jpg",
  "status": "active",
  "registration_count": 150,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### List Events
```http
GET /events?page=1&limit=10&category=fundraising&status=active
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `category` (optional): Filter by category
- `status` (optional): Filter by status (active, completed, cancelled)
- `search` (optional): Search by title or description
- `start_date` (optional): Filter by start date (ISO 8601)
- `end_date` (optional): Filter by end date (ISO 8601)

**Response:**
```json
{
  "events": [
    {
      "id": "event-789",
      "title": "Spring Fundraising Gala",
      "description": "Annual fundraising event for school programs",
      "start_date": "2024-04-15T18:00:00Z",
      "end_date": "2024-04-15T23:00:00Z",
      "location": "Grand Ballroom, 123 Main St, City, State",
      "max_participants": 200,
      "current_participants": 150,
      "ticket_price": 150,
      "goal_amount": 50000,
      "current_amount": 22500,
      "organization_name": "EventraiseHUB Foundation",
      "category": "fundraising",
      "image_url": "https://example.com/event-image.jpg",
      "status": "active",
      "registration_count": 150,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

## 🎟️ Event Registration Endpoints

### Register for Event
```http
POST /events/{id}/register
```

**Request Body:**
```json
{
  "participant_name": "Jane Smith",
  "participant_email": "jane@example.com",
  "participant_phone": "555-1234",
  "ticket_quantity": 2,
  "special_requests": "Vegetarian meal please",
  "dietary_restrictions": "No nuts",
  "emergency_contact_name": "John Smith",
  "emergency_contact_phone": "555-5678"
}
```

**Response:**
```json
{
  "id": "registration-101",
  "event_id": "event-789",
  "participant_name": "Jane Smith",
  "participant_email": "jane@example.com",
  "participant_phone": "555-1234",
  "ticket_quantity": 2,
  "total_amount": 300,
  "special_requests": "Vegetarian meal please",
  "dietary_restrictions": "No nuts",
  "emergency_contact_name": "John Smith",
  "emergency_contact_phone": "555-5678",
  "status": "confirmed",
  "registration_date": "2024-01-15T10:00:00Z"
}
```

### Get Event Registration
```http
GET /events/{id}/registrations/{registration_id}
```

**Response:**
```json
{
  "id": "registration-101",
  "event_id": "event-789",
  "participant_name": "Jane Smith",
  "participant_email": "jane@example.com",
  "participant_phone": "555-1234",
  "ticket_quantity": 2,
  "total_amount": 300,
  "special_requests": "Vegetarian meal please",
  "dietary_restrictions": "No nuts",
  "emergency_contact_name": "John Smith",
  "emergency_contact_phone": "555-5678",
  "status": "confirmed",
  "registration_date": "2024-01-15T10:00:00Z"
}
```

### List Event Registrations
```http
GET /events/{id}/registrations?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status (pending, confirmed, cancelled)

**Response:**
```json
{
  "registrations": [
    {
      "id": "registration-101",
      "event_id": "event-789",
      "participant_name": "Jane Smith",
      "participant_email": "jane@example.com",
      "participant_phone": "555-1234",
      "ticket_quantity": 2,
      "total_amount": 300,
      "special_requests": "Vegetarian meal please",
      "dietary_restrictions": "No nuts",
      "emergency_contact_name": "John Smith",
      "emergency_contact_phone": "555-5678",
      "status": "confirmed",
      "registration_date": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

## 🤝 Volunteer Endpoints

### Get Volunteer Shifts
```http
GET /events/{id}/volunteer-shifts
```

**Response:**
```json
{
  "shifts": [
    {
      "id": "shift-201",
      "event_id": "event-789",
      "title": "Setup Crew",
      "description": "Help set up tables and decorations",
      "start_time": "2024-04-15T16:00:00Z",
      "end_time": "2024-04-15T18:00:00Z",
      "max_volunteers": 10,
      "current_volunteers": 5,
      "requirements": "Must be able to lift 25+ lbs",
      "skills_needed": ["setup", "decorating"],
      "location": "Grand Ballroom",
      "is_active": true
    }
  ]
}
```

### Sign Up for Volunteer Shift
```http
POST /events/{id}/volunteer-signup
```

**Request Body:**
```json
{
  "shift_id": "shift-201",
  "volunteer_name": "Bob Wilson",
  "volunteer_email": "bob@example.com",
  "volunteer_phone": "555-5678",
  "skills": "setup, decorating",
  "experience_level": "intermediate",
  "availability_notes": "Available weekends"
}
```

**Response:**
```json
{
  "id": "signup-301",
  "shift_id": "shift-201",
  "volunteer_name": "Bob Wilson",
  "volunteer_email": "bob@example.com",
  "volunteer_phone": "555-5678",
  "skills": "setup, decorating",
  "experience_level": "intermediate",
  "availability_notes": "Available weekends",
  "status": "confirmed",
  "signed_up_at": "2024-01-15T10:00:00Z"
}
```

## 💳 Payment Endpoints

### Create Checkout Session
```http
POST /create-checkout
```

**Request Body:**
```json
{
  "amount": 100,
  "campaign_id": "campaign-123",
  "profile_id": "profile-456",
  "donor_name": "John Doe",
  "donor_email": "john@example.com",
  "is_anonymous": false,
  "message": "Great cause!"
}
```

**Response:**
```json
{
  "session_id": "cs_1234567890",
  "session_url": "https://checkout.stripe.com/pay/cs_1234567890",
  "expires_at": "2024-01-15T11:00:00Z"
}
```

### Stripe Webhook
```http
POST /webhooks/stripe
```

**Headers:**
```http
Stripe-Signature: t=1234567890,v1=signature
Content-Type: application/json
```

**Request Body:** (Stripe webhook payload)
```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_1234567890",
      "object": "checkout.session",
      "payment_status": "paid",
      "amount_total": 10000,
      "customer_email": "john@example.com"
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Webhook processed successfully"
}
```

## 📊 Admin Endpoints

### Get Analytics Dashboard
```http
GET /admin/analytics
```

**Headers:**
```http
Authorization: Bearer <admin_jwt_token>
X-API-Key: <admin_api_key>
```

**Response:**
```json
{
  "summary": {
    "total_donations": 150,
    "total_donation_amount": 25000,
    "average_donation": 166.67,
    "total_registrations": 75,
    "total_registration_amount": 15000,
    "average_registration": 200,
    "total_volunteers": 45,
    "confirmed_volunteers": 40,
    "total_revenue": 40000
  },
  "monthly_data": [
    {
      "month": "2024-01",
      "donations": 25,
      "registrations": 15,
      "revenue": 8000
    }
  ],
  "campaign_performance": [
    {
      "id": "campaign-123",
      "title": "Spring Fundraiser",
      "goal_amount": 50000,
      "current_amount": 30000,
      "progress_percentage": 60,
      "donation_count": 100
    }
  ],
  "event_performance": [
    {
      "id": "event-789",
      "title": "Gala Dinner",
      "start_date": "2024-04-15T18:00:00Z",
      "max_participants": 200,
      "current_participants": 150,
      "capacity_percentage": 75,
      "ticket_price": 150,
      "registration_count": 150
    }
  ]
}
```

### Export Data
```http
POST /admin/export
```

**Request Body:**
```json
{
  "type": "donations",
  "format": "csv",
  "filters": {
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z",
    "campaign_id": "campaign-123"
  },
  "include_personal_data": false
}
```

**Response:**
```json
{
  "export_id": "export-401",
  "status": "processing",
  "download_url": null,
  "expires_at": "2024-01-22T10:00:00Z"
}
```

### Get Export Status
```http
GET /admin/export/{export_id}
```

**Response:**
```json
{
  "export_id": "export-401",
  "status": "completed",
  "download_url": "https://api.eventraisehub.com/exports/export-401.csv",
  "expires_at": "2024-01-22T10:00:00Z",
  "file_size": 1024,
  "record_count": 150
}
```

## 🔍 Health Check Endpoints

### Basic Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### Advanced Health Check
```http
GET /health/advanced
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:00:00Z",
  "health_score": 100,
  "services": {
    "database": true,
    "stripe": true,
    "sendgrid": true,
    "supabase": true,
    "redis": true,
    "email": true,
    "storage": true,
    "cdn": true
  },
  "performance": {
    "response_time": 150,
    "memory_usage": {
      "rss": 50000000,
      "heapTotal": 30000000,
      "heapUsed": 20000000,
      "external": 1000000
    },
    "uptime": 86400
  },
  "version": "1.0.0",
  "environment": "production"
}
```

## ❌ Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2024-01-15T10:00:00Z",
    "request_id": "req_1234567890"
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Authentication required
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `CONFLICT`: Resource conflict
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded
- `PAYMENT_ERROR`: Payment processing failed
- `SERVICE_UNAVAILABLE`: External service unavailable
- `INTERNAL_ERROR`: Internal server error

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Unprocessable Entity
- `429`: Too Many Requests
- `500`: Internal Server Error
- `503`: Service Unavailable

## 🔒 Rate Limiting

### Rate Limits
- **General API**: 1000 requests per hour per IP
- **Authentication**: 10 requests per minute per IP
- **Payment**: 100 requests per hour per user
- **Admin**: 5000 requests per hour per admin

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## 📝 Pagination

### Pagination Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Pagination Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

## 🔐 Security

### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### Data Protection
- All personal data encrypted at rest
- TLS 1.2+ for data in transit
- PCI DSS compliance for payment data
- GDPR compliance for EU users
- SOC 2 Type II compliance

## 📞 Support

### API Support
- **Email**: api-support@eventraisehub.com
- **Documentation**: https://docs.eventraisehub.com
- **Status Page**: https://status.eventraisehub.com

### Rate Limits
- **General**: 1000 requests/hour
- **Authentication**: 10 requests/minute
- **Payment**: 100 requests/hour
- **Admin**: 5000 requests/hour

---

**Last Updated**: January 15, 2024
**API Version**: 1.0.0
**API Versioning**: Header-based (`Accept: application/vnd.eventraisehub.v1+json`)
