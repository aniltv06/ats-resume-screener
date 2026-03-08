interface Props {
  suggestions: string[]
  skillGaps: string[]
  summary: string
}

export default function Suggestions({ suggestions, skillGaps, summary }: Props) {
  return (
    <div className="flex flex-col gap-4">
      {summary && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-blue-800 mb-1">Summary</h3>
          <p className="text-sm text-blue-700">{summary}</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Improvement Suggestions</h3>
          <ol className="flex flex-col gap-2">
            {suggestions.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                  {i + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {skillGaps.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Skill Gaps</h3>
          <ul className="flex flex-col gap-2">
            {skillGaps.map((g, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-amber-500 mt-0.5">▸</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
