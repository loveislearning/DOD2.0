const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs"); 
const path = require("path");

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json'); // Path to your db.json file

app.use(cors());
app.use(bodyParser.json());

// --- Helper Functions for File I/O ---

// Function to read the database file
function readDB() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading db.json. Ensure the file exists.", error.message);
        // Return a default structure if the file is missing or corrupted
        return { users: [], cars: [] }; 
    }
}

// Function to write to the database file
function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// --- API ROUTES ---

// GET endpoint to fetch all cars
app.get("/api/cars", (req, res) => {
    const db = readDB();
    res.json(db.cars);
});

// POST endpoint to add a new car
app.post("/api/cars", (req, res) => {
    const { name, email, model, image, price, userId } = req.body; 

    if (!name || !email || !model || !image || !price || !userId) {
        return res.status(400).json({ success: false, message: "Missing required fields (including image and userId)" });
    }

    const db = readDB();
    
    // Simple ID generation
    const newId = db.cars.length > 0 ? Math.max(...db.cars.map(c => c.id || 0)) + 1 : 1;

    const newCar = {
        id: newId,
        name,
        email,
        model,
        image,
        price,
        userId: String(userId) 
    };

    db.cars.push(newCar);
    writeDB(db); 

    console.log("✅ Car added and saved:", newCar);

    res.status(201).json({ 
        success: true,
        message: "Car added successfully!",
        car: newCar,
    });
});

// DELETE endpoint to remove a car listing
app.delete("/api/cars/:id", (req, res) => {
    const carId = parseInt(req.params.id);
    const db = readDB();

    const initialLength = db.cars.length;
    
    db.cars = db.cars.filter(car => car.id !== carId);

    if (db.cars.length < initialLength) {
        writeDB(db); 
        console.log(`❌ Car ID ${carId} deleted.`);
        return res.status(200).json({ success: true, message: "Car deleted successfully." });
    } else {
        return res.status(404).json({ success: false, message: "Car not found." });
    }
});


// 🔥 NEW ROUTE: GET all users (Used by login.js for filtering)
app.get("/api/users", (req, res) => {
    const db = readDB();
    // In a real app, you would filter or check credentials here. 
    // For this simple setup, we return all users for the client-side login logic.
    res.json(db.users);
});


// 🔥 NEW ROUTE: POST endpoint to create a new user (Used by login.js signup)
app.post("/api/users", (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing required fields for signup." });
    }

    const db = readDB();
    
    // Simple ID generation for users (ensuring it's a string ID)
    const newId = db.users.length > 0 ? String(Math.max(...db.users.map(u => parseInt(u.id) || 0)) + 1) : "1";

    const newUser = {
        id: newId,
        name,
        email,
        password,
        // Initialize optional fields
        phone: null, 
        address: null,
        dob: null
    };

    db.users.push(newUser);
    writeDB(db); 
    
    console.log("✅ New user created:", newUser);
    // Return the new user object so the client gets the ID
    res.status(201).json(newUser); 
});


// GET endpoint to fetch an individual user
app.get("/api/users/:id", (req, res) => {
    const userId = req.params.id;
    const db = readDB();
    const user = db.users.find(u => String(u.id) === String(userId)); 

    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
});


// 🔥 CRITICAL NEW ROUTE: PATCH endpoint to update user details (Used by login.js details form)
app.patch("/api/users/:id", (req, res) => {
    const userId = req.params.id;
    const updates = req.body; // Contains { phone, address, dob }
    const db = readDB();

    const userIndex = db.users.findIndex(u => String(u.id) === String(userId));

    if (userIndex !== -1) {
        // Merge the existing user data with the new updates
        db.users[userIndex] = { 
            ...db.users[userIndex],
            ...updates 
        };
        
        writeDB(db); // Persist the change
        console.log(`✅ User ID ${userId} updated with new details.`);
        res.status(200).json({ success: true, user: db.users[userIndex] });
    } else {
        res.status(404).json({ success: false, message: "User not found for update." });
    }
});


app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
);