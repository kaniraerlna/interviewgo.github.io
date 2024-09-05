import os
from keras.models import load_model

# Get the directory where this script is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the model
model_path = os.path.join(current_dir, "..", "machine-learning", "assets", "model_chatbot.h5")

# Convert to an absolute path
model_path = os.path.abspath(model_path)

# Print the model path to verify
print("Model path:", model_path)

# Test importing/loading the model
try:
    model = load_model(model_path)
    print("Model loaded successfully.")
except Exception as e:
    print("Error loading model:", e)
