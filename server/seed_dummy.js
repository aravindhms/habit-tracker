const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { subDays, format, eachDayOfInterval } = require('date-fns');

const dbPath = path.resolve(__dirname, 'habits.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
  seed();
});

function seed() {
  db.serialize(() => {
    console.log('Resetting tables...');
    db.run("DELETE FROM habit_logs");
    db.run("DELETE FROM habits");
    db.run("DELETE FROM mood_logs");
    db.run("DELETE FROM sqlite_sequence WHERE name IN ('habits', 'habit_logs', 'mood_logs')");

    const initialHabits = [
      { name: 'Wake up at 05:00', icon: '⏰', goal: 30, frequency: 'daily' },
      { name: 'Gym', icon: '💪', goal: 20, frequency: 'daily' },
      { name: 'Reading', icon: '📖', goal: 25, frequency: 'daily' },
      { name: 'Day Planning', icon: '📅', goal: 30, frequency: 'daily' },
      { name: 'Budget Tracking', icon: '💰', goal: 30, frequency: 'daily' },
      { name: 'Project Work', icon: '🎯', goal: 22, frequency: 'daily' },
      { name: 'No Alcohol', icon: '🍾', goal: 28, frequency: 'daily' },
      { name: 'Social Media Detox', icon: '🌿', goal: 30, frequency: 'daily' },
      { name: 'Goal Journaling', icon: '📝', goal: 15, frequency: 'daily' },
      { name: 'Cold Shower', icon: '🚿', goal: 20, frequency: 'daily' }
    ];

    console.log('Seeding habits...');
    const stmt = db.prepare("INSERT INTO habits (name, icon, goal, frequency, order_index) VALUES (?, ?, ?, ?, ?)");
    initialHabits.forEach((h, index) => {
      stmt.run(h.name, h.icon, h.goal, h.frequency, index);
    });
    stmt.finalize();

    // Get the inserted habits to use their IDs
    db.all("SELECT id, frequency FROM habits", (err, habits) => {
      if (err) {
        console.error('Error fetching habits', err);
        return;
      }

      console.log('Seeding logs for the past 30 days...');
      const today = new Date();
      const startDate = subDays(today, 30);
      const days = eachDayOfInterval({ start: startDate, end: today });

      const logStmt = db.prepare("INSERT INTO habit_logs (habit_id, date, status) VALUES (?, ?, ?)");
      const moodStmt = db.prepare("INSERT INTO mood_logs (date, mood, motivation) VALUES (?, ?, ?)");

      days.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');

        // Seed habit logs
        habits.forEach(habit => {
          // 80% chance of completion for dummy data
          const status = Math.random() > 0.2 ? 1 : (Math.random() > 0.5 ? 2 : 0);
          logStmt.run(habit.id, dateStr, status);
        });

        // Seed mood logs
        const mood = Math.floor(Math.random() * 5) + 1; // 1-5
        const motivation = Math.floor(Math.random() * 5) + 1; // 1-5
        moodStmt.run(dateStr, mood, motivation);
      });

      logStmt.finalize();
      moodStmt.finalize();

      console.log('Seeding complete!');
      db.close();
    });
  });
}
