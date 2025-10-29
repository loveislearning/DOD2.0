// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Temporary data storage (like an in-memory database)
let cars = [];

// ✅ POST endpoint: Add a new car
app.post("/api/cars", (req, res) => {
  const { name, email, model, price } = req.body;

  // Validation check
  if (!name || !email || !model || !price) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const newCar = {
    id: cars.length + 1,
    name,
    email,
    model,
    price,
  };

  cars.push(newCar);
  console.log("✅ Car added:", newCar);

  // ✅ Added success flag here
  res.status(200).json({
    success: true,
    message: "Car added successfully!",
    car: newCar,
  });
});

// ✅ GET endpoint: Get all cars
app.get("/api/cars", (req, res) => {
  res.json(cars);
});

// ✅ Run the server
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
