import requests
import os
from django.conf import settings
from datetime import datetime

class MapplsService:
    """
    Service to interact with MapmyIndia (Mappls) APIs.
    Used for traffic data and accurate location services.
    """
    
    _access_token = None
    _token_expiry = None

    @classmethod
    def get_token(cls):
        """Get OAuth2 token from Mappls."""
        if cls._access_token and cls._token_expiry and datetime.now() < cls._token_expiry:
            return cls._access_token

        client_id = os.environ.get('MAPPLS_CLIENT_ID')
        client_secret = os.environ.get('MAPPLS_CLIENT_SECRET')

        if not client_id or not client_secret:
            return None

        try:
            url = "https://outpost.mappls.com/api/security/oauth/token"
            data = {
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret
            }
            response = requests.post(url, data=data, timeout=10)
            response.raise_for_status()
            res_data = response.json()
            
            cls._access_token = res_data.get('access_token')
            expires_in = res_data.get('expires_in', 3600)
            cls._token_expiry = datetime.now() # Roughly
            
            return cls._access_token
        except Exception as e:
            print(f"Mappls Token Error: {e}")
            return None

    @staticmethod
    def get_traffic_congestion(lat, lng):
        """
        Fetch traffic congestion info for a coordinate.
        In a real app, uses Mappls Traffic/Flow API.
        For demo, we simulate based on time/location if API fails.
        """
        token = MapplsService.get_token()
        if not token:
            return MapplsService._simulated_traffic(lat, lng)

        try:
            # Placeholder for Mappls Traffic Flow API
            # url = f"https://apis.mappls.com/advancedmaps/v1/{settings.MAPPLS_API_KEY}/traffic?location={lat},{lng}"
            # For now, we use a mock delay to simulate heavy vs light traffic
            
            import random
            congestion_level = random.randint(1, 10) # 1 clear, 10 gridlock
            
            return {
                "source": "mappls_simulated",
                "congestion_index": congestion_level,
                "description": "Heavy Traffic" if congestion_level > 7 else "Normal Traffic",
                "speed_kmh": 40 - (congestion_level * 3),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            print(f"Mappls Traffic Error: {e}")
            return MapplsService._simulated_traffic(lat, lng)

    @staticmethod
    def _simulated_traffic(lat, lng):
        import random
        # Heuristic: certain hours are peak traffic
        hour = datetime.now().hour
        is_peak = (9 <= hour <= 11) or (18 <= hour <= 21)
        
        congestion = random.randint(6, 10) if is_peak else random.randint(1, 5)
        
        return {
            "source": "mappls_simulated",
            "congestion_index": congestion,
            "description": "Peak Traffic Jam" if congestion > 7 else "Flowing",
            "speed_kmh": max(5, 50 - (congestion * 5)),
            "timestamp": datetime.now().isoformat()
        }
