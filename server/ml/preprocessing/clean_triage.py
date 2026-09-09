import pandas as pd
from pathlib import Path


# Paths
BASE_DIR = Path(__file__).resolve().parents[1]
INPUT_FILE = BASE_DIR / "data" / "mimic-iv-ed-demo-2.2" / "ed" / "triage.csv.gz"
OUTPUT_FILE = BASE_DIR / "data" / "clean_triage.csv"


# Load dataset
df = pd.read_csv(INPUT_FILE)

print(f"Original rows: {len(df)}")


# Remove records without acuity
df = df.dropna(subset=["acuity"]).copy()


# Convert acuity to integer
df["acuity"] = df["acuity"].astype(int)


# Convert acuity into project triage classes
def map_priority(acuity):
    if acuity in [1, 2]:
        return "RED"
    elif acuity == 3:
        return "YELLOW"
    elif acuity in [4, 5]:
        return "GREEN"
    return None


df["priority"] = df["acuity"].apply(map_priority)


# Remove invalid labels
df = df.dropna(subset=["priority"])


# Clean chief complaint text
df["chiefcomplaint"] = (
    df["chiefcomplaint"]
    .fillna("UNKNOWN")
    .astype(str)
    .str.strip()
    .str.lower()
)


# Select useful columns
columns = [
    "subject_id",
    "stay_id",
    "temperature",
    "heartrate",
    "resprate",
    "o2sat",
    "sbp",
    "dbp",
    "pain",
    "chiefcomplaint",
    "acuity",
    "priority",
]

df = df[columns]


# Save cleaned dataset
df.to_csv(OUTPUT_FILE, index=False)


print(f"Cleaned rows: {len(df)}")
print("\nPriority distribution:")
print(df["priority"].value_counts())

print(f"\nSaved to: {OUTPUT_FILE}")