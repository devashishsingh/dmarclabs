# DMARC Labs

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Express](https://img.shields.io/badge/Express-4-black)](https://expressjs.com)

**Free, private DMARC aggregate XML report analyzer with WHOIS sender intelligence.**

Stop guessing who's sending email from your domain. Drop in a DMARC report, get an instant human-readable breakdown of every sending IP — organisation, country, SPF/DKIM/DMARC pass rates — in under 5 seconds. No signup. No credit card. Data deleted after analysis.

**Stack:** Next.js 14 (Vercel) + Express.js (Fly.io)

---

## Project Structure

```
/
├── frontend/     # Next.js 14 app (deploy to Vercel)
└── backend/      # Express.js API  (deploy to Fly.io)
```

---

## Local Development

### 1. Backend

```bash
cd backend
cp .env.example .env          # fill in RESEND_API_KEY
npm install
npm run dev                   # http://localhost:8080
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:8080
npm install
npm run dev                   # http://localhost:3000
```

---

## Production Deployment

### Backend → Fly.io

```bash
cd backend

# Install Fly CLI if not already: https://fly.io/docs/hands-on/install-flyctl/
flyctl auth login
flyctl launch              # Follow prompts; select region "iad" (US East)

# Set secrets (do NOT put secrets in fly.toml)
flyctl secrets set RESEND_API_KEY="re_xxxxxxxxxxxx"
flyctl secrets set MODERATOR_EMAIL="your@email.com"
flyctl secrets set CORS_ORIGIN="https://your-vercel-domain.vercel.app"

flyctl deploy
```

Your API will be live at `https://dmarc-analyzer-api.fly.dev`.

### Frontend → Vercel

```bash
cd frontend

# Install Vercel CLI if not already: npm i -g vercel
vercel login
vercel deploy --prod
```

In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Key                          | Value                                    |
|------------------------------|------------------------------------------|
| `NEXT_PUBLIC_API_URL`        | `https://dmarc-analyzer-api.fly.dev`     |
| `NEXT_PUBLIC_MAX_FILE_SIZE_MB` | `100`                                  |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Required | Description                              |
|--------------------|----------|------------------------------------------|
| `NODE_ENV`         | Yes      | `production` or `development`            |
| `PORT`             | No       | Default `8080`                           |
| `RESEND_API_KEY`   | Yes (prod)| Resend API key for email notifications  |
| `MODERATOR_EMAIL`  | Yes      | Email that receives access requests      |
| `CORS_ORIGIN`      | Yes      | Frontend URL (comma-separated for multiple) |
| `MAX_FILE_SIZE_MB` | No       | Default `100`                            |
| `SESSION_TTL`      | No       | Session lifetime ms. Default `1800000`   |
| `RATE_LIMIT`       | No       | Requests/min per IP. Default `10`        |

### Frontend (`frontend/.env.local`)

| Variable                        | Description                   |
|---------------------------------|-------------------------------|
| `NEXT_PUBLIC_API_URL`           | Backend API base URL          |
| `NEXT_PUBLIC_MAX_FILE_SIZE_MB`  | Free tier file size limit     |

---

## Resend Email Setup

1. Sign up at [resend.com](https://resend.com) (free tier: 3000 emails/month)
2. Create an API key
3. Add your sending domain or use the sandbox domain for testing
4. Update `RESEND_API_KEY` in Fly.io secrets
5. Update the `from` address in `backend/src/services/emailService.js` to match your verified domain

---

## Architecture

```
Browser
  │
  ├─ POST /api/upload      → multer saves to OS temp dir → creates session
  ├─ POST /api/analyze     → parses XML → WHOIS batch → returns enriched results
  ├─ POST /api/purge       → deletes file + session immediately
  ├─ POST /api/request-access → sends email via Resend
  └─ POST /api/feedback    → anonymized sentiment logging

Session storage: node-cache (in-memory, no database)
WHOIS: ip-api.com (45 req/min free tier, cached 24h per IP)
File storage: OS tmpdir (deleted after analysis or 30min TTL)
```

### Privacy Guarantees
- Uploaded files are deleted from disk immediately after XML parsing
- Session data (results) lives in-memory only, auto-expires in 30 minutes
- Users can trigger instant purge at any time
- No personal data is logged
- No database — everything is ephemeral

---

## DMARC XML Format

The analyzer expects DMARC aggregate reports (RUA) in the standard RFC 7489 XML format:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<feedback>
  <report_metadata>...</report_metadata>
  <policy_published>...</policy_published>
  <record>
    <row>
      <source_ip>23.251.232.51</source_ip>
      <count>1869</count>
      <policy_evaluated>
        <disposition>none</disposition>
        <dkim>pass</dkim>
        <spf>pass</spf>
      </policy_evaluated>
    </row>
    <identifiers>...</identifiers>
    <auth_results>
      <dkim><domain>...</domain><result>pass</result></dkim>
      <spf><domain>...</domain><result>pass</result></spf>
    </auth_results>
  </record>
</feedback>
```

Files can be raw `.xml`, or gzip-compressed `.xml.gz`, or zipped `.zip`.

---

## CSV Export Format

Downloaded CSVs include these columns:

`IP Address, Email Volume, DMARC Pass, DMARC Fail, DMARC Pass Rate, SPF Pass, SPF Fail, SPF Pass Rate, DKIM Pass, DKIM Fail, DKIM Pass Rate, WHOIS Owner, ASN, Country, Threat Level`

---

## Health Check

```
GET https://dmarc-analyzer-api.fly.dev/health
→ {"status":"ok","timestamp":"2026-04-24T12:00:00.000Z"}
```

Fly.io uses this endpoint for machine health checks (configured in `fly.toml`).
