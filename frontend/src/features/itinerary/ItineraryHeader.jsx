import { formatCurrency } from './formatCurrency'

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/

function buildPaletteGradient(palette) {
  const validHexes = palette.filter((hex) => HEX_PATTERN.test(hex))

  if (validHexes.length === 0) return null
  if (validHexes.length === 1) {
    // Single color: fade it to a darker shade of itself for depth
    return `linear-gradient(135deg, ${validHexes[0]}, ${shadeHex(validHexes[0], -25)})`
  }

  return `linear-gradient(135deg, ${validHexes.join(', ')})`
}

// Darkens (negative percent) or lightens (positive percent) a hex color
function shadeHex(hex, percent) {
  const clean = hex.replace('#', '')
  const num = parseInt(clean, 16)
  const amt = Math.round(2.55 * percent)

  const r = Math.min(255, Math.max(0, (num >> 16) + amt))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amt))

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

function ItineraryHeader({ trip, theme }) {
  const palette = trip?.vibe?.color_palette ?? []
  const paletteGradient = buildPaletteGradient(palette)
  const headerBackground =
    theme?.headerGradient ?? paletteGradient ?? 'linear-gradient(135deg, #4f46e5, #7c3aed)'

  return (
    <header
      className="rounded-2xl border border-slate-200 p-6 text-white shadow-md"
      style={{ background: headerBackground }}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-white/80">Generated Itinerary</p>
      <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
        {trip?.destination}{trip?.country ? `, ${trip.country}` : ''}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-white/90 sm:text-base">{trip?.vibe?.description}</p>
      <p className="mt-2 text-sm text-white/85">
        {trip?.vibe?.mood} · {trip?.travelers ?? 0} traveler{trip?.travelers === 1 ? '' : 's'}
        {trip?.budget?.recommended ? ' · Recommended budget' : ''}
      </p>

      {palette.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {palette.map((hex, index) => (
            <span
              key={`${hex}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-medium text-white"
            >
              <span
                className="h-3 w-3 rounded-full border border-white/50"
                style={{ backgroundColor: HEX_PATTERN.test(hex) ? hex : '#9CA3AF' }}
              />
              {hex.toUpperCase()}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white/15 p-3">
          <p className="text-white/75">Trip Duration</p>
          <p className="font-semibold text-white">
            {trip?.days ?? '–'} days / {trip?.nights ?? '–'} nights
          </p>
        </div>
        <div className="rounded-lg bg-white/15 p-3">
          <p className="text-white/75">Budget</p>
          <p className="font-semibold text-white">{formatCurrency(trip?.budget?.total, trip?.currency)}</p>
        </div>
        <div className="rounded-lg bg-white/15 p-3">
          <p className="text-white/75">Hotel</p>
          <p className="font-semibold text-white">{trip?.hotel?.name ?? 'TBD'}</p>
        </div>
        <div className="rounded-lg bg-white/15 p-3">
          <p className="text-white/75">Transport</p>
          <p className="font-semibold text-white">{trip?.transportation?.type ?? 'TBD'}</p>
        </div>
      </div>
    </header>
  )
}

export default ItineraryHeader