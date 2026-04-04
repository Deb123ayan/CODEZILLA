#!/usr/bin/env python
"""
Train ML Models Script
Trains all ML models for the insurance system
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from ai_engine.ml_service import InsuranceAI

print("=" * 50)
print("Training ML Models")
print("=" * 50)
print()

try:
    ai = InsuranceAI()
    print("Training models...")
    ai.train_initial_models()
    print()
    print("✓ ML models trained successfully!")
    print()
    
    # Verify models exist
    import os
    model_dir = os.path.join(os.path.dirname(__file__), 'ai_engine', 'models')
    models = ['premium_model.joblib', 'fraud_model.joblib', 'disruption_model.joblib']
    
    print("Verifying models:")
    for model in models:
        path = os.path.join(model_dir, model)
        if os.path.exists(path):
            size = os.path.getsize(path) / 1024  # KB
            print(f"  ✓ {model}: {size:.2f} KB")
        else:
            print(f"  ✗ {model}: NOT FOUND")
    
except Exception as e:
    print(f"✗ Error training models: {str(e)}")
    import traceback
    traceback.print_exc()

print()
print("=" * 50)
