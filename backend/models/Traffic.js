const mongoose = require("mongoose");

const trafficSchema = new mongoose.Schema({
  time: String,
  day: String,
  location: String,
  weather: String,
  score: Number,
  level: String
});

module.exports = mongoose.model("Traffic", trafficSchema);