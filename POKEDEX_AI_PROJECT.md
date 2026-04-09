# Pokédex.ai — Project Planning Document

> **The unified Pokémon platform for collectors and fans.**
> Every Pokémon. Every card. AI-powered. Free.

---

## 1. Project Overview

### Elevator Pitch
Pokédex.ai is a web app that combines a complete Pokémon encyclopedia, a TCG card database, and an AI-powered collection tracker into one fast, beautiful platform — built for serious collectors and newcomers alike.

### The Problem
Pokemon information is fragmented:
- **Bulbapedia / Serebii** — deep lore, but slow, dated UI, no collector tools
- **Pokémon Database** — clean, but no card data, no collection tracking
- **Pokellector / TCGPlayer** — card tracking, but no game lore or Pokédex
- **None** combine game history + card variations + live prices + AI in one place

### What Pokédex.ai Does Differently
1. Unified game lore + TCG card database in one app
2. AI card scanner — point camera at a card, instantly identify it and add to your collection
3. Smart collection recommendations — "here's what you're missing, here's what's rising in value"
4. Full depth: easter eggs, hidden mechanics, beta/prototype info, shiny odds, breeding strategies
5. Modern, mobile-first design vs. the dated UX of every existing Pokémon site

### Competitive Positioning

| Feature | Pokédex.ai | Bulbapedia | Serebii | Pokémon DB | Pokellector |
|---|---|---|---|---|---|
| Full Pokédex (lore + stats) | ✅ | ✅ | ✅ | ✅ | ❌ |
| TCG Card Database | ✅ | ✅ (partial) | ❌ | ❌ | ✅ |
| Live Card Prices | ✅ | ❌ | ❌ | ❌ | ✅ |
| Collection Tracker | ✅ | ❌ | ❌ | ❌ | ✅ |
| AI Card Scanner | ✅ | ❌ | ❌ | ❌ | Limited |
| Easter Eggs / Hidden Mechanics | ✅ | ✅ | Partial | ❌ | ❌ |
| Modern UI / Mobile-first | ✅ | ❌ | ❌ | Partial | Partial |

---

## 2. Target Users

### Primary Personas

**Collector Carl** — Serious collector with 500+ cards
- Wants to track his collection value, set completion %, and PSA grades
- Researches card prices before buying/selling
- Wants to know which cards in a set are rising in value
- Pain: uses 3 different apps and a spreadsheet today

**New Nikki** — Just discovered Pokémon cards at 22
- Doesn't know where to start — what sets are valuable? What should I buy?
- Wants to understand card variants: why is one Charizard $5 and another $500?
- Wants to learn the Pokémon lore and game history as she collects
- Pain: overwhelmed by existing sites, which assume deep prior knowledge

---

## 3. Core Features — MVP (4–8 Weeks)

### 3.1 Full Pokédex (All 1,025+ Pokémon)

**Browse Page**
- Grid view of all Pokémon with sprite, name, national dex number, types
- Search by name or dex number
- Filter by: type, generation, legendary/mythical status, ability
- Sort by: dex number, name, base stat total

**Individual Pokémon Page**
Each Pokémon page is a deep-dive with the following sections:

| Section | Content |
|---|---|
| **Header** | Official artwork, name, category, types, generation |
| **Stats** | HP, Attack, Defense, Sp. Atk, Sp. Def, Speed — bar chart |
| **Lore & History** | Name etymology, design inspiration, real-world basis, anime appearances |
| **Pokédex Entries** | Every in-game Pokédex description across all games |
| **Game Appearances** | Which games it appears in, how to catch it, regional dex number |
| **Evolution Chain** | Full chain with methods (level, stone, trade, friendship, etc.) |
| **Forms** | Regional forms, Mega evolutions, Gigantamax, gender differences |
| **Sprites** | All sprites from Gen 1 through current, shiny variants |
| **Hidden Mechanics** | Shiny odds + how to boost them, breeding notes, hidden abilities |
| **Easter Eggs** | Known secrets, glitches, developer references for this Pokémon |
| **Related Cards** | TCG cards featuring this Pokémon (links to card detail) |

### 3.2 TCG Card Database

**Browse Page**
- Grid of all cards with card image, name, set, rarity symbol
- Filter by: set, rarity, card type (Pokémon/Trainer/Energy), variant, type
- Search by card name or Pokémon

**Individual Card Page**

| Section | Content |
|---|---|
| **Card Image** | High-res front (and back if relevant) |
| **Card Details** | Set, set number, rarity, HP, attacks, weaknesses, retreat cost |
| **Variant Type** | Regular, Holo, Reverse Holo, Full Art, Alt Art, Secret Rare, Gold Card, Rainbow Rare, Shiny Vault, Promo |
| **Live Prices** | TCGPlayer (USD) + CardMarket (EUR) market price, last updated |
| **Price History** | 30/90/365-day price chart |
| **Market Trend** | Up/Down/Stable indicator |
| **Related Pokémon** | Link to Pokédex entry for this Pokémon |
| **Other Cards** | Other cards of this Pokémon across all sets |

**Card Variant Guide** (dedicated explainer section for new buyers)
- What is a Holo vs Reverse Holo?
- What makes a Secret Rare?
- Why are some cards graded (PSA/BGS)?
- How to spot fakes

### 3.3 Live Card Prices
- Source: Pokemon TCG API (pokemontcg.io) — includes TCGPlayer market pricing
- CardMarket (EUR) via TCGdex or direct CardMarket API
- Price sync: Vercel Cron job runs nightly to update `card_prices` table
- Price history: store daily snapshots in Supabase for chart data
- Display: market price (not listed price) with "last updated X hours ago" label

### 3.4 Collection Tracker

**Authentication**
- Google OAuth and Apple OAuth via Supabase Auth
- No email/password — social login only
- User profile: display name, avatar, join date

**My Collection Dashboard**
- Total collection value (sum of market prices × quantity)
- Value breakdown by set
- Top 10 most valuable cards owned
- Set completion: for each set, "X of Y cards owned (Z%)"
- Recently added cards

**Adding Cards**
- Search for a card → click "Add to Collection"
- Or use the AI card scanner (camera)
- Per card entry: quantity, condition (Mint/Near Mint/Lightly Played/Moderately Played/Heavily Played/Damaged), PSA grade (optional, 1–10 or BGS grades)
- Acquired price (optional — for profit/loss tracking)

**Collection Views**
- List view with filtering/sorting
- Group by: set, Pokémon, rarity, condition
- Export to CSV

---

## 4. AI Features

### 4.1 Card Scanner (Camera AI)

**User Flow**
1. User taps "Scan Card" on mobile
2. Camera activates — user points at a card
3. App sends image to AI endpoint → returns card match with confidence score
4. Matched card shown with name, set, current price
5. User confirms → one tap to add to collection

**Implementation (MVP)**
- API route: `POST /api/ai/scan` — accepts base64 image
- Model: OpenAI Vision API (`gpt-4o-mini` for cost efficiency) with prompt:
  > "Identify this Pokémon TCG card. Return: card name, set name, card number, rarity. If you cannot identify it with high confidence, return null."
- Fallback: if confidence low, redirect to manual search
- Rate limit: 10 scans/day per free user to control OpenAI costs

**Cost Estimate (OpenAI gpt-4o-mini)**
- ~$0.00015 per image input token (roughly 300 tokens per card image)
- ~$0.045 per 100 scans — very low cost at small scale

**Future (v2):** Fine-tuned YOLO11 model running in-browser via TensorFlow.js — zero API cost, offline capable

### 4.2 Collection Recommendations

**MVP (Rule-Based)**
- Set completion suggestions: "You own 87% of Scarlet & Violet Base Set — here are the 5 missing cards"
- Evolution chain completion: "You have Charmander and Charizard cards but no Charmeleon cards"
- Value alerts: "3 cards in your collection have increased 20%+ in the last 30 days"

**v2 (Embedding-Based)**
- Store card embeddings in Supabase pgvector
- "Cards similar to ones you already own" — semantic similarity search
- "Undervalued cards in sets you collect" — price-to-rarity anomaly detection
- "Trending cards in your favorite sets"

---

## 5. Future Features (Post-MVP Roadmap)

| Feature | Priority | Notes |
|---|---|---|
| AI grade estimator | High | Upload photo → estimated PSA grade using vision model |
| AI chatbot | High | "What's the best Charizard card under $50?" — GPT-4o with card DB context |
| Price alerts | High | Email/push when a card you want drops below a target price |
| PWA / mobile app | High | Install to home screen, offline collection access |
| Deck builder | Medium | TCG competitive deck building with legality checks |
| Trade tracker | Medium | Log trades, track what you gave vs. received |
| Beta/prototype section | Medium | Cancelled designs, MissingNo lore, beta sprites, cut Pokémon |
| Competitive tier lists | Medium | VGC and TCG meta analysis with usage stats |
| Pack simulator | Low | Simulate opening booster packs for a set |
| Marketplace | Low | Peer-to-peer card trading/selling (requires licensing) |

---

## 6. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG/ISR per page type, built-in API routes, image optimization |
| Language | TypeScript | Type safety across complex Pokémon + card data shapes |
| Styling | Tailwind CSS + shadcn/ui | Fast colorful UI, accessible components out of the box |
| Animations | CSS transitions + Web Animations API | Card flips, hover effects, reveal animations — no heavy library |
| Database | Supabase (PostgreSQL) | Free tier, built-in auth, real-time, pgvector for v2 AI |
| Auth | Supabase Auth (Google + Apple OAuth) | Social login, zero config, free |
| File Storage | Supabase Storage | User-uploaded card scan images |
| Hosting | Vercel (free tier) | Zero cost, global CDN, cron jobs, edge functions |
| AI — Card Scanner | OpenAI Vision API (gpt-4o-mini) | Cheap per call, reliable card identification |
| AI — Recommendations (v2) | Supabase pgvector + OpenAI Embeddings | Semantic similarity search inside existing DB |
| Ads | Google AdSense | Free to set up, revenue from traffic |

### Why No Heavy Animation Library
Card flip animations and Pokémon entrance effects use:
- CSS: `transform`, `transition`, `@keyframes`, `animation` — GPU-accelerated, zero JS overhead
- Web Animations API: `element.animate([...], { duration, easing })` for JS-driven sequences
- CSS custom properties for dynamic type-color theming per Pokémon

---

## 7. Data Sources

| Source | What It Provides | Cost | Rate Limits |
|---|---|---|---|
| [PokeAPI](https://pokeapi.co) | All 1,025 Pokémon: stats, abilities, moves, lore, game appearances, evolution chains | Free | REST: no limit (fair use); GraphQL: 100 req/hr/IP |
| [Pokemon TCG API](https://pokemontcg.io) | All TCG sets + cards: images, rarity, variants, HP, attacks, TCGPlayer prices | Free (1,000 req/day); free API key for higher limits | 1,000/day without key |
| [TCGdex](https://tcgdex.dev) | 130,000+ cards, multilingual (14 languages), variant data, REST + GraphQL | Free | No documented limit |
| [CardMarket API](https://www.cardmarket.com/en/Pokemon/Tools/API) | EU pricing data | Free (limited) | Registration required |
| [Purukitto/pokemon-data.json](https://github.com/Purukitto/pokemon-data.json) | Bulk JSON with Bulbapedia/pokemondb images | Free, open source | N/A |

**Data Strategy**
1. **Seed once at build time**: Run scripts to pull all Pokémon from PokeAPI and all cards from Pokemon TCG API into Supabase — avoids runtime API calls for core data
2. **Cache image URLs, don't store images**: Use PokeAPI/TCG API CDN URLs directly — avoids hitting Supabase Storage limits
3. **Nightly price sync**: Vercel Cron job calls Pokemon TCG API to refresh prices in `card_prices` table
4. **ISR for Pokémon/card pages**: Revalidate every 24h so content stays fresh without full rebuilds

---

## 8. Database Schema

```sql
-- Pokémon core data
pokemon (
  id          int primary key,    -- national dex number
  name        text,
  slug        text unique,        -- e.g. "charizard", "mr-mime"
  types       text[],             -- e.g. ["Fire", "Flying"]
  stats       jsonb,              -- { hp, attack, defense, sp_atk, sp_def, speed }
  generation  int,
  is_legendary bool,
  is_mythical  bool,
  sprite_url  text,               -- official artwork URL (PokeAPI CDN)
  lore        jsonb               -- { etymology, design, category, height, weight }
)

-- Per-game Pokédex entries
pokemon_game_appearances (
  id          serial primary key,
  pokemon_id  int references pokemon(id),
  game        text,               -- e.g. "Red/Blue", "Scarlet/Violet"
  dex_number  int,                -- regional dex number in that game
  dex_entry   text,               -- in-game Pokédex description
  catch_method text               -- e.g. "Route 4 (grass), Cerulean Cave"
)

-- Easter eggs and hidden mechanics
pokemon_easter_eggs (
  id          serial primary key,
  pokemon_id  int references pokemon(id),
  title       text,               -- e.g. "MissingNo Glitch"
  description text,
  source_game text,               -- e.g. "Red/Blue"
  category    text                -- "glitch" | "easter_egg" | "hidden_mechanic" | "prototype"
)

-- TCG sets
card_sets (
  id          text primary key,   -- e.g. "base1", "sv1"
  name        text,               -- e.g. "Base Set", "Scarlet & Violet"
  series      text,               -- e.g. "Base", "Sword & Shield"
  release_date date,
  total_cards int,
  symbol_url  text
)

-- TCG cards
cards (
  id          text primary key,   -- e.g. "base1-4"
  name        text,
  pokemon_id  int references pokemon(id), -- null for Trainer/Energy cards
  set_id      text references card_sets(id),
  collector_number text,
  rarity      text,               -- e.g. "Rare Holo", "Secret Rare"
  variant_type text,              -- "standard" | "holo" | "reverse_holo" | "full_art" | "alt_art" | "secret_rare" | "gold" | "rainbow_rare" | "shiny_vault" | "promo"
  supertype   text,               -- "Pokémon" | "Trainer" | "Energy"
  hp          int,
  types       text[],
  attacks     jsonb,
  image_url   text,               -- TCG API CDN URL
  image_url_hires text
)

-- Live prices (updated nightly)
card_prices (
  id          serial primary key,
  card_id     text references cards(id),
  platform    text,               -- "tcgplayer" | "cardmarket"
  price_usd   decimal(10,2),
  price_eur   decimal(10,2),
  updated_at  timestamptz default now()
)

-- Price history (daily snapshots for charts)
card_price_history (
  id          serial primary key,
  card_id     text references cards(id),
  platform    text,
  price_usd   decimal(10,2),
  price_eur   decimal(10,2),
  recorded_date date
)

-- Users (managed by Supabase Auth — this is the public profile)
user_profiles (
  id          uuid primary key references auth.users(id),
  display_name text,
  avatar_url  text,
  created_at  timestamptz default now()
)

-- User collections
collections (
  id              serial primary key,
  user_id         uuid references user_profiles(id),
  card_id         text references cards(id),
  quantity        int default 1,
  condition       text,           -- "Mint" | "Near Mint" | "Lightly Played" | "Moderately Played" | "Heavily Played" | "Damaged"
  psa_grade       text,           -- "PSA 10" | "PSA 9" | "BGS 9.5" | null (raw)
  acquired_price  decimal(10,2),  -- optional, for P&L tracking
  acquired_date   date,
  notes           text,
  added_at        timestamptz default now()
)
```

---

## 9. App Architecture

```
/app
├── (public)
│   ├── /                     → Landing page (hero, feature overview)
│   ├── /pokedex              → Browse all Pokémon (SSG, pre-rendered)
│   ├── /pokedex/[slug]       → Pokémon detail page (ISR, revalidate 24h)
│   ├── /cards                → Browse TCG cards (SSR + filtering)
│   ├── /cards/[id]           → Card detail + prices (ISR, revalidate 1h)
│   └── /guides
│       ├── /card-variants    → What is Holo vs Reverse Holo? etc.
│       └── /shiny-hunting    → Hidden mechanic guides
│
├── (auth)
│   ├── /login                → Google/Apple OAuth sign-in
│   └── /collection           → User collection dashboard (CSR, requires auth)
│       └── /scan             → AI card scanner (camera, mobile)
│
└── /api
    ├── /sync/pokemon         → Vercel Cron: seed/refresh Pokémon data
    ├── /sync/cards           → Vercel Cron: seed/refresh card data
    ├── /sync/prices          → Vercel Cron (nightly): refresh card prices
    └── /ai/scan              → POST: image → card identification
```

---

## 10. Risks & Concerns

| Risk | Severity | Mitigation |
|---|---|---|
| 4–8 weeks for all MVP features is aggressive | High | Phase it: Pokédex + Cards in weeks 1–4, Collection + AI in weeks 5–8. Cut AI scanner to v1.1 if needed |
| AI card scanner costs (OpenAI API) | Medium | Use `gpt-4o-mini` (cheap), rate limit 10 scans/day per free user, monitor spend |
| Nintendo/TPC IP enforcement on card images | High | Only serve image URLs from official PokeAPI/TCG API CDNs — never host copied card images |
| PokeAPI GraphQL rate limit (100 req/hr/IP) | Medium | Use REST endpoints for seeding; cache everything in Supabase after first run |
| Supabase free tier: 500MB DB, 5GB bandwidth | Medium | Don't store images locally — use CDN URLs. 500MB is plenty for Pokémon + card metadata |
| Pokemon TCG API free tier: 1,000 req/day | Medium | Seed all cards in one large batch script (it's ~15,000 cards total), then only poll prices nightly |
| Ad revenue low at launch | Low | Expected. Focus on organic growth via SEO (Pokémon pages are highly searchable) |
| Bulbapedia data scraping violates ToS | Medium | Never scrape. Link to Bulbapedia for anything not in PokeAPI. Use community JSON datasets for bulk data |

---

## 11. Development Phases (4–8 Week Plan)

### Week 1–2: Foundation + Pokédex
- [ ] Scaffold new Next.js 15 standalone project
- [ ] Supabase project setup: DB schema migration, RLS policies
- [ ] Data seed script: pull all 1,025 Pokémon from PokeAPI into Supabase
- [ ] Build `/pokedex` browse page (grid, search, type filter)
- [ ] Build `/pokedex/[slug]` detail page (stats, lore, Pokédex entries, sprites)
- [ ] CSS animation system: type-color theming, card hover effects, sprite reveals

### Week 3–4: Card Database
- [ ] Data seed script: pull all card sets + cards from Pokemon TCG API into Supabase
- [ ] Build `/cards` browse page (grid, filter by set/rarity/variant)
- [ ] Build `/cards/[id]` detail page (image, variants, attacks, prices)
- [ ] Price display component with TCGPlayer + CardMarket values
- [ ] Price sync cron job (nightly via Vercel Cron)

### Week 5–6: Collection Tracker + Auth
- [ ] Supabase Auth: Google OAuth + Apple OAuth setup
- [ ] Login page + auth middleware (protected `/collection` routes)
- [ ] Collection dashboard: value summary, set completion, top cards
- [ ] Add-to-collection flow: search card → set condition/grade → save
- [ ] Export collection to CSV

### Week 7–8: AI + Polish
- [ ] AI card scanner: camera UI + `/api/ai/scan` endpoint (OpenAI gpt-4o-mini)
- [ ] Collection recommendations: set completion suggestions, evolution chain gaps
- [ ] Mobile responsive polish (Pokédex + Cards + Collection all mobile-first)
- [ ] SEO: meta tags, Open Graph, structured data for Pokémon pages
- [ ] Google AdSense integration
- [ ] Performance audit (Lighthouse > 90), image lazy loading, ISR validation
- [ ] Launch

---

## 12. Competitive Advantage Summary

What no single competitor currently offers:
1. **Unified platform** — game lore + TCG cards + collection tracker in one app, no switching between sites
2. **AI-native from day 1** — card scanner + smart recommendations built into the core experience
3. **Collector-first UX** — portfolio value, PSA grade tracking, set completion % — not an afterthought
4. **Depth** — easter eggs, hidden shiny mechanics, prototype info, developer easter eggs — content competitors ignore
5. **Modern stack** — fast ISR pages, mobile-first, zero janky ad-loaded layouts

---

## 13. Key External Links & Resources

**APIs & Data**
- PokeAPI docs: https://pokeapi.co/docs/v2
- Pokemon TCG API docs: https://docs.pokemontcg.io
- TCGdex docs: https://tcgdex.dev/reference/card
- Bulk JSON dataset: https://github.com/Purukitto/pokemon-data.json

**Competitors to Study**
- https://pokemondb.net (clean UX, good filter patterns)
- https://pokellector.com (collection tracker UX reference)
- https://www.serebii.net (content depth reference)

**AI Card Recognition References**
- Ximilar card scanner: https://www.ximilar.com/blog/pokemon-card-image-search-engine/
- PokeGrade.AI (AI grading): https://pokegrade.ai
- Nyckel Gen 1 classifier: https://www.nyckel.com/pretrained-classifiers/pokemon-cards-identifier/

**Stack**
- Next.js App Router: https://nextjs.org/docs/app
- Supabase + Next.js quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase pgvector: https://supabase.com/docs/guides/database/extensions/pgvector
