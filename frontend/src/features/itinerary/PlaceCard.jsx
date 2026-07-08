import { useWikimediaImage } from './useWikimediaImage'
import DetailField from './DetailField'
import { formatCurrency } from './formatCurrency'

function PlaceCard({ place, currency, isSelected, onPlaceClick }) {
  const { imageUrl, loading } = useWikimediaImage(place.name)
  const isClickable = Boolean(place.latitude && place.longitude)
  const transport = place.transport || {}

  return (
    <button
      type="button"
      onClick={() => isClickable && onPlaceClick?.(place)}
      disabled={!isClickable}
      className={`w-full overflow-hidden rounded-xl border bg-white text-left shadow-sm transition ${
        isSelected
          ? 'trip-border-primary ring-2 ring-[var(--trip-primary-soft)]'
          : isClickable
            ? 'border-slate-200 hover:border-[var(--trip-primary)] hover:bg-[var(--trip-primary-soft)]'
            : 'cursor-default border-slate-200'
      }`}
    >
      <div className="h-40 w-full bg-slate-100">
        {imageUrl ? (
          <img src={imageUrl} alt={place.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
            {loading ? 'Finding image from Wikimedia...' : 'No Wikimedia image found'}
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">{place.name}</h3>
          <span className="trip-bg-soft trip-text-primary rounded-full px-3 py-1 text-xs font-semibold">
            Stop {place.order}
          </span>
        </div>

        <p className="text-sm text-slate-600">{place.description}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <DetailField label="Arrival" value={place.arrival_time} />
          <DetailField label="Departure" value={place.departure_time} />
          <DetailField label="Duration" value={`${place.estimated_duration_minutes} min`} />
          <DetailField label="Cost" value={formatCurrency(place.estimated_cost, currency)} />
          <DetailField label="Address" value={place.address} />
          <DetailField label="OSM Query" value={place.osm_query} />
          <DetailField label="Crowd Notes" value={place.crowd_level_notes} />
          <DetailField label="Accessibility" value={place.accessibility} />
          <DetailField label="Geocoded" value={place.geocoded ? 'Yes' : 'No'} />
        </div>

        {transport?.type ? (
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Transport to Next Stop</p>
            <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                <span className="font-medium">Type:</span> {transport.type}
              </p>
              <p>
                <span className="font-medium">Distance:</span> {transport.distance_km} km
              </p>
              <p>
                <span className="font-medium">Duration:</span> {transport.duration_minutes} min
              </p>
              <p>
                <span className="font-medium">Meters:</span> {transport.distance_meters}
              </p>
            </div>
          </div>
        ) : null}

        {isClickable ? (
          <p className="trip-text-primary text-xs font-medium">Tap to center this stop on the map</p>
        ) : (
          <p className="text-xs text-slate-500">Location unavailable on map</p>
        )}
      </div>
    </button>
  )
}

export default PlaceCard
