# ML Model Results

## Baseline Model

Model: TF-IDF + Logistic Regression

Dataset: MIMIC-IV-ED Demo

Test Accuracy: 50%

### Classification Report

| Class | Precision | Recall | F1-Score |
|-------|-----------|--------|----------|
| GREEN | 0.00 | 0.00 | 0.00 |
| RED | 0.60 | 0.39 | 0.47 |
| YELLOW | 0.46 | 0.67 | 0.55 |

Macro F1-Score: 0.34
Weighted F1-Score: 0.49

## Observation

The baseline model achieved 50% accuracy.
GREEN performance was poor because the dataset contains very few GREEN samples.
The baseline currently uses only the chief complaint text.
The next version will include patient vital signs along with text features.
## Version 2 - Text + Vitals

Model: TF-IDF + Logistic Regression

Features:
- Chief complaint
- Temperature
- Heart rate
- Respiratory rate
- Oxygen saturation
- Systolic BP
- Diastolic BP
- Pain score

Test Accuracy: 59.52%

### Classification Report

| Class | Precision | Recall | F1-Score |
|-------|-----------|--------|----------|
| GREEN | 0.00 | 0.00 | 0.00 |
| RED | 0.67 | 0.61 | 0.64 |
| YELLOW | 0.52 | 0.61 | 0.56 |

Macro F1-Score: 0.40
Weighted F1-Score: 0.59

## Comparison

Version 1 (Text only): 50.00%
Version 2 (Text + Vitals): 59.52%

The addition of vital signs improved the baseline model performance.
However, GREEN classification remains unreliable because the demo dataset contains very few GREEN samples.