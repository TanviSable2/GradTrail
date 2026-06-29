# GradTrail

A platform that aggregates job listings, internships, and online courses from multiple sources into one place — built for engineering students who don't want to check five different job boards every day.

**Live site:** https://gradtrail.vercel.app/

## Why I built this

Most job aggregator sites either focus on experienced professionals or charge for access. As an engineering student, I found myself manually checking Naukri, LinkedIn, Internshala, and a handful of company career pages every week — most of which had outdated or duplicate listings. GradTrail pulls from multiple sources automatically, filters by branch and skills, and lets you set reminders so you never miss a deadline.

## Features

- **Aggregated job listings** from Adzuna, Jooble, and direct company searches (TCS, Infosys, Zoho, and others), refreshed automatically every 48 hours
- **AI-style match scoring** — ranks jobs based on how well they fit your branch and skills, without needing to manually filter through hundreds of listings
- **Resume Tailor** — paste your resume and get a job-specific match score, missing skills, and suggested bullet points tailored to that exact job description. This runs entirely on a rule-based matching engine I built — no paid AI API, no rate limits, works instantly every time
- **Email reminders** — set a reminder on any saved job and get an email a few days later if you haven't applied yet, even for listings that don't have a stated deadline
- **Application tracker** — track status (saved → applied → interview → offer/rejected) across everything you've applied to
- **Internships and courses** — same aggregation system, separate views, with curated course recommendations from Coursera, Udemy, and similar platforms

## Tech stack

**Frontend:** React (Vite), React Router, Axios  
**Backend:** Node.js, Express, PostgreSQL  
**Auth:** JWT-based authentication with role-based access (student/admin)  
**Email:** Nodemailer with Gmail SMTP  
**Scheduling:** node-cron for automated sync and reminder jobs  
**Hosting:** Render (backend), Vercel (frontend), Neon (managed PostgreSQL)  
**CI/CD:** GitHub Actions for automated build verification, with Render and Vercel auto-deploying on every push to `main`

## Architecture notes

- Strict MVC separation on the backend — routes contain no logic, controllers are thin, all business logic lives in services, all SQL lives in query files
- The job sync system is rate-limit aware: it checks a `sync_log` table before hitting any external API, so it never re-syncs a source more than once every 48 hours regardless of how many times the server restarts
- The Resume Tailor deliberately avoids depending on a paid AI API in production. I initially tried Gemini's free tier, but Google's free-tier limit dropped to roughly 20 requests/day in late 2025, which made it unreliable for a live demo. I built a deterministic, domain-aware scoring engine instead — it checks resume text against role-specific skill sets (electrical, mechanical, backend, data science, etc.), handles common skill name variations (`Node.js` / `NodeJS` / `node js`), and never fails or rate-limits

## Running locally

### Backend

```bash
cd Backend
npm install
# create a .env file with your DB credentials, JWT secret, and API keys — see .env.example
npm run dev
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

The backend expects a PostgreSQL database. Run `Backend/src/db/schema.sql` against your local database before starting the server.

## What I'd add next

- Real file upload for resumes (currently uses a pasted link — Cloudinary integration was attempted but ran into PDF delivery permission issues that need more investigation)
- A staging environment before production deploys
- Automated tests in the CI pipeline (currently CI checks build/syntax validity, not functional test coverage)
