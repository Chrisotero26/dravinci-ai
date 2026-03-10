# 🧠 Dravinci AI — Complete Setup Guide

![Dravinci AI](public/images/dravinci-logo.png)

A full-stack AI companion platform built with Next.js, Supabase, Claude AI, ElevenLabs TTS, and Stripe.

---

## 📁 Project Structure

```
dravinci-ai/
├── pages/
│   ├── index.jsx              ← Landing page (SEO optimized)
│   ├── companions.jsx         ← Browse all companions
│   ├── [slug].jsx             ← Dynamic character chat pages
│   ├── _app.jsx               ← App wrapper
│   └── api/
│       ├── messages/
│       │   └── send.js        ← Chat API endpoint
│       ├── subscriptions/
│       │   ├── create-checkout.js  ← Stripe checkout
│       │   └── webhook.js         ← Stripe webhook handler
│       └── tts/
│           └── generate.js    ← ElevenLabs TTS (Premium)
│
├── components/
│   ├── layout/
│   │   └── Header.jsx         ← Header with logo placeholder
│   ├── chat/
│   │   └── ChatWindow.jsx     ← Main chat interface
│   ├── characters/
│   │   └── CharacterGrid.jsx  ← Character browsing grid
│   └── subscription/
│       ├── AuthModal.jsx      ← Login/Register with age verification
│       └── SubscriptionModal.jsx ← Upgrade to Premium
│
├── data/
│   └── characters.js          ← 10 character profiles
│
├── lib/
│   ├── supabase.js             ← DB client + schema comments
│   └── characterPrompts.js    ← System prompts for Claude
│
├── scripts/
│   ├── generateCharacter.js   ← Manus prompts + CLI generator
│   └── generateSitemap.js     ← Sitemap + DB seeder
│
├── styles/
│   └── globals.css
│
├── public/
│   └── images/
│       └── characters/        ← Character avatars and OG images
│           └── [PLACE IMAGES HERE]
│
├── .env.example
├── next.config.js
└── package.json
```

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-org/dravinci-ai.git
cd dravinci-ai
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your keys
```

### 3. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy the full SQL schema from `lib/supabase.js` (in the large comment block)
4. Run it in the SQL editor
5. Enable Email Auth in Authentication settings
6. Copy your URL and anon key to `.env.local`

### 4. Set Up Stripe

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Create products (run these in Stripe dashboard or CLI)
stripe products create --name="Dravinci Premium"
stripe prices create --product=prod_XXX --unit-amount=999 --currency=usd --recurring[interval]=month
stripe prices create --product=prod_XXX --unit-amount=7999 --currency=usd --recurring[interval]=year

# Copy price IDs to .env.local

# Start webhook forwarding (development)
stripe listen --forward-to localhost:3000/api/subscriptions/webhook
```

### 5. Set Up ElevenLabs (Optional — for voice)

1. Create account at [elevenlabs.io](https://elevenlabs.io)
2. Browse/clone voices for each character
3. Copy voice IDs into `data/characters.js` (replace `PLACEHOLDER_*_VOICE_ID`)
4. Add API key to `.env.local`

### 6. Add Your Logo

Replace the logo placeholder in `components/layout/Header.jsx`:

```jsx
// The logo placeholder is clearly marked with:
// ===== LOGO PLACEHOLDER =====

// Place your logo at: public/images/dravinci-logo.png
// Recommended size: 160x50px, PNG with transparency
```

### 7. Seed Database

```bash
# Seed characters to Supabase
node scripts/generateSitemap.js --seed

# Generate sitemap
node scripts/generateSitemap.js
```

### 8. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🤖 AI Companion URLs

Each character gets a clean, SEO-optimized URL:

| Character | URL | Style |
|-----------|-----|-------|
| Valeria | `/chat-with-valeria` | Romantic-lite |
| Luna | `/chat-with-luna` | Playful |
| Marcus | `/chat-with-marcus` | Mentor |
| Sofia | `/chat-with-sofia` | Friendly |
| Kai | `/chat-with-kai` | Humorous |
| Amara | `/chat-with-amara` | Mentor |
| Ethan | `/chat-with-ethan` | Romantic-lite |
| Yuki | `/chat-with-yuki` | Friendly |
| Rafael | `/chat-with-rafael` | Romantic-lite |
| Aria | `/chat-with-aria` | Friendly |

---

## 💰 Monetization

### Free Tier
- 10 messages per day
- Access to all 10 companions
- Text only

### Premium ($9.99/month or $79.99/year)
- Unlimited messages
- Voice responses (TTS)
- Priority response speed
- Conversation memory
- Exclusive premium characters

### Revenue Flow
```
User signs up → Free tier (10 msgs/day) → Hits limit 
→ SubscriptionModal opens → Stripe Checkout 
→ Webhook updates Supabase → User gets Premium access
```

---

## 🤖 Manus Automation

### Generate New Characters

```bash
# Generate a single character
node scripts/generateCharacter.js "Alex" "Australia" "playful" "outdoor adventurer"

# Or use the Manus prompts in scripts/generateCharacter.js:
# - MANUS_CHARACTER_GENERATION_PROMPT (single character)
# - BATCH_GENERATION_PROMPT (10 characters at once)
# - MANUS_SEO_PAGE_PROMPT (generates Next.js page)
```

### Batch Workflow for Manus
1. Feed `BATCH_GENERATION_PROMPT` to Claude via Manus
2. Parse the JSON array output
3. Add characters to `data/characters.js`
4. Run `node scripts/generateSitemap.js --seed` to seed DB
5. Run `node scripts/generateSitemap.js` to update sitemap
6. Deploy

---

## 🔒 Safety & Compliance

- **18+ verification** on registration (DOB required + checkbox)
- **Age gate** in character system prompts
- **Content filtering**: All characters have safe-behavior rules
- **No explicit content**: Flirty only in safe, non-sexual way
- **Crisis handling**: Characters redirect to professional help for serious issues
- **GDPR**: Users can delete account/data
- **Row Level Security** on all Supabase tables

---

## 🚀 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add STRIPE_WEBHOOK_SECRET from: stripe listen --print-secret

# Production webhook
stripe webhooks create --url=https://dravinci.ai/api/subscriptions/webhook \
  --events=checkout.session.completed,customer.subscription.deleted,invoice.payment_failed
```

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Users, subscription status, message counts |
| `characters` | Character profiles and personality data |
| `conversations` | Chat session groupings |
| `messages` | Individual chat messages + TTS cache URLs |
| `subscription_events` | Stripe event audit trail |
| `response_cache` | Cached AI responses (cost optimization) |

---

## 🎨 Design System

**Colors**:
- Background: `#080818`
- Gold (primary): `#C4954A`
- Blue (accent): `#6B8CFF`  
- Success green: `#4DB877`

**Fonts**:
- Display: Playfair Display (headings)
- Body: Segoe UI / system fonts

---

Built with ❤️ for Dravinci AI
