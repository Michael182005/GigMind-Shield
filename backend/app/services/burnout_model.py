import joblib
import numpy as np

model = joblib.load("ml/burnout_model.pkl")

def predict_burnout(hours_worked, rating, jobs_completed, days_without_break, stress_level):

    features = np.array([[hours_worked, rating, jobs_completed, days_without_break, stress_level]])

    probabilities = model.predict_proba(features)[0]

    low, medium, high = probabilities

    burnout_score = (medium * 0.5) + (high * 1.0)

    return round(float(burnout_score), 2)