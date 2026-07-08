import time
from typing import Dict, List, Optional

import environ
import httpx

env = environ.Env()

GEOAPIFY_URL = "https://api.geoapify.com/v1/geocode/search"

HEADERS = {
    "User-Agent": "TravelPlanner/2.0"
}

_cache: Dict[str, Dict] = {}


class Geocoder:

    def __init__(self):

        self.api_key = env("GEOAPIFY_API_KEY")

        self.client = httpx.Client(
            timeout=20,
            headers=HEADERS,
        )

    def close(self):
        self.client.close()

    def geocode(self, query: str) -> Optional[Dict]:

        if not query:
            return None

        query = query.strip()

        if query in _cache:
            print(f"🟢 CACHE: {query}")
            return _cache[query]

        print(f"🔍 Geocoding: {query}")

        for attempt in range(3):

            try:

                response = self.client.get(
                    GEOAPIFY_URL,
                    params={
                        "text": query,
                        "limit": 1,
                        "format": "json",
                        "apiKey": self.api_key,
                    },
                )

                response.raise_for_status()

                data = response.json()

                features = data.get("results", [])

                if not features:
                    print(f"❌ NOT FOUND: {query}")
                    return None

                place = features[0]

                result = {
                    "address": place.get("formatted"),
                    "latitude": place.get("lat"),
                    "longitude": place.get("lon"),
                }

                _cache[query] = result

                print(
                    f"✅ FOUND: {query}\n"
                    f"   {result['latitude']}, {result['longitude']}"
                )

                return result

            except Exception as e:

                print(f"⚠ Attempt {attempt + 1} failed")

                print(e)

                if attempt == 2:
                    print(f"❌ FAILED: {query}")
                    return None

                time.sleep(2 ** attempt)

        return None


def enrich_location(
    geocoder: Geocoder,
    location: Dict,
):

    if not location:
        return

    query = (
        location.get("osm_query")
        or location.get("address")
        or location.get("name")
        or location.get("restaurant")
    )

    if not query:
        location["geocoded"] = False
        return

    result = geocoder.geocode(query)

    if not result:
        location["geocoded"] = False
        return

    location["address"] = result["address"]
    location["latitude"] = result["latitude"]
    location["longitude"] = result["longitude"]
    location["geocoded"] = True


def enrich_itinerary(itinerary: Dict):

    geocoder = Geocoder()

    try:

        print("\n==============================")
        print("STARTING GEOCODER")
        print("==============================")

        ####################################################
        # HOTEL
        ####################################################

        hotel = itinerary.get("trip", {}).get("hotel")

        if hotel:

            print("\n🏨 Hotel")

            enrich_location(
                geocoder,
                hotel,
            )

        ####################################################
        # DAYS
        ####################################################

        for day in itinerary.get("daily_itinerary", []):

            print(f"\n📅 Day {day.get('day')}")

            ###############################################
            # Attractions
            ###############################################

            for stop in day.get("to_go_locations", []):

                enrich_location(
                    geocoder,
                    stop,
                )

            ###############################################
            # Restaurants
            ###############################################

            for meal in day.get("meal_plan", []):

                restaurant = {
                    "restaurant": meal.get("restaurant"),
                    "osm_query": meal.get("osm_query"),
                    "address": meal.get("address"),
                }

                enrich_location(
                    geocoder,
                    restaurant,
                )

                if restaurant.get("geocoded"):

                    meal["address"] = restaurant["address"]
                    meal["latitude"] = restaurant["latitude"]
                    meal["longitude"] = restaurant["longitude"]

                meal["geocoded"] = restaurant.get("geocoded", False)

        print("\n==============================")
        print("GEOCODER COMPLETE")
        print("==============================")

    finally:

        geocoder.close()

    return itinerary


def collect_unverified(itinerary: Dict) -> List[Dict]:
    """
    Walks an itinerary that has already been through enrich_itinerary() and
    returns a flat list of every place that failed geocoding, tagged with a
    stable "role" key so a caller can patch the exact right field back in
    after generating a replacement.

    Each item: {"role": str, "name": str, "osm_query": str}
    """

    unverified = []

    hotel = itinerary.get("trip", {}).get("hotel")
    if hotel and not hotel.get("geocoded", False):
        unverified.append({
            "role": "hotel",
            "name": hotel.get("name", ""),
            "osm_query": hotel.get("osm_query", ""),
        })

    for day in itinerary.get("daily_itinerary", []):
        day_num = day.get("day")

        for stop in day.get("to_go_locations", []):
            if not stop.get("geocoded", False):
                unverified.append({
                    "role": f"day{day_num}_attraction_{stop.get('order')}",
                    "name": stop.get("name", ""),
                    "osm_query": stop.get("osm_query", ""),
                })

        for meal in day.get("meal_plan", []):
            if not meal.get("geocoded", False):
                unverified.append({
                    "role": f"day{day_num}_meal_{meal.get('type')}",
                    "name": meal.get("restaurant", ""),
                    "osm_query": meal.get("osm_query", ""),
                })

    return unverified


def reverify_place(geocoder: Geocoder, osm_query: str) -> Optional[Dict]:
    """
    Re-runs a single geocode lookup, bypassing nothing (still cache-aware).
    Used after a replacement place has been substituted in.
    """
    return geocoder.geocode(osm_query)