const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve the Vite static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Neon PostgreSQL connection string
const connectionString = 'postgresql://neondb_owner:npg_nF91jOqDAbtm@ep-green-dew-ax60ger0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
    connectionString: connectionString,
});

pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
});

async function initDB() {
    try {
        console.log("Connected to PostgreSQL database!");
        
        // Create table if it doesn't exist
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                location TEXT NOT NULL,
                category VARCHAR(255) NOT NULL,
                booking_date DATE NOT NULL,
                slot VARCHAR(100) NOT NULL,
                details TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createTableQuery);
        console.log("Bookings table verified/created.");
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

initDB();

// API Endpoint to save a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const { name, email, phone, location, category, date, slot, details } = req.body;
        
        const insertQuery = `
            INSERT INTO bookings (name, email, phone, location, category, booking_date, slot, details)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        
        const values = [name, email, phone, location, category, date, slot, details];
        const result = await pool.query(insertQuery, values);
        
        res.status(201).json({ success: true, booking: result.rows[0] });
    } catch (err) {
        console.error("Error inserting booking:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Endpoint to get all bookings for Admin page
app.get('/api/bookings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Endpoint to delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Error deleting booking:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
