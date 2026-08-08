import pandas as pd
import re

# Step 1: Load the dataset
data = pd.read_csv("../datasets/phishing_email.csv")

print("Dataset loaded successfully!")
print("Original dataset shape:", data.shape)
print()

# Step 2: Remove duplicate rows
duplicate_count = data.duplicated().sum()

print("Duplicate rows found:", duplicate_count)

data.drop_duplicates(inplace=True)

print("Duplicates removed successfully!")
print("New dataset shape:", data.shape)
print()

# Step 3: Text preprocessing
def clean_text(text):
    text = str(text)
    
    # Convert text to lowercase
    text = text.lower()
    
    # Remove extra whitespace
    text = re.sub(r"\s+", " ", text).strip()
    
    return text


data["text_combined"] = data["text_combined"].apply(clean_text)

print("Text preprocessing completed!")
print()
print("Sample cleaned email:")
print(data["text_combined"].iloc[0])

# Step 3B: Separate features and labels

X = data["text_combined"]
y = data["label"]

print()
print("Features and labels separated successfully!")
print("Number of emails:", len(X))
print("Number of labels:", len(y))

print()
print("Label distribution:")
print(y.value_counts())

# Step 4: Split dataset into training and testing sets

from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print()
print("Train/test split completed!")

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))

print()
print("Training label distribution:")
print(y_train.value_counts())

print()
print("Testing label distribution:")
print(y_test.value_counts())

# Step 5: TF-IDF Vectorization

from sklearn.feature_extraction.text import TfidfVectorizer

vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    sublinear_tf=True,
    min_df=2
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

print()
print("TF-IDF vectorization completed!")

print("Training TF-IDF shape:", X_train_tfidf.shape)
print("Testing TF-IDF shape:", X_test_tfidf.shape)

# Step 6: Train Logistic Regression

from sklearn.linear_model import LogisticRegression

model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

print()
print("Training Logistic Regression model...")

model.fit(X_train_tfidf, y_train)

print("Model training completed!")

# Step 7: Evaluate the model

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix
)

# Generate predictions on test data
predictions = model.predict(X_test_tfidf)

# Calculate evaluation metrics
accuracy = accuracy_score(y_test, predictions)
precision = precision_score(y_test, predictions)
recall = recall_score(y_test, predictions)
f1 = f1_score(y_test, predictions)
cm = confusion_matrix(y_test, predictions)

print()
print("Model Evaluation Results")
print("------------------------")

print("Accuracy :", accuracy)
print("Precision:", precision)
print("Recall   :", recall)
print("F1-score :", f1)

print()
print("Confusion Matrix:")
print(cm)

# Step 8: ROC-AUC and prediction confidence

from sklearn.metrics import roc_auc_score

# Get probability of phishing (class 1)
probabilities = model.predict_proba(X_test_tfidf)[:, 1]

# Calculate ROC-AUC
roc_auc = roc_auc_score(y_test, probabilities)

print()
print("ROC-AUC:", roc_auc)

# Show sample predictions with confidence
print()
print("Sample prediction probabilities:")

for i in range(5):
    prediction = model.predict(X_test_tfidf[i])[0]
    confidence = model.predict_proba(X_test_tfidf[i]).max()

    label = "Phishing" if prediction == 1 else "Legitimate"

    print(
        f"Email {i + 1}: {label} | "
        f"Confidence: {confidence * 100:.2f}%"
    )

    # Step 9: Save the trained model and TF-IDF vectorizer

import pickle

with open("phishing_model.pkl", "wb") as model_file:
    pickle.dump(model, model_file)

with open("vectorizer.pkl", "wb") as vectorizer_file:
    pickle.dump(vectorizer, vectorizer_file)

print()
print("Model saved successfully!")
print("Vectorizer saved successfully!")
