# EventRaise

A comprehensive fundraising platform built with Next.js, Supabase, and Stripe.

## Features

- **Event Management**: Create and customize fundraising events (walk-a-thons, auctions, product sales, direct donations, raffles)
- **Volunteer Management**: Sign-up sheets, automated reminders, shift scheduling
- **Payment Processing**: Credit card, ACH, mobile wallets with Stripe integration
- **Real-time Tracking**: Live leaderboards, progress goals, donor recognition
- **Promotion Tools**: Email, SMS, and social media integrations
- **Reports & Analytics**: Financial summaries, tax receipts, compliance-ready reports

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Payments**: Stripe
- **Deployment**: Vercel
- **Version Control**: GitHub

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/EventRaise.git
cd EventRaise
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a new Supabase project
2. Run the migration file to set up the database schema:
```sql
-- Run the contents of supabase/migrations/001_initial_schema.sql in your Supabase SQL editor
```

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
EventRaise/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── events/            # Event management pages
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   └── ui/               # Base UI components
├── lib/                  # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── stripe.ts         # Stripe configuration
├── supabase/             # Database migrations
│   └── migrations/       # SQL migration files
└── public/               # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

