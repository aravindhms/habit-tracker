import React, { useState, useEffect } from 'react';
import HabitGrid from './components/HabitGrid';
import Analysis from './components/Analysis';
import Charts from './components/Charts';
import Admin from './components/Admin';
import Summary from './components/Summary';
import { Settings, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import './index.css';

function App() {
  const API_BASE = `http://${window.location.hostname}:5000`;
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'admin'

  const fetchData = async () => {
    try {
      const monthStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;
      console.log(`Fetching data for: ${monthStr}`);
      const res = await fetch(`${API_BASE}/api/data?month=${monthStr}`, {
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
      await fetch(`${API_BASE}/api/toggle`, {
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
      await fetch(`${API_BASE}/api/habits`, {
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
      await fetch(`${API_BASE}/api/habits/${id}`, {
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
      await fetch(`${API_BASE}/api/habits/${id}`, {
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

      await fetch(`${API_BASE}/api/habits/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habits: reorderPayload })
      });
    } catch (err) {
      console.error("Failed to reorder", err);
      fetchData(); // Revert on error
    }
  };

  const handleExport = async () => {
    try {
      // const API_URL = ... (removed local definition)
      const res = await fetch(`${API_BASE}/api/export`);
      const data = await res.json();

      const { habits, logs } = data;
      const wb = XLSX.utils.book_new();

      // Helper to process data
      const processHabits = (freq) => {
        const freqHabits = habits.filter(h => (h.frequency || 'daily') === freq);
        const freqHabitIds = new Set(freqHabits.map(h => h.id));

        // Map logs to readable format
        const sheetData = logs
          .filter(l => freqHabitIds.has(l.habit_id))
          .map(l => {
            const habit = freqHabits.find(h => h.id === l.habit_id);
            return {
              Date: l.date,
              Habit: habit ? habit.name : 'Unknown',
              Status: l.status === 1 ? 'Done' : l.status === 2 ? 'Failed' : 'Empty'
            };
          })
          .sort((a, b) => new Date(b.Date) - new Date(a.Date)); // Sort by date desc

        if (sheetData.length === 0) {
          sheetData.push({ Info: "No logs found for this category" });
        }

        const ws = XLSX.utils.json_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, freq.charAt(0).toUpperCase() + freq.slice(1));
      };

      processHabits('daily');
      processHabits('weekly');
      processHabits('monthly');

      XLSX.writeFile(wb, `habit-tracker-data-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Failed to export data", err);
      alert("Failed to export data");
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
            <h4>{monthNames[currentMonth.month - 1]} {currentMonth.year}</h4>
            <button className="btn-icon" onClick={handleNextMonth}><ChevronRight size={24} /></button>
          </div>
          <button className="btn-icon" onClick={handleExport} title="Export Data">
            <Download size={20} />
          </button>
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
