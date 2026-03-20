import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest, RandomForestRegressor, RandomForestClassifier
import joblib
import os

# Base directory for saved models
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
if not os.path.exists(MODEL_DIR):
    os.makedirs(MODEL_DIR)

class InsuranceAI:
    def __init__(self):
        self.risk_model_path = os.path.join(MODEL_DIR, 'premium_model.joblib')
        self.fraud_model_path = os.path.join(MODEL_DIR, 'fraud_model.joblib')
        self.disruption_model_path = os.path.join(MODEL_DIR, 'disruption_model.joblib')
        
        # Cache for loaded models
        self._risk_model = None
        self._fraud_model = None
        self._disruption_model = None

    def _get_model(self, attr_name, path):
        """Helper to load and cache models with error handling"""
        model = getattr(self, attr_name)
        if model is None:
            if not os.path.exists(path):
                print(f"CRITICAL: Model file missing at {path}. System will use fallbacks.")
                return None
            try:
                model = joblib.load(path)
                setattr(self, attr_name, model)
            except Exception as e:
                print(f"ERROR: Failed to load model at {path}: {str(e)}")
                return None
        return model

    def train_initial_models(self):
        """
        Trains baseline models for the hackathon demo using synthetic data.
        In production, this would use historical claim/weather data.
        """
        # 1. Premium Risk Model (RandomForestRegressor)
        X_risk = np.random.rand(100, 4) * [1000, 1, 1, 4]
        y_premium = (X_risk[:, 0] * 0.03) * (1 + X_risk[:, 1] + X_risk[:, 2])
        risk_model = RandomForestRegressor(n_estimators=10)
        risk_model.fit(X_risk, y_premium)
        joblib.dump(risk_model, self.risk_model_path)

        # 2. Fraud Detection (IsolationForest)
        # Features: [lost_hours, compensation, distance_km, active_days, nearby_workers_count, neighborhood_score, loc_dup_count]
        X_fraud = np.random.rand(200, 7) * [8, 1000, 20, 30, 5, 0.3, 0]
        
        # Inject "curfew fraud" anomalies: High compensation + many nearby workers
        # Let's say indices 180-200 are outliers
        X_fraud[180:, 4] = np.random.randint(10, 50, 20) # 10-50 workers nearby is an anomaly for a "curfew"
        X_fraud[180:, 1] = 500 # High compensation claim
        X_fraud[180:, 5] = 0.9 # Neighborhood consensus shows others are working fine
        X_fraud[190:, 6] = 5   # GPS duplication (5 agents at exactly same coord) - Bot farm!

        fraud_model = IsolationForest(contamination=0.1, random_state=42)
        fraud_model.fit(X_fraud)
        joblib.dump(fraud_model, self.fraud_model_path)

        # 3. Disruption Predictor (RandomForestClassifier)
        X_disrupt = np.random.rand(100, 3) * [150, 40, 500]
        y_disrupt = (X_disrupt[:, 0] > 100) | (X_disrupt[:, 2] > 400)
        disrupt_model = RandomForestClassifier(n_estimators=10)
        disrupt_model.fit(X_disrupt, y_disrupt)
        joblib.dump(disrupt_model, self.disruption_model_path)
        
        # Reset cache after training
        self._risk_model = None
        self._fraud_model = None
        self._disruption_model = None
        
        return "Models trained and saved successfully."

    def predict_premium(self, avg_income, weather_risk, pollution_risk, platform='Zomato'):
        platform_map = {'Zomato': 0, 'Swiggy': 1, 'Blinkit': 2, 'Amazon': 3}
        model = self._get_model('_risk_model', self.risk_model_path)
        
        if model is None:
            # Fallback logic if model fails
            base = (avg_income * 0.03) * (1 + weather_risk + pollution_risk)
            return round(float(base), 2)

        input_data = np.array([[avg_income, weather_risk, pollution_risk, platform_map.get(platform, 0)]])
        premium = model.predict(input_data)[0]
        return round(float(premium), 2)

    def is_claim_fraudulent(self, lost_hours, compensation, distance_km, active_days=15, nearby_workers_count=0, neighborhood_score=0.0, loc_dup_count=0):
        model = self._get_model('_fraud_model', self.fraud_model_path)
        
        if model is None:
            # Default fallback: flag if distance is extreme OR if too many workers nearby during curfew
            if distance_km > 25.0: return True
            if nearby_workers_count > 2: return True # Rule of thumb: if > 2 workers nearby, curfew is suspicious
            if neighborhood_score > 0.7: return True # Others are working fine
            if loc_dup_count > 1: return True # Multiple agents at same coord
            return False

        input_data = np.array([[lost_hours, compensation, distance_km, active_days, nearby_workers_count, neighborhood_score, loc_dup_count]])
        prediction = model.predict(input_data)[0]
        return prediction == -1

    def predict_disruption(self, forecast_rain, forecast_wind, aqi):
        model = self._get_model('_disruption_model', self.disruption_model_path)
        
        if model is None:
            # Fallback rule-based
            if forecast_rain > 100 or aqi > 400:
                return 0.85
            return 0.1

        input_data = np.array([[forecast_rain, forecast_wind, aqi]])
        prob = model.predict_proba(input_data)[0][1]
        return round(float(prob), 2)

# Global Instance
ai_service = InsuranceAI()
