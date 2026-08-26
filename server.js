require('dotenv').config();
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

// Neon PostgreSQL connection string from environment variable or fallback
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_nF91jOqDAbtm@ep-green-dew-ax60ger0.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require';

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
        
        // Create indexes for performance
        const createIndexesQuery = `
            CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_bookings_category ON bookings(category);
            CREATE INDEX IF NOT EXISTS idx_bookings_name_email ON bookings(name, email);
        `;
        await pool.query(createIndexesQuery);
        console.log("Database indexes verified/created.");
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

// API Endpoint to get all bookings for Admin page with pagination and filtering
app.get('/api/bookings', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', category = '', sort = 'created_at' } = req.query;
        
        const offset = (page - 1) * limit;
        let whereClauses = [];
        let params = [];
        let paramIndex = 1;

        if (search) {
            whereClauses.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (category) {
            whereClauses.push(`category = $${paramIndex}`);
            params.push(category);
            paramIndex++;
        }

        const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
        
        let orderByString = 'ORDER BY created_at DESC';
        if (sort === 'booking_date') {
            orderByString = 'ORDER BY booking_date ASC';
        }

        const countQuery = `SELECT COUNT(*) FROM bookings ${whereString}`;
        const countResult = await pool.query(countQuery, params);
        const totalCount = parseInt(countResult.rows[0].count, 10);

        const dataQuery = `
            SELECT * FROM bookings 
            ${whereString} 
            ${orderByString} 
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;
        
        const dataParams = [...params, limit, offset];
        const result = await pool.query(dataQuery, dataParams);
        
        res.status(200).json({
            success: true,
            data: result.rows,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: parseInt(page, 10)
        });
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
