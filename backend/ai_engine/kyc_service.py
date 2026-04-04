import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader, Dataset
import cv2
import numpy as np
from PIL import Image
import shutil

class KYCVerification:
    def __init__(self, model_path='kyc_model.pth'):
        self.model_path = os.path.join(os.path.dirname(__file__), '..', 'models', model_path)
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        self.classes = ['Aadhar', 'PAN'] # Primary classes
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._load_model()

    def _load_model(self):
        # Use a lightweight ResNet18
        model = models.resnet18(weights='DEFAULT' if not os.path.exists(self.model_path) else None)
        num_ftrs = model.fc.in_features
        model.fc = nn.Linear(num_ftrs, len(self.classes))
        model = model.to(self.device)
        
        if os.path.exists(self.model_path):
            try:
                # Load with weights_only=True for security
                checkpoint = torch.load(self.model_path, map_location=self.device, weights_only=True)
                model.load_state_dict(checkpoint)
                model.eval()
                print(f"Loaded KYC model from {self.model_path}")
            except Exception as e:
                print(f"Error loading KYC model weights: {e}")
        else:
            print("KYC Model weights not found. Using pretrained ResNet weights as fallback.")
            model.eval()
        return model

    def verify_document(self, image_path, expected_type='Aadhar'):
        """
        Verify if the given image matches the expected KYC document type.
        Returns: (is_verified, confidence, predicted_type)
        """
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        try:
            image = Image.open(image_path).convert('RGB')
            input_tensor = transform(image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
                confidence, predicted_idx = torch.max(probabilities, 0)
                predicted_type = self.classes[predicted_idx]

                is_verified = (predicted_type == expected_type) and (confidence.item() > 0.7)
                return is_verified, round(confidence.item() * 100, 2), predicted_type
        except Exception as e:
            print(f"Error in KYC verification: {e}")
            return False, 0.0, "Error"

def train_kyc_model(dataset_root):
    """
    Train the ResNet model using the provided Aadhar/PAN datasets.
    """
    print("Starting KYC Model Training...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    # Define transforms
    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Simple directory structure for training
    tmp_train_dir = 'tmp_kyc_train'
    if os.path.exists(tmp_train_dir): shutil.rmtree(tmp_train_dir)
    os.makedirs(os.path.join(tmp_train_dir, 'Aadhar'), exist_ok=True)
    os.makedirs(os.path.join(tmp_train_dir, 'PAN'), exist_ok=True)

    def copy_limited(src, dst, limit=200):
        if not os.path.exists(src): 
            print(f"Warning: Source {src} not found")
            return
        files = [f for f in os.listdir(src) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        for f in files[:limit]:
            shutil.copy(os.path.join(src, f), os.path.join(dst, f))

    print("Pre-processing datasets...")
    copy_limited(os.path.join(dataset_root, 'Aadhar-card', 'train', 'images'), os.path.join(tmp_train_dir, 'Aadhar'))
    copy_limited(os.path.join(dataset_root, 'Pancard', 'train', 'images'), os.path.join(tmp_train_dir, 'PAN'))
    
    train_data = datasets.ImageFolder(tmp_train_dir, transform=train_transforms)
    train_loader = DataLoader(train_data, batch_size=32, shuffle=True)

    # Initialize Model
    model = models.resnet18(weights='DEFAULT')
    num_ftrs = model.fc.in_features
    # Determine number of classes from ImageFolder
    class_names = train_data.classes
    model.fc = nn.Linear(num_ftrs, len(class_names))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # Training loop
    model.train()
    for epoch in range(3): # Short training for demo
        running_loss = 0.0
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        print(f"Epoch {epoch+1}, Loss: {running_loss/len(train_loader)}")

    # Save model
    model_save_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'kyc_model.pth')
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    torch.save(model.state_dict(), model_save_path)
    print(f"Model saved to {model_save_path}")
    
    # Cleanup
    shutil.rmtree(tmp_train_dir)
