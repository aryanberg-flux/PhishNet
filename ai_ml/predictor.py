import pickle
from ocr import extract_text


# ==============================
# LOAD TRAINED MODEL
# ==============================

with open("phishing_model.pkl", "rb") as model_file:
    model = pickle.load(model_file)

with open("vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)


# ==============================
# PREDICTION FUNCTION
# ==============================

def predict_email(email_text):

    # Convert email text into TF-IDF features
    vector = vectorizer.transform([email_text])

    # Get prediction
    prediction = model.predict(vector)[0]

    # Get probabilities for both classes
    probabilities = model.predict_proba(vector)[0]

    legitimate_probability = probabilities[0] * 100
    phishing_probability = probabilities[1] * 100

    # Convert prediction to readable label
    if prediction == 1:
        result = "Phishing"
        confidence = phishing_probability
    else:
        result = "Legitimate"
        confidence = legitimate_probability

    return result, confidence, legitimate_probability, phishing_probability


# ==============================
# TEST OCR → ML PIPELINE
# ==============================

if __name__ == "__main__":

    image_path = r"C:\Users\Aryan\Desktop\WhatsApp Image 2026-08-06 at 10.23.06 PM.jpeg"

    print("Extracting text from image...")

    # OCR
    email_text = extract_text(image_path)

    print("\n--- EXTRACTED TEXT ---")
    print(email_text)

    # ML prediction
    result, confidence, legitimate_probability, phishing_probability = (
        predict_email(email_text)
    )

    print("\n--- PREDICTION ---")
    print(f"Prediction: {result}")
    print(f"Confidence: {confidence:.2f}%")

    print("\n--- PROBABILITIES ---")
    print(f"Legitimate probability: {legitimate_probability:.2f}%")
    print(f"Phishing probability: {phishing_probability:.2f}%")