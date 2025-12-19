#!/bin/bash
# Create Fresh Database Script
# Creates a new database for Likelemba

echo "🗄️  Creating fresh database for Likelemba..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set"
    echo "Please set it in your .env file"
    exit 1
fi

# Extract database name from URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
    echo "❌ Could not extract database name from DATABASE_URL"
    exit 1
fi

echo "📋 Database name: $DB_NAME"
echo "⚠️  This will create a new database or reset existing one"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Cancelled"
    exit 0
fi

# Extract connection info without database name
BASE_URL=$(echo $DATABASE_URL | sed 's/\/[^\/]*$/\/postgres/')

echo "🔌 Connecting to PostgreSQL..."

# Drop database if exists and create new
psql "$BASE_URL" -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null
psql "$BASE_URL" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully"
    echo ""
    echo "📋 Running schema migration..."
    psql "$DATABASE_URL" -f database/schema.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Schema created successfully!"
        echo ""
        echo "🎉 Database setup complete!"
        echo ""
        echo "Next steps:"
        echo "  1. Run: npm run verify"
        echo "  2. Start server: npm start"
    else
        echo "❌ Schema creation failed"
        exit 1
    fi
else
    echo "❌ Database creation failed"
    exit 1
fi

