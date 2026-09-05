import joblib
import pandas as pd
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_FILE = BASE_DIR / "data" / "clean_triage.csv"

df = pd.read_csv(DATA_FILE)

text_col = "chiefcomplaint"

vital_cols = [
    "temperature",
    "heartrate",
    "resprate",
    "o2sat",
    "sbp",
    "dbp",
    "pain",
]

# Convert vital columns to numeric.
# Invalid text values such as "UA" become missing values.
for col in vital_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

vital_cols = [
    "temperature",
    "heartrate",
    "resprate",
    "o2sat",
    "sbp",
    "dbp",
    "pain",
]

X = df[[text_col] + vital_cols]
y = df["priority"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

preprocessor = ColumnTransformer([
    (
        "text",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2)
        ),
        text_col
    ),
    (
        "vitals",
        Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ]),
        vital_cols
    )
])

model = Pipeline([
    ("preprocessor", preprocessor),
    (
        "classifier",
        LogisticRegression(
            max_iter=1000,
            class_weight="balanced"
        )
    )
])

model.fit(X_train, y_train)

y_pred = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, y_pred))

print("\nClassification Report:")
print(classification_report(y_test, y_pred, zero_division=0))
cm = confusion_matrix(
    y_test,
    y_pred,
    labels=["RED", "YELLOW", "GREEN"]
)

print("\nConfusion Matrix:")
print(cm)

print("\nClass order: RED, YELLOW, GREEN")
MODEL_FILE = BASE_DIR / "models" / "triage_vitals_model.joblib"

joblib.dump(model, MODEL_FILE)

print(f"\nModel saved to: {MODEL_FILE}")