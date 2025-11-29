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
      goal INTEGER DEFAULT 30
    )`);

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
          { name: 'Wake up at 05:00', icon: '⏰' },
          { name: 'Gym', icon: '💪' },
          { name: 'Reading / Learning', icon: '📖' },
          { name: 'Day Planning', icon: '📅' },
          { name: 'Budget Tracking', icon: '💰' },
          { name: 'Project Work', icon: '🎯' },
          { name: 'No Alcohol', icon: '🍾' },
          { name: 'Social Media Detox', icon: '🌿' },
          { name: 'Goal Journaling', icon: '📝' },
          { name: 'Cold Shower', icon: '🚿' }
        ];
        const stmt = db.prepare("INSERT INTO habits (name, icon) VALUES (?, ?)");
        initialHabits.forEach(h => stmt.run(h.name, h.icon));
        stmt.finalize();
        console.log("Seeded initial habits.");
      }
    });
  });
}

module.exports = db;
