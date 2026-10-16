# IFTA Consulting Client Portal

Secure consulting client portal and workflow management system for IFTA Consulting (K) Ltd.

This repository implements the foundation for a professional-services workflow platform:

- Next.js App Router with public, auth, client, staff and admin route groups.
- Real public pages for Home, About, Services, Pricing, Client Portal, AI Research, Contact, Privacy, Terms and Cookies.
- Protected dashboard routes for `/client`, `/staff` and `/admin`.
- Responsive portal navigation with desktop sidebars and a collapsing mobile drawer.
- First-party email/password authentication with httpOnly session cookies.
- MongoDB-backed RBAC for application roles, permissions and access scope.
- Next.js Server Actions for login, signup, logout, contact submission and protected mutations.
- MongoDB/Mongoose connection caching for Vercel-compatible serverless use.
- Immutable audit-log model and audit service.
- Central engagement request and engagement transition service.
- Reusable UI components for buttons, cards, inputs, labels, selects, textareas, tables and empty states.
- Foundation seed script for roles, permissions and example staff users.
- Unit tests for authorization and workflow transitions.

## Route Structure

```text
app/
  (public)/
    page.tsx
    about/page.tsx
    services/page.tsx
    pricing/page.tsx
    client-portal/page.tsx
    ai-research/page.tsx
    contact/page.tsx
    privacy/page.tsx
    terms/page.tsx
    cookies/page.tsx
  (auth)/
    sign-in/page.tsx
    sign-up/page.tsx
    verify-email/sent/page.tsx
  api/
    auth/verify-email/route.ts
  (dashboard)/
    client/
      layout.tsx
      page.tsx
      engagements/page.tsx
      cart/page.tsx
      kyc/page.tsx
      documents/page.tsx
      messages/page.tsx
      invoices/page.tsx
      payments/page.tsx
      ai/page.tsx
      archive/page.tsx
    staff/
      layout.tsx
      page.tsx
      engagements/page.tsx
      tasks/page.tsx
      clients/page.tsx
      documents/page.tsx
      reviews/page.tsx
      messages/page.tsx
      notes/page.tsx
      ai/page.tsx
      calendar/page.tsx
    admin/
      layout.tsx
      page.tsx
      clients/page.tsx
      staff/page.tsx
      permissions/page.tsx
      services/page.tsx
      requests/page.tsx
      workflows/page.tsx
      kyc/page.tsx
      invoices/page.tsx
      reports/page.tsx
      audit/page.tsx
      settings/page.tsx
```

Route group names do not change URLs. The public homepage remains `/`, auth pages are `/sign-in` and `/sign-up`, and the protected portals remain `/client`, `/staff` and `/admin`.
Dashboard sidebar links resolve to concrete module pages, not dynamic section placeholders.

## Typography

The app uses Geist through `next/font/google`:

- Headings: Geist SemiBold/Bold, `600-700`
- Body: Geist Regular/Medium, `400-500`
- Buttons: Geist Medium/SemiBold, `500-600`
- Tables and forms: Geist
- Invoice numbers, IDs and workflow codes: Geist Mono

## Backend Pattern

Internal mutations should use Server Actions where appropriate. Current examples:

- `src/features/auth/actions.ts`
- `src/features/authorization/actions.ts`
- `src/features/public/actions.ts`

Core auth and authorization files:

- `src/features/auth/password.ts`
- `src/features/auth/password-policy.ts`
- `src/features/auth/session.ts`
- `src/features/auth/server.ts`
- `src/features/authorization/access-control.ts`
- `src/repositories/user-repository.ts`

Dashboard module support files:

- `src/constants/dashboard-modules.ts`
- `src/lib/dashboard/module-page-utils.ts`
- `src/components/dashboard/admin/*.tsx`
- `src/components/dashboard/client/*.tsx`
- `src/components/dashboard/staff/*.tsx`

Each dashboard sidebar route has its own page component. The low-level UI primitives are shared,
but `/admin/clients`, `/staff/tasks`, `/client/kyc` and the other modules no longer render through
one generic section component.

Auth UX support files:

- `src/components/auth/sign-in-form.tsx`
- `src/components/auth/sign-up-form.tsx`
- `src/components/auth/resend-verification-form.tsx`
- `src/components/ui/password-input.tsx`
- `src/components/ui/submit-button.tsx`
- `src/models/email-verification-token.ts`
- `src/features/auth/email-verification.ts`

## Local Setup

Create `.env.local` from `.env.example` and fill the required values:

```bash
cp .env.example .env.local
```

Required for the foundation to run:

- `MONGODB_URI`
- `AUTH_SESSION_DAYS`
- `EMAIL_VERIFICATION_TOKEN_HOURS`
- `PASSWORD_PEPPER`

Email verification uses Resend when these are configured:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

When Resend is not configured in local development, the verification screen shows a development
verification link instead of leaving the user stuck.

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Seed foundation data:

```bash
npm run seed
```

After deploying the signed job route, configure the production eTIMS worker:

```bash
npm run qstash:setup
```

This creates or updates a QStash schedule that calls the signed
`/api/jobs/process-etims` endpoint every five minutes. Add `QSTASH_URL`,
`QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY`, and
`QSTASH_NEXT_SIGNING_KEY` to the production environment before running it.

Seeded portal users share `SEED_USER_PASSWORD` when set, otherwise `ChangeMe!12345`:

- Admin: `admin@ifta.test`
- Staff: `staff@ifta.test`
- Client: `client@ifta.test`

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Workflow Foundation

The workflow from the PDF is represented as an explicit state machine in:

```text
src/features/engagements/transition-service.ts
```

Direct status updates should not be added elsewhere. Every future workflow mutation should route through this service or a feature-specific application service that calls it.

## Next Phases

Phase 2 should connect the service catalogue, pricing snapshots and admin service management to MongoDB models.

Phase 3 should add engagement cart, checkout, organization creation, client representatives, engagement request creation and admin review screens.

Phase 4 should add configurable KYC templates, document upload session handling, R2 integration and document review.

## Supported uploads

All upload forms share one rule set in `src/lib/uploads.ts`. Accepted formats are PDF, DOCX (and legacy DOC), XLSX (and legacy XLS), CSV, TXT, XML, JPG, PNG, TIFF and ZIP. Identity (KYC) documents and signed letters accept PDF, JPG, PNG and TIFF only. Files are checked by extension, declared type, size and actual file contents, and only PDF/JPG/PNG are ever opened inline in the browser; everything else downloads.

## SMS notifications

Clients can add a phone number and opt in to SMS on sign-up or in their profile. Important events (action required, KYC updates, invoices, payments, engagement updates) are texted through Africa's Talking. Set `AT_USERNAME`, `AT_API_KEY` and optionally `AT_SENDER_ID` in your environment (use `AT_USERNAME=sandbox` to test). With these unset, SMS is skipped and everything else works as before.

## Client dashboard

The client home page shows one clear "next step" computed from the client's real requests, KYC, letters, invoices and engagements (`src/features/client/next-step.ts`), followed by live counts and a five-step journey.

## KRA eTIMS (OSCU / VSCU) setup

The portal submits approved invoices, credit notes and debit notes to KRA through the same queue, retry and reconciliation framework whichever control unit you use. To connect, edit `.env` only:

1. Set `ETIMS_MODE=OSCU` (KRA-hosted) or `ETIMS_MODE=VSCU` (KRA's VSCU application running on your own server).
2. Set `ETIMS_BASE_URL` (for example `https://etims-api-sbx.kra.go.ke/etims-api` for the OSCU sandbox, or `http://localhost:8088` for a local VSCU), `ETIMS_TIN`, and `ETIMS_BRANCH_ID` (default `00`).
3. OSCU only: set `ETIMS_DEVICE_SERIAL`, run `npm run etims:init`, and paste the printed `ETIMS_CMC_KEY` into `.env`.
4. Enter each service's KRA item code and classification code under Finance > eTIMS > Service mappings, then run `npm run etims:register-items` once so KRA knows the items.
5. Restart the app and press "Test connection" on the eTIMS setup page.

Endpoint paths default correctly for each mode and can be overridden with `ETIMS_PATH_INIT`, `ETIMS_PATH_SALES`, `ETIMS_PATH_CREDIT_NOTE`, `ETIMS_PATH_DEBIT_NOTE` and `ETIMS_PATH_ITEM`. Use `ETIMS_ENVIRONMENT=PRODUCTION` only after sandbox testing passes. Each invoice gets a sequential KRA invoice number assigned on approval (`ETIMS_SEQUENCE_START` continues numbering from another system); a failed submission is retried with the same number, never a new one.

Credit notes are sent as KRA refund receipts that reference the original invoice number. Debit notes use the sales endpoint and stay blocked in production until an administrator marks the debit-note mapping as verified, because KRA has no dedicated debit-note receipt type. Leave `ETIMS_MODE` blank only if you use a third-party certified integrator through `KRA_ETIMS_API_URL` and `KRA_ETIMS_API_TOKEN`.

## M-Pesa payments

Clients can pay an invoice by approving an M-Pesa prompt on their phone (STK Push). Fill in the `MPESA_*` lines in `.env` (see `.env.example`); with the consumer key left blank the option is simply hidden and the manual "enter your reference" form remains. Safaricom confirms each payment to `/api/payments/mpesa/callback?token=...`, which must be reachable over https. The portal then marks the payment verified, reduces the invoice balance and notifies the client, with no finance staff action. A repeated confirmation from Safaricom changes nothing. If a client never approves the prompt, the pending payment is marked as not completed once Safaricom reports it.
