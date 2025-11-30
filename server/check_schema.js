const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'habits.db');
const db = new sqlite3.Database(dbPath);

db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='habit_logs'", (err, row) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Current Schema:", row ? row.sql : "Table not found");
    }
    db.close();
});
