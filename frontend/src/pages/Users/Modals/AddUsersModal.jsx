import React, { useState } from 'react';
import './AddUsersModal.css';

const AddUsersModal = ({ isOpen, onClose, onAddUser }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'hr', label: 'HR' },
    { value: 'employee', label: 'Employee' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Validate password max length
    if (formData.password.length > 21) {
      setError('Password cannot exceed 21 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // The onAddUser function will handle the API call
      await onAddUser(formData);
      
      // Reset form on successful submission
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'employee'
      });
      
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'employee'
    });
    setError(null);
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="addUser-modal-overlay">
      <div className="addUser-modal-container">
        <div className="addUser-modal-header">
          <h2>Add New User</h2>
          <button className="addUser-close-button" onClick={handleClose}>×</button>
        </div>
        
        {error && (
          <div className="addUser-error-message" style={{
            backgroundColor: '#fee',
            color: '#c53030',
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '4px',
            border: '1px solid #fc8181'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="addUser-form">
          <div className="addUser-form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              placeholder="Enter username"
              disabled={loading}
            />
          </div>

          <div className="addUser-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter email address"
              disabled={loading}
            />
          </div>

          <div className="addUser-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Enter password (6-21 characters)"
              minLength="6"
              maxLength="21"
              disabled={loading}
            />
          </div>

          <div className="addUser-form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div className="addUser-form-actions">
            <button 
              type="button" 
              className="addUser-cancel-button" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="addUser-submit-button"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUsersModal;