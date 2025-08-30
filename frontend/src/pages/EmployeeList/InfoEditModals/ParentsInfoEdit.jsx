import React, { useState, useEffect } from "react";
import "../EmployeeDetails.css";
import api from "../../../api/api";

function ParentsInfoEdit({ employee, onSave, onClose }) {
  const [formData, setFormData] = useState({
    motherMaidenName: employee.motherMaidenName || '',
    motherPhoneNumber: employee.motherPhoneNumber || '',
    motherOccupation: employee.motherOccupation || '',
    motherStatus: employee.motherStatus || '',
    motherAddress: employee.motherAddress || '',
    fatherMaidenName: employee.fatherMaidenName || '',
    fatherPhoneNumber: employee.fatherPhoneNumber || '',
    fatherOccupation: employee.fatherOccupation || '',
    fatherStatus: employee.fatherStatus || '',
    fatherAddress: employee.fatherAddress || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // map frontend
      const payload = {
        motherName: formData.motherMaidenName,
        mPhoneNo: formData.motherPhoneNumber,
        mOccupation: formData.motherOccupation,
        mAddress: formData.motherAddress,
        mStatus: formData.motherStatus,
        fatherName: formData.fatherMaidenName,
        fPhoneNo: formData.fatherPhoneNumber,
        fOccupation: formData.fatherOccupation,
        fAddress: formData.fatherAddress,
        fStatus: formData.fatherStatus
      };
      console.log("Submitting payload:", payload);
      const { data } = await api.put(`/emp-info/parents/${employee.pInfoID}`, payload);
      if (onSave) onSave(data);
      onClose();
    } catch (err) {
      console.log("Error from API:", err.response?.data);
      setError(err.response?.data?.message || "Failed to update parents info");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="section-edit-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h3>Edit Parents Information</h3>
        
        <div className="section-edit-form">
          <h4>Mother's Information</h4>
          <div className="form-row">
            <div className="input-group">
              <label>Mother's Maiden Name</label>
              <input
                type="text"
                value={formData.motherMaidenName}
                onChange={(e) => handleInputChange('motherMaidenName', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.motherPhoneNumber}
                onChange={(e) => handleInputChange('motherPhoneNumber', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Occupation</label>
              <input
                type="text"
                value={formData.motherOccupation}
                onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Status</label>
              <select
                value={formData.motherStatus}
                onChange={(e) => handleInputChange('motherStatus', e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="alive">Alive</option>
                <option value="deceased">Deceased</option>
              </select>
            </div>
          </div>
          <div className="input-group full-width">
            <label>Address</label>
            <textarea
              value={formData.motherAddress}
              onChange={(e) => handleInputChange('motherAddress', e.target.value)}
              rows="2"
            />
          </div>

          <h4>Father's Information</h4>
          <div className="form-row">
            <div className="input-group">
              <label>Father's Name</label>
              <input
                type="text"
                value={formData.fatherMaidenName}
                onChange={(e) => handleInputChange('fatherMaidenName', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.fatherPhoneNumber}
                onChange={(e) => handleInputChange('fatherPhoneNumber', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="input-group">
              <label>Occupation</label>
              <input
                type="text"
                value={formData.fatherOccupation}
                onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Status</label>
              <select
                value={formData.fatherStatus}
                onChange={(e) => handleInputChange('fatherStatus', e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="alive">Alive</option>
                <option value="deceased">Deceased</option>
              </select>
            </div>
          </div>
          <div className="input-group full-width">
            <label>Address</label>
            <textarea
              value={formData.fatherAddress}
              onChange={(e) => handleInputChange('fatherAddress', e.target.value)}
              rows="2"
            />
          </div>
        </div>

        <div className="role-modal-actions">
          <button className="confirm-button" onClick={handleSubmit} disabled={loading}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParentsInfoEdit;