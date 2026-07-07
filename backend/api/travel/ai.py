import json
from typing import Dict, Any

from ..utils import generate


def build_itinerary_prompt(user_prompt: str) -> str:
    """
    Creates the prompt for the AI itinerary generator.
    """

    return f"""
You are an expert travel planner.

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
13. Generate the correct number of itinerary days.
14. Never leave arrays empty.
15. Always recommend at least 3 attractions per day.

Vibe & Aesthetic

16a. Always populate the "trip.vibe" object, even if the user didn't specify a vibe — infer a sensible default based on the destination and trip type.
16b. "color_palette" should be a short list (3–6) of descriptive color/tone words matching the intended photo mood.
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

OpenStreetMap / OSRM Compatibility

21. Every attraction, hotel, and restaurant MUST be a real place that currently exists.

22. Every attraction, hotel, and restaurant MUST include an "osm_query" field.

23. The osm_query must be written exactly as it should be searched in OpenStreetMap Nominatim.

24. Format osm_query as:

"Official Place Name, City, Country"

Examples:

"Eiffel Tower, Paris, France"

"Louvre Museum, Paris, France"

"The Shelbourne Dublin, Autograph Collection, Dublin, Ireland"

"The Woollen Mills, Dublin, Ireland"

25. Use official names only.

26. Never abbreviate place names.

27. Never invent attractions, restaurants or hotels.

28. The "name" field should only contain the official place name.

29. The "address" field should contain the full postal address whenever known.

30. The "osm_query" field should always be optimized for OpenStreetMap geocoding.

31. All generated places must be uniquely searchable using their osm_query.

32. The generated itinerary will later be processed by OpenStreetMap Nominatim and OSRM Routing APIs, so every osm_query must resolve to a single real-world location.

Restaurant Recommendations

33. Every meal must recommend 2–4 signature dishes or drinks available at that restaurant.

34. Include a "recommended_orders" array.

35. Each recommended order must contain:
    - name
    - description
    - estimated_price

36. Estimated prices must use the destination country's local currency.

37. The meal's estimated_cost should equal the approximate sum of the recommended orders.

38. Recommend the restaurant's most popular or signature dishes.

39. Do not invent menu items.

40. Ensure the dishes actually exist at the recommended restaurant.

41. Breakfast should contain breakfast items.

42. Lunch and dinner may contain appetizers, main courses, desserts, or beverages.

43. Recommend at least one local specialty food every day.

44. If the traveler has dietary preferences, recommend suitable dishes.

45. Prices should be realistic for the restaurant.

46. Use official restaurant names.

47. Every restaurant must include an osm_query.

48. Every attraction and restaurant should be reasonably close to each other to minimize travel time.

49. Balance indoor and outdoor attractions throughout the itinerary.

50. Avoid recommending duplicate attractions or restaurants during the trip unless explicitly requested.

51. Schedule meals near the attractions visited around the same time of day.

52. Include iconic local foods and must-try specialties unique to the destination.

53. Budget calculations must include the cost of the recommended menu items.

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


def create_itinerary(user_prompt: str) -> Dict[str, Any]:
    """
    Main function.

    Returns AI itinerary before geocoding.
    """

    itinerary = generate_itinerary(user_prompt)

    itinerary = validate_itinerary(itinerary)

    return itinerary


