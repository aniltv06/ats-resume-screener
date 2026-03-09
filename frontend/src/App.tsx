import { useState } from 'react'
import ResumeInput from './components/ResumeInput'
import JobDescInput from './components/JobDescInput'
import ProviderSelector from './components/ProviderSelector'
import ScoreCard from './components/ScoreCard'
import KeywordAnalysis from './components/KeywordAnalysis'
import Suggestions from './components/Suggestions'
import { analyzeResume } from './api'
import type { AnalysisResult, Provider } from './types'

const PROVIDER_LABELS: Record<Provider, string> = {
  claude: 'Claude Sonnet 4.6',
  openai: 'GPT-4o',
  gemini: 'Gemini 1.5 Pro',
  local: 'Keyword Match (no AI)',
}

export default function App() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [provider, setProvider] = useState<Provider>('claude')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [usedProvider, setUsedProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleAnalyze() {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both a resume and a job description.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await analyzeResume(resumeText, jobDescription, provider)
      setResult(data)
      setUsedProvider(provider)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Resume Screener</h1>
            <p className="text-xs text-gray-500">ATS scoring powered by AI</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Input section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ResumeInput value={resumeText} onChange={setResumeText} />
          <JobDescInput value={jobDescription} onChange={setJobDescription} />
        </div>

        {/* Provider selector */}
        <div className="mb-6">
          <ProviderSelector value={provider} onChange={setProvider} />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-8">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing…
              </span>
            ) : (
              'Analyze Resume'
            )}
          </button>
        </div>

        {/* Results section */}
        {result && (
          <div className="flex flex-col gap-6">
            {usedProvider && (
              <p className="text-xs text-gray-400 text-center">
                Analyzed by {PROVIDER_LABELS[usedProvider]}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <ScoreCard score={result.ats_score} />
              <div className="flex-1">
                <KeywordAnalysis
                  matched={result.matched_keywords}
                  missing={result.missing_keywords}
                />
              </div>
            </div>
            <Suggestions
              suggestions={result.suggestions}
              skillGaps={result.skill_gaps}
              summary={result.summary}
            />
          </div>
        )}
      </main>
    </div>
  )
}
