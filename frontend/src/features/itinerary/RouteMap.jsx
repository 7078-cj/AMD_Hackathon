import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import MapController from './MapController'
import { fetchOsrmRouteChain } from './osrm'

const markerStyles = {
  hotel: 'bg-[#2563EB]',
  restaurant: 'bg-[#D9A05B]',
  activity: 'bg-[#2CB1A3]',
}

function createMarkerIcon(kind, label, selected = false) {
  const color = markerStyles[kind] || markerStyles.activity
  const ring = selected
    ? 'ring-2 ring-offset-2 ring-offset-[#0A1418] ring-[#F5D97A]'
    : ''

  return L.divIcon({
    className: 'custom-div-marker',
    html: `
      <span
        class="flex h-7 w-7 items-center justify-center rounded-full
        ${color} ${ring}
        border-2 border-[#0A1418]
        text-xs font-bold text-white
        shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
      >
        ${label}
      </span>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

function RestaurantPopup({ restaurant, currency }) {
  return (
    <div className="space-y-2 text-sm">
      <p className="font-semibold">
        {restaurant.restaurant || restaurant.name}
      </p>

      <p>
        {restaurant.type} - {restaurant.time}
      </p>

      {restaurant.address ? <p>{restaurant.address}</p> : null}

      {restaurant.osm_query ? (
        <p className="text-xs text-slate-500">{restaurant.osm_query}</p>
      ) : null}

      <p className="font-medium text-emerald-700">
        {currency} {restaurant.estimated_cost}
      </p>

      {(restaurant.recommended_orders || []).length > 0 ? (
        <ul className="space-y-1 text-xs">
          {restaurant.recommended_orders.map((order) => (
            <li key={order.name}>
              <span className="font-medium">{order.name}</span>
              {' - '}
              {currency} {order.estimated_price}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-xs text-rose-600">
        Click marker to focus this restaurant
      </p>
    </div>
  )
}

function RouteMap({
  day,
  hotel,
  currency = 'PHP',
  focusLatLng,
  selectedRestaurantKey,
  selectedPlaceOrder,
  onRestaurantMarkerClick,
}) {
  const [restaurantRoutes, setRestaurantRoutes] = useState([])
  const [loadingRestaurantRoutes, setLoadingRestaurantRoutes] = useState(false)

  const mapData = useMemo(() => {
    const markers = []
    const activityRoutes = []

    const hotelPoint =
      hotel?.latitude && hotel?.longitude
        ? [Number(hotel.latitude), Number(hotel.longitude)]
        : null

    if (hotelPoint) {
      markers.push({
        id: 'hotel',
        label: hotel.name,
        latLng: hotelPoint,
        kind: 'hotel',
        subtitle: 'Hotel',
        icon: createMarkerIcon('hotel', 'H'),
        popup: (
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{hotel.name}</p>
            <p>{hotel.type}</p>
            <p>{hotel.address}</p>
            <p className="text-xs text-slate-500">{hotel.osm_query}</p>
          </div>
        ),
      })
    }

    ;(day.restaurants || []).forEach((restaurant, index) => {
      const mealKey = `${restaurant.type}-${restaurant.time}-${restaurant.restaurant || restaurant.name}`

      const isSelected = selectedRestaurantKey === mealKey

      markers.push({
        id: `restaurant-${index}`,
        label: restaurant.restaurant || restaurant.name,
        latLng: restaurant.latLng,
        kind: 'restaurant',
        subtitle: `${restaurant.type} - ${restaurant.time}`,
        icon: createMarkerIcon(
          'restaurant',
          restaurant.type?.[0] || 'R',
          isSelected,
        ),
        restaurant,
        onClick: () => onRestaurantMarkerClick?.(restaurant),
        popup: (
          <RestaurantPopup
            restaurant={restaurant}
            currency={currency}
          />
        ),
      })
    })

    ;(day.places || []).forEach((place) => {
      if (place.latLng) {
        const isSelected = selectedPlaceOrder === place.order

        markers.push({
          id: `place-${place.order}`,
          label: place.name,
          latLng: place.latLng,
          kind: 'activity',
          subtitle: `Stop ${place.order}`,
          icon: createMarkerIcon(
            'activity',
            String(place.order),
            isSelected,
          ),
          popup: (
            <div className="space-y-1 text-sm">
              <p className="font-semibold">{place.name}</p>
              <p>Stop {place.order}</p>
              <p>{place.address}</p>

              <p className="text-xs text-slate-500">
                {place.osm_query}
              </p>

              {place.crowd_level_notes ? (
                <p>{place.crowd_level_notes}</p>
              ) : null}
            </div>
          ),
        })
      }

      if (place.routeCoordinates?.length > 1) {
        activityRoutes.push(place.routeCoordinates)
      }
    })

    return {
      markers,
      activityRoutes,
      center: markers[0]?.latLng || [11.1800395, 119.390496],
    }
  }, [
    day,
    hotel,
    currency,
    selectedRestaurantKey,
    selectedPlaceOrder,
    onRestaurantMarkerClick,
  ])

  useEffect(() => {
    let cancelled = false

    async function loadRestaurantRoutes() {
      setLoadingRestaurantRoutes(true)

      const sortedRestaurants = [...(day.restaurants || [])]
        .filter((restaurant) => restaurant.latLng)
        .sort((a, b) =>
          (a.time || '').localeCompare(b.time || ''),
        )

      const routePoints = []

      const hotelPoint =
        hotel?.latitude && hotel?.longitude
          ? [Number(hotel.latitude), Number(hotel.longitude)]
          : null

      if (hotelPoint) {
        routePoints.push(hotelPoint)
      }

      sortedRestaurants.forEach((restaurant) => {
        routePoints.push(restaurant.latLng)
      })

      const segments =
        routePoints.length > 1
          ? await fetchOsrmRouteChain(routePoints)
          : []

      if (!cancelled) {
        setRestaurantRoutes(segments)
        setLoadingRestaurantRoutes(false)
      }
    }

    loadRestaurantRoutes()

    return () => {
      cancelled = true
    }
  }, [day.day, day.restaurants, hotel])

  return (
    <section className="overflow-hidden rounded-2xl border border-[#23414D] bg-[#11202A] shadow-lg">
      <header className="border-b border-[#23414D] px-4 py-3">
        <h2 className="text-base font-semibold text-[#E8F1F2]">
          Route Map
        </h2>

        <p className="text-xs text-[#8CA7AC]">
          Numbered stops show visit order · dashed lines are restaurant
          routes
        </p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#8CA7AC]">
          <span className="inline-flex items-center gap-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-[10px] font-bold text-white">
              H
            </span>
            Hotel
          </span>

          <span className="inline-flex items-center gap-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D9A05B] text-[10px] font-bold text-white">
              R
            </span>
            Restaurant
          </span>

          <span className="inline-flex items-center gap-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2CB1A3] text-[10px] font-bold text-white">
              1
            </span>
            Attraction Order
          </span>
        </div>

        {loadingRestaurantRoutes && (
          <p className="mt-2 text-xs text-[#8CA7AC]">
            Loading restaurant routes...
          </p>
        )}
      </header>

      <div className="h-[500px] lg:h-[calc(100vh-180px)] min-h-[650px] w-full">
        <MapContainer
          center={mapData.center}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />

          <MapController
            markers={mapData.markers}
            focusLatLng={focusLatLng}
            dayKey={day.day}
          />

          {mapData.activityRoutes.map((segment, index) => (
            <Polyline
              key={`activity-${index}`}
              positions={segment}
              pathOptions={{
                color: '#2CB1A3',
                weight: 4,
                opacity: 0.9,
              }}
            />
          ))}

          {restaurantRoutes.map((segment, index) => (
            <Polyline
              key={`restaurant-${index}`}
              positions={segment}
              pathOptions={{
                color: '#D9A05B',
                weight: 4,
                opacity: 0.85,
                dashArray: '8 8',
              }}
            />
          ))}

          {mapData.markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.latLng}
              icon={marker.icon}
              eventHandlers={{
                click: () => {
                  if (marker.kind === 'restaurant') {
                    marker.onClick?.()
                  }
                },
              }}
            >
              <Popup>{marker.popup}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  )
}

export default RouteMap