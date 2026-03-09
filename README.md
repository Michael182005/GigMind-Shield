# 🛡️ GigMind Shield

### AI-Powered Burnout Detection for Gig Workers

GigMind Shield is an AI-powered system designed to detect and predict **burnout risk among gig workers** such as delivery partners, ride-share drivers, freelancers, and other independent workers.

The platform analyzes workload patterns using **Machine Learning** to provide early burnout detection and help gig workers maintain healthier work habits.

---

## 🚨 Problem

Gig workers often experience:

* Long and irregular working hours
* High workload pressure
* Lack of mental health monitoring
* No early warning system for burnout

These issues can lead to **stress, reduced productivity, and long-term health problems**.

---

## 💡 Solution

GigMind Shield provides an **AI-driven burnout detection platform** that:

* Collects gig worker activity and workload data
* Uses machine learning to analyze work patterns
* Predicts burnout risk levels

The system categorizes burnout into three levels:

🟢 **Low Risk** – Healthy workload
🟡 **Moderate Risk** – Early warning signs
🔴 **High Risk** – Serious burnout risk

This helps gig workers **identify burnout early and take preventive action**.

---

## 🧠 Machine Learning Model

The ML model evaluates factors such as:

* Working hours
* Task load
* Work frequency
* Work intensity patterns

Using these inputs, the system predicts burnout risk using a **supervised machine learning model**.

---

## 🏗️ System Architecture

```
User Input (Gig Worker Data)
        │
        ▼
React Frontend Dashboard
        │
        ▼
FastAPI Backend API
        │
        ▼
Burnout Prediction ML Model
        │
        ▼
Burnout Risk Result (Low / Moderate / High)
```

---

## ⚙️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* FastAPI
* Python
* REST API

### Machine Learning

* Scikit-Learn
* Pandas
* NumPy

---

## 📂 Project Structure

```
GigMind-Shield
│
├── backend
│   ├── app
│   └── ml
│
├── frontend
│   ├── src
│   └── components
│
└── README.md
```

---

## 🚀 Running the Project

### Backend

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at:

```
http://localhost:8000
```

---

### Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

## 📊 Key Features

✔ AI-powered burnout risk prediction
✔ Gig worker workload analysis
✔ FastAPI REST backend
✔ Interactive dashboard
✔ ML model integration

---

## 🎥 Demo

(Add your demo video link here)

---

## 🌟 Future Improvements

* Real-time health monitoring
* AI productivity assistant for gig workers
* Mobile application
* Integration with major gig platforms

---

## 📜 License

This project is created for educational and hackathon purposes.
