# Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `migrations/0001_schema.sql` (schema, RLS, policies, storage bucket).
3. Run `migrations/0002_seed.sql` for demo content (Cruise Tourism and Introduction to Tourism).
4. Promote your account to admin after signing up once:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'your-email@example.com');
```

5. In **Authentication → URL Configuration**, set the Site URL and add
   `<your-site>/auth/callback` to the Redirect URLs.
