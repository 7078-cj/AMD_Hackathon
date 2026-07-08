import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

function MapController({ markers, focusLatLng, dayKey }) {
  const map = useMap()

  useEffect(() => {
    if (focusLatLng) {
      map.flyTo(focusLatLng, 15, { duration: 0.75 })
      return
    }

    const points = markers.map((marker) => marker.latLng).filter(Boolean)
    if (points.length === 0) {
      return
    }

    if (points.length === 1) {
      map.setView(points[0], 14)
      return
    }

    map.fitBounds(L.latLngBounds(points), {
      padding: [48, 48],
      maxZoom: 14,
    })
  }, [dayKey, focusLatLng, markers, map])

  return null
}

export default MapController
