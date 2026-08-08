import pandas as pd
import re
import pickle

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score
)


# =========================================================
# STEP 1: LOAD ORIGINAL DATASET
# =========================================================

data = pd.read_csv("../datasets/phishing_email.csv")

print("Original dataset loaded!")
print("Original dataset shape:", data.shape)
print()


# =========================================================
# STEP 2: REMOVE DUPLICATES
# =========================================================

duplicate_count = data.duplicated().sum()

print("Duplicate rows found:", duplicate_count)

data.drop_duplicates(inplace=True)

print("Duplicates removed.")
print("Dataset shape:", data.shape)
print()


# =========================================================
# STEP 3: LOAD SUPPLEMENTAL TRAINING DATA
# =========================================================

supplemental_path = "ai_ml/supplemental_training.csv"

supplemental = pd.read_csv(supplemental_path)

print("Supplemental training dataset loaded!")
print("Supplemental samples:", len(supplemental))
print()

print("Supplemental label distribution:")
print(supplemental["label"].value_counts())
print()


# =========================================================
# STEP 4: COMBINE DATASETS
# =========================================================

data = pd.concat(
    [
        data[["text_combined", "label"]].rename(
            columns={"text_combined": "text"}
        ),
        supplemental[["text", "label"]]
    ],
    ignore_index=True
)

print("Datasets combined successfully!")
print("Combined dataset shape:", data.shape)
print()


# =========================================================
# STEP 5: TEXT PREPROCESSING
# =========================================================

def clean_text(text):

    text = str(text)

    text = text.lower()

    text = re.sub(
        r"\s+",
        " ",
        text
    ).strip()

    return text


data["text"] = data["text"].apply(clean_text)

print("Text preprocessing completed!")
print()


# =========================================================
# STEP 6: FEATURES + LABELS
# =========================================================

X = data["text"]
y = data["label"]

print("Features and labels separated.")
print("Total emails:", len(X))

print()
print("Label distribution:")
print(y.value_counts())
print()


# =========================================================
# STEP 7: TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("Train/test split completed!")

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))
print()


# =========================================================
# STEP 8: TF-IDF
# =========================================================

vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    sublinear_tf=True,
    min_df=2
)

X_train_tfidf = vectorizer.fit_transform(X_train)

X_test_tfidf = vectorizer.transform(X_test)

print("TF-IDF vectorization completed!")

print(
    "Training TF-IDF shape:",
    X_train_tfidf.shape
)

print(
    "Testing TF-IDF shape:",
    X_test_tfidf.shape
)

print()


# =========================================================
# STEP 9: TRAIN LOGISTIC REGRESSION
# =========================================================

model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"
)

print("Training Logistic Regression model...")

model.fit(
    X_train_tfidf,
    y_train
)

print("Model training completed!")
print()


# =========================================================
# STEP 10: EVALUATE MODEL
# =========================================================

predictions = model.predict(
    X_test_tfidf
)

accuracy = accuracy_score(
    y_test,
    predictions
)

precision = precision_score(
    y_test,
    predictions
)

recall = recall_score(
    y_test,
    predictions
)

f1 = f1_score(
    y_test,
    predictions
)

cm = confusion_matrix(
    y_test,
    predictions
)


print("Model Evaluation Results")
print("------------------------")

print("Accuracy :", accuracy)
print("Precision:", precision)
print("Recall   :", recall)
print("F1-score :", f1)

print()
print("Confusion Matrix:")
print(cm)


# =========================================================
# STEP 11: ROC-AUC
# =========================================================

probabilities = model.predict_proba(
    X_test_tfidf
)[:, 1]

roc_auc = roc_auc_score(
    y_test,
    probabilities
)

print()
print("ROC-AUC:", roc_auc)


# =========================================================
# STEP 12: SAMPLE PREDICTIONS
# =========================================================

print()
print("Sample prediction probabilities:")

for i in range(5):

    prediction = model.predict(
        X_test_tfidf[i]
    )[0]

    confidence = model.predict_proba(
        X_test_tfidf[i]
    ).max()

    label = (
        "Phishing"
        if prediction == 1
        else "Legitimate"
    )

    print(
        f"Email {i + 1}: {label} | "
        f"Confidence: {confidence * 100:.2f}%"
    )


# =========================================================
# STEP 13: SAVE MODEL
# =========================================================

with open(
    "ai_ml/phishing_model.pkl",
    "wb"
) as model_file:

    pickle.dump(
        model,
        model_file
    )


with open(
    "ai_ml/vectorizer.pkl",
    "wb"
) as vectorizer_file:

    pickle.dump(
        vectorizer,
        vectorizer_file
    )


print()
print("Model saved successfully!")
print("Vectorizer saved successfully!")
print()
print("Training complete.")