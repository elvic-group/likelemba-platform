#!/bin/bash
# Database Setup Script for Likelemba

echo "🗄️  Setting up Likelemba database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable not set"
    echo "Please set it in your .env file or export it:"
    echo "export DATABASE_URL=postgresql://user:password@localhost:5432/likelemba"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

echo "📋 Running database schema..."
psql $DATABASE_URL -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully!"
    echo ""
    echo "📊 Verifying tables..."
    psql $DATABASE_URL -c "\dt" | head -30
    echo ""
    echo "✅ Database setup complete!"
else
    echo "❌ Error: Database setup failed"
    exit 1
fi

