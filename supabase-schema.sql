-- ============================================================
-- ORGATIVA — Supabase Schema + Seed Data
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT 'category',
  image_url   TEXT,
  product_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug           TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  category_label TEXT NOT NULL,
  category_slug  TEXT NOT NULL REFERENCES categories(slug) ON UPDATE CASCADE,
  weight         TEXT NOT NULL,
  price          INTEGER NOT NULL,
  original_price INTEGER,
  rating         INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  reviews        INTEGER NOT NULL DEFAULT 0,
  image          TEXT NOT NULL,
  images         TEXT[] NOT NULL DEFAULT '{}',
  badge          TEXT,
  description    TEXT NOT NULL DEFAULT '',
  highlights     TEXT[] NOT NULL DEFAULT '{}',
  origin         TEXT NOT NULL DEFAULT '',
  in_stock       BOOLEAN NOT NULL DEFAULT TRUE,
  featured       BOOLEAN NOT NULL DEFAULT FALSE,
  trending       BOOLEAN NOT NULL DEFAULT FALSE,
  display_order  INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number    TEXT UNIQUE NOT NULL,
  customer_name   TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  division        TEXT NOT NULL,
  district        TEXT NOT NULL,
  thana           TEXT NOT NULL,
  address         TEXT NOT NULL,
  postcode        TEXT,
  payment_method  TEXT NOT NULL,
  payment_number  TEXT,
  transaction_id  TEXT,
  subtotal        INTEGER NOT NULL,
  delivery_fee    INTEGER NOT NULL DEFAULT 0,
  total           INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TABLE: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name  TEXT NOT NULL,
  product_image TEXT NOT NULL,
  quantity      INTEGER NOT NULL CHECK (quantity > 0),
  unit_price    INTEGER NOT NULL,
  total_price   INTEGER NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: site_settings
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL DEFAULT '',
  label       TEXT,
  group_name  TEXT NOT NULL DEFAULT 'general',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public: read categories, products, site_settings
CREATE POLICY "Public read categories"    ON categories   FOR SELECT USING (true);
CREATE POLICY "Public read products"      ON products     FOR SELECT USING (true);
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);

-- Public: insert orders (checkout) and read orders for tracking
CREATE POLICY "Public insert orders"      ON orders      FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read orders"        ON orders      FOR SELECT USING (true);
CREATE POLICY "Public insert order_items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read order_items"   ON order_items FOR SELECT USING (true);

-- Authenticated (admin): full access to all tables
CREATE POLICY "Admin all categories"    ON categories   FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all products"      ON products     FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all orders"        ON orders       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all order_items"   ON order_items  FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin all site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS products_category_slug_idx ON products(category_slug);
CREATE INDEX IF NOT EXISTS products_in_stock_idx       ON products(in_stock);
CREATE INDEX IF NOT EXISTS products_featured_idx       ON products(featured);
CREATE INDEX IF NOT EXISTS products_trending_idx       ON products(trending);
CREATE INDEX IF NOT EXISTS orders_status_idx           ON orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx       ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx    ON order_items(order_id);

-- ============================================================
-- SEED: categories
-- ============================================================
INSERT INTO categories (slug, label, icon, image_url, product_count, display_order) VALUES
  ('grocery',    'মুদিখানা',  'shopping_basket',      'https://lh3.googleusercontent.com/aida-public/AB6AXuDSg9hH9ujnIKyNiGKZJyg4HfJMPVD_0ldRswiaQusRyN7UXTaJvPLvAYSp_9R1K3_Mtk2rqWh0czflf5-C7G8UPa1pgtlnosfQgi_cBKYn9KZ-4WJnBCVkzLZvEtHLsysQ9_7Qg9BeH8oQfSd4pIw22Vh8OcuM0XUzoJXLm_QnTb5gIKgBb4w9Je59EWeVd5I3foeT8lCczcVnjGlhLJE_Kt8YSNaD8hGYDlFcBhLs9htEmECTNRTE7OV_K8jYr0Oc-qZTJfasa_Ql', 24, 1),
  ('wellness',   'স্বাস্থ্য', 'spa',                   'https://lh3.googleusercontent.com/aida-public/AB6AXuARi7y4X1xKus8g3_P2uWyUQg_lzIJOrWI1WEYMY90tA2LsfCO6Rb5sRi7pRC4wcZc1r4ld-nXnyVUR2Wp50MoCpxRb6W8JeE9ooYfApjTNHtzEB3f0g5SmTNUQGfGkjSa366wupd4dfx5ZmnWLVIpgaL9akE39EyjQrN7OE9MgllO2R1DBG837omZuisu-8nYfMPSQ9Ws5A6y2cMY0TZCq2p0jaf3NZCaP5TlEY5MLsLlL8J0hyKeOaqH2j1JwImfto8GJF9Xhw10z', 18, 2),
  ('dry-fruits', 'শুকনো ফল', 'nutrition',              'https://lh3.googleusercontent.com/aida-public/AB6AXuC4OyRQIUdiUI7it70igzeO1DTJ9YVekCu-ry2N4leQLGGJ2HnFGn6XSMYhcje8nPa_PoQ5FB6g88WYGzb02d37Zq9ir4WXr8GE9D-K1PzV5rUZptriy8g_Vu4EfEvRPZ-YZGgJASwN0dK16Z1y_ObdW6cjCibodpBPVuYhQfTFQZLQEezNI7wMDjY6Dt7wMv6J-Jz9fOqlQo4bB9DLKVJNyleZ6iXTM_vVJPgDhWXmX8PxwfdNM2TBvoAtMbDolXEu0eaewM9PD8WT', 32, 3),
  ('honey',      'মধু',       'hive',                  'https://lh3.googleusercontent.com/aida-public/AB6AXuDOuWkZmVQOm9mTIlZMs0yKmUQgzUb9t2X-H8Bqcw_jMA19Xg3r9RxZHueHSssW9BEdAsoBE-1ArJfAXM1-bY2LWvli8I6ORJfLjtTxFOojBApcyYIQfdjZ5uddeHETIb79GEcGTw-qqVHRMZ30YjLwjApQcm3xan0Sxjj1_IilIis3b8FT5kKBYije_rX2FLVkWZC5ycakZwHeoev35K-uaTKNMf54GkvnprZvESneoKbefsticw0Q_sGc-cIk2NBSACdii1gSx', 12, 4),
  ('spices',     'মশলা',      'local_fire_department', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBq58vEH7gYivPXEcLtToX4pCgGkviWmugMHiaigVEtrhNKVWTb4fTxR1hT32LDpNdlSJzxRskyCEBJLI9quHz9O_6QJVWrn2OIY0kpmCMFk7aQwMx5LqiF6lunsosrCjrayF1NNm2DDGr068cYTrgWBexlw0yOmDhPOzDAp1MypmTUW6y9JGsEHMxMHefsdhAn4UsSDMBRDY5ICzk37jUhLrIrO4ZkFiI3ZE-r9CNn86Gtqi1oO6X-niuYbLh0cNTrJ99yBDhQFyb7', 28, 5),
  ('tea-coffee', 'চা ও কফি', 'coffee',                'https://lh3.googleusercontent.com/aida-public/AB6AXuARi7y4X1xKus8g3_P2uWyUQg_lzIJOrWI1WEYMY90tA2LsfCO6Rb5sRi7pRC4wcZc1r4ld-nXnyVUR2Wp50MoCpxRb6W8JeE9ooYfApjTNHtzEB3f0g5SmTNUQGfGkjSa366wupd4dfx5ZmnWLVIpgaL9akE39EyjQrN7OE9MgllO2R1DBG837omZuisu-8nYfMPSQ9Ws5A6y2cMY0TZCq2p0jaf3NZCaP5TlEY5MLsLlL8J0hyKeOaqH2j1JwImfto8GJF9Xhw10z', 15, 6),
  ('grains',     'শস্য',      'grain',                 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSg9hH9ujnIKyNiGKZJyg4HfJMPVD_0ldRswiaQusRyN7UXTaJvPLvAYSp_9R1K3_Mtk2rqWh0czflf5-C7G8UPa1pgtlnosfQgi_cBKYn9KZ-4WJnBCVkzLZvEtHLsysQ9_7Qg9BeH8oQfSd4pIw22Vh8OcuM0XUzoJXLm_QnTb5gIKgBb4w9Je59EWeVd5I3foeT8lCczcVnjGlhLJE_Kt8YSNaD8hGYDlFcBhLs9htEmECTNRTE7OV_K8jYr0Oc-qZTJfasa_Ql', 20, 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: products (all 8)
-- ============================================================
INSERT INTO products (slug, name, category_label, category_slug, weight, price, original_price, rating, reviews, image, images, badge, description, highlights, origin, in_stock, featured, trending, display_order) VALUES
(
  'wild-forest-honey', 'বন্য বনের মধু', 'মধু', 'honey',
  '৫০০ গ্রাম নিট', 2400, 2800, 5, 42,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBq58vEH7gYivPXEcLtToX4pCgGkviWmugMHiaigVEtrhNKVWTb4fTxR1hT32LDpNdlSJzxRskyCEBJLI9quHz9O_6QJVWrn2OIY0kpmCMFk7aQwMx5LqiF6lunsosrCjrayF1NNm2DDGr068cYTrgWBexlw0yOmDhPOzDAp1MypmTUW6y9JGsEHMxMHefsdhAn4UsSDMBRDY5ICzk37jUhLrIrO4ZkFiI3ZE-r9CNn86Gtqi1oO6X-niuYbLh0cNTrJ99yBDhQFyb7',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuBq58vEH7gYivPXEcLtToX4pCgGkviWmugMHiaigVEtrhNKVWTb4fTxR1hT32LDpNdlSJzxRskyCEBJLI9quHz9O_6QJVWrn2OIY0kpmCMFk7aQwMx5LqiF6lunsosrCjrayF1NNm2DDGr068cYTrgWBexlw0yOmDhPOzDAp1MypmTUW6y9JGsEHMxMHefsdhAn4UsSDMBRDY5ICzk37jUhLrIrO4ZkFiI3ZE-r9CNn86Gtqi1oO6X-niuYbLh0cNTrJ99yBDhQFyb7', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOuWkZmVQOm9mTIlZMs0yKmUQgzUb9t2X-H8Bqcw_jMA19Xg3r9RxZHueHSssW9BEdAsoBE-1ArJfAXM1-bY2LWvli8I6ORJfLjtTxFOojBApcyYIQfdjZ5uddeHETIb79GEcGTw-qqVHRMZ30YjLwjApQcm3xan0Sxjj1_IilIis3b8FT5kKBYije_rX2FLVkWZC5ycakZwHeoev35K-uaTKNMf54GkvnprZvESneoKbefsticw0Q_sGc-cIk2NBSACdii1gSx'],
  'সেরা বিক্রয়',
  'সুন্দরবনের বিশুদ্ধ ম্যানগ্রোভ বন থেকে সংগ্রহ করা এই কাঁচা বন্য মধু অফিল্টার্ড ও তাপমুক্ত — প্রতিটি এনজাইম, অ্যান্টিঅক্সিডেন্ট ও প্রাকৃতিক স্বাদ সংরক্ষিত।',
  ARRAY['১০০% কাঁচা, অফিল্টার্ড ও তাপমুক্ত', 'সুন্দরবন, বাংলাদেশ থেকে সংগ্রহ', 'অ্যান্টিঅক্সিডেন্ট ও এনজাইম সমৃদ্ধ', 'কোনো সংযোজন বা সংরক্ষক নেই', 'বিশুদ্ধতার জন্য ল্যাব-পরীক্ষিত'],
  'সুন্দরবন, বাংলাদেশ', TRUE, TRUE, TRUE, 1
),
(
  'cold-pressed-mustard-oil', 'ঠান্ডা চাপা সরিষার তেল', 'মুদিখানা', 'grocery',
  '৭৫০ মিলি · ভার্জিন গ্রেড', 1850, 2200, 4, 28,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA5GzOFWh1pgalQi48-L6jXrnrBdcvDxK-Gb2S8CCtBZFhvlX6tSY2Kz_j7uleHESVRHEh2qnBrg-_pdX-Ks_uVdKF5QPfZpif5WE-0yV3F0MmXlPDL9MqfTONTNjX7iazXEden3BKL14y5eckX2gd8w4dug-rDpGiPJIq0JpnVgtv8zQNZ2mKOn1kg3Iisw4JEuaZNxS0M2pjAGoHHG_zXdz9MCZGlp3pmHyrpaZ0fMr2frPb0LRDYEWVdycoyfZpBlnXXx4gm11UX',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuA5GzOFWh1pgalQi48-L6jXrnrBdcvDxK-Gb2S8CCtBZFhvlX6tSY2Kz_j7uleHESVRHEh2qnBrg-_pdX-Ks_uVdKF5QPfZpif5WE-0yV3F0MmXlPDL9MqfTONTNjX7iazXEden3BKL14y5eckX2gd8w4dug-rDpGiPJIq0JpnVgtv8zQNZ2mKOn1kg3Iisw4JEuaZNxS0M2pjAGoHHG_zXdz9MCZGlp3pmHyrpaZ0fMr2frPb0LRDYEWVdycoyfZpBlnXXx4gm11UX'],
  'অর্গানিক',
  'ঐতিহ্যবাহী ঠান্ডা চাপা পাথর ভাঙা পদ্ধতিতে তৈরি এই ভার্জিন সরিষার তেল প্রাকৃতিক ঝাঁজ, ওমেগা-৩ ফ্যাটি অ্যাসিড ও গ্লুকোসিনোলেট সংরক্ষণ করে।',
  ARRAY['প্রথম ঠান্ডা চাপা নিষ্কাশন', 'প্রাকৃতিক গ্লুকোসিনোলেট বজায় রাখে', 'ওমেগা-৩ ও ওমেগা-৬ সমৃদ্ধ', 'কোনো হেক্সেন বা রাসায়নিক নেই', 'ঐতিহ্যবাহী পাথর ভাঙা পদ্ধতি'],
  'রাজশাহী, বাংলাদেশ', TRUE, FALSE, TRUE, 2
),
(
  'premium-pistachios', 'প্রিমিয়াম পেস্তা বাদাম', 'শুকনো ফল', 'dry-fruits',
  '২৫০ গ্রাম · ভাজা', 3200, NULL, 5, 156,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAV_9aStLOUy3wxdgtym2iJwX-mmsl6jPJD6ecTZT3ziz2Tj-7pVXrqDCQtEOQ1kzc5XZ9Y9EX1rThCwppLb5Ba6F1-DP_5Gj-P6rlShkJGl9-jVC03jtFGxY5OQAGu5T5uN8a7exjnEslKqzIgo2XojJ3Sut175FRnz4WnEjtZRYIDTFSiYFVbuvsJ9GqCw4_PbgqjDXCx8QA7F61_Axk_Oki0NTEjqUGDoqK2smHnSmqtEy_xZKZrNfTpDdaKzmjBG3-bkpQClACP',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuAV_9aStLOUy3wxdgtym2iJwX-mmsl6jPJD6ecTZT3ziz2Tj-7pVXrqDCQtEOQ1kzc5XZ9Y9EX1rThCwppLb5Ba6F1-DP_5Gj-P6rlShkJGl9-jVC03jtFGxY5OQAGu5T5uN8a7exjnEslKqzIgo2XojJ3Sut175FRnz4WnEjtZRYIDTFSiYFVbuvsJ9GqCw4_PbgqjDXCx8QA7F61_Axk_Oki0NTEjqUGDoqK2smHnSmqtEy_xZKZrNfTpDdaKzmjBG3-bkpQClACP'],
  'প্রিমিয়াম',
  'ইরানের সেরা বাগান থেকে হাতে বাছাই করা এই পেস্তা বাদাম হালকাভাবে ভেজে প্রাকৃতিক মাখনের মতো মিষ্টি স্বাদ বাড়ানো হয়েছে।',
  ARRAY['হাতে বাছাই প্রিমিয়াম মানের', 'হালকা ভাজা, তেল ছাড়া', 'উদ্ভিদ-ভিত্তিক প্রোটিনের উৎস', 'অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ', 'পুনরায় সিলযোগ্য প্যাকেজিং'],
  'ইরান (অর্গাটিভা আমদানি)', TRUE, TRUE, FALSE, 3
),
(
  'hand-churned-ghee', 'হাতে তৈরি ঘি', 'মুদিখানা', 'grocery',
  'ঐতিহ্যবাহী কারিগরি', 2800, 3200, 4, 89,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuANdJPuajyHXCp7iaCYfSFlXnopP1beP-KgAbmdmX1lt5SMH_C3_9CLD2By3zJ9krkw5PF9Lml-mSOEcTLSfbSkb3Qf5-BiRlT8A_QYfY28tect19CUj5EWHG5_LMQXowf87L424S9yL1awzpv4dLpT9PrXFkcJypZtLB0Zp5E3ovtK7vzAHW5AcmfLKILDwZsvVPYSXiuRO1Yn4MUTCCmm7gzOYg-sd9yHviieYhyrn2p93b--_W8qcR-J1-6HWrVbTZqUfedVRsuE',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuANdJPuajyHXCp7iaCYfSFlXnopP1beP-KgAbmdmX1lt5SMH_C3_9CLD2By3zJ9krkw5PF9Lml-mSOEcTLSfbSkb3Qf5-BiRlT8A_QYfY28tect19CUj5EWHG5_LMQXowf87L424S9yL1awzpv4dLpT9PrXFkcJypZtLB0Zp5E3ovtK7vzAHW5AcmfLKILDwZsvVPYSXiuRO1Yn4MUTCCmm7gzOYg-sd9yHviieYhyrn2p93b--_W8qcR-J1-6HWrVbTZqUfedVRsuE'],
  'ঐতিহ্যবাহী',
  'ঐতিহ্যবাহী বিলোনা পদ্ধতিতে ছোট ব্যাচে তৈরি — যেখানে দই হাতে মাখন করে ধীরে ধীরে রান্না করে সোনালী ঘি তৈরি হয়।',
  ARRAY['ঐতিহ্যবাহী বিলোনা পদ্ধতি', 'দেশি গরুর A2 দুধ', 'ধীরে রান্না, ছোট ব্যাচ', 'দানাদার গঠন = বিশুদ্ধ ঘি', 'কোনো সংযোজন বা রঙ নেই'],
  'পাবনা, বাংলাদেশ', TRUE, FALSE, FALSE, 4
),
(
  'organic-turmeric-powder', 'জৈব হলুদ গুঁড়া', 'মশলা', 'spices',
  '২০০ গ্রাম · গুঁড়া', 850, NULL, 5, 203,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDSg9hH9ujnIKyNiGKZJyg4HfJMPVD_0ldRswiaQusRyN7UXTaJvPLvAYSp_9R1K3_Mtk2rqWh0czflf5-C7G8UPa1pgtlnosfQgi_cBKYn9KZ-4WJnBCVkzLZvEtHLsysQ9_7Qg9BeH8oQfSd4pIw22Vh8OcuM0XUzoJXLm_QnTb5gIKgBb4w9Je59EWeVd5I3foeT8lCczcVnjGlhLJE_Kt8YSNaD8hGYDlFcBhLs9htEmECTNRTE7OV_K8jYr0Oc-qZTJfasa_Ql',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuDSg9hH9ujnIKyNiGKZJyg4HfJMPVD_0ldRswiaQusRyN7UXTaJvPLvAYSp_9R1K3_Mtk2rqWh0czflf5-C7G8UPa1pgtlnosfQgi_cBKYn9KZ-4WJnBCVkzLZvEtHLsysQ9_7Qg9BeH8oQfSd4pIw22Vh8OcuM0XUzoJXLm_QnTb5gIKgBb4w9Je59EWeVd5I3foeT8lCczcVnjGlhLJE_Kt8YSNaD8hGYDlFcBhLs9htEmECTNRTE7OV_K8jYr0Oc-qZTJfasa_Ql'],
  'অর্গানিক',
  'তাজা লাকাডং হলুদের শিকড় থেকে পাথরে গুঁড়া করা — বিশ্বে সর্বোচ্চ কারকিউমিন পরিমাণের জন্য বিখ্যাত (৭–১২%)।',
  ARRAY['উচ্চ কারকিউমিন: ৭–১২%', 'পাথরে গুঁড়া, স্প্রে-শুকানো নয়', 'কোনো ভেজাল বা স্টার্চ নেই', 'গভীর সোনালী রঙ ও সুবাস', 'তৃতীয় পক্ষ ল্যাব প্রত্যয়িত'],
  'সিলেট, বাংলাদেশ', TRUE, FALSE, TRUE, 5
),
(
  'green-tea-garden-fresh', 'বাগান তাজা সবুজ চা', 'চা ও কফি', 'tea-coffee',
  '১০০ গ্রাম · লুজ লিফ', 1200, NULL, 4, 67,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuARi7y4X1xKus8g3_P2uWyUQg_lzIJOrWI1WEYMY90tA2LsfCO6Rb5sRi7pRC4wcZc1r4ld-nXnyVUR2Wp50MoCpxRb6W8JeE9ooYfApjTNHtzEB3f0g5SmTNUQGfGkjSa366wupd4dfx5ZmnWLVIpgaL9akE39EyjQrN7OE9MgllO2R1DBG837omZuisu-8nYfMPSQ9Ws5A6y2cMY0TZCq2p0jaf3NZCaP5TlEY5MLsLlL8J0hyKeOaqH2j1JwImfto8GJF9Xhw10z',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuARi7y4X1xKus8g3_P2uWyUQg_lzIJOrWI1WEYMY90tA2LsfCO6Rb5sRi7pRC4wcZc1r4ld-nXnyVUR2Wp50MoCpxRb6W8JeE9ooYfApjTNHtzEB3f0g5SmTNUQGfGkjSa366wupd4dfx5ZmnWLVIpgaL9akE39EyjQrN7OE9MgllO2R1DBG837omZuisu-8nYfMPSQ9Ws5A6y2cMY0TZCq2p0jaf3NZCaP5TlEY5MLsLlL8J0hyKeOaqH2j1JwImfto8GJF9Xhw10z'],
  'তাজা ফসল',
  'সিলেটের চা বাগানের ঢেউখেলানো পাহাড় থেকে হাতে তুলা এই প্রথম ফ্লাশের পাতা হালকাভাবে বাষ্পে প্রক্রিয়াজাত করা হয়।',
  ARRAY['প্রথম বসন্তের ফ্লাশ ফসল', 'হাতে তোলা দুই পাতা ও কুঁড়ি', 'হালকা অক্সিডেশন, উচ্চ অ্যান্টিঅক্সিডেন্ট', 'কীটনাশক ও রাসায়নিকমুক্ত বাগান', 'তাজা রাখতে ফয়েল-সিলড'],
  'সিলেট চা বাগান, বাংলাদেশ', TRUE, FALSE, FALSE, 6
),
(
  'organic-black-seed', 'জৈব কালিজিরার তেল', 'স্বাস্থ্য', 'wellness',
  '২০০ মিলি · ঠান্ডা চাপা', 1950, NULL, 5, 118,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC4OyRQIUdiUI7it70igzeO1DTJ9YVekCu-ry2N4leQLGGJ2HnFGn6XSMYhcje8nPa_PoQ5FB6g88WYGzb02d37Zq9ir4WXr8GE9D-K1PzV5rUZptriy8g_Vu4EfEvRPZ-YZGgJASwN0dK16Z1y_ObdW6cjCibodpBPVuYhQfTFQZLQEezNI7wMDjY6Dt7wMv6J-Jz9fOqlQo4bB9DLKVJNyleZ6iXTM_vVJPgDhWXmX8PxwfdNM2TBvoAtMbDolXEu0eaewM9PD8WT',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuC4OyRQIUdiUI7it70igzeO1DTJ9YVekCu-ry2N4leQLGGJ2HnFGn6XSMYhcje8nPa_PoQ5FB6g88WYGzb02d37Zq9ir4WXr8GE9D-K1PzV5rUZptriy8g_Vu4EfEvRPZ-YZGgJASwN0dK16Z1y_ObdW6cjCibodpBPVuYhQfTFQZLQEezNI7wMDjY6Dt7wMv6J-Jz9fOqlQo4bB9DLKVJNyleZ6iXTM_vVJPgDhWXmX8PxwfdNM2TBvoAtMbDolXEu0eaewM9PD8WT'],
  'স্বাস্থ্যকর',
  'ঐতিহ্যবাহী চিকিৎসায় মৃত্যু ছাড়া সব রোগের ওষুধ বলে পরিচিত এই ঠান্ডা চাপা নাইজেলা সাটিভা তেল।',
  ARRAY['উচ্চ থাইমোকুইনোন পরিমাণ', 'ঠান্ডা চাপা, শূন্য তাপ', 'রোগ প্রতিরোধ ও শ্বাসতন্ত্র সহায়তা', 'প্রিমিয়াম ইথিওপিয়ান কালিজিরা', 'সংরক্ষণের জন্য গাঢ় কাচের বোতল'],
  'ইথিওপিয়া (অর্গাটিভা আমদানি)', TRUE, TRUE, FALSE, 7
),
(
  'organic-basmati-rice', 'জৈব বাসমতি চাল', 'শস্য', 'grains',
  '১ কেজি · ২ বছর পুরানো', 1100, NULL, 4, 74,
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDSg9hH9ujnIKyNiGKZJyg4HfJMPVD_0ldRswiaQusRyN7UXTaJvPLvAYSp_9R1K3_Mtk2rqWh0czflf5-C7G8UPa1pgtlnosfQgi_cBKYn9KZ-4WJnBCVkzLZvEtHLsysQ9_7Qg9BeH8oQfSd4pIw22Vh8OcuM0XUzoJXLm_QnTb5gIKgBb4w9Je59EWeVd5I3foeT8lCczcVnjGlhLJE_Kt8YSNaD8hGYDlFcBhLs9htEmECTNRTE7OV_K8jYr0Oc-qZTJfasa_Ql',
  ARRAY['https://lh3.googleusercontent.com/aida-public/AB6AXuDSg9hH9ujnIKyNiGKZJyg4HfJMPVD_0ldRswiaQusRyN7UXTaJvPLvAYSp_9R1K3_Mtk2rqWh0czflf5-C7G8UPa1pgtlnosfQgi_cBKYn9KZ-4WJnBCVkzLZvEtHLsysQ9_7Qg9BeH8oQfSd4pIw22Vh8OcuM0XUzoJXLm_QnTb5gIKgBb4w9Je59EWeVd5I3foeT8lCczcVnjGlhLJE_Kt8YSNaD8hGYDlFcBhLs9htEmECTNRTE7OV_K8jYr0Oc-qZTJfasa_Ql'],
  'পুরাতন',
  'জলবায়ু-নিয়ন্ত্রিত গুদামে ২ বছর প্রাকৃতিকভাবে পুরানো এই লং-গ্রেইন বাসমতি চাল রান্নায় আলাদা, ফুলকো ও সুগন্ধি হয়।',
  ARRAY['অতিরিক্ত সুবাসের জন্য ২ বছর পুরানো', 'এক্সট্রা-লং গ্রেইন', 'জৈব চাষ, কোনো রাসায়নিক নেই', 'আলাদা ও ফুলকো রান্না হয়', 'পুনরায় সিলযোগ্য ফুড-সেফ প্যাকেজিং'],
  'দিনাজপুর, বাংলাদেশ', TRUE, FALSE, FALSE, 8
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED: site_settings
-- ============================================================
INSERT INTO site_settings (key, value, label, group_name) VALUES
  ('delivery_fee',        '60',                       'ডেলিভারি চার্জ (টাকা)',       'delivery'),
  ('free_delivery_above', '1000',                     'বিনামূল্যে ডেলিভারি ন্যূনতম', 'delivery'),
  ('site_phone',          '01700000000',               'সাইট ফোন নম্বর',              'contact'),
  ('site_email',          'hello@orgativa.com.bd',    'সাইট ইমেইল',                  'contact'),
  ('hero_headline',       'বিশুদ্ধ উৎস। সুস্থ জীবন।', 'হিরো শিরোনাম',                'hero'),
  ('hero_subline',        '১০০% অর্গানিক।',            'হিরো সাবলাইন',                'hero'),
  ('hero_description',    'বাংলাদেশের সেরা খামার থেকে হাতে বাছাই করা — কীটনাশকমুক্ত, ল্যাব-প্রত্যয়িত পণ্য।', 'হিরো বিবরণ', 'hero'),
  ('promo_1_title',       '🔥 ফ্ল্যাশ সেল',             'প্রমো ১ শিরোনাম',              'promos'),
  ('promo_1_desc',        'নির্বাচিত পণ্যে ২০% ছাড়',  'প্রমো ১ বিবরণ',               'promos'),
  ('promo_2_title',       '🌿 নতুন পণ্য',               'প্রমো ২ শিরোনাম',              'promos'),
  ('promo_2_desc',        'তাজা মৌসুমি ফসল',           'প্রমো ২ বিবরণ',               'promos'),
  ('promo_3_title',       '🚚 বিনামূল্যে ডেলিভারি',     'প্রমো ৩ শিরোনাম',              'promos'),
  ('promo_3_desc',        '৳১,০০০+ অর্ডারে',           'প্রমো ৩ বিবরণ',               'promos')
ON CONFLICT (key) DO NOTHING;
