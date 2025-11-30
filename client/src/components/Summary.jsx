import React from 'react';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';

const Summary = ({ habits, logs, currentMonth }) => {
    const calculateSummaryStats = () => {
        const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();

        // Filter for daily habits only
        const dailyHabits = habits.filter(h => !h.frequency || h.frequency === 'daily');
        const dailyHabitIds = new Set(dailyHabits.map(h => h.id));

        // Total completions this month (only for daily habits)
        const totalCompletions = logs.filter(l => l.status === 1 && dailyHabitIds.has(l.habit_id)).length;

        // Total possible completions
        const totalPossible = dailyHabits.length * daysInMonth;

        // Overall completion rate
        const completionRate = totalPossible > 0 ? ((totalCompletions / totalPossible) * 100).toFixed(1) : 0;

        // Calculate per-habit completion rates (only daily)
        const habitStats = dailyHabits.map(habit => {
            const habitCompletions = logs.filter(l => l.habit_id === habit.id && l.status === 1).length;
            const habitGoal = habit.goal || 30;
            const rate = (habitCompletions / habitGoal) * 100;
            return {
                ...habit,
                completions: habitCompletions,
                rate: rate
            };
        });

        // Best performing habit
        const bestHabit = habitStats.reduce((best, current) =>
            current.rate > best.rate ? current : best
            , habitStats[0] || {});

        // Worst performing habit (needs attention)
        const worstHabit = habitStats.reduce((worst, current) =>
            current.rate < worst.rate ? current : worst
            , habitStats[0] || {});

        // Get last 7 days for weekly stats
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const weeklyLogs = logs.filter(l => {
            const logDate = new Date(l.date);
            return logDate >= sevenDaysAgo && logDate <= today && l.status === 1 && dailyHabitIds.has(l.habit_id);
        });

        const weeklyCompletions = weeklyLogs.length;
        const weeklyPossible = dailyHabits.length * 7;
        const weeklyRate = weeklyPossible > 0 ? ((weeklyCompletions / weeklyPossible) * 100).toFixed(1) : 0;

        return {
            totalCompletions,
            completionRate,
            weeklyCompletions,
            weeklyRate,
            bestHabit,
            worstHabit
        };
    };

    const stats = calculateSummaryStats();

    return (
        <div className="summary-container">
            <div className="summary-card">
                <div className="summary-icon success">
                    <Target size={24} />
                </div>
                <div className="summary-content">
                    <div className="summary-label">Monthly Progress</div>
                    <div className="summary-value">{stats.completionRate}%</div>
                    <div className="summary-subtext">{stats.totalCompletions} completed</div>
                </div>
            </div>

            <div className="summary-card">
                <div className="summary-icon info">
                    <TrendingUp size={24} />
                </div>
                <div className="summary-content">
                    <div className="summary-label">This Week</div>
                    <div className="summary-value">{stats.weeklyRate}%</div>
                    <div className="summary-subtext">{stats.weeklyCompletions} completed</div>
                </div>
            </div>

            <div className="summary-card">
                <div className="summary-icon award">
                    <Award size={24} />
                </div>
                <div className="summary-content">
                    <div className="summary-label">Best Habit</div>
                    <div className="summary-value best-habit">
                        <span className="habit-icon">{stats.bestHabit?.icon}</span>
                        <span className="habit-name-short">{stats.bestHabit?.name}</span>
                    </div>
                    <div className="summary-subtext">{stats.bestHabit?.rate?.toFixed(0)}% complete</div>
                </div>
            </div>

            <div className="summary-card">
                <div className="summary-icon warning">
                    <TrendingDown size={24} />
                </div>
                <div className="summary-content">
                    <div className="summary-label">Needs Attention</div>
                    <div className="summary-value worst-habit">
                        <span className="habit-icon">{stats.worstHabit?.icon}</span>
                        <span className="habit-name-short">{stats.worstHabit?.name}</span>
                    </div>
                    <div className="summary-subtext">{stats.worstHabit?.rate?.toFixed(0)}% complete</div>
                </div>
            </div>
        </div>
    );
};

export default Summary;
