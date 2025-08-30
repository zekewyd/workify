import React from 'react';
import './ApproveModal.css';

const ApproveModal = ({ isOpen, onClose, inquiry, onApprove }) => {
  if (!isOpen) return null;

  const handleApprove = () => {
    onApprove(inquiry);
    onClose();
  };

  return (
    <div className="approve-modal-overlay">
      <div className="approve-modal-container">
        <div className="approve-modal-header">
          <h2>Approve Inquiry</h2>
          <button className="approve-close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="approve-modal-content">
          <p>Are you sure you want to approve this inquiry?</p>
          <div className="approve-inquiry-details">
            <p><strong>Name:</strong> {inquiry?.name}</p>
            <p><strong>Request:</strong> {inquiry?.requestName}</p>
            <p><strong>Type:</strong> {inquiry?.type}</p>
          </div>
        </div>

        <div className="approve-modal-actions">
          <button 
            type="button" 
            className="approve-cancel-button" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="approve-confirm-button"
            onClick={handleApprove}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;