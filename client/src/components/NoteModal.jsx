import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const NoteModal = ({ isOpen, onClose, onSave, initialNote, date, habitName }) => {
    const [note, setNote] = useState(initialNote || '');

    useEffect(() => {
        setNote(initialNote || '');
    }, [initialNote, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(note);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content note-modal">
                <div className="modal-header">
                    <h3>Note for {habitName}</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="modal-body">
                    <p className="note-date">{date}</p>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note about your progress..."
                        rows={5}
                        autoFocus
                    />
                </div>
                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>
                        <Save size={16} />
                        Save Note
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NoteModal;
