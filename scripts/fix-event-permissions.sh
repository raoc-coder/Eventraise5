#!/bin/bash

# Fix Event Permissions Script
# This script applies the database migration to fix event viewing permissions

echo "🔧 Fixing event permissions..."

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Apply the migration
echo "📦 Applying database migration..."
supabase db reset

echo "✅ Event permissions have been fixed!"
echo ""
echo "🎉 Changes applied:"
echo "   • All users can now view events created by others"
echo "   • Event creators can still edit/delete their own events"
echo "   • Backward compatibility with both organizer_id and created_by columns"
echo ""
echo "🚀 You can now test the event viewing functionality!"
