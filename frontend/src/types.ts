export type Provider = 'claude' | 'openai' | 'gemini'

export interface AnalysisResult {
  ats_score: number
  matched_keywords: string[]
  missing_keywords: string[]
  skill_gaps: string[]
  suggestions: string[]
  summary: string
}
