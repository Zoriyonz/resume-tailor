# Resume Tailor

Tailors a resume to a specific job posting. Live at https://resume-tailor-navy-chi.vercel.app

## What it does

You paste a resume and a job description. The app parses the posting, then rewrites and reweights your existing experience to match its keywords and priorities. It rephrases what is already true on your resume and does not invent experience.

## Stack

Next.js, React, TypeScript and Tailwind CSS. The rewrite runs through the Anthropic Claude API from a server-side route, and Stripe Payment Links handle the optional pay-per-use checkout. Deployed on Vercel.

## Run it locally

Run npm install, create a .env.local file containing ANTHROPIC_API_KEY set to your own key, then run npm run dev and open http://localhost:3000. The key is read only on the server and is never exposed to the browser.

## Status

Prototype. Results depend on the model and should always be reviewed before you send a resume out.

Built by Zoriyon Zion.
