import pickle
import re
from pathlib import Path

try:
    from .ocr import extract_text
except ImportError:
    from ocr import extract_text


# ==========================================
# LOAD TRAINED MODEL + VECTORIZER
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

with open(BASE_DIR / "phishing_model.pkl", "rb") as model_file:
    model = pickle.load(model_file)

with open(BASE_DIR / "vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)


# ==========================================
# TEXT PREPROCESSING
# ==========================================

def clean_text(text):
    text = str(text)
    text = text.lower()
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ==========================================
# PREDICT EMAIL
# ==========================================

def predict_email(email_text):

    # Same preprocessing used during training
    email_text = clean_text(email_text)

    # Convert text to TF-IDF features
    vector = vectorizer.transform([email_text])

    # Logistic Regression prediction
    prediction = model.predict(vector)[0]

    # Prediction probabilities
    probabilities = model.predict_proba(vector)[0]

    legitimate_probability = float(probabilities[0] * 100)
    phishing_probability = float(probabilities[1] * 100)

    # Convert prediction to readable label
    if prediction == 1:
        result = "Phishing"
        confidence = phishing_probability
    else:
        result = "Legitimate"
        confidence = legitimate_probability

    return (
        result,
        float(confidence),
        legitimate_probability,
        phishing_probability
    )


# ==========================================
# BACKEND INTERFACE
# ==========================================

def predict_text(text):

    result, confidence, legitimate_probability, phishing_probability = (
        predict_email(text)
    )

    return {
        "label": result,
        "confidence": float(confidence),
        "phishing_probability": float(phishing_probability),
        "legitimate_probability": float(legitimate_probability)
    }


# ==========================================
# TEST OCR → ML PIPELINE
# ==========================================

if __name__ == "__main__":

    image_path = (
        r"C:\Users\Aryan\Desktop"
        r"\WhatsApp Image 2026-08-06 at 10.23.06 PM.jpeg"
    )

    print("Extracting text from image...")

    email_text = extract_text(image_path)

    print("\n--- EXTRACTED TEXT ---")
    print(email_text)

    # Test normal prediction
    result, confidence, legitimate_probability, phishing_probability = (
        predict_email(email_text)
    )

    print("\n--- PREDICTION ---")
    print(f"Prediction: {result}")
    print(f"Confidence: {confidence:.2f}%")

    print("\n--- PROBABILITIES ---")
    print(
        f"Legitimate probability: "
        f"{legitimate_probability:.2f}%"
    )

    print(
        f"Phishing probability: "
        f"{phishing_probability:.2f}%"
    )

    # Test backend format
    print("\n--- BACKEND FORMAT ---")
    print(predict_text(email_text))