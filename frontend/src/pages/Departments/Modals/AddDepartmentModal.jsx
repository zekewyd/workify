import React, { useState } from 'react';
import './AddDepartmentModal.css';
import api from '../../../api/api';

const AddDepartmentModal = ({ isOpen, onClose, onAddDepartment }) => {
  const [formData, setFormData] = useState({
    departmentName: "",
    jobTitles: [""],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleJobTitleChange = (index, value) => {
    const updated = [...formData.jobTitles];
    updated[index] = value;
    setFormData(prev => ({ ...prev, jobTitles: updated }));
  };

  const addJobTitleField = () => {
    setFormData(prev => ({ ...prev, jobTitles: [...prev.jobTitles, ""] }));
  };

  const removeJobTitleField = (index) => {
    const updated = formData.jobTitles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, jobTitles: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.departmentName.trim() || formData.jobTitles.some((jt) => !jt.trim())) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newDepartment = {
        departmentName: formData.departmentName.trim(),
        jobTitles: formData.jobTitles.map((jt) => jt.trim()),
      };

      const response = await api.post('/department/create', newDepartment);
      
      onAddDepartment(response.data);
      
      setFormData({
        departmentName: "",
        jobTitles: [""]
      });   
      onClose();
    } catch (err) {
      console.error('Error adding department:', err);
      setError(err.response?.data?.message || 'Failed to add department. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      departmentName: "",
      jobTitles: [""]
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="add-department-modal-overlay" onClick={handleClose}>
      <div className="add-department-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="add-department-modal-header">
          <h2>Add New Department</h2>
          <button className="add-department-close-button" onClick={handleClose}>×</button>
        </div>
        
        {error && (
          <div className="add-department-error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="add-department-form">
          <div className="add-department-form-group">
            <label htmlFor="departmentName">Department Name</label>
            <input
              type="text"
              id="departmentName"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleInputChange}
              placeholder="Enter department name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="add-department-form-group">
            <label>Job Titles</label>
            {formData.jobTitles.map((jobTitle, index) => (
              <div key={index} className="job-title-row">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => handleJobTitleChange(index, e.target.value)}
                  placeholder="Enter job title"
                  required
                  disabled={isLoading}
                />
                {formData.jobTitles.length > 1 && (
                  <button
                    type="button"
                    className="remove-job-title-btn"
                    onClick={() => removeJobTitleField(index)}
                    disabled={isLoading}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="add-job-title-btn"
              onClick={addJobTitleField}
              disabled={isLoading}
            >
              + Add Job Title
            </button>
          </div>

          <div className="add-department-form-actions">
            <button 
              type="button" 
              className="add-department-cancel-button" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="add-department-submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartmentModal;