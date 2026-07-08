function DetailField({ label, value, className = '' }) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  return (
    <div className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-700">{value}</p>
    </div>
  )
}

export default DetailField
