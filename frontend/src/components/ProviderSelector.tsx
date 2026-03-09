import type { Provider } from '../types'

const PROVIDERS: { id: Provider; name: string; model: string; color: string }[] = [
  { id: 'claude',  name: 'Claude',   model: 'Sonnet 4.6',  color: '#D97706' },
  { id: 'openai',  name: 'OpenAI',   model: 'GPT-4o',      color: '#10B981' },
  { id: 'gemini',  name: 'Gemini',   model: '1.5 Pro',     color: '#6366F1' },
  { id: 'local',   name: 'Keyword',  model: 'No API key',  color: '#64748B' },
]

interface Props {
  value: Provider
  onChange: (p: Provider) => void
}

export default function ProviderSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">Scoring Method</label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROVIDERS.map((p) => {
          const selected = value === p.id
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              style={
                selected
                  ? { borderColor: p.color, backgroundColor: p.color + '15', color: p.color }
                  : {}
              }
              className={`flex flex-col items-center gap-0.5 py-3 px-2 rounded-xl border-2 transition-all ${
                selected ? '' : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-semibold">{p.name}</span>
              <span className="text-xs opacity-60">{p.model}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
