#!/bin/bash

# EventraiseHub Supabase Deployment Script
# This script deploys the database schema and seed data to your Supabase project

set -e

echo "🚀 Deploying EventraiseHub to Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Please login to Supabase first:"
    echo "   supabase login"
    exit 1
fi

# Link to your Supabase project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref supabase-indigo-door

# Deploy the database schema
echo "📊 Deploying database schema..."
supabase db push

# Run the seed data
echo "🌱 Seeding database with sample data..."
supabase db reset --linked

# Generate TypeScript types
echo "📝 Generating TypeScript types..."
supabase gen types typescript --linked > lib/database.types.ts

echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local with the correct Supabase keys"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit your Supabase dashboard to verify the data"
