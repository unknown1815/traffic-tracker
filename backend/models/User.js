const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,   // prevents duplicate users
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  }

}, { timestamps: true }); // adds createdAt & updatedAt

module.exports = mongoose.model("User", userSchema);