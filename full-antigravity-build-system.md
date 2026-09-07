# FULL BUILD SYSTEM — Amazon Affiliate Platform (Antigravity)
Run these in order, one at a time. Don't paste all of them together — let each phase complete and verify before moving to the next, or Antigravity will half-wire things.

---

## PHASE 0 — Setup (do this yourself, not a prompt)
1. Create Supabase project → copy URL, anon key, service role key
2. Create PostHog account (free) → copy project API key
3. Run the SQL below in Supabase SQL editor (schema + RLS in one shot)

```sql
create extension if not exists pgcrypto;

create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  image_url text,
  price numeric,
  category text,
  amazon_url text not null,
  description text,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

create table clicks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device text,
  country text,
  clicked_at timestamptz default now()
);

create table admins (
  id uuid primary key references auth.users(id),
  email text
);

alter table products enable row level security;
alter table clicks enable row level security;
alter table admins enable row level security;

create policy "public read active products" on products for select using (active = true);
create policy "admins full access products" on products for all
  using (auth.uid() in (select id from admins))
  with check (auth.uid() in (select id from admins));
create policy "admins read clicks" on clicks for select
  using (auth.uid() in (select id from admins));
```

4. After creating your own auth user (Supabase Auth → add user), manually insert yourself into `admins`:
```sql
insert into admins (id, email) values ('<your-auth-user-id>', 'you@email.com');
```

Env vars you'll need ready before Phase 1:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## PHASE 1 — Scaffold + Storefront
```
Create a Next.js 14 App Router + TypeScript + Tailwind project named "affiliate-storefront".
Install and configure @supabase/supabase-js, @supabase/ssr, posthog-js, posthog-node, zod.
Set up a Supabase client util at lib/supabase/client.ts (browser, anon key) and lib/supabase/server.ts (server, service role key for privileged operations).

Build the public storefront at app/page.tsx:
- Server component, fetch all products where active = true, ordered by featured desc then created_at desc
- Render a responsive grid of ProductCard (components/ProductCard.tsx): image, title, price, category badge, "View Deal" button
- "View Deal" links to /go/[slug] — never directly to amazon_url
- Add a client-side category filter bar and search input above the grid (components/ProductFilters.tsx)
- Add a persistent, non-dismissible footer disclosure: "As an Amazon Associate I earn from qualifying purchases."

Design tokens (Tailwind config, add as custom colors):
brand-orange: #FF6B00, brand-black: #0A0A0A, brand-white: #FFFFFF, ember-red: #FF3D00,
warm-amber: #FF9A3C, peach-tint: #FFE0C2, deep-charcoal: #1A1A1A, off-white: #F5F5F2
Font: Poppins (import via next/font/google, weights 300/400/500/700), fallback system sans.
Background: brand-black with a subtle SVG dot-grid pattern (orange dots, 3pt diameter, 14px spacing, low opacity) as a fixed background layer.
Cards: off-white or deep-charcoal background depending on light/dark section, rounded-lg, subtle shadow, orange accent on hover/CTA buttons.
Fully responsive, mobile-first.

Do not add auth to this route. Do not hardcode products — Supabase only.
```

---

## PHASE 2 — Tracked Redirect (revenue-critical path)
```
Install @upstash/ratelimit and @upstash/redis.
Create a Route Handler at app/go/[slug]/route.ts that:
1. Rate-limits by IP: max 20 requests/minute per IP+slug combo using Upstash. On exceeded, return 429 with plain text "Too many requests" — do not redirect.
2. Looks up the product by slug using the SERVER supabase client (service role key). If not found or inactive, redirect to "/" with a not-found query param.
3. Fires two things without blocking the response:
   a. Insert into "clicks": product_id, referrer (request.headers.get('referer')), utm_source/utm_medium/utm_campaign (from request.nextUrl.searchParams), device (basic parse of user-agent into "mobile"/"desktop"/"tablet"), country (request.headers.get('cf-ipcountry') or null)
   b. posthog-node server capture: event "affiliate_click", distinct_id = a hashed IP or anonymous UUID from cookie, properties { product_id, slug, price, category }
4. Returns a 302 redirect to product.amazon_url immediately — do not await the tracking writes before redirecting; fire them and let them resolve in the background (use waitUntil if on Vercel edge, or just don't await in Node runtime).

Add Zod validation: reject if slug doesn't match /^[a-z0-9-]+$/ before hitting the DB.
```

---

## PHASE 3 — Admin Auth + Panel
```
Add Supabase Auth (email/password) for admin access.
Create:
- app/admin/login/page.tsx — email/password form, on success redirect to /admin
- middleware.ts — protect all /admin/* routes: check session exists AND user id exists in "admins" table (server-side check via supabase server client), else redirect to /admin/login
- app/admin/page.tsx — dashboard: table of all products (title, price, category, active toggle, featured toggle, edit/delete buttons), "+ Add Product" button
- app/admin/products/new/page.tsx and app/admin/products/[id]/edit/page.tsx — form with fields: title, slug (auto-slugify from title on blur, manually editable), image upload (to Supabase Storage bucket "product-images", client-side compress to max 800px webp before upload using browser-image-compression), price, category (dropdown, editable list), amazon_url, description (textarea), featured (toggle), active (toggle)
- Validate all fields with Zod: amazon_url must match /^https:\/\/(www\.)?amazon\.[a-z.]+\//, price must be positive number, slug lowercase-alphanumeric-hyphens only. Show inline errors, block submission on invalid.
- Delete action requires a confirm dialog.

Style: dark theme, deep-charcoal background, Poppins, orange accent buttons and active states. Prioritize functional clarity over decoration — this is an internal tool.
```

---

## PHASE 4 — Analytics Dashboard
```
Add app/admin/analytics/page.tsx (protected by the same admin middleware).
Server-fetch (never client-side, to avoid exposing raw click data) from the "clicks" table joined to "products":
1. Stat cards: total clicks (7d, 30d, all-time)
2. Line chart (Recharts): clicks per day, last 30 days
3. Bar chart (Recharts): top 10 products by click count, all-time
4. Table: traffic breakdown by utm_source — source, count, % of total, sorted desc
5. Table: device breakdown (mobile/desktop/tablet %) and top 5 countries

Install recharts. Add a date-range selector (7d/30d/90d/all) that re-queries on change (use a client component wrapper with server actions or route handler for the query, keep the raw query server-side).
```

---

## PHASE 5 — SEO, Compliance, Deploy Prep
```
Add:
- app/robots.ts — allow all, point to sitemap
- app/sitemap.ts — dynamically generated from active products, if individual product pages exist
- Open Graph + Twitter card meta tags on the homepage (app/layout.tsx metadata export)
- next-sitemap or manual sitemap regeneration on product create/update (can be a simple revalidation)
- A /privacy and /disclosure static page — FTC affiliate disclosure in full, linked from footer

Then:
- Add error.tsx and not-found.tsx at the app root for graceful error handling
- Add loading.tsx with a skeleton grid for the storefront
- Confirm SUPABASE_SERVICE_ROLE_KEY is never imported into any 'use client' file (grep check)
```

---

## Post-build checklist before pointing your domain at it
- [ ] Test RLS: try editing a product from browser devtools using only the anon key — must fail
- [ ] Hit /go/[slug] 25 times in a minute — confirm 429 kicks in
- [ ] Confirm PostHog events showing up in real-time view
- [ ] Confirm clicks table populating on real redirect clicks
- [ ] Mobile Lighthouse score check (target 90+ performance)
- [ ] Set up UptimeRobot (free) pinging /go/[a-known-active-slug] every 5 min
- [ ] Manual weekly Supabase pg_dump until you upgrade off free tier
