import json
import logging
from typing import Dict, Any

from ..utils import generate
from .geocoder import Geocoder, enrich_itinerary, enrich_location, collect_unverified

logger = logging.getLogger(__name__)


def build_itinerary_prompt(user_prompt: str) -> str:
    """
    Creates the prompt for the AI itinerary generator.
    """

    return f"""
You are an expert travel planner with deep, current, verifiable knowledge of real-world destinations.

The user request is:

"{user_prompt}"

Your task is to generate a COMPLETE travel itinerary.

If the user does NOT specify:

- destination
- duration
- budget
- hotel
- transportation
- attractions
- restaurants
- meal preferences
- vibe / mood / aesthetic
- number of travelers or group preferences
- accessibility needs

recommend sensible defaults.

If the user DOES specify or imply a desired vibe, mood, or aesthetic (e.g. "romantic", "adventurous", "cozy", "luxurious", "chill", "vibrant nightlife", "pastel aesthetic", "moody golden-hour photos", "IG-worthy", etc.), you MUST:

- Let that vibe influence which attractions, restaurants, and activities are chosen.
- Let it influence pacing and timing.
- Infer a color palette / photo mood target that matches the vibe, and factor that into attraction choice and suggested time of day.
- Reflect this in a top-level "vibe" object in the JSON, and weave consistent mood language into each day's "theme" and each location's "description".

If the user is planning for a GROUP (multiple named people, "me and my friends", "family trip", differing preferences per person, etc.), you MUST:

- Balance the itinerary across everyone's stated interests, dietary needs, and constraints rather than optimizing for a single traveler.
- Note in a "group_considerations" field how conflicting preferences were balanced (e.g. alternating activity types, offering optional/flexible stops).

You MUST also consider, where relevant:

- Crowd levels: prefer scheduling popular/high-traffic attractions at times they are typically less crowded (early morning, late afternoon, off-peak days), and note this reasoning briefly.
- Carbon footprint: when multiple transportation options are reasonable, note the relative carbon footprint of the recommended option compared to alternatives.
- Accessibility: if the user indicates any mobility, sensory, or other accessibility needs, prioritize attractions, restaurants, and routes that are wheelchair-accessible or otherwise suitable, and flag any known accessibility limitations.

Return ONLY valid JSON.

Do NOT include markdown.
Do NOT explain.
Do NOT wrap the JSON inside ```.
Do NOT include comments or trailing commas anywhere in the JSON.
Escape any double quotes or backslashes that appear inside string values so the JSON remains valid.

JSON Schema

{{
    "trip": {{
        "destination": "",
        "country": "",
        "days": 0,
        "nights": 0,
        "currency": "",
        "travelers": 1,
        "vibe": {{
            "mood": "",
            "description": "",
            "color_palette": [],
            "photo_style_notes": ""
        }},
        "group_considerations": "",
        "accessibility_notes": "",
        "budget": {{
            "total": 0,
            "recommended": true
        }},
        "hotel": {{
            "name": "",
            "osm_query": "",
            "address": "",
            "type": "",
            "estimated_cost": 0,
            "accessibility": ""
        }},
        "transportation": {{
            "type": "",
            "recommended": true,
            "estimated_carbon_kg_co2": 0,
            "carbon_comparison_notes": ""
        }}
    }},

    "daily_itinerary": [
        {{
            "day": 1,
            "theme": "",

            "meal_plan": [
                {{
                    "type": "Breakfast",
                    "time": "08:00",
                    "restaurant": "",
                    "osm_query": "",
                    "address": "",
                    "recommended_orders": [
                        {{
                            "name": "",
                            "description": "",
                            "estimated_price": 0
                        }}
                    ],
                    "estimated_cost": 0
                }},
                {{
                    "type": "Lunch",
                    "time": "12:00",
                    "restaurant": "",
                    "osm_query": "",
                    "address": "",
                    "recommended_orders": [
                        {{
                            "name": "",
                            "description": "",
                            "estimated_price": 0
                        }}
                    ],
                    "estimated_cost": 0
                }},
                {{
                    "type": "Dinner",
                    "time": "18:00",
                    "restaurant": "",
                    "osm_query": "",
                    "address": "",
                    "recommended_orders": [
                        {{
                            "name": "",
                            "description": "",
                            "estimated_price": 0
                        }}
                    ],
                    "estimated_cost": 0
                }}
            ],

            "to_go_locations": [
                {{
                    "order": 1,
                    "arrival_time": "09:00",
                    "departure_time": "11:00",
                    "name": "",
                    "osm_query": "",
                    "address": "",
                    "description": "",
                    "estimated_cost": 0,
                    "estimated_duration_minutes": 120,
                    "crowd_level_notes": "",
                    "accessibility": ""
                }}
            ],

            "daily_budget": {{
                "food": 0,
                "transport": 0,
                "activities": 0,
                "total": 0
            }}
        }}
    ],

    "budget_breakdown": {{
        "hotel": 0,
        "food": 0,
        "transport": 0,
        "activities": 0,
        "shopping": 0,
        "misc": 0,
        "total": 0
    }},

    "travel_tips": []
}}

Rules

1. Return ONLY JSON.
2. Recommend REAL attractions.
3. Recommend REAL restaurants.
4. Every day MUST have Breakfast, Lunch and Dinner.
5. Every day MUST have attractions.
6. Attractions should already be ordered geographically.
7. Hotel should be close to Day 1 attractions.
8. Include realistic budgets.
9. Include realistic visit durations.
10. Use complete addresses whenever possible.
11. Do NOT generate latitude or longitude.
12. Budget total must equal the breakdown.
13. Generate the correct number of itinerary days, and "daily_itinerary" must contain exactly one entry per day (day numbers 1 through "days", with no gaps or duplicates).
14. Never leave arrays empty.
15. Always recommend at least 3 attractions per day.

Vibe & Aesthetic

16a. Always populate the "trip.vibe" object, even if the user didn't specify a vibe — infer a sensible default based on the destination and trip type.
16b. "color_palette" should be a short list (3–6) of hex color codes (e.g. "#FF7F50") matching the intended photo mood. Do NOT use color names or rgba — hex only, each starting with "#" and 6 hex digits.
16c. "photo_style_notes" should briefly describe lighting/time-of-day and composition style that fits the vibe.
16d. Attraction and restaurant choices, and suggested visit times, should be consistent with the stated vibe and color palette where multiple equally-valid real options exist.

Crowd-Aware Scheduling

17a. Use general knowledge of typical crowd patterns (opening hours, weekday vs weekend, tourist season) to schedule high-traffic attractions at comparatively less crowded times.
17b. Briefly note the crowd reasoning in "crowd_level_notes" for major/popular attractions; leave empty for low-traffic spots where not relevant.

Group Trip Planning

18a. If planning for a group, populate "group_considerations" describing how differing preferences, dietary needs, or interests were balanced across the itinerary.
18b. If not a group trip, leave "group_considerations" as an empty string.

Carbon Footprint

19a. Populate "transportation.estimated_carbon_kg_co2" with a realistic estimate for the recommended transportation type over the trip.
19b. Populate "carbon_comparison_notes" with a brief comparison to at least one reasonable alternative transportation mode and its relative footprint.

Accessibility

20a. If the user indicates accessibility needs, populate "accessibility_notes" at the trip level summarizing overall approach, and the "accessibility" field for hotel and each attraction with relevant details (e.g. "wheelchair accessible entrance", "no elevator access — stairs only").
20b. If no accessibility needs are indicated, leave these fields as empty strings rather than omitting them.

Real-World Accuracy (Critical)

21. Every attraction, hotel, and restaurant MUST be a real, currently operating place. Do not invent plausible-sounding names, and do not recommend a place you believe has permanently closed.
22. If you are not confident that a specific place genuinely exists and is currently open, do NOT include it. Replace it with a different, well-established, easily verifiable place that fits the same role in the itinerary (same neighborhood, similar cuisine/category, similar price point).
23. Prefer well-known, easily verifiable places (established landmarks, long-running local institutions, recognized chains with a specific branch) over obscure or newly-opened venues you are less certain about, unless the user specifically asked for hidden gems — in which case still only use real, verifiable places.
24. Every attraction, hotel, and restaurant MUST include an "osm_query" field.
25. The osm_query must be written exactly as it should be searched in OpenStreetMap Nominatim.
26. Format osm_query as:

"Official Place Name, City, Country"

Examples:

"Eiffel Tower, Paris, France"

"Louvre Museum, Paris, France"

"The Shelbourne Dublin, Autograph Collection, Dublin, Ireland"

"The Woollen Mills, Dublin, Ireland"

27. Use official names only.
28. Never abbreviate place names.
29. Never invent attractions, restaurants, or hotels.
30. The "name" field should only contain the official place name.
31. The "address" field should contain the full postal address whenever known. If the exact street address is genuinely uncertain, provide the most specific verifiable location description you are confident about (e.g. neighborhood and city) rather than guessing a precise street number.
32. The "osm_query" field should always be optimized for OpenStreetMap geocoding.
33. All generated places must be uniquely searchable using their osm_query. For chains or common names (e.g. "Starbucks", "Costa Coffee"), the osm_query and address MUST include enough disambiguating detail (specific street or neighborhood) to identify the exact branch — never leave it generic enough to match multiple locations.
34. The generated itinerary will later be processed by OpenStreetMap Nominatim and OSRM Routing APIs, so every osm_query must resolve to a single real-world location.
35. Do not reuse a fictional or composite location under a real-sounding name — every place must correspond to one specific, actual real-world entity.

Restaurant Recommendations

36. Every meal must recommend 2–4 signature dishes or drinks actually available at that restaurant.
37. Include a "recommended_orders" array.
38. Each recommended order must contain:
    - name
    - description
    - estimated_price
39. Estimated prices must use the destination country's local currency.
40. The meal's estimated_cost should equal the approximate sum of the recommended orders.
41. Recommend the restaurant's most popular or signature dishes.
42. Do not invent menu items.
43. Ensure the dishes actually exist at the recommended restaurant. If uncertain about a restaurant's specific menu, recommend well-known local specialty dishes common to that cuisine and describe them generically, rather than inventing an oddly specific item.
44. Breakfast should contain breakfast items.
45. Lunch and dinner may contain appetizers, main courses, desserts, or beverages.
46. Recommend at least one local specialty food every day.
47. If the traveler has dietary preferences, recommend suitable dishes.
48. Prices should be realistic for the restaurant and destination.
49. Use official restaurant names.
50. Every restaurant must include an osm_query.
51. Every attraction and restaurant should be reasonably close to each other to minimize travel time.
52. Balance indoor and outdoor attractions throughout the itinerary.
53. Avoid recommending duplicate attractions or restaurants during the trip unless explicitly requested.
54. Schedule meals near the attractions visited around the same time of day.
55. Include iconic local foods and must-try specialties unique to the destination.
56. Budget calculations must include the cost of the recommended menu items.

Currency & Numbers

57. "currency" must be the destination's local currency, expressed as its 3-letter ISO 4217 code (e.g. "EUR", "JPY", "USD"), not a symbol or full name.
58. All numeric fields (costs, budgets, carbon estimates) must be plain numbers, not strings, and must not include currency symbols or commas.

"""


def generate_itinerary(user_prompt: str) -> Dict[str, Any]:
    """
    Generates an itinerary using the configured LLM.
    """

    prompt = build_itinerary_prompt(user_prompt)

    response = generate(prompt)

    if not response["success"]:
        raise Exception(response["error"])

    return response["result"]


def validate_itinerary(itinerary: Dict[str, Any]) -> Dict[str, Any]:
    """
    Ensures required keys exist.
    """

    itinerary.setdefault("trip", {})
    itinerary.setdefault("daily_itinerary", [])
    itinerary.setdefault("budget_breakdown", {})
    itinerary.setdefault("travel_tips", [])

    for day in itinerary["daily_itinerary"]:

        day.setdefault("meal_plan", [])

        day.setdefault("to_go_locations", [])

        day.setdefault("daily_budget", {})

    return itinerary


def build_replacement_prompt(unverified: list) -> str:
    """
    Asks the LLM for verifiable replacements for only the places that
    failed geocoding, rather than regenerating the whole itinerary.
    """

    listed = "\n".join(
        f'- {p["role"]}: "{p["name"]}" (queried as "{p["osm_query"]}")'
        for p in unverified
    )

    return f"""
The following places could not be geocoded and may not exist, may be
misspelled, or may be too ambiguous to resolve to a single real-world
location:

{listed}

For each one, provide a REAL, currently operating replacement that fits the
same role (same city/neighborhood, same category — attraction, restaurant,
or hotel — and a similar price point/vibe as the original). Follow the same
osm_query formatting rules as before: "Official Place Name, City, Country",
official name only, no abbreviations, disambiguated enough for a single
OpenStreetMap/geocoding match.

Return ONLY valid JSON, no markdown, no explanation, in this exact shape:

{{
  "replacements": {{
    "<role>": {{
      "name": "",
      "osm_query": "",
      "address": ""
    }}
  }}
}}
"""


def resolve_unverified_places(
    itinerary: Dict[str, Any],
    unverified: list,
    geocoder: Geocoder,
) -> Dict[str, Any]:
    """
    Second pass: asks the LLM for replacements for places that failed
    geocoding, patches them into the itinerary, and re-geocodes just those.
    """

    if not unverified:
        return itinerary

    prompt = build_replacement_prompt(unverified)
    response = generate(prompt)

    if not response["success"]:
        logger.warning("Replacement generation failed: %s", response.get("error"))
        return itinerary

    replacements = response["result"].get("replacements", {})

    hotel = itinerary.get("trip", {}).get("hotel")

    for day in itinerary.get("daily_itinerary", []):
        day_num = day.get("day")

        for stop in day.get("to_go_locations", []):
            role = f"day{day_num}_attraction_{stop.get('order')}"
            new_data = replacements.get(role)
            if new_data:
                stop["name"] = new_data.get("name", stop.get("name"))
                stop["osm_query"] = new_data.get("osm_query", stop.get("osm_query"))
                stop["address"] = new_data.get("address", stop.get("address"))
                enrich_location(geocoder, stop)

        for meal in day.get("meal_plan", []):
            role = f"day{day_num}_meal_{meal.get('type')}"
            new_data = replacements.get(role)
            if new_data:
                meal["restaurant"] = new_data.get("name", meal.get("restaurant"))
                meal["osm_query"] = new_data.get("osm_query", meal.get("osm_query"))
                meal["address"] = new_data.get("address", meal.get("address"))

                temp = {
                    "restaurant": meal["restaurant"],
                    "osm_query": meal["osm_query"],
                    "address": meal["address"],
                }
                enrich_location(geocoder, temp)
                meal["geocoded"] = temp.get("geocoded", False)
                if temp.get("geocoded"):
                    meal["address"] = temp["address"]
                    meal["latitude"] = temp["latitude"]
                    meal["longitude"] = temp["longitude"]

    if hotel:
        new_data = replacements.get("hotel")
        if new_data:
            hotel["name"] = new_data.get("name", hotel.get("name"))
            hotel["osm_query"] = new_data.get("osm_query", hotel.get("osm_query"))
            hotel["address"] = new_data.get("address", hotel.get("address"))
            enrich_location(geocoder, hotel)

    return itinerary


def create_itinerary(user_prompt: str) -> Dict[str, Any]:
    """
    Main function.

    Generates the itinerary, geocodes every place via Geoapify, and retries
    (with LLM-suggested replacements) any place that failed to geocode —
    so downstream map/routing display isn't left with dead pins.
    """

    itinerary = generate_itinerary(user_prompt)
    itinerary = validate_itinerary(itinerary)

    itinerary = enrich_itinerary(itinerary)

    unverified = collect_unverified(itinerary)

    if unverified:
        logger.info(
            "Retrying %d unverified place(s): %s",
            len(unverified),
            [p["name"] for p in unverified],
        )

        geocoder = Geocoder()
        try:
            itinerary = resolve_unverified_places(itinerary, unverified, geocoder)
        finally:
            geocoder.close()

    return itinerary