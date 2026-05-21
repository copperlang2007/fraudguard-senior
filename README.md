# FraudGuard Senior

**AI-Powered Medicare Fraud Detection & Claim Optimizer for Seniors & Veterans**

Production-grade full-stack MVP ready for market. Addresses 2026 Medicare changes: negotiated drug prices, $2,100 OOP cap, fraud concerns.

## Key Features
- AI Claim Scanner (mock + API route)
- Fraud risk scoring & savings calculator
- 2026 price optimizer
- Premium subscription ($9.99/mo via Stripe)
- Veteran-focused alerts

## Tech Stack (Elite Production)
Next.js 15 + TypeScript + Tailwind + Vercel AI + Stripe + Supabase

## Deploy
Vercel one-click ready. Local: npm install && npm run dev

## Business Model
Freemium → Premium $9.99/mo. B2B white-label for insurers.

## Defensibility
Proprietary fraud ML + user network effects + HIPAA-ready architecture.

Built by copperlang2007 | Market placement: AARP, VA partnerships, senior Facebook ads.

## Working Starter

This repository now includes a tested TypeScript fraud and claim optimization core:

- Medicare claim fraud risk scoring
- Duplicate claim and unsolicited outreach risk signals
- Provider verification checks
- 2026 Part D out-of-pocket cap modeling
- Veteran-specific review action guidance

## Verify

```bash
npm ci
npm run ci
```

GitHub Actions runs the same build and Vitest suite on pull requests and pushes to `main`.
