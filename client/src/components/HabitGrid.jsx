import React from 'react';
import { Check, X, GripVertical } from 'lucide-react';
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
const SortableHabitRow = ({ habit, days, getStatus, handleToggle }) => {
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
                        {status === 1 && <Check size={14} strokeWidth={3} />}
                        {status === 2 && <X size={14} strokeWidth={3} />}
                    </div>
                );
            })}
        </div>
    );
};

const HabitGrid = ({ habits, logs, currentMonth, onToggle, onReorder }) => {
    const daysInMonth = new Date(currentMonth.year, currentMonth.month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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

            // Create new full list preserving other habits' positions if needed, 
            // but here we only reorder daily habits relative to each other.
            // We need to construct the full new list to send back to App.jsx
            const newDaily = arrayMove(dailyHabits, oldIndex, newIndex);

            // Re-merge with non-daily habits (which aren't being reordered here)
            // Actually, onReorder expects the full list. 
            // We should append the others at the end or keep their relative positions?
            // Simplest: Daily first, then others. Or just map the new order.

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

    // --- Weekly Logic ---
    // Weeks: 1, 2, 3, 4, 5 (simple division)
    const weeks = [1, 2, 3, 4, 5];

    const handleWeeklyToggle = (habitId, week, currentStatus) => {
        const dateKey = `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-W${week}`;
        // No strict future check for weeks/months for now, or maybe check if current date is in that week?
        // Let's keep it open for flexibility.
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
                <div className="habit-grid-container glass-panel">
                    <div className="grid-header">
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
                                    getStatus={(id, day) => getStatus(id, `${currentMonth.year}-${String(currentMonth.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                                    handleToggle={handleDailyToggle}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
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
