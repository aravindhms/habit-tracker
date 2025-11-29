import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Save } from 'lucide-react';
import DeleteConfirmModal from './DeleteConfirmModal';

const Admin = ({ habits, onAdd, onUpdate, onDelete, onClose }) => {
    const [newHabit, setNewHabit] = useState({ name: '', icon: '', goal: 30 });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', icon: '', goal: 30 });

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newHabit.name) return;
        onAdd(newHabit);
        setNewHabit({ name: '', icon: '', goal: 30 });
    };

    const startEdit = (habit) => {
        setEditingId(habit.id);
        setEditForm({ name: habit.name, icon: habit.icon, goal: habit.goal });
    };

    const saveEdit = (id) => {
        onUpdate(id, editForm);
        setEditingId(null);
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
                            <label>Monthly Goal</label>
                            <input
                                type="number"
                                value={newHabit.goal}
                                onChange={(e) => setNewHabit({ ...newHabit, goal: parseInt(e.target.value) || 30 })}
                                placeholder="30"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary">
                        <Plus size={18} /> Add Habit
                    </button>
                </form>

                <div className="habits-list">
                    <h3>Existing Habits</h3>
                    {habits.map(habit => (
                        <div key={habit.id} className="habit-item-admin">
                            {editingId === habit.id ? (
                                <div className="edit-mode">
                                    <input
                                        value={editForm.icon}
                                        onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                        className="edit-icon"
                                    />
                                    <input
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="edit-name"
                                    />
                                    <input
                                        type="number"
                                        value={editForm.goal}
                                        onChange={(e) => setEditForm({ ...editForm, goal: parseInt(e.target.value) })}
                                        className="edit-goal"
                                    />
                                    <button onClick={() => saveEdit(habit.id)} className="action-btn save">
                                        <Save size={18} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="habit-info">
                                        <span className="habit-icon">{habit.icon}</span>
                                        <span className="habit-name">{habit.name}</span>
                                        <span className="habit-goal-badge">Goal: {habit.goal}</span>
                                    </div>
                                    <div className="habit-actions">
                                        <button onClick={() => startEdit(habit)} className="action-btn edit">
                                            <Edit2 size={18} />
                                        </button>
                                        <button onClick={() => confirmDelete(habit)} className="action-btn delete">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

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
