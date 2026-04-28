const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// TEST ROUTE: To check if backend is alive
app.get('/', (req, res) => {
  res.send('Transport Management System Backend is Running!');
});

// API ROUTE: Fetch trips (Example using your 4NF table)
app.get('/api/trips', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Trip_Amenities_4NF');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Fetch All Routes
app.get('/api/routes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Routes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Detailed Trips (Joining Trips and Routes)
app.get('/api/all-trips', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.trip_id, r.source_city, r.destination_city, t.bus_type 
      FROM Trips t 
      JOIN Routes r ON t.route_id = r.route_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 1. Fetch All Routes
app.get('/api/routes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Routes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Fetch Detailed Trips (Joining Trips and Routes)
app.get('/api/all-trips', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.trip_id, r.source_city, r.destination_city, t.bus_type 
      FROM Trips_Main t 
      JOIN Routes r ON t.route_id = r.route_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Keep your existing /api/trips (Amenities) route
app.get('/api/trips', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM Trip_Amenities_4NF');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/vehicles', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM Vehicles');
  res.json(rows);
});

app.get('/api/bookings', async (req, res) => {
  const [rows] = await db.query(`
    SELECT b.booking_id, u.username, b.trip_id, b.seat_number 
    FROM Bookings b 
    JOIN Users_BCNF u ON b.user_id = u.user_id
  `);
  res.json(rows);
});
app.get('/api/all-trips', async (req, res) => {
  const { userId } = req.query; // Get the user ID from the frontend request
  try {
    const [rows] = await db.query(`
      SELECT t.trip_id, r.source_city, r.destination_city, t.bus_type 
      FROM Trips_Main t 
      JOIN Routes r ON t.route_id = r.route_id
      WHERE t.user_id = ?`, [userId]); // Only get rows for this user!
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PORT = 5000;

app.post('/api/add-amenity', async (req, res) => {
  const { trip_id, amenity_name } = req.body;
  try {
    const query = 'INSERT INTO Trip_Amenities_4NF (trip_id, amenity_name) VALUES (?, ?)';
    await db.query(query, [trip_id, amenity_name]);
    res.status(200).send('Success');
  } catch (err) {
    res.status(500).send(err.message);
  }
});
// LOGIN ROUTE
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query(
      'SELECT * FROM Users_BCNF WHERE username = ? AND password = ?',
      [username, password]
    );

    if (users.length > 0) {
      res.status(200).json({ message: "Login Successful", user: users[0] });
    } else {
      res.status(401).json({ message: "Invalid Username or Password" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// This goes in server.js, before the app.listen line
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // This line actually talks to your MySQL table
    const [users] = await db.query(
      'SELECT * FROM Users_BCNF WHERE username = ? AND password = ?',
      [username, password]
    );

    if (users.length > 0) {
      res.status(200).json({ message: "Login Successful" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
