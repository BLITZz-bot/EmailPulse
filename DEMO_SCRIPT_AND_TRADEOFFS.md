# 🎥 ReachInbox Demo Video Cheat Sheet & Technical Trade-Offs

Use this guide while recording your **5-minute demo video**! You can read or summarize these points directly in your video voiceover.

---

## 🎙️ Part 1: What to Say in Video — "Assumptions, Shortcuts & Trade-offs"

When you reach the end of your demo video, summarize these 4 key points:

### 1. ☁️ Trade-Off: Serverless Cloud Infrastructure over Local Docker
> *"For infrastructure, I chose **Neon Cloud PostgreSQL** and **Upstash Cloud Redis (TLS)** instead of requiring local Docker containers. This ensures the evaluator can clone and run `npm run dev` instantly without needing Docker Desktop running on their machine."*

### 2. 📧 Shortcut: Automatic Ethereal SMTP Provisioning
> *"For fake SMTP email testing, I implemented Nodemailer's dynamic `createTestAccount()` helper. This automatically provisions Ethereal test credentials on server boot, generating instant browser preview links for every delivered email without requiring manual SMTP registration."*

### 3. 🚦 Architectural Choice: Job Re-Delaying over Job Failing (Zero Loss)
> *"For rate limiting, when a sender exceeds the hourly limit (e.g. 200 emails/hour), instead of failing or dropping jobs, the BullMQ worker dynamically reschedules them (`job.moveToDelayed`) into the start of the next hour's window. This guarantees zero email loss under heavy load."*

### 4. 🔑 UX Feature: Dual Auth Mode (`?demo=true` & Google OAuth)
> *"The app supports real Google OAuth 2.0 authentication showing the user's avatar and email. However, I also included a `?demo=true` URL parameter so evaluators can jump straight into testing the dashboard without completing Google sign-in."*

---

## ⏱️ Part 2: Step-by-Step Video Recording Timeline (Under 5 Minutes)

| Time | What to Show on Screen | What to Say in Voiceover |
|---|---|---|
| **0:00 - 0:45** | Codebase in VS Code / Architecture Diagram | *"Hi! This is Email Pulse — a production-grade cold email scheduler built with Next.js 14, Express TypeScript, BullMQ + Upstash Redis, Neon Postgres, and Ethereal SMTP."* |
| **0:45 - 1:30** | Go to `http://localhost:3000` & click **Sign in with Google** | *"Here is the Google OAuth login. After logging in, the dashboard displays my Google profile picture, name, and email in the top header, along with real-time stats cards."* |
| **1:30 - 2:30** | Click **+ Compose Email**, upload CSV file, set date & delay, click **Schedule Campaign** | *"I'll upload a CSV lead list. Notice it parses and shows '✓ Detected 3 unique email addresses'. I'll set a start time and 2000ms delay and schedule the campaign."* |
| **2:30 - 3:30** | Go to backend terminal, press **`Ctrl + C`** to stop server, then run **`npm run dev`** to restart | *"Now testing server restart: I'll stop the backend server completely. When I restart it with `npm run dev`, BullMQ reconnects to Redis and PostgreSQL — no jobs are lost or re-sent!"* |
| **3:30 - 4:30** | Switch to **Sent History** tab & click **`Preview Email ↗`** | *"When the scheduled time arrives, the job status moves to SENT. Clicking 'Preview Email' opens Ethereal Email's web browser view showing the rendered HTML email!"* |
| **4:30 - 5:00** | Full screen dashboard | Briefly summarize the 4 trade-offs from Part 1 above. *"Thank you!"* |
