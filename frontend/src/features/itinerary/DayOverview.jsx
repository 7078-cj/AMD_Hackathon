import { useEffect, useState } from 'react'
import DayBudgetCard from './DayBudgetCard'
import MealPlanList from './MealPlanList'
import PlaceCard from './PlaceCard'
import RouteMap from './RouteMap'

function DayOverview({ day, hotel, currency = 'PHP' }) {
  const [focusLatLng, setFocusLatLng] = useState(null)
  const [selectedRestaurantKey, setSelectedRestaurantKey] = useState(null)
  const [selectedPlaceOrder, setSelectedPlaceOrder] = useState(null)

  useEffect(() => {
    setFocusLatLng(null)
    setSelectedRestaurantKey(null)
    setSelectedPlaceOrder(null)
  }, [day.day])

  const handleRestaurantClick = (meal, mealKey) => {
    if (!meal.latitude || !meal.longitude) {
      return
    }

    setSelectedRestaurantKey(mealKey)
    setSelectedPlaceOrder(null)
    setFocusLatLng([Number(meal.latitude), Number(meal.longitude)])
  }

  const handleRestaurantMarkerClick = (restaurant) => {
    const mealKey = `${restaurant.type}-${restaurant.time}-${restaurant.restaurant || restaurant.name}`
    setSelectedRestaurantKey(mealKey)
    setSelectedPlaceOrder(null)
    setFocusLatLng(restaurant.latLng)
  }

  const handlePlaceClick = (place) => {
    if (!place.latitude || !place.longitude) {
      return
    }

    setSelectedPlaceOrder(place.order)
    setSelectedRestaurantKey(null)
    setFocusLatLng([Number(place.latitude), Number(place.longitude)])
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <DayBudgetCard day={day} currency={currency} />

        <MealPlanList
          meals={day.meal_plan || []}
          currency={currency}
          onRestaurantClick={handleRestaurantClick}
          selectedRestaurantKey={selectedRestaurantKey}
        />

        <div className="space-y-3">
          {(day.places || []).map((place) => (
            <PlaceCard
              key={`${day.day}-${place.order}-${place.name}`}
              place={place}
              currency={currency}
              isSelected={selectedPlaceOrder === place.order}
              onPlaceClick={handlePlaceClick}
            />
          ))}
        </div>
      </div>

      <div className="lg:sticky lg:top-5 lg:h-fit">
        <RouteMap
          day={day}
          hotel={hotel}
          currency={currency}
          focusLatLng={focusLatLng}
          selectedRestaurantKey={selectedRestaurantKey}
          selectedPlaceOrder={selectedPlaceOrder}
          onRestaurantMarkerClick={handleRestaurantMarkerClick}
        />
      </div>
    </section>
  )
}

export default DayOverview
