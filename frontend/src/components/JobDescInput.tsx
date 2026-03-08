import { useState } from 'react'
import { scrapeUrl } from '../api'

interface Props {
  value: string
  onChange: (text: string) => void
}

export default function JobDescInput({ value, onChange }: Props) {
  const [tab, setTab] = useState<'paste' | 'url'>('paste')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleScrape() {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const text = await scrapeUrl(url.trim())
      onChange(text)
      setTab('paste')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scraping failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">Job Description</label>
      <div className="flex gap-1 border-b border-gray-200 mb-1">
        {(['paste', 'url'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
              tab === t
                ? 'bg-white border border-b-white border-gray-200 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'paste' ? 'Paste Text' : 'Enter URL'}
          </button>
        ))}
      </div>

      {tab === 'paste' ? (
        <textarea
          className="w-full h-52 p-3 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Paste job description here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="flex flex-col gap-3 h-52 justify-center px-1">
          <input
            type="url"
            className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="https://jobs.apple.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
          />
          <button
            onClick={handleScrape}
            disabled={loading || !url.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Fetching…' : 'Fetch Job Description'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Paste a public job posting URL (LinkedIn, Greenhouse, Lever, etc.)
          </p>
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
