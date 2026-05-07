const express = require("express");
const router = express.Router();
const Traffic = require("../models/Traffic");
const axios = require("axios");
const model = require("../mlModel");


// =======================
// ⚙️ WEIGHTS
// =======================
const timeWeight = {
  morning: 0.7,
  afternoon: 0.5,
  evening: 0.9,
  night: 0.2
};

const dayWeight = {
  monday: 0.7,
  tuesday: 0.6,
  wednesday: 0.6,
  thursday: 0.7,
  friday: 0.9,
  saturday: 0.5,
  sunday: 0.3
};

const weatherWeight = {
  clear: 0.5,
  rain: 0.9,
  fog: 0.7
};


// =======================
// 🚀 CREATE + PREDICT
// =======================
router.post("/", async (req, res) => {
  try {
    const { origin, destination, time, day, location } = req.body;

    console.log("INPUT:", req.body);

    if (!origin || !destination || !location) {
      return res.status(400).json({ error: "Missing inputs" });
    }

    // =======================
    // 🌦️ WEATHER
    // =======================
    const weatherRes = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: location,
          appid: process.env.WEATHER_API_KEY
        }
      }
    );

    const weatherMain = weatherRes.data.weather[0].main.toLowerCase();

    let weather = "clear";
    if (weatherMain.includes("rain")) weather = "rain";
    else if (weatherMain.includes("fog") || weatherMain.includes("mist")) weather = "fog";

    const W = weatherWeight[weather] || 0.5;


    // =======================
    // 📍 GEOCODING
    // =======================
    const geoOrigin = await axios.get(
      `https://api.tomtom.com/search/2/geocode/${origin}, ${location}.json`,
      { params: { key: process.env.TOMTOM_API_KEY } }
    );

    const geoDest = await axios.get(
      `https://api.tomtom.com/search/2/geocode/${destination}, ${location}.json`,
      { params: { key: process.env.TOMTOM_API_KEY } }
    );

    if (!geoOrigin.data.results.length) {
      return res.status(400).json({ error: "Invalid origin" });
    }

    if (!geoDest.data.results.length) {
      return res.status(400).json({ error: "Invalid destination" });
    }

    const o = geoOrigin.data.results[0].position;
    const d = geoDest.data.results[0].position;

    console.log("Coordinates:", o, d);


    // =======================
    // 🚦 TRAFFIC (2 POINT SAMPLE)
    // =======================
    const points = [`${o.lat},${o.lon}`, `${d.lat},${d.lon}`];

    let trafficValues = [];

    for (let point of points) {
      try {
        const resTraffic = await axios.get(
          `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json`,
          {
            params: {
              key: process.env.TOMTOM_API_KEY,
              point: point
            }
          }
        );

        const flow = resTraffic.data.flowSegmentData;

        if (flow && flow.currentSpeed && flow.freeFlowSpeed) {
          const index = flow.currentSpeed / flow.freeFlowSpeed;

          if (!isNaN(index) && index > 0) {
            trafficValues.push(index);
          }
        }

      } catch (err) {
        console.log("Traffic fetch failed:", point);
      }
    }


    // =======================
    // 📊 ADVANCED TRAFFIC INDEX
    // =======================
    let baseIndex = 1;

    if (trafficValues.length > 0) {
      baseIndex =
        trafficValues.reduce((a, b) => a + b, 0) / trafficValues.length;
    }

    // 🛣️ Distance approx (km)
    const distanceKm =
      Math.sqrt(
        Math.pow(o.lat - d.lat, 2) +
        Math.pow(o.lon - d.lon, 2)
      ) * 111;

    let distanceFactor = 1;
    if (distanceKm < 3) distanceFactor = 1.1;
    else if (distanceKm > 15) distanceFactor = 0.9;

    // 🕒 Peak hour
    let peakFactor = 1;
    if (time === "morning" && day !== "sunday") peakFactor = 1.3;
    if (time === "evening" && day !== "sunday") peakFactor = 1.5;
    if (time === "night") peakFactor = 0.7;

    // 🌧️ Weather
    let weatherFactor = 1;
    if (weather === "rain") weatherFactor = 1.4;
    if (weather === "fog") weatherFactor = 1.3;

    // 📊 Historical
    const pastData = await Traffic.find({ location });

    let avgScore = 0.5;

    if (pastData.length > 0) {
      avgScore =
        pastData.reduce((sum, d) => sum + d.score, 0) / pastData.length;
    }

    let historicalFactor = 1 + (avgScore - 0.5);

    // 🔥 Final index
    let trafficIndex =
      baseIndex *
      distanceFactor *
      peakFactor *
      weatherFactor *
      historicalFactor;

    // clamp
    trafficIndex = Math.max(0.5, Math.min(trafficIndex, 3));

    console.log("🔥 Traffic Index:", trafficIndex);


    // =======================
    // 🧠 ML MODEL
    // =======================
    const T = timeWeight[time] || 0.5;
    const D = dayWeight[day] || 0.5;

    let score;

    try {
      score = model.predict([[T, D, W, trafficIndex]])[0];

      if (!score || isNaN(score)) {
        score = (T + D + W + trafficIndex) / 4;
      }

    } catch (err) {
      console.log("ML ERROR:", err.message);
      score = (T + D + W + trafficIndex) / 4;
    }

    let level = "Low";
    if (score > 0.7) level = "High";
    else if (score > 0.4) level = "Medium";

    console.log("Final Score:", score, level);


    // =======================
    // 💾 SAVE
    // =======================
    const newData = new Traffic({
      origin,
      destination,
      location,
      time,
      day,
      weather,
      trafficIndex,
      score,
      level
    });

    await newData.save();


    // =======================
    // ✅ RESPONSE
    // =======================
    res.json({
      origin,
      destination,
      location,
      time,
      day,
      weather,
      trafficIndex,
      score,
      level
    });

  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});


// =======================
// 📖 GET
// =======================
router.get("/", async (req, res) => {
  const data = await Traffic.find();
  res.json(data);
});


// =======================
// ❌ DELETE
// =======================
router.delete("/:id", async (req, res) => {
  await Traffic.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});


// =======================
// ✏ UPDATE
// =======================
router.put("/:id", async (req, res) => {
  const updated = await Traffic.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

module.exports = router;