import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

const Charts = ({ logs, currentMonth, habits }) => {
    const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Filter for daily habits
    const dailyHabits = habits ? habits.filter(h => !h.frequency || h.frequency === 'daily') : [];
    const dailyHabitIds = new Set(dailyHabits.map(h => h.id));
    const totalDailyHabits = dailyHabits.length;

    // Calculate daily completion percentage
    const progressData = labels.map(day => {
        const dateStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayLogs = logs.filter(l => l.date === dateStr && l.status === 1 && dailyHabitIds.has(l.habit_id));

        return totalDailyHabits > 0 ? (dayLogs.length / totalDailyHabits) * 100 : 0;
    });

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
            },
        },
        elements: {
            line: {
                tension: 0.4, // Smooth curves
            },
        },
    };

    const progressChartData = {
        labels,
        datasets: [
            {
                fill: true,
                label: 'Progress %',
                data: progressData,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
        ],
    };

    return (
        <div className="charts-container">
            <div className="chart-wrapper glass-panel">
                <h3>Daily Progress</h3>
                <div style={{ height: '250px' }}>
                    <Line options={commonOptions} data={progressChartData} />
                </div>
            </div>
        </div>
    );
};

export default Charts;
