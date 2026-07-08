import RestaurantCard from './RestaurantCard'

function MealPlanList({ meals, currency, onRestaurantClick, selectedRestaurantKey }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Meal Plan</h2>
      <p className="mt-1 text-xs text-slate-500">Tap a restaurant to center it on the map and view full details.</p>
      <ul className="mt-3 space-y-3">
        {meals.map((meal) => {
          const mealKey = `${meal.type}-${meal.time}-${meal.restaurant}`

          return (
            <RestaurantCard
              key={mealKey}
              meal={meal}
              currency={currency}
              isSelected={selectedRestaurantKey === mealKey}
              onRestaurantClick={onRestaurantClick}
            />
          )
        })}
      </ul>
    </section>
  )
}

export default MealPlanList
