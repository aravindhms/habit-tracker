import React from 'react';
import { Check, X } from 'lucide-react';

const HabitGrid = ({ habits, logs, currentMonth, onToggle }) => {
    const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const getStatus = (habitId, day) => {
        const dateStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const log = logs.find(l => l.habit_id === habitId && l.date === dateStr);
        return log ? log.status : 0;
    };

    const handleToggle = (habitId, day, currentStatus) => {
        const dateStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Prevent editing future dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Create date using local time constructor to avoid UTC issues
        // Note: Month is 1-based in currentMonth object (from App.jsx), but Date constructor expects 0-based month
        // Wait, let's check App.jsx to see if month is 0 or 1 based.
        // Usually JS getMonth() is 0-11.
        // If currentMonth.month is 1-12, we need -1.
        // Let's assume it matches standard JS Date for now, or check App.jsx.
        // Actually, in getStatus, we use padStart(2, '0'), implying it's a number.
        // Let's use the dateStr parsing but force local time.

        const [y, m, d] = dateStr.split('-').map(Number);
        const cellDate = new Date(y, m - 1, d); // Month is 0-indexed in Date constructor

        if (cellDate > today) {
            return;
        }

        // Cycle: 0 (Empty) -> 1 (Done) -> 2 (Failed) -> 0
        let nextStatus = 0;
        if (currentStatus === 0) nextStatus = 1;
        else if (currentStatus === 1) nextStatus = 2;
        else nextStatus = 0;

        onToggle(habitId, dateStr, nextStatus);
    };

    return (
        <div className="habit-grid-container glass-panel">
            <div className="grid-header">
                <div className="habit-name-header">My Habits</div>
                {days.map(day => (
                    <div key={day} className="day-header">
                        <span className="day-num">{day}</span>
                    </div>
                ))}
            </div>

            {habits.map(habit => (
                <div key={habit.id} className="habit-row">
                    <div className="habit-name">
                        <span className="habit-icon">{habit.icon}</span>
                        {habit.name}
                    </div>
                    {days.map(day => {
                        const status = getStatus(habit.id, day);
                        return (
                            <div
                                key={day}
                                className={`habit-cell ${status === 1 ? 'completed' : status === 2 ? 'failed' : ''}`}
                                onClick={() => handleToggle(habit.id, day, status)}
                            >
                                {status === 1 && <Check size={14} strokeWidth={3} />}
                                {status === 2 && <X size={14} strokeWidth={3} />}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default HabitGrid;
