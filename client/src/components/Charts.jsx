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

const Charts = ({ logs, currentMonth }) => {
    const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Calculate daily completion percentage
    const progressData = labels.map(day => {
        const dateStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayLogs = logs.filter(l => l.date === dateStr && l.status === 1);
        // Assuming 10 habits total for percentage calculation, or dynamic based on habits count
        // For now, let's assume 10 habits is 100%
        return (dayLogs.length / 10) * 100;
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
