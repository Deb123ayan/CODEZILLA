from .ml_service import ai_service

def calculate_risk_and_premium(zone, avg_income, weather_risk=0.4, pollution_risk=0.3, platform='Zomato'):
    """
    Interfaces with the AI ML service to calculate the weekly premium.
    """
    premium = ai_service.predict_premium(avg_income, weather_risk, pollution_risk, platform)
    coverage_limit = avg_income * 1.5 # Still a business rule for now
    
    return {
        "premium": premium,
        "coverage": coverage_limit,
        "risks": {
            "weather": weather_risk,
            "pollution": pollution_risk
        }
    }

def get_realtime_risk_alert(zone, forecast_rain, forecast_wind, aqi):
    """
    Winning Feature: AI Based disruption forecast.
    """
    prob = ai_service.predict_disruption(forecast_rain, forecast_wind, aqi)
    
    risk_level = "HIGH" if prob > 0.6 else "MEDIUM" if prob > 0.3 else "LOW"
    
    return {
        "zone": zone,
        "probability": prob,
        "risk_level": risk_level,
        "alert_message": "High rain risk tomorrow. Stay safe!" if risk_level == "HIGH" else "Moderate risks found.",
    }

def audit_claim_for_fraud(lost_hours, compensation, distance_km):
    """
    Returns True if the claim is NOT flagged by the IsolationForest anomaly detector.
    """
    return not ai_service.is_claim_fraudulent(lost_hours, compensation, distance_km)
