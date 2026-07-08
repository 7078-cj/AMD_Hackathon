import { formatCurrency } from './formatCurrency'

function DayBudgetCard({ day, currency }) {
  const budget = day?.daily_budget || {}

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="trip-text-primary text-sm font-semibold uppercase tracking-wide">Day {day.day}</p>
      <h2 className="mt-1 text-xl font-semibold text-slate-900">{day.theme}</h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Food</p>
          <p className="font-semibold text-slate-800">{formatCurrency(budget.food, currency)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Transport</p>
          <p className="font-semibold text-slate-800">{formatCurrency(budget.transport, currency)}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs text-slate-500">Activities</p>
          <p className="font-semibold text-slate-800">{formatCurrency(budget.activities, currency)}</p>
        </div>
        <div className="trip-bg-soft rounded-lg p-3">
          <p className="trip-text-primary text-xs">Total</p>
          <p className="trip-text-primary font-semibold">{formatCurrency(budget.total, currency)}</p>
        </div>
      </div>
    </div>
  )
}

export default DayBudgetCard
