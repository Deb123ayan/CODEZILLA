import numpy as np
import io
from PIL import Image, ImageChops, ImageEnhance
import os
import joblib
from sklearn.ensemble import RandomForestClassifier

class DocumentForensicsModel:
    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), 'document_classifier.joblib')
        self.clf = self._load_or_train_model()

    def _load_or_train_model(self):
        """
        Mock training: In a real scenario, this would load from a dataset of 
        thousands of real vs fake documents. Here we generate a baseline model.
        """
        if os.path.exists(self.model_path):
            return joblib.load(self.model_path)
        
        # Simulated Feature Vectors [ELA_MAX, NOISE_VAR, METADATA_SIG, COMPRESSION_VAR]
        # Real documents: Low ELA variance, high metadata signals, natural noise
        X_real = np.array([
            [10, 50, 1, 0.1], [15, 45, 1, 0.15], [12, 55, 1, 0.08], [8, 60, 1, 0.12]
        ])
        y_real = np.zeros(len(X_real)) # 0 = Real

        # Edited/AI documents: High ELA variance, no metadata, artificial noise/smoothness
        X_fake = np.array([
            [80, 5, 0, 0.8], [95, 2, 0, 0.9], [75, 12, 0, 0.7], [110, 8, 0, 1.0]
        ])
        y_fake = np.ones(len(X_fake)) # 1 = Tampered/AI

        X = np.vstack((X_real, X_fake))
        y = np.hstack((y_real, y_fake))

        clf = RandomForestClassifier(n_estimators=100)
        clf.fit(X, y)
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(clf, self.model_path)
        return clf

    def extract_features(self, image_bytes):
        """
        Extracts forensic features from the image for the model.
        """
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            
            # 1. ELA (Error Level Analysis)
            # Resave image at a lower quality
            ela_io = io.BytesIO()
            img.save(ela_io, 'JPEG', quality=90)
            ela_img = Image.open(ela_io)
            
            # Calculate absolute difference
            diff = ImageChops.difference(img, ela_img)
            
            # Get max difference as a feature
            extrema = diff.getextrema()
            ela_max = sum([e[1] for e in extrema]) / 3
            
            # 2. Noise Variance (AI detection)
            # Real scans have sensory noise; AI/Digital edits are often suspiciously smooth or have repetitive patterns
            gray_img = img.convert('L')
            data = np.array(gray_img)
            noise_var = np.var(data - np.median(data))

            # 3. Compression Variance
            # High variance suggests multi-layered compression (editing)
            comp_var = ela_max / (noise_var + 0.01)

            return np.array([ela_max, noise_var, 0, comp_var])
        except Exception as e:
            print(f"Feature extraction failed: {e}")
            return np.array([0, 0, 0, 0])

    def predict(self, image_bytes):
        """
        Predicts if document is Real (0) or Tampered/AI (1)
        Returns: (Is_Fake, Probability)
        """
        features = self.extract_features(image_bytes)
        prediction = self.clf.predict([features])[0]
        prob = self.clf.predict_proba([features])[0][1]
        
        return bool(prediction), float(prob)
