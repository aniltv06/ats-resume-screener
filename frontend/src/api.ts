import type { AnalysisResult } from './types'

// In production set VITE_API_URL to your backend URL (e.g. https://my-api.railway.app).
// In local dev the Vite proxy handles /api → localhost:8000, so this is empty.
const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function analyzeResume(
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail ?? 'Analysis failed')
  }
  return res.json()
}

export async function parseFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE}/api/parse-file`, { method: 'POST', body: form })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail ?? 'File parsing failed')
  }
  const data = await res.json()
  return data.text as string
}

export async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/scrape-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(err.detail ?? 'URL scraping failed')
  }
  const data = await res.json()
  return data.job_description as string
}
