import DayBudgetCard from './DayBudgetCard'
import MealPlanList from './MealPlanList'
import PlaceCard from './PlaceCard'

function DayOverview({
  day,
  currency = 'PHP',
  selectedRestaurantKey,
  selectedPlaceOrder,
  onRestaurantClick,
  onPlaceClick,
}) {
  return (
    <div className="space-y-5">
      <DayBudgetCard day={day} currency={currency} />

      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#4E6B72]">Meals</p>
        <MealPlanList
          meals={day.meal_plan || []}
          currency={currency}
          onRestaurantClick={onRestaurantClick}
          selectedRestaurantKey={selectedRestaurantKey}
        />
      </div>

      <div>
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#4E6B72]">
          Stops, in order
        </p>
        <div className="space-y-3">
          {(day.places || []).map((place) => (
            <PlaceCard
              key={`${day.day}-${place.order}-${place.name}`}
              place={place}
              currency={currency}
              isSelected={selectedPlaceOrder === place.order}
              onPlaceClick={onPlaceClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default DayOverview