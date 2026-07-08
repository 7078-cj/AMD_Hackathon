import DetailField from './DetailField'

function TripDetailsSections({ trip, budgetBreakdown, travelTips }) {
  const currency = trip.currency || 'PHP'

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-900">Trip Details</h2>
        <div className="mt-4 space-y-4">
          <DetailField label="Travelers" value={trip.travelers} />
          <DetailField label="Vibe Mood" value={trip?.vibe?.mood} />
          <DetailField label="Photo Style Notes" value={trip?.vibe?.photo_style_notes} />
          <DetailField label="Group Considerations" value={trip.group_considerations} />
          <DetailField label="Accessibility Notes" value={trip.accessibility_notes} />

          {(trip?.vibe?.color_palette || []).length > 0 ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Color Palette</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {trip.vibe.color_palette.map((color) => (
                  <span
                    key={color}
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                  >
                    {color}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-900">Hotel</h2>
        <div className="mt-4 space-y-3">
          <DetailField label="Name" value={trip?.hotel?.name} />
          <DetailField label="Type" value={trip?.hotel?.type} />
          <DetailField label="Address" value={trip?.hotel?.address} />
          <DetailField label="OSM Query" value={trip?.hotel?.osm_query} />
          <DetailField label="Estimated Cost" value={`${currency} ${trip?.hotel?.estimated_cost}`} />
          <DetailField label="Accessibility" value={trip?.hotel?.accessibility} />
          <DetailField label="Geocoded" value={trip?.hotel?.geocoded ? 'Yes' : 'No'} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-base font-semibold text-slate-900">Transportation</h2>
        <div className="mt-4 space-y-3">
          <DetailField label="Type" value={trip?.transportation?.type} />
          <DetailField
            label="Recommended"
            value={trip?.transportation?.recommended ? 'Yes' : 'No'}
          />
          <DetailField
            label="Estimated Carbon"
            value={
              trip?.transportation?.estimated_carbon_kg_co2
                ? `${trip.transportation.estimated_carbon_kg_co2} kg CO2`
                : null
            }
          />
          <DetailField
            label="Carbon Comparison"
            value={trip?.transportation?.carbon_comparison_notes}
          />
        </div>
      </section>

      {budgetBreakdown ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-base font-semibold text-slate-900">Budget Breakdown</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(budgetBreakdown).map(([key, value]) => (
              <div key={key} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs capitalize text-slate-500">{key}</p>
                <p className="font-semibold text-slate-800">
                  {currency} {Number(value).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {(travelTips || []).length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Travel Tips</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {travelTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

export default TripDetailsSections
