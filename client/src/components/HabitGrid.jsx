import React, { useState, useEffect } from 'react';
import { Check, X, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Row Component
const SortableHabitRow = ({ habit, days, getStatus, handleToggle, isMobile }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: habit.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 'auto',
        position: 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} className="habit-row">
            <div className="habit-name">
                <div {...attributes} {...listeners} className="drag-handle" style={{ cursor: 'grab', marginRight: '8px', display: 'flex', alignItems: 'center' }}>
                    <GripVertical size={16} color="rgba(255,255,255,0.3)" />
                </div>
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
                        {status === 1 && <Check size={isMobile ? 16 : 14} strokeWidth={3} />}
                        {status === 2 && <X size={isMobile ? 16 : 14} strokeWidth={3} />}
                    </div>
                );
            })}
        </div>
    );
};

const HabitGrid = ({ habits, logs, currentMonth, onToggle, onReorder }) => {
    const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
    const allDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Mobile detection
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [currentWeek, setCurrentWeek] = useState(0);

    // Calculate weeks for the month
    const getWeeksInMonth = () => {
        const weeks = [];
        for (let i = 0; i < daysInMonth; i += 7) {
            const weekDays = allDays.slice(i, Math.min(i + 7, daysInMonth));
            weeks.push(weekDays);
        }
        return weeks;
    };

    const weeksInMonth = getWeeksInMonth();
    const totalWeeks = weeksInMonth.length;

    // Get days for current view
    const days = isMobile ? weeksInMonth[currentWeek] || [] : allDays;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset week when month changes
    useEffect(() => {
        setCurrentWeek(0);
    }, [currentMonth]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // --- Filter Habits ---
    const dailyHabits = habits.filter(h => !h.frequency || h.frequency === 'daily');
    const weeklyHabits = habits.filter(h => h.frequency === 'weekly');
    const monthlyHabits = habits.filter(h => h.frequency === 'monthly');

    // --- Helpers ---
    const getStatus = (habitId, dateKey) => {
        const log = logs.find(l => l.habit_id === habitId && l.date === dateKey);
        return log ? log.status : 0;
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = dailyHabits.findIndex((h) => h.id === active.id);
            const newIndex = dailyHabits.findIndex((h) => h.id === over.id);
            const newDaily = arrayMove(dailyHabits, oldIndex, newIndex);
            const newHabits = [...newDaily, ...weeklyHabits, ...monthlyHabits];
            onReorder(newHabits);
        }
    };

    // --- Daily Logic ---
    const handleDailyToggle = (habitId, day, currentStatus) => {
        const dateStr = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Future check
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [y, m, d] = dateStr.split('-').map(Number);
        const cellDate = new Date(y, m - 1, d);

        if (cellDate > today) return;

        let nextStatus = currentStatus === 0 ? 1 : currentStatus === 1 ? 2 : 0;
        onToggle(habitId, dateStr, nextStatus);
    };

    // Week navigation
    const goToPrevWeek = () => {
        setCurrentWeek(prev => Math.max(0, prev - 1));
    };

    const goToNextWeek = () => {
        setCurrentWeek(prev => Math.min(totalWeeks - 1, prev + 1));
    };

    // Get week date range for display
    const getWeekRange = () => {
        if (!isMobile || !weeksInMonth[currentWeek]) return '';
        const weekDays = weeksInMonth[currentWeek];
        const startDay = weekDays[0];
        const endDay = weekDays[weekDays.length - 1];
        return `${startDay} - ${endDay}`;
    };

    // --- Weekly Logic ---
    const weeks = [1, 2, 3, 4, 5];

    const handleWeeklyToggle = (habitId, week, currentStatus) => {
        const dateKey = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-W${week}`;
        let nextStatus = currentStatus === 0 ? 1 : currentStatus === 1 ? 2 : 0;
        onToggle(habitId, dateKey, nextStatus);
    };

    // --- Monthly Logic ---
    const handleMonthlyToggle = (habitId, currentStatus) => {
        const dateKey = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;
        let nextStatus = currentStatus === 0 ? 1 : currentStatus === 1 ? 2 : 0;
        onToggle(habitId, dateKey, nextStatus);
    };

    return (
        <div className="habit-grid-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* DAILY HABITS */}
            {dailyHabits.length > 0 && (
                <div className={`habit-grid-container glass-panel ${isMobile ? 'mobile-paginated' : ''}`}>
                    {/* Mobile Week Navigation */}
                    {isMobile && (
                        <div className="week-pagination">
                            <button
                                className="week-nav-btn"
                                onClick={goToPrevWeek}
                                disabled={currentWeek === 0}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <div className="week-indicator">
                                <span className="week-label">Week {currentWeek + 1}</span>
                                <span className="week-dates">Days {getWeekRange()}</span>
                            </div>
                            <button
                                className="week-nav-btn"
                                onClick={goToNextWeek}
                                disabled={currentWeek === totalWeeks - 1}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    <div className={`grid-header ${isMobile ? 'mobile-grid' : ''}`}>
                        <div className="habit-name-header">Daily Habits</div>
                        {days.map(day => (
                            <div key={day} className="day-header">
                                <span className="day-num">{day}</span>
                            </div>
                        ))}
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={dailyHabits.map(h => h.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {dailyHabits.map(habit => (
                                <SortableHabitRow
                                    key={habit.id}
                                    habit={habit}
                                    days={days}
                                    isMobile={isMobile}
                                    getStatus={(id, day) => getStatus(id, `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                                    handleToggle={handleDailyToggle}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {/* Mobile Week Dots */}
                    {isMobile && (
                        <div className="week-dots">
                            {weeksInMonth.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`week-dot ${idx === currentWeek ? 'active' : ''}`}
                                    onClick={() => setCurrentWeek(idx)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* WEEKLY TASKS */}
            {weeklyHabits.length > 0 && (
                <div className="habit-grid-container glass-panel weekly-grid">
                    <div className="section-header" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3>Weekly Tasks</h3>
                    </div>
                    <div className="grid-header">
                        <div className="habit-name-header">Task</div>
                        {weeks.map(week => (
                            <div key={week} className="day-header" style={{ width: '60px' }}>
                                <span className="day-num">W{week}</span>
                            </div>
                        ))}
                    </div>
                    {weeklyHabits.map(habit => (
                        <div key={habit.id} className="habit-row">
                            <div className="habit-name">
                                <span className="habit-icon">{habit.icon}</span>
                                {habit.name}
                            </div>
                            {weeks.map(week => {
                                const dateKey = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-W${week}`;
                                const status = getStatus(habit.id, dateKey);
                                return (
                                    <div
                                        key={week}
                                        className={`habit-cell ${status === 1 ? 'completed' : status === 2 ? 'failed' : ''}`}
                                        onClick={() => handleWeeklyToggle(habit.id, week, status)}
                                        style={{ width: '60px' }}
                                    >
                                        {status === 1 && <Check size={14} strokeWidth={3} />}
                                        {status === 2 && <X size={14} strokeWidth={3} />}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}

            {/* MONTHLY TASKS */}
            {monthlyHabits.length > 0 && (
                <div className="habit-grid-container glass-panel monthly-grid">
                    <div className="section-header" style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3>Monthly Tasks</h3>
                    </div>
                    <div className="grid-header">
                        <div className="habit-name-header">Task</div>
                        <div className="day-header" style={{ width: '100px', flex: 1 }}>
                            <span className="day-num">Status</span>
                        </div>
                    </div>
                    {monthlyHabits.map(habit => (
                        <div key={habit.id} className="habit-row">
                            <div className="habit-name">
                                <span className="habit-icon">{habit.icon}</span>
                                {habit.name}
                            </div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                {(() => {
                                    const dateKey = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}`;
                                    const status = getStatus(habit.id, dateKey);
                                    return (
                                        <div
                                            className={`habit-cell ${status === 1 ? 'completed' : status === 2 ? 'failed' : ''}`}
                                            onClick={() => handleMonthlyToggle(habit.id, status)}
                                            style={{ width: '100px', height: '30px', borderRadius: '6px' }}
                                        >
                                            {status === 1 && <Check size={14} strokeWidth={3} />}
                                            {status === 2 && <X size={14} strokeWidth={3} />}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
};

export default HabitGrid;
