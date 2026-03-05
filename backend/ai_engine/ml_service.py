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

    def train_initial_models(self):
        """
        Trains baseline models for the hackathon demo using synthetic data.
        In production, this would use historical claim/weather data.
        """
        # 1. Premium Risk Model (RandomForestRegressor)
        # Inputs: [avg_income, weather_risk, pollution_risk, delivery_platform_index]
        # Output: premium_amount
        X_risk = np.random.rand(100, 4) * [1000, 1, 1, 4]
        y_premium = (X_risk[:, 0] * 0.03) * (1 + X_risk[:, 1] + X_risk[:, 2]) # Simple base formula
        risk_model = RandomForestRegressor(n_estimators=10)
        risk_model.fit(X_risk, y_premium)
        joblib.dump(risk_model, self.risk_model_path)

        # 2. Fraud Detection (IsolationForest)
        # Inputs: [lost_hours, compensation, distance_from_event_zone, worker_active_days]
        X_fraud = np.random.rand(100, 4) * [8, 1000, 20, 30]
        fraud_model = IsolationForest(contamination=0.1, random_state=42)
        fraud_model.fit(X_fraud)
        joblib.dump(fraud_model, self.fraud_model_path)

        # 3. Disruption Predictor (RandomForestClassifier)
        # Inputs: [predicted_rain, predicted_wind, aqi]
        # Output: 1 (Disruption expected), 0 (No disruption)
        X_disrupt = np.random.rand(100, 3) * [150, 40, 500]
        y_disrupt = (X_disrupt[:, 0] > 100) | (X_disrupt[:, 2] > 400)
        disrupt_model = RandomForestClassifier(n_estimators=10)
        disrupt_model.fit(X_disrupt, y_disrupt)
        joblib.dump(disrupt_model, self.disruption_model_path)
        
        return "Models trained and saved successfully."

    def predict_premium(self, avg_income, weather_risk, pollution_risk, platform='Zomato'):
        platform_map = {'Zomato': 0, 'Swiggy': 1, 'Blinkit': 2, 'Amazon': 3}
        model = joblib.load(self.risk_model_path)
        input_data = np.array([[avg_income, weather_risk, pollution_risk, platform_map.get(platform, 0)]])
        premium = model.predict(input_data)[0]
        return round(float(premium), 2)

    def is_claim_fraudulent(self, lost_hours, compensation, distance_km, active_days=15):
        model = joblib.load(self.fraud_model_path)
        input_data = np.array([[lost_hours, compensation, distance_km, active_days]])
        # IsolationForest returns -1 for anomalies (fraud) and 1 for normal
        prediction = model.predict(input_data)[0]
        return prediction == -1

    def predict_disruption(self, forecast_rain, forecast_wind, aqi):
        model = joblib.load(self.disruption_model_path)
        input_data = np.array([[forecast_rain, forecast_wind, aqi]])
        prob = model.predict_proba(input_data)[0][1] # Probability of index 1 (Disruption)
        return round(float(prob), 2)

# Global Instance
ai_service = InsuranceAI()
