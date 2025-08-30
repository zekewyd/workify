import React, { useState, useEffect } from "react";
import "./UpdateUsersModal.css";

const UpdateUserModal = ({ isOpen, onClose, user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    createdAt: ""
  });

  const roleOptions = [
    "admin",
    "hr",
    "employee"
  ];

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        role: user.role || "",
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : ""
      });
    }
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      // Map the form data to match backend expectations
      const updateData = {
        username: formData.username,
        email: formData.email,
        role: formData.role
      };
      
      onUpdateUser(user._id, updateData);
    }
    onClose();
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        role: user.role || "",
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : ""
      });
    }
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <div className="update-user-modal-overlay">
      <div className="update-user-modal-content">
        <div className="update-user-modal-header">
          <h2>Update User Information</h2>
          <button 
            className="update-user-modal-close"
            onClick={handleCancel}
            type="button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="update-user-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
              required
            >
              <option value="">Select Role</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="createdAt">Hired Date</label>
            <input
              type="date"
              id="createdAt"
              name="createdAt"
              value={formData.createdAt}
              onChange={handleInputChange}
              className="form-input"
              disabled
              readOnly
            />
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserModal;