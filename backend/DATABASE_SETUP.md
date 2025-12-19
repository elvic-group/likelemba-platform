# Database Setup Guide

## Current Situation

Your database has existing tables with a different structure. You have a few options:

## Option 1: Use Fresh Database (Recommended for Development)

Create a new database specifically for Likelemba:

```bash
# Create new database
createdb likelemba

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/likelemba

# Run migration
npm run db:migrate
```

## Option 2: Reset Existing Database (⚠️ Deletes All Data)

**WARNING:** This will delete ALL existing data in the database!

```bash
# Interactive reset (asks for confirmation)
node scripts/reset-database.js

# Or manually
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:migrate
```

## Option 3: Check Existing Tables First

See what tables exist and their structure:

```bash
node scripts/check-existing-tables.js
```

This will show you:
- All existing tables
- Their column structure
- Whether they conflict with Likelemba schema

## Option 4: Use Different Schema (Advanced)

If you need to keep existing tables, you can:

1. Create a new schema for Likelemba
2. Update connection to use that schema
3. Run migrations in the new schema

```sql
-- Create new schema
CREATE SCHEMA likelemba;

-- Set search path
SET search_path TO likelemba, public;

-- Run schema.sql with schema prefix
```

## Recommended Approach

For **development/testing:**
- Use Option 1 (fresh database)

For **production with existing data:**
- Use Option 3 to check what exists
- Consider Option 4 (separate schema)
- Or backup existing data, then Option 2

## Verification

After setup, verify tables exist:

```bash
npm run verify
```

Should show:
```
✅ All required tables exist
```

## Troubleshooting

### "column does not exist" errors
- Tables exist but with different structure
- Solution: Use fresh database or reset

### "relation already exists" errors
- Tables already created
- Solution: Check if they're correct, or drop and recreate

### Connection errors
- Check DATABASE_URL is correct
- Verify database exists
- Check credentials

---

**Next Step:** Choose an option above and run the migration.

