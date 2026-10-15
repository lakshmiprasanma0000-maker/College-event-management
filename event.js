const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Middleware to serve static files (like style.css) and handle form data
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MySQL Database Connection Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',             // Your MySQL username
    password: 'googlemates', // Your MySQL password
    database: 'events'        // Your database name from MySQL Workbench
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database successfully!');
});

// 1. API Route: Fetch all events from the table
app.get('/api/events', (req, res) => {
    const query = 'SELECT * FROM event_management';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Database error');
        }
        res.json(results);
    });
});

// 2. API Route: Fetch a single event by ID
app.get('/api/events/:id', (req, res) => {
    const eventId = req.params.id;
    const query = 'SELECT * FROM event_management WHERE event_id = ?';
    
    db.query(query, [eventId], (err, results) => {
        if (err) {
            console.error('Error fetching event:', err);
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(results[0]);
    });
});

// 3. Form Route: Add a new event
app.post('/add-event', (req, res) => {
    const { event_name, event_time, event_day, venue, description } = req.body;
    const query = `INSERT INTO event_management (event_name, event_time, event_day, venue, description) VALUES (?, ?, ?, ?, ?)`;
    
    db.query(query, [event_name, event_time, event_day, venue, description], (err, result) => {
        if (err) {
            console.error('Error inserting event:', err);
            return res.status(500).send('Database error occurred while adding event.');
        }

        res.send(`<h2>Event "${event_name}" added successfully!</h2><a href="/index.html">Back to Home</a>`);
    });
});

// 4. Form Route: Update an existing event
app.post('/update-event', (req, res) => {
    const { event_id, event_name, event_time, event_day, venue, description } = req.body;
    const query = `UPDATE event_management SET event_name = ?, event_time = ?, event_day = ?, venue = ?, description = ? WHERE event_id = ?`;
    
    db.query(query, [event_name, event_time, event_day, venue, description, event_id], (err, result) => {
        if (err) {
            console.error('Error updating event:', err);
            return res.status(500).send('Database error occurred while updating.');
        }

        res.send(`<h2>Event ID ${event_id} updated successfully!</h2><a href="/index.html">Back to Home</a>`);
    });
});

// 5. Form Route: Delete an event by ID
app.post('/delete-event', (req, res) => {
    const { event_id } = req.body;
    const query = 'DELETE FROM event_management WHERE event_id = ?';
    
    db.query(query, [event_id], (err, result) => {
        if (err) {
            console.error('Error deleting event:', err);
            return res.status(500).send('Database error occurred while deleting.');
        }

        if (result.affectedRows === 0) {
            return res.send(`<h2>No event found with ID ${event_id}</h2><a href="/delete.html">Try Again</a>`);
        }

        res.send(`<h2>Event ID ${event_id} deleted successfully!</h2><a href="/index.html">Back to Home</a>`);
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
