import torch

# Load the processed training dataset
train = torch.load("datasets/processed/train.pt")

# Show what is stored inside
print("Keys:", train.keys())

# Show tensor shapes
print("\nFeatures Shape:", train["features"].shape)
print("Labels Shape:", train["labels"].shape)
print("Patient IDs Shape:", train["patient_ids"].shape)
print("Hospital IDs Shape:", train["hospital_ids"].shape)

# Display the first sample
print("\nFirst Feature Tensor:")
print(train["features"][0])

print("\nFirst Label:")
print(train["labels"][0])

print("\nFirst Patient ID:")
print(train["patient_ids"][0])

print("\nFirst Hospital ID:")
print(train["hospital_ids"][0])