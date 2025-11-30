import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditHabitModal from './EditHabitModal';

const Admin = ({ habits, onAdd, onUpdate, onDelete, onClose }) => {
    const [newHabit, setNewHabit] = useState({ name: '', icon: '', goal: 30, frequency: 'daily' });

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [habitToEdit, setHabitToEdit] = useState(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newHabit.name) return;
        onAdd(newHabit);
        setNewHabit({ name: '', icon: '', goal: 30, frequency: 'daily' });
    };

    const startEdit = (habit) => {
        setHabitToEdit(habit);
        setEditModalOpen(true);
    };

    const handleSaveEdit = (id, updatedHabit) => {
        onUpdate(id, updatedHabit);
        setEditModalOpen(false);
        setHabitToEdit(null);
    };

    const confirmDelete = (habit) => {
        setHabitToDelete(habit);
        setDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (habitToDelete) {
            onDelete(habitToDelete.id);
            setDeleteModalOpen(false);
            setHabitToDelete(null);
        }
    };

    return (
        <div className="admin-panel glass-panel">
            <div className="admin-header">
                <h2>Manage Habits</h2>
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
            </div>

            <div className="admin-content">
                <form onSubmit={handleSubmit} className="habit-form">
                    <h3>Add New Habit</h3>
                    <div className="form-group">
                        <label>Habit Name</label>
                        <input
                            type="text"
                            value={newHabit.name}
                            onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                            placeholder="e.g., Read Books"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Icon (Emoji)</label>
                            <input
                                type="text"
                                value={newHabit.icon}
                                onChange={(e) => setNewHabit({ ...newHabit, icon: e.target.value })}
                                placeholder="📚"
                                className="icon-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Frequency</label>
                            <select
                                value={newHabit.frequency}
                                onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn-primary">
                        <Plus size={18} /> Add Habit
                    </button>
                </form>

                <div className="habits-section">
                    <h3>Existing Habits</h3>

                    {['daily', 'weekly', 'monthly'].map(freq => {
                        const freqHabits = habits.filter(h => (h.frequency || 'daily') === freq);
                        if (freqHabits.length === 0) return null;

                        return (
                            <div key={freq} className="habit-category-group">
                                <h4 style={{ textTransform: 'capitalize', margin: '1rem 0 0.5rem', color: 'rgba(255,255,255,0.7)' }}>{freq} Habits</h4>
                                <div className="habits-grid">
                                    {freqHabits.map(habit => (
                                        <div key={habit.id} className="habit-item-admin">
                                            <div className="habit-info">
                                                <span className="habit-icon">{habit.icon}</span>
                                                <span className="habit-name">{habit.name}</span>
                                                <span className="habit-goal-badge" style={{ marginLeft: '8px' }}>
                                                    {habit.frequency || 'daily'}
                                                </span>
                                            </div>
                                            <div className="habit-actions">
                                                <button onClick={() => startEdit(habit)} className="action-btn edit">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => confirmDelete(habit)} className="action-btn delete">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <EditHabitModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                onSave={handleSaveEdit}
                habit={habitToEdit}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={executeDelete}
                habitName={habitToDelete?.name}
            />
        </div>
    );
};

export default Admin;
