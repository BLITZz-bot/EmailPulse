# 📧 Email Pulse — Full-Stack Cold Email Scheduler & Dashboard

Production-grade cold email scheduler and live monitoring dashboard built for the **ReachInbox Hiring Assignment**.

---

## 🚀 System Architecture Overview

```
 ┌────────────────┐          ┌───────────────────────┐          ┌───────────────────────┐
 │   Next.js 14   │  HTTP    │   Express.js Backend  │  Prisma  │    Neon PostgreSQL    │
 │  Dashboard UI  │ ───────► │   TypeScript Server   │ ───────► │  (Job & User Storage) │
 └────────────────┘          └───────────────────────┘          └───────────────────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │    BullMQ + Upstash   │
                             │      Redis Queue      │
                             └───────────────────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │    BullMQ Worker      │
                             │ (Rate Limit & Delay)  │
                             └───────────────────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │  Ethereal Email SMTP  │
                             │ (HTML Web Previews)   │
                             └───────────────────────┘
```

---

## 🛠️ Tech Stack

- **Backend**: TypeScript, Express.js (v5), Prisma ORM, Neon Cloud PostgreSQL, BullMQ, Upstash Cloud Redis (TLS), Passport.js (Google OAuth 2.0), Nodemailer, Zod.
- **Frontend**: Next.js 14 App Router (Turbopack), TypeScript, Tailwind CSS, TanStack React Query v5, Axios, PapaParse.
- **Infrastructure**: Neon Cloud Serverless PostgreSQL & Upstash Cloud Redis (TLS enabled).

---

## 📖 How Architecture Requirements Are Implemented

### 1. How Scheduling Works (Zero Cron)
- Scheduling requests arrive at `POST /api/emails/schedule`.
- Each lead recipient is saved to PostgreSQL with status `SCHEDULED`.
- BullMQ calculates the exact delay in milliseconds (`scheduledAt - Date.now() + index * delayBetweenEmailsMs`) and enqueues a delayed job in Redis.
- **No OS or Node cron libraries are used anywhere**.

### 2. How Persistence on Server Restart is Handled
- All scheduled jobs are stored persistently in Redis (Upstash) and PostgreSQL (Neon).
- If the backend crashes or is restarted, BullMQ automatically reads pending delayed jobs from Redis and executes them at their target time.
- **Idempotency Guarantee**: Before sending, the worker inspects PostgreSQL. If `dbJob.status` is already `SENT` or `CANCELLED`, execution is skipped to guarantee zero duplicate sends.

### 3. How Rate Limiting & Concurrency Work
- **Worker Concurrency**: Set via `WORKER_CONCURRENCY` env var (default: 5 parallel workers).
- **Throttling (Minimum Delay)**: Enforced using BullMQ's rate limiter (`max: 1, duration: 2000ms`) to mimic email provider throttling.
- **Hourly Rate Limiting**: Uses atomic Redis counters keyed by `ratelimit:{sender}:{YYYY-MM-DD-HH}`.
  - If a sender exceeds `MAX_EMAILS_PER_HOUR_PER_SENDER` (e.g., 200/hr), the worker automatically calls `job.moveToDelayed()` to reschedule the email into the next hourly window without dropping or losing the job.

---

## ⚙️ Environment Variables & Setup

### Backend `.env` (`backend/.env`)
```env
PORT=3001
NODE_ENV=development

# Upstash Cloud Redis (TLS)
REDIS_HOST=intimate-pony-101994.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_upstash_redis_password
REDIS_TLS=true

# Neon Cloud PostgreSQL
DATABASE_URL=postgresql://neondb_owner:...@ep-square-darkness-axykc631-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

SESSION_SECRET=super_secret_session_key
WORKER_CONCURRENCY=5
MIN_DELAY_BETWEEN_SENDS_MS=2000
MAX_EMAILS_PER_HOUR_PER_SENDER=200
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local` (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=email_pulse_nextauth_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Ethereal Email Setup
No manual registration required! The backend automatically provisions a fresh Ethereal test account on startup using `nodemailer.createTestAccount()`. Web preview links (`nodemailer.getTestMessageUrl()`) are stored in PostgreSQL and rendered on the frontend dashboard as clickable **`Preview Email ↗`** links.

---

## 🚦 How to Run Locally

### 1. Start the Backend (Port 3001)
```bash
cd backend
npm install
npx prisma db push
npm run dev
```
*Console output will confirm:*
```text
✅ Email queue initialized
🚀 Email worker started | concurrency: 5
🚀 Server running on http://localhost:3001
✅ Redis connected
```

### 2. Start the Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 🎯 Feature Matrix

| Category | Feature | Status | Description |
|---|---|---|---|
| **Backend** | API Scheduler | ✅ | `POST /api/emails/schedule` accepts bulk leads, subject, body, date, & delay |
| **Backend** | BullMQ Queue | ✅ | Persistent Redis job queue with exponential backoff retries |
| **Backend** | Worker Engine | ✅ | Multi-concurrency worker processing queued jobs |
| **Backend** | State Persistence | ✅ | PostgreSQL + Redis state survives full server restarts |
| **Backend** | Idempotency | ✅ | Status check before send prevents duplicate deliveries |
| **Backend** | Rate Limiting | ✅ | Atomic Redis hourly counters with automatic job re-delaying |
| **Backend** | Ethereal SMTP | ✅ | Automatic account creation & HTML browser preview URL extraction |
| **Backend** | Auth System | ✅ | Passport.js Google OAuth 2.0 with session cookies |
| **Frontend** | Google OAuth Login | ✅ | Real Google Sign-In with user avatar, name, and email header display |
| **Frontend** | Live Dashboard | ✅ | 3-second auto-refreshing interface using TanStack Query |
| **Frontend** | Stats Cards | ✅ | Real-time counts for Scheduled, Sent, and Failed/Cancelled jobs |
| **Frontend** | Compose Campaign | ✅ | Modal dialog with CSV/TXT lead file upload, regex email parser, & lead count badge |
| **Frontend** | Scheduled Table | ✅ | Recipient, Subject, Sender, Scheduled Time, Status, and Cancel action button |
| **Frontend** | Sent History Table | ✅ | Recipient, Subject, Sent Time, Status badge, & clickable **Preview Email ↗** link |

---

## 📽️ Demo Video Guide
- **Google OAuth Login**: Sign in with Google to view your profile avatar & name.
- **Scheduling**: Upload a CSV lead file in the Compose Modal and schedule a campaign.
- **Server Restart**: Stop the backend (`Ctrl+C`), restart it (`npm run dev`), and verify scheduled jobs persist and send on time.
- **Ethereal Preview**: Click **`Preview Email ↗`** in the Sent History table to view the rendered HTML email in your browser.
