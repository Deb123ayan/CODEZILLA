import requests
import os
from datetime import datetime


# Free weather API — OpenWeatherMap
# Sign up at https://openweathermap.org/api for a free key (1000 calls/day)
# For demo: we use a fallback if no key is set
OPENWEATHER_API_KEY = os.environ.get('OPENWEATHER_API_KEY', '')

# Zone coordinates for known delivery zones (fallback when GPS not available)
ZONE_COORDINATES = {
    # Bangalore
    'koramangala': (12.9352, 77.6245),
    'indiranagar': (12.9784, 77.6408),
    'hsr layout': (12.9116, 77.6389),
    'whitefield': (12.9698, 77.7500),
    'electronic city': (12.8399, 77.6770),
    # Mumbai
    'bandra': (19.0596, 72.8295),
    'andheri': (19.1136, 72.8697),
    'powai': (19.1176, 72.9060),
    # Delhi
    'connaught place': (28.6315, 77.2167),
    'saket': (28.5244, 77.2066),
    'dwarka': (28.5921, 77.0460),
    # Kolkata
    'salt lake': (22.5726, 88.4159),
    'park street': (22.5512, 88.3524),
    'new town': (22.5958, 88.4795),
    'gariahat': (22.5175, 88.3681),
}


class WeatherService:
    """
    Fetches real weather data from OpenWeatherMap API.
    Used to verify if weather conditions actually warrant an insurance claim.
    """

    @staticmethod
    def get_coordinates_for_zone(zone_name):
        """Get lat/lng for a known zone name."""
        key = zone_name.lower().strip()
        # Try exact match first
        if key in ZONE_COORDINATES:
            return ZONE_COORDINATES[key]
        # Try partial match
        for zone, coords in ZONE_COORDINATES.items():
            if zone in key or key in zone:
                return coords
        return None

    @staticmethod
    def fetch_open_meteo_weather(lat, lng):
        """
        Fetch real-time weather from Open-Meteo (Free, no API key).
        Returns standardized weather data.
        """
        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={lat}&longitude={lng}&current_weather=true&hourly=precipitation,rain,showers,snowfall,temperature_2m"
            )
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            curr = data.get('current_weather', {})
            
            # Find closest hourly rain for current hour
            import datetime
            current_hour = datetime.datetime.now().hour
            hourly = data.get('hourly', {})
            
            # Simple index-based lookup for the current hour (0-23)
            rain_val = hourly.get('rain', [0])[current_hour] if len(hourly.get('rain', [])) > current_hour else 0
            showers_val = hourly.get('showers', [0])[current_hour] if len(hourly.get('showers', [])) > current_hour else 0
            temp_val = hourly.get('temperature_2m', [25])[current_hour] if len(hourly.get('temperature_2m', [])) > current_hour else curr.get('temperature', 25)
            
            total_precip = rain_val + showers_val

            return {
                'source': 'openmeteo_live',
                'lat': lat,
                'lng': lng,
                'temperature_c': float(temp_val),
                'humidity': 60,
                'rain_1h_mm': float(total_precip),
                'rain_3h_mm': float(total_precip * 3), 
                'wind_speed_kmh': float(curr.get('windspeed', 0)),
                'description': 'clear' if total_precip == 0 else 'rainy',
                'weather_main': 'Rain' if total_precip > 0 else 'Clear',
                'timestamp': datetime.datetime.now().isoformat(),
            }
        except Exception as e:
            print(f"Open-Meteo API error: {e}")
            return None

    @staticmethod
    def fetch_current_weather(lat, lng):
        """
        Fetch real-time weather. Tries Open-Meteo first (Free/No-Key), 
        then OpenWeatherMap as fallback.
        """
        # Try Open-Meteo first as requested
        om_data = WeatherService.fetch_open_meteo_weather(lat, lng)
        if om_data:
            return om_data

        if not OPENWEATHER_API_KEY:
            return WeatherService._simulated_weather(lat, lng)

        try:
            url = (
                f"https://api.openweathermap.org/data/2.5/weather"
                f"?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}&units=metric"
            )
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # ... rest of OpenWeatherMap logic ...
            rain_1h = data.get('rain', {}).get('1h', 0)
            rain_3h = data.get('rain', {}).get('3h', 0)
            wind_speed = data.get('wind', {}).get('speed', 0)
            temp = data['main']['temp']
            humidity = data['main']['humidity']
            description = data['weather'][0]['description'] if data.get('weather') else 'unknown'
            weather_main = data['weather'][0]['main'] if data.get('weather') else 'Clear'

            return {
                'source': 'openweathermap_live',
                'lat': lat,
                'lng': lng,
                'temperature_c': temp,
                'humidity': humidity,
                'rain_1h_mm': rain_1h,
                'rain_3h_mm': rain_3h,
                'wind_speed_kmh': round(wind_speed * 3.6, 1),
                'description': description,
                'weather_main': weather_main,
                'timestamp': datetime.now().isoformat(),
            }
        except Exception as e:
            print(f"Weather API error: {e}. Falling back to simulation.")
            return WeatherService._simulated_weather(lat, lng)

    @staticmethod
    def fetch_air_quality(lat, lng):
        """
        Fetch real AQI from OpenWeatherMap Air Pollution API.
        """
        if not OPENWEATHER_API_KEY:
            return WeatherService._simulated_aqi(lat, lng)

        try:
            url = (
                f"http://api.openweathermap.org/data/2.5/air_pollution"
                f"?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}"
            )
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()

            aqi_index = data['list'][0]['main']['aqi']  # 1-5 scale
            components = data['list'][0]['components']

            # Convert OpenWeatherMap 1-5 scale to India's AQI-like 0-500 scale
            aqi_map = {1: 50, 2: 100, 3: 200, 4: 300, 5: 450}
            estimated_aqi = aqi_map.get(aqi_index, 150)

            return {
                'source': 'openweathermap_live',
                'aqi': estimated_aqi,
                'aqi_category': WeatherService._aqi_category(estimated_aqi),
                'pm2_5': components.get('pm2_5', 0),
                'pm10': components.get('pm10', 0),
                'co': components.get('co', 0),
                'timestamp': datetime.now().isoformat(),
            }
        except Exception as e:
            print(f"AQI API error: {e}. Falling back to simulation.")
            return WeatherService._simulated_aqi(lat, lng)

    @staticmethod
    def check_disruption_conditions(lat, lng):
        """
        Master method: checks weather + AQI and determines if conditions
        qualify for an insurance claim (parametric trigger).
        """
        weather = WeatherService.fetch_current_weather(lat, lng)
        aqi_data = WeatherService.fetch_air_quality(lat, lng)

        triggers = []
        is_disrupted = False

        # Ensure values are floats for comparison
        rain_1h = float(weather.get('rain_1h_mm', 0))
        rain_3h = float(weather.get('rain_3h_mm', 0))
        temp = float(weather.get('temperature_c', 25))
        wind = float(weather.get('wind_speed_kmh', 0))
        aqi = float(aqi_data.get('aqi', 100))

        # Trigger 1: Heavy Rain
        if rain_3h > 50 or rain_1h > 20:
            triggers.append({
                'type': 'HEAVY_RAIN',
                'severity': 'HIGH',
                'detail': f"Rain: {rain_1h}mm/1h, {rain_3h}mm/3h",
                'threshold': '20mm/1h or 50mm/3h',
            })
            is_disrupted = True

        # Trigger 2: Extreme Heat (>40°C)
        if temp > 40:
            triggers.append({
                'type': 'EXTREME_HEAT',
                'severity': 'HIGH',
                'detail': f"Temperature: {temp}°C",
                'threshold': '40°C',
            })
            is_disrupted = True

        # Trigger 3: High Wind (>60 km/h)
        if wind > 60:
            triggers.append({
                'type': 'HIGH_WIND',
                'severity': 'MEDIUM',
                'detail': f"Wind: {wind} km/h",
                'threshold': '60 km/h',
            })
            is_disrupted = True

        # Trigger 4: Severe Pollution (AQI > 300)
        if aqi > 300:
            triggers.append({
                'type': 'SEVERE_POLLUTION',
                'severity': 'HIGH',
                'detail': f"AQI: {aqi} ({aqi_data.get('aqi_category', 'Unknown')})",
                'threshold': 'AQI > 300',
            })
            is_disrupted = True

        return {
            'is_disrupted': is_disrupted,
            'trigger_count': len(triggers),
            'triggers': triggers,
            'weather': weather,
            'air_quality': aqi_data,
            'verdict': 'CLAIM_ELIGIBLE' if is_disrupted else 'NO_DISRUPTION',
            'checked_at': datetime.now().isoformat(),
        }

    @staticmethod
    def verify_claim(lat, lng, claimed_reason):
        """
        Anti-fraud: Verify a worker's claim against real weather.
        """
        conditions = WeatherService.check_disruption_conditions(lat, lng)

        reason_to_trigger = {
            'WEATHER': ['HEAVY_RAIN', 'HIGH_WIND', 'STORM', 'FLOOD_RISK'],
            'RAIN': ['HEAVY_RAIN'],
            'HEAT': ['EXTREME_HEAT'],
            'AQI': ['SEVERE_POLLUTION'],
            'POLLUTION': ['SEVERE_POLLUTION'],
            'STORM': ['STORM', 'HIGH_WIND', 'HEAVY_RAIN', 'SEVERE_TRAFFIC'],
            'FLOOD': ['FLOOD_RISK', 'HEAVY_RAIN'],
            'TRAFFIC': ['SEVERE_TRAFFIC'],
        }

        expected_triggers = reason_to_trigger.get(claimed_reason.upper(), [])
        actual_trigger_types = [t['type'] for t in conditions['triggers']]

        # Check if claimed reason matches actual conditions
        claim_verified = any(t in actual_trigger_types for t in expected_triggers)

        return {
            'claim_verified': claim_verified,
            'claimed_reason': claimed_reason,
            'actual_conditions': conditions,
            'fraud_flag': not claim_verified and not conditions['is_disrupted'],
            'fraud_reason': (
                f"Worker claimed '{claimed_reason}' but actual conditions were: "
                f"{conditions['weather'].get('description', 'clear')}, "
                f"Temp: {conditions['weather'].get('temperature_c')}°C, "
                f"Rain: {conditions['weather'].get('rain_1h_mm')}mm"
            ) if not claim_verified else None,
        }

    # ── Fallback simulated data (when no API key) ──

    @staticmethod
    def _simulated_weather(lat, lng):
        """Realistic simulated weather for demo purposes."""
        import random
        is_rainy = random.random() > 0.6
        return {
            'source': 'simulated (no API key set)',
            'lat': lat,
            'lng': lng,
            'temperature_c': round(random.uniform(25, 42), 1),
            'humidity': random.randint(40, 95),
            'rain_1h_mm': round(random.uniform(0, 30), 1) if is_rainy else 0,
            'rain_3h_mm': round(random.uniform(0, 80), 1) if is_rainy else 0,
            'wind_speed_kmh': round(random.uniform(5, 50), 1),
            'description': random.choice([
                'light rain', 'heavy rain', 'clear sky', 'scattered clouds',
                'thunderstorm', 'haze', 'overcast clouds'
            ]),
            'weather_main': 'Rain' if is_rainy else 'Clear',
            'timestamp': datetime.now().isoformat(),
        }

    @staticmethod
    def _simulated_aqi(lat, lng):
        import random
        aqi = random.randint(50, 450)
        return {
            'source': 'simulated (no API key set)',
            'aqi': aqi,
            'aqi_category': WeatherService._aqi_category(aqi),
            'pm2_5': round(random.uniform(10, 200), 1),
            'pm10': round(random.uniform(20, 300), 1),
            'co': round(random.uniform(200, 2000), 1),
            'timestamp': datetime.now().isoformat(),
        }

    @staticmethod
    def _aqi_category(aqi):
        if aqi <= 50: return 'Good'
        if aqi <= 100: return 'Moderate'
        if aqi <= 200: return 'Unhealthy for Sensitive'
        if aqi <= 300: return 'Unhealthy'
        if aqi <= 400: return 'Very Unhealthy'
        return 'Hazardous'
