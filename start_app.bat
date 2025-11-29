@echo off
echo Starting Habit Tracker...

start "Habit Tracker Server" cmd /k "cd server && npm start"
timeout /t 5
start "Habit Tracker Client" cmd /k "cd client && npm run dev"

echo App started! Client running at http://localhost:5174
