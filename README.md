# Resume Tailor — AI-Powered Resume Optimization

A production-ready SaaS application that uses AI to tailor resumes to specific job descriptions, optimizing for ATS systems and human recruiters.

**Live:** [resume-tailor-one-rust.vercel.app](https://resume-tailor-one-rust.vercel.app)

---

## What It Does

Job seekers paste their resume and a job description. The AI rewrites the resume to mirror the exact keywords, tone, and structure that ATS systems and hiring managers look for — increasing interview callback rates.

---

## Tech Stack

- **Frontend:** Next.js 15, React, Tailwind CSS
- **AI:** Anthropic Claude API (claude-haiku)
- **Payments:** Stripe Payment Links
- **Deployment:** Vercel

---

## Features

- AI resume rewriting optimized for ATS keyword matching
- Pay-per-use model ($2/resume) via Stripe
- Instant results with copy-to-clipboard output
- Fully responsive, mobile-friendly UI
- Clean, minimal design with fast load times

---

## Running Locally

```bash
npm install
npm run dev
```

Add a `.env.local` file:
```
NEXT_PUBLIC_ANTHROPIC_KEY=your_key_here
```

Open [http://localhost:3000](http://localhost:3000)

---

Built by Zoriyon Zion