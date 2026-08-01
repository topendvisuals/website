# Top End Visuals — website & booking system

A Next.js 14 (App Router) site for Jethro Llewellyn's photography business, built for the
Christmas 2026 campaign. Booking data lives in Supabase, transactional email runs on Resend,
and the 20% deposit is collected through Stripe Checkout. Deploys to Netlify.

## 1. What's included

- Marketing site: Home, Bookings, Portfolio, About Me, Contact Me
- Homepage popup (0.5s delay, dismissible, links straight to Bookings)
- Christmas booking flow: pick a package → pick an open date → submit request → pay 20%
  refundable deposit → sign contract → booking auto-confirms
- Supabase schema with a database-level guarantee of **one booking per day**
- Email notifications: customer confirmation, owner notification, deposit/contract
  instructions, and a final "you're confirmed" email to both sides
- SEO: per-page metadata, Open Graph image (generated in code, no binary asset needed),
  sitemap.xml, robots.txt, semantic headings, JSON-LD `ProfessionalService` schema

## 2. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in real values, see below
npm run dev
```

## 3. Required accounts & environment variables

Every value in `.env.example` needs to be real before the site can send email, take
payments, or store bookings. Nothing in the code is a stub — these are genuinely required
external accounts:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `RESEND_API_KEY`, `EMAIL_FROM` | resend.com → API Keys (verify your sending domain first) |
| `OWNER_NOTIFICATION_EMAIL` | Jethro's real inbox for new-booking alerts |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Developers → Webhooks → add endpoint `https://YOURSITE/api/webhooks/stripe`, subscribe to `payment_intent.succeeded` |
| `NEXT_PUBLIC_SITE_URL` | Your live domain, e.g. `https://topendvisuals.com` |

## 4. Supabase setup

1. Create a project at supabase.com.
2. Open the SQL Editor and run `supabase/schema.sql` once. It creates `bookings`,
   `availability`, `contact_messages`, the one-booking-per-day constraint, the
   auto-confirm trigger, and seeds a placeholder Nov–Dec 2026 weekend schedule.
3. To manage real availability, edit the `availability` table directly in the Supabase
   Table Editor — toggle `is_open`, add rows, or add `slot_type = 'sunrise'` rows for
   December morning sessions. No redeploy needed.
4. Row Level Security is enabled with no public policies. All reads/writes go through the
   Next.js API routes using the service role key, so customer data is never exposed to the
   browser directly.

## 5. Deploying to Netlify

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Netlify will detect `netlify.toml` (build command `npm run build`, publish `.next`, and
   the `@netlify/plugin-nextjs` plugin) automatically.
4. Add every variable from `.env.example` under **Site settings → Environment variables**.
5. Deploy. Point your domain's DNS at Netlify and set `NEXT_PUBLIC_SITE_URL` to match.
6. Add the Stripe webhook endpoint once you have the live URL (see table above).

## 6. Admin dashboard

A password-protected admin section lives at `/admin` — dashboard stats, a bookings list + calendar
(month/week views, click any booking for details, mark cancelled, edit), availability management,
contact messages, and an email template editor. There's no public sign-up; you create the one login
account yourself:

1. Supabase → **Authentication → Users → Add user**
2. Enter your email and a password, and make sure **"Auto Confirm User"** is ticked (so it doesn't
   wait on an email verification step)
3. That's it — go to `/admin/login` on your site and sign in with those credentials

If your Supabase project was created before this feature was added, run
`supabase/migrations/003_admin_dashboard.sql` once in the SQL Editor first (adds the
`email_templates` table the admin email editor uses). A brand-new project built from the current
`supabase/schema.sql` already has this and doesn't need it.

## 7. Apple Pay / Google Pay on the deposit payment

Google Pay works automatically with no setup. Apple Pay needs a one-time domain registration in
Stripe once you're on your real domain:

1. Stripe Dashboard → **Settings → Payment methods → Apple Pay** (or **Settings → Payment method
   domains**)
2. Add your live domain (e.g. `topendvisuals.com`)
3. Stripe verifies it automatically (it fetches a verification file Stripe serves for you — no file
   upload needed on your end for a Next.js/Vercel-style host)

Until that's done, Apple Pay simply won't appear as an option — card and Google Pay still work fine
in the meantime.

## 8. Assumptions made (clearly labelled in code too)

- **Photos**: no photo library was supplied yet. The hero, about, and portfolio sections use
  styled gradient placeholders instead of stock photography, each labelled in-code with the
  exact file path to drop a real image in (e.g. `/public/images/hero.jpg`). Swap them in and
  the layout won't need to change.
- **Availability schedule**: seeded with Saturdays/Sundays across Nov 1 – Dec 23, 2026
  (standard slots) plus December weekend sunrise slots, since the real schedule was said to
  be coming later. Edit the `availability` table to match reality.
- **Contract signing**: no e-signature provider (DocuSign, HelloSign, etc.) was specified, so
  bookings are finalised with a lightweight in-house agreement — the customer types their
  full legal name against the displayed terms and ticks a consent checkbox, timestamped and
  stored against the booking. This is workable for a small studio but isn't a certified
  e-signature product; swap in a provider on `app/api/bookings/[id]/contract/route.ts` if a
  stronger evidentiary standard is needed. The contract text itself is a placeholder summary
  — replace with your actual legal terms before launch.
- **Inline payment & contract**: customers now pay their deposit and sign the contract directly in
  the booking modal, without leaving the site or waiting on an email — the `/payment/[id]` page
  still exists as a fallback for anyone who closes the modal partway through and wants to finish
  later via the link in their confirmation email.
- **Admin dashboard scope**: built to match what was actually asked for — stats, a bookings
  list/calendar with edit and cancel, availability toggling, contact messages, and an email subject
  + intro-text editor. The email editor intentionally doesn't allow rewriting the full HTML (prices,
  buttons, links stay code-controlled) so it can't accidentally be edited into a broken email.
- **Deposit payment**: implemented as an embedded Stripe Payment Element directly on `/payment/[id]`
  (via `@stripe/react-stripe-js`) rather than a redirect to a separate Stripe-hosted checkout page,
  so customers never leave the site. If your Supabase project was created before this change, run
  `supabase/migrations/002_embedded_payment.sql` once — it renames a column to match. Also update
  your existing Stripe webhook endpoint to listen for `payment_intent.succeeded` instead of
  `checkout.session.completed` if it was set up under the old flow.
- **Placeholder contact details**: the phone number and social links in the Footer and
  Contact page are placeholders, flagged in the page copy — replace with real ones.
- **Follow-up email**: the brief asked for a separate "please pay your deposit" email after
  the initial confirmation. This build sends the deposit/contract link in the *same* email as
  the booking confirmation (subject: "Your Christmas session request…"), since the link is
  valid immediately and there's no reason to make the customer wait for a second email. A
  further reminder email for bookings still pending after a few days would be a natural next
  addition (e.g. via a scheduled Supabase Edge Function).

## 9. Known item to revisit before launch

`npm audit` flags the pinned Next.js 14.2.x line for several advisories that are fixed in
Next 15/16. This project intentionally stays on Next 14 App Router APIs for stability; plan
a Next 15/16 upgrade pass (and a re-test of the booking flow) before going live, or run
`npm audit fix` and address any breaking changes it introduces.

## 10. Project structure

```
app/
  (site)/                Public pages (Header/Footer applied here, not at the root)
    page.tsx, bookings/, portfolio/, about/, contact/, payment/[id]/
  admin/                 Password-protected dashboard
    login/                No sidebar — full-screen sign-in
    (protected)/          Sidebar shell + dashboard, bookings, availability, messages, emails
  api/                   bookings, availability, contact, Stripe payment intent + webhook, admin/*
middleware.ts             Gatekeeper for every /admin/* route
components/               UI components (Header, Hero, BookingModal, Gallery, admin/*, …)
lib/                      Supabase clients, email templates, Stripe client, packages, types
supabase/schema.sql       Full DB schema, RLS, trigger, seed data
supabase/migrations/      Incremental changes for already-existing Supabase projects
```
