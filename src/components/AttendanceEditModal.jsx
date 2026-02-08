import { useState } from 'react';
import { Edit2, X, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from './common/Modal';

const AttendanceEditModal = ({ isOpen, onClose, record, onSave }) => {
    const [status, setStatus] = useState(record?.status || 'present');
    const [editReason, setEditReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editReason.trim()) {
            setError('Please provide a reason for editing attendance');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSave({
                id: record.id,
                status,
                editReason
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update attendance');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Attendance Record">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Student</label>
                    <input
                        type="text"
                        value={record?.student_name || 'Unknown'}
                        disabled
                        style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                    />
                </div>

                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="text"
                        value={record?.date || 'N/A'}
                        disabled
                        style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}
                    />
                </div>

                <div className="form-group">
                    <label>Current Status</label>
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', marginBottom: '0.5rem' }}>
                        <span className={`badge ${record?.status === 'present' ? 'badge-success' : 'badge-error'}`}>
                            {record?.status || 'Unknown'}
                        </span>
                    </div>
                </div>

                <div className="form-group">
                    <label>New Status *</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                    >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Reason for Edit *</label>
                    <textarea
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="Explain why this attendance record is being changed..."
                        rows={4}
                        required
                        style={{ resize: 'vertical', minHeight: '100px' }}
                    />
                    <small className="text-dim">This will be logged for audit purposes</small>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        <X size={20} />
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <CheckCircle size={20} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AttendanceEditModal;
