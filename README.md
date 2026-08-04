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

## Cloudflare Workers Deployment (Workers Assets)

This application is ready to be deployed as a Single Page Application (SPA) to Cloudflare Workers using the modern **Workers Assets** system.

### Prerequisites
1. Ensure you have a Cloudflare account.
2. Install the Cloudflare Wrangler CLI globally (optional, as it's already installed in development dependencies):
   ```bash
   npm install -g wrangler
   ```

### Deployment Steps
1. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```
2. **Configure Environment Variables**:
   Vite loads environment variables at build-time. Make sure your `.env` contains the correct Supabase production keys before compiling.
3. **Deploy with a single command**:
   ```bash
   npm run deploy
   ```

This command automatically builds the static assets of the Vite React SPA inside `./dist` and uploads them to the Cloudflare network. The configured `wrangler.toml` handles routing fallbacks seamlessly, redirecting deep links to `index.html` for client-side routing.

