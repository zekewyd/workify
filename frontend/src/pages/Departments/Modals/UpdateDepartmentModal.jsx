import React, { useState, useEffect } from "react";
import "./UpdateDepartmentModal.css";

function UpdateDepartmentModal({ isOpen, onClose, department, onUpdateDepartment }) {
  const [formData, setFormData] = useState({
    departmentName: "",
    jobTitles: [""],
  });

  useEffect(() => {
    if (department) {
      setFormData({
        departmentName: department.departmentName || "",
        jobTitles: department.jobTitles && department.jobTitles.length > 0 ? department.jobTitles : [""],
      });
    }
  }, [department]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleJobTitleChange = (index, value) => {
    const updated = [...formData.jobTitles];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      jobTitles: updated,
    }));
  };

  const addJobTitle = () => {
    setFormData((prev) => ({
      ...prev,
      jobTitles: [...prev.jobTitles, ""],
    }));
  };

  const removeJobTitle = (index) => {
    const updated = [...formData.jobTitles];
    updated.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      jobTitles: updated.length > 0 ? updated : [""],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdateDepartment(department._id, formData);
      onClose();
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="updateDept-modal-overlay">
      <div className="updateDept-modal-content">
        <div className="updateDept-modal-header">
            <h2>Update Department</h2>
            <button className="updateDept-modal-close" onClick={onClose}>
                &times;
            </button>
        </div>

        <form onSubmit={handleSubmit} className="updateDept-form">
          <div className="form-group">
            <label htmlFor="departmentName">Department Name</label>
            <input
              type="text"
              id="departmentName"
              name="departmentName"
              value={formData.departmentName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Job Titles</label>
            {formData.jobTitles.map((jt, index) => (
              <div key={index} className="jobtitle-row">
                <input
                  type="text"
                  value={jt}
                  onChange={(e) => handleJobTitleChange(index, e.target.value)}
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="remove-jobtitle-btn"
                  onClick={() => removeJobTitle(index)}
                  disabled={formData.jobTitles.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="add-jobtitle-btn"
              onClick={addJobTitle}
            >
              + Add Job Title
            </button>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Update Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UpdateDepartmentModal;