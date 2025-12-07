const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

// Get all data for export
app.get('/api/export', (req, res) => {
    db.serialize(() => {
        db.all("SELECT * FROM habits ORDER BY order_index ASC", [], (err, habits) => {
            if (err) return res.status(500).json({ error: err.message });

            db.all("SELECT * FROM habit_logs", [], (err, logs) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ habits, logs });
            });
        });
    });
});

// Get all habits and their logs for a specific month (YYYY-MM)
app.get('/api/data', (req, res) => {
    const { month } = req.query; // Format: YYYY-MM

    if (!month) {
        return res.status(400).json({ error: 'Month is required (YYYY-MM)' });
    }

    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // Simple approximation

    console.log(`[API] Fetching data for month: ${month}`);
    db.all("SELECT * FROM habits ORDER BY order_index ASC", [], (err, habits) => {
        if (err) return res.status(500).json({ error: err.message });

        // Use LIKE to match YYYY-MM% which covers:
        // YYYY-MM-DD (Daily)
        // YYYY-MM-Wn (Weekly)
        // YYYY-MM (Monthly)
        const query = "SELECT * FROM habit_logs WHERE date LIKE ?";
        const params = [`${month}%`];
        console.log(`[API] Query: ${query} with params: ${params}`);

        db.all(
            query,
            params,
            (err, logs) => {
                if (err) return res.status(500).json({ error: err.message });
                console.log(`[API] Found ${logs.length} logs for ${month}`);
                if (logs.length > 0) console.log(`[API] Sample log:`, logs[0]);
                res.json({ habits, logs });
            }
        );
    });
});

// Toggle habit status (0: Empty, 1: Done, 2: Failed)
app.post('/api/toggle', (req, res) => {
    const { habit_id, date, status } = req.body;

    console.log(`[API] Toggle request:`, { habit_id, date, status });

    // Upsert logic
    db.run(`INSERT INTO habit_logs (habit_id, date, status) 
          VALUES (?, ?, ?) 
          ON CONFLICT(habit_id, date) 
          DO UPDATE SET status=excluded.status`,
        [habit_id, date, status],
        function (err) {
            if (err) {
                console.error(`[API] Toggle Error:`, err);
                return res.status(500).json({ error: err.message });
            }
            console.log(`[API] Toggle Success. Changes: ${this.changes}`);
            res.json({ message: 'Updated', changes: this.changes });
        }
    );
});

// Create new habit
app.post('/api/habits', (req, res) => {
    const { name, icon, goal, frequency } = req.body;

    // Get max order_index
    db.get("SELECT MAX(order_index) as maxOrder FROM habits", (err, row) => {
        const nextOrder = (row && row.maxOrder !== null) ? row.maxOrder + 1 : 0;

        db.run("INSERT INTO habits (name, icon, goal, frequency, order_index) VALUES (?, ?, ?, ?, ?)",
            [name, icon, goal || 30, frequency || 'daily', nextOrder],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: this.lastID, name, icon, goal, frequency: frequency || 'daily', order_index: nextOrder });
            }
        );
    });
});

// Update habit
app.put('/api/habits/:id', (req, res) => {
    const { name, icon, goal, frequency } = req.body;
    db.run("UPDATE habits SET name = ?, icon = ?, goal = ?, frequency = ? WHERE id = ?",
        [name, icon, goal, frequency, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Updated', changes: this.changes });
        }
    );
});

// Reorder habits
app.put('/api/habits/reorder', (req, res) => {
    const { habits } = req.body; // Array of { id, order_index }

    if (!habits || !Array.isArray(habits)) {
        return res.status(400).json({ error: 'Invalid data' });
    }

    db.serialize(() => {
        const stmt = db.prepare("UPDATE habits SET order_index = ? WHERE id = ?");
        habits.forEach(h => {
            stmt.run(h.order_index, h.id);
        });
        stmt.finalize((err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Reordered successfully' });
        });
    });
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
