import { useState, useRef } from 'react'
import { parseFile } from '../api'

interface Props {
  value: string
  onChange: (text: string) => void
}

export default function ResumeInput({ value, onChange }: Props) {
  const [tab, setTab] = useState<'paste' | 'upload'>('paste')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const text = await parseFile(file)
      onChange(text)
      setTab('paste')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">Resume</label>
      <div className="flex gap-1 border-b border-gray-200 mb-1">
        {(['paste', 'upload'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
              tab === t
                ? 'bg-white border border-b-white border-gray-200 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'paste' ? 'Paste Text' : 'Upload File'}
          </button>
        ))}
      </div>

      {tab === 'paste' ? (
        <textarea
          className="w-full h-52 p-3 text-sm border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Paste your resume text here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-52 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFile}
          />
          {uploading ? (
            <p className="text-sm text-blue-600 animate-pulse">Parsing file…</p>
          ) : (
            <>
              <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <p className="text-sm text-gray-500">Click to upload <span className="font-medium text-blue-600">PDF or DOCX</span></p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
