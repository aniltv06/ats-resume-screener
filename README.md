# Resume Screener

An AI-powered resume analysis tool that scores resumes against job descriptions using Claude AI. Paste or upload your resume, paste or link a job description, and get an instant ATS compatibility score, keyword gap analysis, and tailored improvement suggestions.

---

## Features

- **ATS Score** — 0–100 score with a color-coded SVG circular progress ring (red / yellow / green)
- **Keyword Analysis** — side-by-side green (matched) and red (missing) keyword chips
- **Improvement Suggestions** — numbered, actionable bullets written by Claude
- **Skill Gap Analysis** — explicit gaps between your resume and the role requirements
- **Overall Summary** — 1–2 sentence Claude assessment
- **PDF / DOCX Upload** — server-side parsing via PyMuPDF and python-docx
- **Job URL Scraping** — auto-fetch a job description from any public posting URL

---

## Architecture

```
Browser (React + Vite + Tailwind)
        │
        │  /api/*  (dev: Vite proxy → localhost:8000)
        │          (prod: VITE_API_URL env var → Railway)
        ▼
FastAPI  (Python 3.12)
        │
        ▼
Claude API  (claude-sonnet-4-6)
```

The Claude API key lives **only** on the backend — it is never sent to the browser.

---

## Project Structure

```
Anil-Resume/
├── backend/
│   ├── .env                    # ANTHROPIC_API_KEY + ALLOWED_ORIGINS (git-ignored)
│   ├── .env.example
│   ├── Procfile                # for Railway / Heroku
│   ├── requirements.txt
│   ├── main.py
│   ├── routers/
│   │   ├── analyze.py          # POST /api/analyze
│   │   └── scrape.py           # POST /api/scrape-url  POST /api/parse-file
│   └── services/
│       ├── claude_service.py
│       ├── document_parser.py
│       └── web_scraper.py
│
├── frontend/
│   ├── vercel.json             # Vercel build config
│   ├── .env.production.example
│   ├── vite.config.ts          # /api proxy → localhost:8000
│   ├── package.json
│   └── src/
│       ├── App.tsx
│       ├── api.ts              # fetch wrappers (reads VITE_API_URL)
│       ├── types.ts
│       └── components/
│           ├── ResumeInput.tsx
│           ├── JobDescInput.tsx
│           ├── ScoreCard.tsx
│           ├── KeywordAnalysis.tsx
│           └── Suggestions.tsx
│
└── README.md
```

---

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### 1 — Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
ALLOWED_ORIGINS=http://localhost:5173
```

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

The API is now available at `http://localhost:8000`. Check `http://localhost:8000/health`.

### 2 — Frontend

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Vite proxies all `/api/*` requests to `http://localhost:8000` — no extra config needed.

---

## Deploying to Vercel + Railway

The recommended production setup is:

| Service | What it hosts | Why |
|---------|--------------|-----|
| **Vercel** | React frontend | Native Vite support, instant CDN |
| **Railway** | FastAPI backend | Persistent server, handles file uploads and PyMuPDF native binaries |

> **Why not put everything on Vercel?**
> Vercel runs Python as serverless functions with a 10-second timeout and a stripped Linux environment. PyMuPDF (used for PDF parsing) requires native `libmupdf` binaries that are not available in Vercel's runtime. Railway (and Render) run a full container, so everything works out of the box.

---

### Step 1 — Deploy the backend to Railway

1. Push this repo to GitHub.

2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**.

3. Select the repo, then set the **Root Directory** to `backend/`.

4. Railway detects `requirements.txt` + `Procfile` and builds automatically.

5. Under **Variables**, add:

   | Key | Value |
   |-----|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-...` |
   | `ALLOWED_ORIGINS` | *(leave blank for now — fill in after step 3)* |

6. Under **Settings → Networking**, click **Generate Domain**. Copy the URL — it looks like
   `https://resume-screener-api-production.up.railway.app`

7. Come back and set `ALLOWED_ORIGINS` to your Vercel frontend URL (from step 3).

---

### Step 2 — Configure the frontend for production

Create `frontend/.env.production` (git-ignored):

```
VITE_API_URL=https://resume-screener-api-production.up.railway.app
```

Or skip the file and set it as a Vercel environment variable in step 3 (preferred).

---

### Step 3 — Deploy the frontend to Vercel

**Option A — Vercel CLI (fastest)**

```bash
npm install -g vercel
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? *(your account)*
- Link to existing project? **N**
- Project name: `resume-screener` *(or anything)*
- In which directory is your code located? **`./`** *(already inside `frontend/`)*

After the first deploy, set the environment variable:

```bash
vercel env add VITE_API_URL production
# paste your Railway URL when prompted
vercel --prod
```

**Option B — Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository**.
2. Select your repo.
3. Set **Root Directory** to `frontend`.
4. Vercel auto-detects Vite — no build settings needed (handled by `frontend/vercel.json`).
5. Under **Environment Variables**, add:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_API_URL` | `https://...railway.app` | Production |

6. Click **Deploy**.

Your live URL will be something like `https://resume-screener.vercel.app`.

---

### Step 4 — Finalize CORS on Railway

Go back to your Railway project → **Variables** and set:

```
ALLOWED_ORIGINS=https://resume-screener.vercel.app
```

Railway redeploys automatically. Your app is now fully live.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list of allowed frontend origins |

### Frontend (`frontend/.env.production`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `""` (empty) | Base URL of the backend API. Empty in local dev (Vite proxy handles it). |

---

## API Reference

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/api/analyze` | `{ resume_text, job_description }` | `AnalysisResult` |
| `POST` | `/api/parse-file` | multipart `file` (PDF / DOCX) | `{ text: string }` |
| `POST` | `/api/scrape-url` | `{ url: string }` | `{ job_description: string }` |
| `GET` | `/health` | — | `{ status: "ok" }` |

### `AnalysisResult` shape

```ts
{
  ats_score: number           // 0–100
  matched_keywords: string[]
  missing_keywords: string[]
  skill_gaps: string[]
  suggestions: string[]
  summary: string
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Python 3.12, FastAPI, Uvicorn |
| AI | Anthropic Claude (`claude-sonnet-4-6`) |
| PDF parsing | PyMuPDF (`fitz`) |
| DOCX parsing | python-docx |
| URL scraping | httpx + BeautifulSoup4 |
| Frontend hosting | Vercel |
| Backend hosting | Railway |
