import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

np.random.seed(42)

data_size = 1000

hours_worked = np.random.randint(4, 16, data_size)
rating = np.random.uniform(2.5, 5, data_size)
jobs_completed = np.random.randint(5, 40, data_size)
days_without_break = np.random.randint(0, 7, data_size)
stress_level = np.random.randint(1, 10, data_size)


burnout_score = (
    (hours_worked / 16) +
    (stress_level / 10) +
    (days_without_break / 7) +
    ((5 - rating) / 5)
)


burnout = np.where(burnout_score < 1.5, 0,
           np.where(burnout_score < 2.5, 1, 2))

df = pd.DataFrame({
    "hours_worked": hours_worked,
    "rating": rating,
    "jobs_completed": jobs_completed,
    "days_without_break": days_without_break,
    "stress_level": stress_level,
    "burnout": burnout
})

X = df.drop("burnout", axis=1)
y = df["burnout"]

model = RandomForestClassifier(n_estimators=100)

model.fit(X, y)

joblib.dump(model, "burnout_model.pkl")

print("Model trained and saved as burnout_model.pkl")