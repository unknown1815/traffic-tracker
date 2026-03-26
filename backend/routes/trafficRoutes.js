const express = require("express");
const router = express.Router();
const Traffic = require("../models/Traffic");


// =======================
// ⚙️ WEIGHTS
// =======================

// Time weights
const timeWeight = {
  morning: 0.7,
  afternoon: 0.5,
  evening: 0.9,
  night: 0.2
};

// Day weights
const dayWeight = {
  monday: 0.7,
  tuesday: 0.6,
  wednesday: 0.6,
  thursday: 0.7,
  friday: 0.9,
  saturday: 0.5,
  sunday: 0.3
};

// Location weights
const locationWeight = {
  city: 0.9,
  town: 0.6,
  village: 0.3
};

// Weather weights
const weatherWeight = {
  clear: 0.5,
  rain: 0.9,
  fog: 0.7
};


// =======================
// ➕ CREATE + PREDICT
// =======================
router.post("/", async (req, res) => {
  try {
    const { time, day, location, weather } = req.body;

    const T = timeWeight[time] || 0;
    const D = dayWeight[day] || 0;
    const L = locationWeight[location] || 0;
    const W = weatherWeight[weather] || 0;

    const score = (T + D + L + W) / 4;

    let level = "Low";
    if (score > 0.7) level = "High";
    else if (score > 0.4) level = "Medium";

    const newData = new Traffic({
      time,
      day,
      location,
      weather,
      score,
      level
    });

    await newData.save();

    res.json(newData);

  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ error: "Create failed" });
  }
});


// =======================
// 📖 READ ALL
// =======================
router.get("/", async (req, res) => {
  try {
    const data = await Traffic.find();
    res.json(data);
  } catch (err) {
    console.error("READ ERROR:", err);
    res.status(500).json({ error: "Fetch failed" });
  }
});


// =======================
// ❌ DELETE
// =======================
router.delete("/:id", async (req, res) => {
  try {
    await Traffic.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});


// =======================
// ✏ UPDATE (EDIT FEATURE)
// =======================
router.put("/:id", async (req, res) => {
  try {
    const { time, day, location, weather } = req.body;

    const T = timeWeight[time] || 0;
    const D = dayWeight[day] || 0;
    const L = locationWeight[location] || 0;
    const W = weatherWeight[weather] || 0;

    const score = (T + D + L + W) / 4;

    let level = "Low";
    if (score > 0.7) level = "High";
    else if (score > 0.4) level = "Medium";

    const updated = await Traffic.findByIdAndUpdate(
      req.params.id,
      {
        time,
        day,
        location,
        weather,
        score,
        level
      },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Update failed" });
  }
});


module.exports = router;