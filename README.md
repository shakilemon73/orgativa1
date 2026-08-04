# Orgativa — Organic Grocery E-Commerce Platform

Orgativa is a modern organic e-commerce web application built for Bangladesh with Bangla localization and Supabase integration.

## Features
- **Bangla Localization**: Native language interface and BDT (৳) currency formatting.
- **Organic Product Catalog**: Filter by categories, search, badges (সেরা বিক্রয়, প্রিমিয়াম, অর্গানিক, etc.).
- **Admin Management Panel**: Real-time management for products, categories, orders, and site settings.
- **Supabase Integration**: Full database integration with fallback support.

## Database Setup (Supabase)
To set up your database in Supabase:
1. Open your Supabase Project Dashboard.
2. Go to **SQL Editor**.
3. Copy the contents of `supabase-schema.sql` located at the root of this project and execute it.
4. Set your environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. You can also sync demo products, categories, settings, and orders directly from the **Admin Dashboard** or **Admin Settings** page in the web app.
