# Supabase Database Setup

## Step 1: Run the Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/wydfkooapfnxbrcgkbmk
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd+Enter)
7. Verify: You should see "Success. No rows returned"

## Step 2: Verify Tables Were Created

1. Click on **Table Editor** in the left sidebar
2. You should see these tables:
   - users
   - hormone_tests
   - ready_scores
   - bio_ages
   - impact_analyses
   - chat_messages
   - user_patterns

## Step 3: Test Row Level Security

1. Go to **Authentication** → **Users**
2. Create a test user (or sign in to the app)
3. Try querying the tables - you should only see your own data

## Step 4: Enable Realtime (Optional)

If you want real-time updates:

1. Go to **Database** → **Replication**
2. Enable replication for tables you want real-time updates on:
   - hormone_tests
   - chat_messages

## Troubleshooting

### "relation already exists" error
- Tables already exist, you're good!
- Or drop existing tables first: `DROP TABLE IF EXISTS table_name CASCADE;`

### RLS preventing inserts
- Make sure you're authenticated
- Check the policies in the SQL file
- Verify `auth.uid()` returns your user ID

### Performance issues
- Check if indexes are created (they should be in schema.sql)
- Monitor slow queries in **Logs** → **Query Performance**

## Database Maintenance

### Backup
- Supabase automatically backs up your database
- For manual backups: Database → Backups → Create backup

### Monitoring
- Check **Logs** for errors
- Monitor **Database** → **Usage** for storage/connection limits

### Adding New Columns
When you need to add columns later, use migrations:

```sql
ALTER TABLE table_name 
ADD COLUMN new_column TYPE;
```

## Next Steps

Once database is set up:
1. Test authentication works
2. Create a user profile through the app
3. Log your first hormone test
4. Verify data appears in Supabase dashboard

