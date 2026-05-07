const { RandomForestRegression } = require("ml-random-forest");

// Training data: [T, D, Weather, TrafficIndex]
const trainingData = [
  [0.9, 0.9, 0.9, 1.8], // high
  [0.7, 0.7, 0.7, 1.5], // medium-high
  [0.5, 0.5, 0.5, 1.2], // medium
  [0.3, 0.3, 0.3, 1.0], // low
  [0.2, 0.2, 0.2, 0.8]  // very low
];

const labels = [0.95, 0.75, 0.5, 0.3, 0.1];

const model = new RandomForestRegression({
  nEstimators: 20
});

model.train(trainingData, labels);

module.exports = model;