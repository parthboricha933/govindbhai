# Sadvichar Hospital — Surgery Record Management

A simple, fast, responsive web app to track surgeries performed at Sadvichar Hospital and other hospitals. Built for the user (who works at Sadvichar Hospital) to log patient surgery records and automatically calculate ₹500 commission earned per surgery performed at *other* hospitals.

## Business Logic

- **Sadvichar Hospital surgeries** → only the count is tracked. No charge is recorded (you work there).
- **Other Hospital surgeries** → the surgery charge (in ₹) is recorded, and **₹500 commission** is automatically credited to Sadvichar Hospital.

## Features

- 📝 **New Entry form** — patient name, village, surgery name, surgery date, surgery charge (Other only), notes; two large buttons to choose Sadvichar or Other Hospital
- 📊 **Dashboard** — 8 summary cards + two clear hospital sections (Sadvichar = count, Other = count + total cash)
- 📋 **Records table** — search, filter, pagination, CRUD, bulk delete, export (CSV / Excel / PDF)
- 📈 **Reports** — filter by date / hospital / village / surgery; charge stats (avg / highest / lowest) consider Other Hospital only
- 📉 **Analytics** — 5 charts (monthly trends, hospital pie, hospital charges, top villages, most common surgeries)
- 🏥 **Hospital Summary** — side-by-side cards: Sadvichar (count) vs Other (count + total cash + commission breakdown)
- 🌗 Dark mode, auto-save draft, fully responsive, no login required

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma 6
- **Charts**: Recharts
- **Notifications**: Sonner

## Local Development

```bash
bun install
bun run dev
```

Open http://localhost:3000

## Database

The Prisma schema is in `prisma/schema.prisma`. Push schema changes to the database with:

```bash
bunx prisma db push
```

## Deployment

The app is configured for Vercel. Set the `DATABASE_URL` environment variable in the Vercel project settings to the Neon PostgreSQL connection string.
