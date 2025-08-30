import React, { useState } from 'react';
import './SubmitInquiryModal.css';
import api from '../../../api/api';

const SubmitInquiryModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    requestName: '',
    type: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.requestName || !formData.type || !formData.description) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);

    try {
      // post to backend
      const res = await api.post("/inquiries/create", {
        requestName: formData.requestName,
        type: formData.type,
        description: formData.description
      });
      if (onSubmit) onSubmit(res.data);
      setFormData({ requestName: '', type: '', description: '' });
      onClose();
    } catch (err) {
      alert("Error submitting inquiry: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ requestName: '', type: '', description: '' });
    onClose();
  };

  return (
    <div className="submit-modal-overlay">
      <div className="submit-modal-container">
        <div className="submit-modal-header">
          <h2>Submit New Inquiry</h2>
          <button className="submit-close-button" onClick={handleCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="submit-modal-content">
          <div className="empInquiry-form-group">
            <label htmlFor="requestName">Request Name *</label>
            <input
              type="text"
              id="requestName"
              name="requestName"
              value={formData.requestName}
              onChange={handleInputChange}
              placeholder="e.g., Leave Request, Equipment Request"
              required
            />
          </div>

          <div className="empInquiry-form-group">
            <label htmlFor="type">Type *</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Type</option>
              <option value="Leave Request">Leave Request</option>
              <option value="Overtime Request">Overtime Request</option>
              <option value="Information Update">Information Update</option>
              <option value="Timesheet Correction">Timesheet Correction</option>
              <option value="Document Request">Document Request</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="empInquiry-form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Please provide details about your request..."
              rows="4"
              required
            />
          </div>

          <div className="submit-modal-actions">
            <button 
              type="button" 
              className="submit-cancel-button" 
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-confirm-button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Inquiry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitInquiryModal;