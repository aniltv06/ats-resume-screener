interface Props {
  score: number
}

export default function ScoreCard({ score }: Props) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  const label =
    score >= 70 ? 'Strong Match' : score >= 40 ? 'Moderate Match' : 'Weak Match'

  return (
    <div className="flex flex-col items-center gap-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">ATS Score</p>
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs text-gray-400">/100</span>
        </div>
      </div>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full"
        style={{ backgroundColor: color + '20', color }}
      >
        {label}
      </span>
    </div>
  )
}
