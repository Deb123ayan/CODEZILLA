import math
from .ml_service import ai_service


def calculate_risk_and_premium(zone, avg_income, weather_risk=0.4, pollution_risk=0.3, platform='Zomato'):
    """
    Interfaces with the AI ML service to calculate the weekly premium.
    """
    premium = ai_service.predict_premium(avg_income, weather_risk, pollution_risk, platform)
    coverage_limit = avg_income * 1.5  # Business rule

    return {
        "premium": premium,
        "coverage": coverage_limit,
        "risks": {
            "weather": weather_risk,
            "pollution": pollution_risk
        }
    }


def compute_dynamic_risk(zone, lat=None, lng=None):
    """
    Fetches real weather/AQI data for a zone and computes dynamic risk scores.
    Returns weather_risk (0-1) and pollution_risk (0-1).
    """
    from ai_engine.weather_service import WeatherService

    # Get coordinates
    if not lat or not lng:
        coords = WeatherService.get_coordinates_for_zone(zone)
        if coords:
            lat, lng = coords
        else:
            return 0.3, 0.2  # Safe default if zone unknown

    weather = WeatherService.fetch_current_weather(lat, lng)
    aqi_data = WeatherService.fetch_air_quality(lat, lng)

    # Compute weather risk (0-1) based on actual conditions
    weather_risk = 0.1  # base risk
    rain = weather.get('rain_1h_mm', 0) + weather.get('rain_3h_mm', 0)
    wind = weather.get('wind_speed_kmh', 0)
    temp = weather.get('temperature_c', 30)

    if rain > 50:
        weather_risk += 0.4
    elif rain > 20:
        weather_risk += 0.2
    elif rain > 5:
        weather_risk += 0.1

    if wind > 60:
        weather_risk += 0.2
    elif wind > 30:
        weather_risk += 0.1

    if temp > 42:
        weather_risk += 0.2
    elif temp > 38:
        weather_risk += 0.1

    storm_keywords = ['thunderstorm', 'storm', 'tornado', 'hurricane', 'cyclone']
    if any(kw in weather.get('description', '').lower() for kw in storm_keywords):
        weather_risk += 0.3

    weather_risk = min(weather_risk, 1.0)

    # Compute pollution risk (0-1) based on AQI
    aqi = aqi_data.get('aqi', 100)
    if aqi > 400:
        pollution_risk = 0.9
    elif aqi > 300:
        pollution_risk = 0.7
    elif aqi > 200:
        pollution_risk = 0.5
    elif aqi > 100:
        pollution_risk = 0.3
    else:
        pollution_risk = 0.1

    return round(weather_risk, 2), round(pollution_risk, 2)


def get_realtime_risk_alert(zone, forecast_rain, forecast_wind, aqi):
    """
    AI-based disruption forecast.
    """
    prob = ai_service.predict_disruption(forecast_rain, forecast_wind, aqi)

    risk_level = "HIGH" if prob > 0.6 else "MEDIUM" if prob > 0.3 else "LOW"

    alerts = {
        "HIGH": "⚠️ High disruption risk detected. Workers in this zone may face income loss.",
        "MEDIUM": "Moderate risks detected. Monitor conditions closely.",
        "LOW": "Conditions look safe for deliveries.",
    }

    return {
        "zone": zone,
        "probability": prob,
        "risk_level": risk_level,
        "alert_message": alerts[risk_level],
    }


def audit_claim_for_fraud(lost_hours, compensation, distance_km, nearby_workers_count=0):
    """
    Returns True if the claim is NOT flagged by the IsolationForest anomaly detector.
    """
    return not ai_service.is_claim_fraudulent(lost_hours, compensation, distance_km, nearby_workers_count=nearby_workers_count)


def compute_gps_distance(lat1, lon1, lat2, lon2):
    """
    Haversine formula to compute distance between two GPS points in km.
    Used for fraud detection — checks if worker is actually near their claimed zone.
    """
    R = 6371  # Earth radius in km

    lat1_r, lat2_r = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_r) * math.cos(lat2_r) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return round(R * c, 2)
