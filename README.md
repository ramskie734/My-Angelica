# My Angelica 💖

A **structured reviewer PWA** that helps students study **in the same order their teacher teaches**.

Unlike random flashcard apps, everything stays organized in a strict hierarchy:

```
Subject → Unit → Lesson → Topic → Study → Flashcards → Quiz → Mastery
```

Every topic owns its own flashcards and quiz — you will never see 68 random cards from an entire subject mixed together.

---

## Features

- **Study mode** — one concept at a time: title, explanation, optional image, teacher notes, summary, important reminders, previous/next.
- **Topic-scoped flashcards** — ❤️ *I Know This* (masters the card, hides it from review but never deletes it) and 🔄 *Review Again* (keeps it in rotation). *Show Mastered Cards* is OFF by default.
- **Smart Continue** — reopening the app resumes the exact subject / unit / lesson / topic / flashcard where you stopped.
- **Mastery levels** — New, Learning, Almost Mastered, Mastered, with completion % for every topic, lesson, unit, subject and the whole account.
- **Quizzes** — Multiple Choice, Identification, Enumeration, True/False, Matching Type and Fill in the Blank, in random mixed order. Partial credit for enumeration and matching. Results show score, %, time, correct/wrong/skipped with **Review Wrong Answers**, **Retry Quiz** and **Back to Topic**.
- **Favorites** — subjects, lessons, topics and flashcards.
- **Notes** — personal notes per topic (auto-saved) plus teacher tips and important reminders.
- **Global search** — subjects, lessons, topics, flashcards, notes and quiz questions.
- **Progress dashboard** — overall/subject/unit/lesson/topic progress, cards mastered, quiz average, study time, streak, achievements and a generated Today's Tasks list.
- **PWA** — installable on Android, iPhone and desktop; offline fallback page; splash icons; service worker caching.
- **Admin panel** — create subjects, units, lessons, topics (with image upload), flashcards (single or bulk) and all six quiz question types; view users and their progress.
- **Auth** — Supabase email + Google sign-in, forgot password, remember me.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion |
| Backend | Supabase (PostgreSQL, Auth, Storage, Row Level Security) |
| Deployment | Vercel-ready, GitHub-ready |

---

## Getting started (Windows / PowerShell)

### 1. Install dependencies

```powershell
cd my-angelica
npm install
```

> If you ever need a clean reinstall:
> ```powershell
> Remove-Item -Recurse -Force node_modules, package-lock.json
> npm install
> ```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick a region near you and save the database password somewhere safe.

### 3. Set up the database

In the Supabase Dashboard open **SQL Editor** and run, in order:

1. `supabase/migrations/0001_schema.sql` — tables, indexes, triggers, Row Level Security and policies, plus the `topic-images` storage bucket.
2. `supabase/migrations/0002_seed.sql` — demo content (Cruise Tourism: Unit 1 → Lesson 1 → Parts of a Cruise Ship with 15 flashcards and all six quiz types, plus more).

### 4. Configure environment variables

Copy the example file and fill in your values (Dashboard → Settings → API):

```powershell
Copy-Item .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Enable auth providers

In the Supabase Dashboard:

- **Authentication → Providers → Email**: keep enabled. To skip email confirmation during development, turn **Confirm email** off.
- **Authentication → Providers → Google** (optional): enable and paste your OAuth client ID/secret from Google Cloud Console with redirect URL `https://your-project-ref.supabase.co/auth/v1/callback`.
- **Authentication → URL Configuration**: set **Site URL** to `http://localhost:3000` (your Vercel URL in production) and add `http://localhost:3000/auth/callback` to **Redirect URLs**.

### 6. Run the app

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account, sign in, and start studying.

### 7. Make yourself an admin

After creating your first account, run this in the Supabase SQL Editor (replace the email):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'your-email@example.com');
```

Sign out and back in — the **Admin** page appears in your profile.

---

## Deploying to Vercel

1. Push this folder to GitHub (it already contains `.gitignore`).
2. In Vercel: **Add New → Project → Import** the repo.
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` = your Vercel URL).
4. Deploy. Then update the Supabase **Site URL** and **Redirect URLs** to your Vercel domain.

## Installing as an app (PWA)

- **Android / Chrome**: menu → *Add to Home screen / Install app*.
- **iPhone / Safari**: Share → *Add to Home Screen*.
- **Desktop Chrome / Edge**: install icon in the address bar.

The service worker caches the app shell; without a connection you get a friendly offline page, and Smart Continue works locally.

## Project structure

```
my-angelica/
├── public/               # PWA manifest, service worker, icons, offline page
├── scripts/              # Icon generator (no dependencies)
├── supabase/
│   └── migrations/       # 0001_schema.sql, 0002_seed.sql
└── src/
    ├── animations/       # Shared Framer Motion variants
    ├── app/
    │   ├── (main)/       # Authenticated app pages (share the app shell)
    │   ├── auth/         # Login, register, forgot password, OAuth callback
    │   └── layout.tsx    # Root layout + providers
    ├── components/       # ui / layout / dashboard / study / flashcards / quiz / admin / pwa
    ├── constants/        # Navigation, mastery labels, achievements
    ├── hooks/            # useDebounce
    ├── lib/              # Supabase clients, mastery + quiz engines, stats, utils
    ├── services/         # All Supabase data access (content, progress, admin…)
    ├── types/            # Shared TypeScript types
    └── middleware.ts     # Session refresh + route protection
```

## How mastery works

| Status | Meaning |
| --- | --- |
| New | Never studied — no progress row exists yet |
| Learning | Marked 🔄 *Review Again* |
| Almost Mastered | Promoted by strong quiz performance |
| Mastered | Marked ❤️ *I Know This* — hidden from review, never deleted |

Completion % at every level (topic → account) is the share of **mastered** flashcards. Answering quiz questions correctly reinforces flashcard mastery: Learning → Almost Mastered → Mastered.

## Notes & limitations

- PWA reminders fire while the app is running (or installed and suspended where the OS supports it); they are best-effort, as browsers limit background scheduling.
- Offline mode covers the app shell and navigation; live data requires a connection.
- The bundled icons are simple generated placeholders (heart on lavender) — replace the files in `public/icons/` with your own art using the same filenames any time.
