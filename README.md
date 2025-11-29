# Habit Tracker

A modern, responsive habit tracker application built with React, Node.js, and SQLite.

![Habit Tracker Screenshot](https://raw.githubusercontent.com/aravindhms/habit-tracker/main/screenshot.png)

## Features

- **Dark Theme UI**: Beautiful glassmorphism design
- **Habit Tracking**: Daily tracking with tri-state toggle (Done, Failed, Empty)
- **Analytics**: 
  - Monthly progress visualization
  - Weekly and monthly summary statistics
  - Best performing habits
- **Responsive**: Works on Desktop, Tablet, and Mobile
- **Admin Panel**: Easy management of habits (Add, Edit, Delete)

## Tech Stack

- **Frontend**: React, Vite, Vanilla CSS (Glassmorphism)
- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/aravindhms/habit-tracker.git
   ```

2. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Run the Application**
   
   You can use the provided batch script (Windows):
   ```bash
   start_app.bat
   ```
   
   Or run manually:
   ```bash
   # Terminal 1: Start Server
   cd server
   npm start

   # Terminal 2: Start Client
   cd client
   npm run dev
   ```

## License

MIT
