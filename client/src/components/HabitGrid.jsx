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
