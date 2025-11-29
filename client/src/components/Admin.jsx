import React, { useState } from 'react';
import { Trash2, Edit2, Plus, Save, X as XIcon } from 'lucide-react';

const Admin = ({ habits, onAdd, onUpdate, onDelete, onClose }) => {
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: '', icon: '', goal: 30 });
    const [isAdding, setIsAdding] = useState(false);

    const handleEditClick = (habit) => {
        setEditingId(habit.id);
        setFormData({ name: habit.name, icon: habit.icon, goal: habit.goal });
        setIsAdding(false);
    };

    const handleAddClick = () => {
        setEditingId(null);
        setFormData({ name: '', icon: '', goal: 30 });
        setIsAdding(true);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsAdding(false);
    };

    const handleSave = async () => {
        if (isAdding) {
            await onAdd(formData);
        } else {
            await onUpdate(editingId, formData);
        }
        handleCancel();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this habit? All logs will be lost.')) {
            await onDelete(id);
        }
    };

    return (
        <div className="admin-container glass-panel">
            <div className="admin-header">
                <h2>Manage Habits</h2>
                <button className="close-btn" onClick={onClose}><XIcon size={20} /></button>
            </div>

            <div className="admin-actions">
                {!isAdding && !editingId && (
                    <button className="btn-primary" onClick={handleAddClick}>
                        <Plus size={16} /> Add New Habit
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="habit-form glass-panel">
                    <h3>{isAdding ? 'Add Habit' : 'Edit Habit'}</h3>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Gym"
                        />
                    </div>
                    <div className="form-group">
                        <label>Icon (Emoji)</label>
                        <input
                            type="text"
                            value={formData.icon}
                            onChange={e => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="e.g. 💪"
                            maxLength="2"
                        />
                    </div>
                    <div className="form-group">
                        <label>Monthly Goal</label>
                        <input
                            type="number"
                            value={formData.goal}
                            onChange={e => setFormData({ ...formData, goal: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="form-actions">
                        <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
                        <button className="btn-primary" onClick={handleSave}>
                            <Save size={16} /> Save
                        </button>
                    </div>
                </div>
            )}

            <div className="habits-list">
                {habits.map(habit => (
                    <div key={habit.id} className="habit-list-item">
                        <div className="habit-info">
                            <span className="habit-icon">{habit.icon}</span>
                            <span className="habit-name">{habit.name}</span>
                            <span className="habit-goal">Goal: {habit.goal}</span>
                        </div>
                        <div className="habit-actions">
                            <button className="btn-icon" onClick={() => handleEditClick(habit)}>
                                <Edit2 size={16} />
                            </button>
                            <button className="btn-icon delete" onClick={() => handleDelete(habit.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;
