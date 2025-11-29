import React from 'react';

const Analysis = ({ habits, logs, currentMonth }) => {
    const calculateProgress = (habitId, habitGoal) => {
        // Count logs for this habit in current month
        const completed = logs.filter(l => l.habit_id === habitId && l.status === 1).length;
        const goal = habitGoal || 30;
        return { completed, goal, percentage: Math.min((completed / goal) * 100, 100) };
    };

    const calculateStreaks = (habitId) => {
        // Get all logs for this habit, sorted by date
        const habitLogs = logs
            .filter(l => l.habit_id === habitId)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        let lastDate = null;

        habitLogs.forEach(log => {
            if (log.status === 1) { // Only count completed days
                const logDate = new Date(log.date);

                if (lastDate) {
                    const dayDiff = Math.floor((logDate - lastDate) / (1000 * 60 * 60 * 24));

                    if (dayDiff === 1) {
                        // Consecutive day
                        tempStreak++;
                    } else {
                        // Streak broken
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                    }
                } else {
                    tempStreak = 1;
                }

                lastDate = logDate;
            } else {
                // Failed or empty breaks the streak
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 0;
                lastDate = null;
            }
        });

        longestStreak = Math.max(longestStreak, tempStreak);

        // Check if current streak is still active (last log was today or yesterday)
        if (lastDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const daysSinceLastLog = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

            if (daysSinceLastLog <= 1) {
                currentStreak = tempStreak;
            }
        }

        return { currentStreak, longestStreak };
    };

    return (
        <div className="analysis-panel glass-panel">
            <h3>Analysis</h3>
            <div className="analysis-header">
                <span>Habit</span>
                <span>Goal</span>
                <span>Done</span>
                <span>Streak</span>
                <span>Progress</span>
            </div>
            <div className="analysis-list">
                {habits.map(habit => {
                    const { completed, goal, percentage } = calculateProgress(habit.id, habit.goal);
                    const { currentStreak, longestStreak } = calculateStreaks(habit.id);
                    return (
                        <div key={habit.id} className="analysis-item">
                            <div className="habit-name-analysis">
                                <span className="habit-icon">{habit.icon}</span>
                                <span className="habit-name-text">{habit.name}</span>
                            </div>
                            <span className="goal-val">{goal}</span>
                            <span className="actual-val">{completed}</span>
                            <div className="streak-val">
                                {currentStreak > 0 && <span className="fire-emoji">🔥</span>}
                                <span className="streak-current">{currentStreak}</span>
                                <span className="streak-divider">/</span>
                                <span className="streak-longest">{longestStreak}</span>
                            </div>
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
