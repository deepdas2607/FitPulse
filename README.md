# FitPulse.AI TeamJugaadu-AWS/OpenInnovationTrack

### *One App. Total Fitness + Healthcare*

![Open Innovation](https://img.shields.io/badge/Track-Open%20Innovation-blueviolet)
![Built with Kiro IDE](https://img.shields.io/badge/Built%20With-Kiro%20IDE-orange)
![AI Powered](https://img.shields.io/badge/AI-Computer%20Vision%20%7C%20ML-success)
![Status](https://img.shields.io/badge/Status-Prototype%20in%20Progress-yellow)

---

## 🚀 Project Overview

**FitPulse.AI** is an **AI-powered fitness and wellness platform** that unifies **workout safety, posture correction, nutrition awareness, stress-based adaptation, and early health-risk alerts** into a single application.

Built following **Open Innovation principles**, FitPulse addresses a real-world gap where fitness, healthcare, and safety exist in silos, leading to unsafe workouts and poor wellness decisions.

This project is being actively developed using **Kiro IDE** for rapid prototyping and clean architecture.

---

## 🎯 Problem We Address

* No real-time posture correction in most fitness apps
* Lack of safety during solo home workouts
* Confusing nutrition labels and diet choices
* No connection between fitness, stress, and health
* Users forced to use multiple disconnected apps

---

## 💡 Our Solution

**FitPulse.AI provides a unified, intelligent, and safety-first wellness system** that:

* Detects incorrect posture and prevents injuries
* Adapts workouts based on stress or fatigue
* Explains food labels instantly
* Provides emergency safety support
* Offers early health-risk awareness

---

## ⭐ Core Features (MVP Focus)

### 🏋️ AI Fitness & Safety

* **AI Posture Detection & Form Correction**
* **Rep Counting**
* **Post-Workout Visual Summary**
* **Virtual Spotter (HELP keyword detection)**
* **Emergency Assistance Automation**

### 🍎 Nutrition & Health

* **Food Lens with OCR**
* **Diet & Drug–Food Interaction Checker**

### 🧠 Wellness Intelligence

* **Stress-Adaptive Workouts**
* **Symptom-to-Risk Analyzer**

---

## 🛠️ Tech Stack (Developed using Kiro IDE)

### **Frontend**

* React
* Tailwind CSS
* HTML Canvas API

### **AI / ML**

| Feature          | Model / Tool                        |
| ---------------- | ----------------------------------- |
| Pose & Reps      | MediaPipe Pose / MoveNet            |
| OCR              | Tesseract.js / EasyOCR              |
| Food Recognition | Food-101 (EfficientNet / MobileNet) |
| Wake-word Safety | Vosk / Picovoice                    |
| Symptom Risk     | XGBoost / LightGBM                  |

### **Backend**

* Flask / FastAPI
* Node.js (optional services)

### **Database**

* Firebase / SQLite
* JSON-based rule engines

🔹 Client-side AI for **privacy & low latency**
🔹 Modular, scalable architecture

---

## ⚙️ Installation & Run Instructions

### **Prerequisites**

* Node.js (v18 or above)
* Python (v3.9 or above)
* Git
* Webcam (for posture detection)

---

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/your-username/FitPulse.AI.git
cd FitPulse.AI
```

---

### **2️⃣ Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

The app will run at:
👉 `http://localhost:5173` (or similar Vite port)

---

### **3️⃣ Backend Setup**

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend runs at:
👉 `http://localhost:5000`

---

### **4️⃣ AI Features Usage**

* Allow **camera access** for posture detection
* Allow **microphone access** for Virtual Spotter
* Upload food images for OCR analysis
* Submit stress or symptom feedback to see adaptive logic

---

## 🌍 Why Open Innovation Track?

FitPulse.AI fits the **Open Innovation Track** because it:

* Solves a **real-world fitness + healthcare problem**
* Combines multiple domains using AI
* Is platform-agnostic and scalable
* Focuses on **safety, inclusivity, and preventive care**

---

## 🏆 Innovation & USP

* Fitness + healthcare + safety in one platform
* Visual proof of posture mistakes
* Emergency safety during workouts
* Beginner and elderly-friendly design
* Privacy-first AI execution

---

## 📊 Impact & Outcomes

**Impact**

* Safer workouts
* Inclusive fitness
* Better nutrition awareness

**Outcomes**

* Stress-adjusted workouts
* Early health-risk alerts
* Emergency safety support

**Real-Life Value**

* Prevents injuries and burnout
* Encourages healthier daily habits
* Replaces multiple apps with one

---

## 🛣️ Future Scope

* Wearable integrations
* Advanced posture ML models
* Telemedicine support
* Corporate wellness dashboards

---

## 👥 Team – Team Jugaadu

* Deepkumar Das
* Pranav Shirke
* Gideon Mire
* Vishal Gowda
* Yash Naik

---

## 📌 Final Note

FitPulse.AI is built as an **intelligent, safety-first wellness companion** using AI and Open Innovation principles.

> **That’s how we’re shaping FitPulse to be intelligent and safe.**

