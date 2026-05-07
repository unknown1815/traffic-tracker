# 🚦 Traffic Predictor

An intelligent real-time traffic prediction system that combines:

* 🌦 Weather conditions
* 🕒 Time & day analysis
* 🚗 Live traffic flow data
* 📍 Route visualization
* 📊 Historical traffic records
* 🤖 ML-based traffic scoring

The project predicts traffic congestion levels and visualizes routes on an interactive map using the TomTom Maps API.

---

# 📌 Features

## ✅ Real-Time Traffic Prediction

Uses live traffic data from TomTom APIs.

## ✅ Weather-Based Prediction

Traffic severity changes based on:

* Rain
* Fog
* Clear weather

## ✅ Smart Traffic Index

Advanced traffic index based on:

* Live speed vs free-flow speed
* Peak hour boost
* Distance normalization
* Historical traffic data

## ✅ Route Visualization

Displays:

* Start & destination markers
* Traffic-colored route
* Auto zoomed map

## ✅ Authentication UI

Simple Login / Signup interface using Local Storage.

## ✅ Manage Records

* View previous traffic predictions
* Delete records
* Stored using MongoDB

---

# 🛠️ Tech Stack

## Frontend

* HTML
* CSS
* JavaScript
* TomTom Maps SDK

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

## APIs Used

* TomTom Traffic API
* TomTom Geocoding API
* OpenWeatherMap API

## ML

* Custom ML prediction model

---

# 📂 Project Structure

```text id="rzb4yv"
traffic_tracker/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── mlModel.js
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── README.md
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash id="ynqk9j"
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

---

## 2️⃣ Install Backend Dependencies

```bash id="n2o7ch"
cd backend
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside backend folder.

```env id="l2lyct"
PORT=5000

MONGO_URI=your_mongodb_connection_string

TOMTOM_API_KEY=your_tomtom_api_key

WEATHER_API_KEY=your_openweathermap_api_key
```

---

# ▶️ Run Backend

```bash id="iw2wuj"
node server.js
```

Server runs on:

```text id="h41af3"
http://127.0.0.1:5000
```

---

# ▶️ Run Frontend

Open:

```text id="r9kl0m"
frontend/index.html
```

using Live Server or browser.

---

# 📊 Traffic Prediction Logic

The final traffic score is calculated using:

```text id="c3r7b3"
Traffic Score =
Time Factor +
Day Factor +
Weather Factor +
Traffic Index
```

Advanced traffic index includes:

* Distance normalization
* Peak hour boost
* Weather multiplier
* Historical learning

---

# 🧠 Traffic Levels

| Score Range | Traffic Level |
| ----------- | ------------- |
| 0 – 0.4     | Low           |
| 0.4 – 0.7   | Medium        |
| > 0.7       | High          |

---

# 🗺️ Route Visualization

Traffic route colors:

* 🟢 Green → Low
* 🟡 Yellow → Medium
* 🔴 Red → High

---

# 📸 Screenshots

 ![App Screenshot](images/image.png)





---

# 🔒 Security

`.env` file is ignored using `.gitignore` to protect API keys.

---

# 🚀 Future Improvements

* 📈 Traffic analytics dashboard
* 🤖 Real ML model training
* 📍 Route comparison
* 🔥 Heatmap visualization
* 📱 Mobile responsive UI
* ☁️ Deployment on cloud

---

# 👨‍💻 Author

Developed by Achal Upadhyay

---

# 📄 License

This project is for educational and learning purposes.
