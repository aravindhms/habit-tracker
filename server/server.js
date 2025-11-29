const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 5000;
app.use(cors());
app.use(bodyParser.json());

// Get all habits and their logs for a specific month (YYYY-MM)
app.get('/api/data', (req, res) => {
    const { month } = req.query; // Format: YYYY-MM

    if (!month) {
        return res.status(400).json({ error: 'Month is required (YYYY-MM)' });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // Simple approximation

    db.all("SELECT * FROM habits", [], (err, habits) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(
            "SELECT * FROM habit_logs WHERE date BETWEEN ? AND ?",
            [startDate, endDate],
            (err, logs) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ habits, logs });
            }
        );
    });
});

// Toggle habit status (0: Empty, 1: Done, 2: Failed)
app.post('/api/toggle', (req, res) => {
    const { habit_id, date, status } = req.body;

    // Upsert logic
    db.run(`INSERT INTO habit_logs (habit_id, date, status) 
          VALUES (?, ?, ?) 
          ON CONFLICT(habit_id, date) 
          DO UPDATE SET status=excluded.status`,
        [habit_id, date, status],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Updated', changes: this.changes });
        }
    );
});

// Create new habit
app.post('/api/habits', (req, res) => {
    const { name, icon, goal } = req.body;
    db.run("INSERT INTO habits (name, icon, goal) VALUES (?, ?, ?)",
        [name, icon, goal || 30],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, name, icon, goal });
        }
    );
});

// Update habit
app.put('/api/habits/:id', (req, res) => {
    const { name, icon, goal } = req.body;
    db.run("UPDATE habits SET name = ?, icon = ?, goal = ? WHERE id = ?",
        [name, icon, goal, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Updated', changes: this.changes });
        }
    );
});

// Delete habit
app.delete('/api/habits/:id', (req, res) => {
    db.serialize(() => {
        db.run("DELETE FROM habit_logs WHERE habit_id = ?", [req.params.id]);
        db.run("DELETE FROM habits WHERE id = ?", [req.params.id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Deleted', changes: this.changes });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
