import React, { useState, useEffect } from 'react';
import HabitGrid from './components/HabitGrid';
import Analysis from './components/Analysis';
import Charts from './components/Charts';
import Admin from './components/Admin';
import Summary from './components/Summary';
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import './index.css';

function App() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState({ year: 2025, month: 11 }); // Nov 2025
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'admin'

  const fetchData = async () => {
    try {
      const monthStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;
      console.log(`Fetching data for: ${monthStr}`);
      const res = await fetch(`http://localhost:5000/api/data?month=${monthStr}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      console.log(`Received ${data.logs.length} logs for ${monthStr}`);
      setHabits(data.habits);
      setLogs(data.logs);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = prev.month === 1 ? 12 : prev.month - 1;
      const newYear = prev.month === 1 ? prev.year - 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = prev.month === 12 ? 1 : prev.month + 1;
      const newYear = prev.month === 12 ? prev.year + 1 : prev.year;
      return { year: newYear, month: newMonth };
    });
  };

  const handleToggle = async (habitId, date, status) => {
    // Optimistic update
    const newLogs = [...logs];
    const existingLogIndex = newLogs.findIndex(l => l.habit_id === habitId && l.date === date);

    if (existingLogIndex >= 0) {
      newLogs[existingLogIndex].status = status;
    } else {
      newLogs.push({ habit_id: habitId, date, status });
    }
    setLogs(newLogs);

    try {
      await fetch('http://localhost:5000/api/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, date, status })
      });
    } catch (err) {
      console.error("Failed to toggle", err);
      fetchData(); // Revert on error
    }
  };

  const handleAddHabit = async (habitData) => {
    try {
      await fetch('http://localhost:5000/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData)
      });
      fetchData();
    } catch (err) {
      console.error("Failed to add habit", err);
    }
  };

  const handleUpdateHabit = async (id, habitData) => {
    try {
      await fetch(`http://localhost:5000/api/habits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData)
      });
      fetchData();
    } catch (err) {
      console.error("Failed to update habit", err);
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/habits/${id}`, {
        method: 'DELETE'
      });
      fetchData();
    } catch (err) {
      console.error("Failed to delete habit", err);
    }
  };

  const handleReorder = async (newHabits) => {
    // Optimistic update
    setHabits(newHabits);

    try {
      const reorderPayload = newHabits.map((h, index) => ({
        id: h.id,
        order_index: index
      }));

      await fetch('http://localhost:5000/api/habits/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits: reorderPayload })
      });
    } catch (err) {
      console.error("Failed to reorder", err);
      fetchData(); // Revert on error
    }
  };

  // Calculate summary stats
  const dailyHabits = habits.filter(h => !h.frequency || h.frequency === 'daily');
  const totalHabits = dailyHabits.length;

  // Filter logs to only include those for daily habits
  const dailyHabitIds = new Set(dailyHabits.map(h => h.id));
  const totalCompleted = logs.filter(l => l.status === 1 && dailyHabitIds.has(l.habit_id)).length;

  const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
  const totalPossible = totalHabits * daysInMonth; // Approximation
  const progressPercentage = totalPossible > 0 ? ((totalCompleted / totalPossible) * 100).toFixed(2) : 0;

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="app-container">
      <header className="main-header glass-panel">
        <div className="header-left">
          <div className="app-branding">
            <h2>Habit Tracker</h2>
          </div>
          <div className="month-nav">
            <button className="btn-icon" onClick={handlePrevMonth}><ChevronLeft size={24} /></button>
            <h1>{monthNames[currentMonth.month - 1]} {currentMonth.year}</h1>
            <button className="btn-icon" onClick={handleNextMonth}><ChevronRight size={24} /></button>
          </div>
          <button className="btn-icon" onClick={() => setView('admin')} title="Manage Habits">
            <Settings size={20} />
          </button>
        </div>
        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Number of habits</span>
            <span className="stat-value">{totalHabits}</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {view === 'admin' ? (
          <div className="full-width-panel">
            <Admin
              habits={habits}
              onAdd={handleAddHabit}
              onUpdate={handleUpdateHabit}
              onDelete={handleDeleteHabit}
              onClose={() => setView('dashboard')}
            />
          </div>
        ) : (
          <>
            <Summary habits={habits} logs={logs} currentMonth={currentMonth} />
            <HabitGrid
              habits={habits}
              logs={logs}
              currentMonth={currentMonth}
              onToggle={handleToggle}
              onReorder={handleReorder}
            />
            <div className="bottom-row">
              <Charts logs={logs} currentMonth={currentMonth} habits={habits} />
              <Analysis habits={habits} logs={logs} currentMonth={currentMonth} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
