interface Props {
  matched: string[]
  missing: string[]
}

function Chip({ label, variant }: { label: string; variant: 'green' | 'red' }) {
  const styles =
    variant === 'green'
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-700 border border-red-200'
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${styles}`}>
      {label}
    </span>
  )
}

export default function KeywordAnalysis({ matched, missing }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Keyword Analysis</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
            Matched ({matched.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {matched.length > 0 ? (
              matched.map((kw) => <Chip key={kw} label={kw} variant="green" />)
            ) : (
              <p className="text-xs text-gray-400">None found</p>
            )}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">
            Missing ({missing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.length > 0 ? (
              missing.map((kw) => <Chip key={kw} label={kw} variant="red" />)
            ) : (
              <p className="text-xs text-gray-400">None — great job!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
