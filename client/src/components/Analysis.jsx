import React from 'react';

const Analysis = ({ habits, logs, currentMonth }) => {
    const calculateProgress = (habitId, habitGoal) => {
        // Count logs for this habit in current month
        const completed = logs.filter(l => l.habit_id === habitId && l.status === 1).length;

        // For daily habits, goal is days in month. For others, use stored goal or default.
        const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
        const goal = habitGoal || daysInMonth;

        // If it's a daily habit (which we filter for below), we should strictly use daysInMonth
        // The prop passed down is just 'habits', but we filter in the render.
        // Let's refine this: The caller maps over daily habits.
        // So we can assume if this function is called for a daily habit, the goal is daysInMonth.

        return { completed, goal: daysInMonth, percentage: Math.min((completed / daysInMonth) * 100, 100) };
    };

    return (
        <div className="analysis-panel glass-panel">
            <h3>Analysis</h3>
            <div className="analysis-header">
                <span>Habit</span>
                <span>Goal</span>
                <span>Done</span>
                <span>Progress</span>
            </div>
            <div className="analysis-list">
                {habits.filter(h => !h.frequency || h.frequency === 'daily').map(habit => {
                    const { completed, goal, percentage } = calculateProgress(habit.id, habit.goal);
                    return (
                        <div key={habit.id} className="analysis-item">
                            <div className="habit-name-analysis">
                                <span className="habit-icon">{habit.icon}</span>
                                <span className="habit-name-text">{habit.name}</span>
                            </div>
                            <span className="goal-val">{goal}</span>
                            <span className="actual-val">{completed}</span>
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Analysis;
