import DayOverview from './DayOverview'
import DayTabs from './DayTabs'
import ItineraryHeader from './ItineraryHeader'
import TripDetailsSections from './TripDetailsSections'

function ItineraryViewer({
  itinerary,
  activeDay,
  onDayChange,
  onBack,
  onSave,
  onDelete,
  saving,
  deleting,
  isSaved,
}) {
  const selectedDay = itinerary.days.find((day) => day.day === activeDay) || itinerary.days[0]

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="w-fit rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700"
        >
          Back to trips
        </button>

        <div className="flex flex-wrap gap-2">
          {!isSaved ? (
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {saving ? 'Saving...' : 'Save itinerary'}
            </button>
          ) : (
            <span className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">Saved trip</span>
          )}

          {isSaved ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete trip'}
            </button>
          ) : null}
        </div>
      </div>

      <ItineraryHeader trip={itinerary.trip} />
      <TripDetailsSections
        trip={itinerary.trip}
        budgetBreakdown={itinerary.budgetBreakdown}
        travelTips={itinerary.travelTips}
      />
      <DayTabs days={itinerary.days} activeDay={activeDay} onDayChange={onDayChange} />

      {selectedDay ? (
        <DayOverview day={selectedDay} hotel={itinerary.trip.hotel} currency={itinerary.trip.currency} />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600 shadow-sm">
          No itinerary day is available.
        </div>
      )}
    </div>
  )
}

export default ItineraryViewer
