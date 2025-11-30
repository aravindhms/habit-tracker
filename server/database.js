const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'habits.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Habits table
    db.run(`CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT,
      goal INTEGER DEFAULT 30,
      order_index INTEGER DEFAULT 0,
      frequency TEXT DEFAULT 'daily'
    )`);

    // Attempt to add columns if they don't exist (for existing DBs)
    db.run("ALTER TABLE habits ADD COLUMN order_index INTEGER DEFAULT 0", (err) => {
      // Ignore error if column exists
    });
    db.run("ALTER TABLE habits ADD COLUMN frequency TEXT DEFAULT 'daily'", (err) => {
      // Ignore error if column exists
    });

    // Habit Logs table (tracks completion)
    db.run(`CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER,
      date TEXT,
      status INTEGER DEFAULT 0, -- 0: not done, 1: done
      FOREIGN KEY(habit_id) REFERENCES habits(id),
      UNIQUE(habit_id, date)
    )`);

    // Mood/Motivation Logs table
    db.run(`CREATE TABLE IF NOT EXISTS mood_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      mood INTEGER,
      motivation INTEGER
    )`);

    // Seed initial habits if empty
    db.get("SELECT count(*) as count FROM habits", (err, row) => {
      if (row.count === 0) {
        const initialHabits = [
          { name: 'Wake up at 05:00', icon: '⏰', order_index: 0 },
          { name: 'Gym', icon: '💪', order_index: 1 },
          { name: 'Reading / Learning', icon: '📖', order_index: 2 },
          { name: 'Day Planning', icon: '📅', order_index: 3 },
          { name: 'Budget Tracking', icon: '💰', order_index: 4 },
          { name: 'Project Work', icon: '🎯', order_index: 5 },
          { name: 'No Alcohol', icon: '🍾', order_index: 6 },
          { name: 'Social Media Detox', icon: '🌿', order_index: 7 },
          { name: 'Goal Journaling', icon: '📝', order_index: 8 },
          { name: 'Cold Shower', icon: '🚿', order_index: 9 }
        ];
        const stmt = db.prepare("INSERT INTO habits (name, icon, order_index) VALUES (?, ?, ?)");
        initialHabits.forEach(h => stmt.run(h.name, h.icon, h.order_index));
        stmt.finalize();
        console.log("Seeded initial habits.");
      }
    });
  });
}

module.exports = db;
