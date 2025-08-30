import React, { useState } from 'react';
import './DeclineModal.css';

const DeclineModal = ({ isOpen, onClose, inquiry, onDecline }) => {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setError(null);
  };

  const validateForm = () => {
    if (!notes.trim()) {
      setError('Please provide a reason for declining this inquiry');
      return false;
    }
    return true;
  };

  const handleDecline = () => {
    if (!validateForm()) {
      return;
    }

    onDecline(inquiry, notes.trim());
    setNotes('');
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setNotes('');
    setError(null);
    onClose();
  };

  return (
    <div className="decline-modal-overlay">
      <div className="decline-modal-container">
        <div className="decline-modal-header">
          <h2>Decline Inquiry</h2>
          <button className="decline-close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="decline-modal-content">
          <p>Please provide a reason for declining this inquiry:</p>
          
          <div className="decline-inquiry-details">
            <p><strong>Name:</strong> {inquiry?.name}</p>
            <p><strong>Request:</strong> {inquiry?.requestName}</p>
            <p><strong>Type:</strong> {inquiry?.type}</p>
          </div>

          {error && (
            <div className="decline-error-message">
              {error}
            </div>
          )}

          <div className="decline-form-group">
            <label htmlFor="notes">Reason for Decline *</label>
            <textarea
              id="notes"
              value={notes}
              onChange={handleNotesChange}
              placeholder="Enter the reason for declining this inquiry..."
              rows="4"
              className={error ? 'error' : ''}
            />
          </div>
        </div>

        <div className="decline-modal-actions">
          <button 
            type="button" 
            className="decline-cancel-button" 
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="decline-confirm-button"
            onClick={handleDecline}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeclineModal;