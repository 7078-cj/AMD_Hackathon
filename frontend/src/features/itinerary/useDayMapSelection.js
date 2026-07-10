import { useEffect, useState } from 'react'

// Shared selection/focus state between the day's meal & place list
// and the map, so both can live in different parts of the layout
// (left scrolling column vs. right sticky map) while staying in sync.
export function useDayMapSelection(dayKey) {
  const [focusLatLng, setFocusLatLng] = useState(null)
  const [selectedRestaurantKey, setSelectedRestaurantKey] = useState(null)
  const [selectedPlaceOrder, setSelectedPlaceOrder] = useState(null)

  useEffect(() => {
    setFocusLatLng(null)
    setSelectedRestaurantKey(null)
    setSelectedPlaceOrder(null)
  }, [dayKey])

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

  return {
    focusLatLng,
    selectedRestaurantKey,
    selectedPlaceOrder,
    handleRestaurantClick,
    handleRestaurantMarkerClick,
    handlePlaceClick,
  }
}