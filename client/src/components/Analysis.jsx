import React from 'react';

const Analysis = ({ habits, logs, currentMonth }) => {
    const calculateProgress = (habitId, habitGoal) => {
        // Count logs for this habit in current month
        const completed = logs.filter(l => l.habit_id === habitId && l.status === 1).length;
        const goal = habitGoal || 30;
        return { completed, goal, percentage: Math.min((completed / goal) * 100, 100) };
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
                {habits.map(habit => {
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
