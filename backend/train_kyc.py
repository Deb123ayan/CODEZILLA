import os
import sys

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_engine.kyc_service import train_kyc_model

dataset_root = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')

if __name__ == '__main__':
    print(f"Opening dataset from: {dataset_root}")
    if not os.path.exists(dataset_root):
        print("Error: Dataset root not found!")
        sys.exit(1)
    
    train_kyc_model(dataset_root)
    print("KYC Model Training Complete!")
