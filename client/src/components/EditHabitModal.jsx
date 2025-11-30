import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const EditHabitModal = ({ isOpen, onClose, onSave, habit }) => {
    const [editForm, setEditForm] = useState({ name: '', icon: '', goal: 30, frequency: 'daily' });

    useEffect(() => {
        if (habit) {
            setEditForm({
                name: habit.name,
                icon: habit.icon,
                goal: habit.goal,
                frequency: habit.frequency || 'daily'
            });
        }
    }, [habit]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(habit.id, editForm);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content edit-modal">
                <div className="modal-header">
                    <h3>Edit Habit</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Habit Name</label>
                        <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="e.g., Read Books"
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Icon</label>
                            <input
                                type="text"
                                value={editForm.icon}
                                onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                className="icon-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Frequency</label>
                            <select
                                value={editForm.frequency}
                                onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">
                            <Save size={18} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditHabitModal;
