const OSRM_URL = 'https://router.project-osrm.org'

function geometryToLatLng(geometry) {
  if (!geometry || geometry.type !== 'LineString' || !Array.isArray(geometry.coordinates)) {
    return []
  }

  return geometry.coordinates
    .map((coordinate) => {
      if (!Array.isArray(coordinate) || coordinate.length < 2) {
        return null
      }

      const [lng, lat] = coordinate
      return [Number(lat), Number(lng)]
    })
    .filter((coordinate) => coordinate && !Number.isNaN(coordinate[0]) && !Number.isNaN(coordinate[1]))
}

export async function fetchOsrmRoute(fromLatLng, toLatLng, profile = 'walking') {
  if (!fromLatLng || !toLatLng) {
    return []
  }

  const [fromLat, fromLng] = fromLatLng
  const [toLat, toLng] = toLatLng

  const url =
    `${OSRM_URL}/route/v1/${profile}/` +
    `${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const geometry = data?.routes?.[0]?.geometry
    return geometryToLatLng(geometry)
  } catch {
    return []
  }
}

export async function fetchOsrmRouteChain(points, profile = 'walking') {
  const segments = []

  for (let index = 0; index < points.length - 1; index += 1) {
    const segment = await fetchOsrmRoute(points[index], points[index + 1], profile)
    if (segment.length > 1) {
      segments.push(segment)
    }
  }

  return segments
}
