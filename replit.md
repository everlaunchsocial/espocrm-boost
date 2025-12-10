# EverLaunch AI

## Overview
A multi-tenant SaaS platform providing AI voice and chat assistants for businesses, with integrated CRM, affiliate/MLM program with multi-level commissions, and customer onboarding. The platform enables affiliates to create personalized AI demos for prospects, tracks usage-based billing, and provisions phone numbers via Vapi API.

## Key Features
- **AI Demo System**: Personalized AI chat and voice demos for prospects
- **CRM**: Contact, lead, account, and deal management with activity tracking
- **Affiliate/MLM Program**: 3-level commission structure with genealogy tracking
- **Customer Billing**: Usage-based billing with minute tracking and overages
- **Estimates & Invoices**: Full estimate-to-invoice workflow with signatures
- **Voice Integration**: Vapi phone number provisioning for AI voice calls
- **Email Automation**: Email sending with open tracking

## Project Structure
```
client/              # Frontend React application
  src/
    components/      # UI components organized by domain
      affiliate/     # Affiliate dashboard, billing, commissions
      crm/           # CRM components (accounts, contacts, leads, deals)
      customer/      # Customer portal components
      demos/         # Demo viewing and chat components
      estimates/     # Estimate builder and viewer
      invoices/      # Invoice management
    pages/           # Route pages
    stores/          # Zustand state stores
    hooks/           # Custom React hooks
    lib/             # Utility libraries
server/              # Backend Express server
  db.ts              # Database connection (Drizzle + PostgreSQL)
  index.ts           # Server entry point
  routes.ts          # API routes
  storage.ts         # Storage interface with CRUD operations
  vite.ts            # Vite dev server integration
shared/              # Shared code
  schema.ts          # Drizzle ORM schema (41 tables)
supabase/            # Legacy Edge Functions (reference only)
  functions/         # Original Supabase functions for reference
```

## Database Schema (41 tables)

### CRM Domain
- `accounts` - Company accounts
- `contacts` - Individual contacts linked to accounts
- `leads` - Lead records before conversion
- `deals` - Sales opportunities with stages
- `tasks` - Task management
- `activities` - Activity log
- `notes` - Notes attached to entities

### Demo System
- `demos` - AI demo configurations per prospect
- `calendar_bookings` - Demo follow-up booking requests

### Estimates & Invoices
- `estimates`, `estimate_items` - Quote/estimate system
- `invoices`, `invoice_items` - Invoice management

### Affiliate/MLM System
- `commission_plans` - Commission rate configurations (30%/15%/5% default)
- `affiliate_plans` - Subscription tiers (Free, Basic, Pro, Agency)
- `affiliates` - Affiliate profiles with plan linkage
- `genealogy` - 3-level upline tracking
- `affiliate_commissions` - Individual commission records
- `affiliate_plan_history`, `affiliate_credit_purchases`, `affiliate_billing_history`

### Customer Billing
- `customer_plans` - Customer subscription tiers (Starter, Growth, Professional)
- `customer_profiles` - Customer accounts with usage tracking
- `billing_subscriptions` - Stripe subscription records
- `billing_usage`, `usage_logs` - Usage tracking (voice minutes, interactions)
- `payouts` - Affiliate payout records

### Voice/Chat
- `voice_settings`, `chat_settings` - AI configuration per customer
- `vapi_accounts` - Vapi API account pool for phone provisioning
- `customer_phone_numbers` - Provisioned phone numbers
- `twilio_numbers` - Legacy Twilio integration

### Other
- `profiles` - User profiles with global roles
- `emails`, `sender_addresses` - Email system
- `call_logs` - Voice call transcription logs
- `media_library` - Asset storage
- `customer_knowledge_sources` - AI knowledge base per customer
- `calendar_integrations` - Google/Outlook calendar sync
- `signup_events` - Analytics events

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Shadcn/UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **State**: Zustand, TanStack Query v5
- **Routing**: React Router DOM v6

## Running the Project
```bash
npm run dev          # Start dev server on port 5000
npm run build        # Build for production
npm run db:push      # Push schema changes
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection (auto-configured)

### Required for Full Functionality (add via Secrets)
- `STRIPE_SECRET_KEY` - Stripe API key
- `VAPI_API_KEY` - Vapi voice API key
- `OPENAI_API_KEY` - OpenAI for AI chat
- `RESEND_API_KEY` - Email sending
- `CAL_API_KEY` - Calendar booking integration

## API Routes (to implement)
```
GET /api/demos/:id          - Get demo by ID
POST /api/demos             - Create new demo
POST /api/demos/:id/chat    - AI chat interaction
POST /api/demos/:id/booking - Create calendar booking
GET /api/leads              - List leads
POST /api/leads             - Create lead
GET /api/affiliates/:id     - Get affiliate dashboard data
POST /api/checkout/customer - Create Stripe checkout for customer
POST /api/checkout/affiliate - Create Stripe checkout for affiliate
```

## Recent Changes
- December 10, 2025: Database migration complete
  - Created comprehensive Drizzle ORM schema (41 tables)
  - Seeded affiliate plans (Free, Basic, Pro, Agency)
  - Seeded customer plans (Starter, Growth, Professional)
  - Created default commission plan (30%/15%/5%)
  - Updated storage interface with CRUD operations

## Architecture Notes
- Affiliates refer customers who pay monthly subscriptions
- Commissions flow through 3 levels of affiliate uplines
- Demos are created by affiliates for their leads/contacts
- Customers get AI voice assistants with provisioned phone numbers
- Usage (voice minutes) is tracked per billing cycle
