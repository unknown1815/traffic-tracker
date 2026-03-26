const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// =======================
// 🗄️ MongoDB Connection (FIXED)
// =======================
mongoose.connect("mongodb://127.0.0.1:27017/trafficDB")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


// =======================
// 🔗 Routes
// =======================
app.use("/api/traffic", require("./routes/trafficRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));


// =======================
// 🧪 Test Route
// =======================
app.get("/", (req, res) => {
  res.send("API Running...");
});


// =======================
// 🚀 Server Start
// =======================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});