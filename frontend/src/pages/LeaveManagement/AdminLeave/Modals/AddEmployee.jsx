import React, { useState } from 'react';
import './AddEmployee.css';

const AddEmployee = ({ onClose, onAddEmployee }) => {
  const [employeeData, setEmployeeData] = useState({
    name: '',
    department: 'IT',
    selectedLeaveTypes: []
  });

  const [leaveEntitlements, setLeaveEntitlements] = useState({});

  const availableLeaveTypes = [
    'Vacation Leave',
    'Medical Leave',
    'Maternity Leave',
    'Bereavement Leave',
    'Personal Leave'
  ];

  const handleInputChange = (field, value) => {
    setEmployeeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLeaveTypeToggle = (leaveType) => {
    setEmployeeData(prev => {
      const newSelectedTypes = prev.selectedLeaveTypes.includes(leaveType)
        ? prev.selectedLeaveTypes.filter(type => type !== leaveType)
        : [...prev.selectedLeaveTypes, leaveType];

     
      const newEntitlements = { ...leaveEntitlements };
      if (newSelectedTypes.includes(leaveType) && !newEntitlements[leaveType]) {
        newEntitlements[leaveType] = { entitled: 0, used: 0, remaining: 0 };
      } else if (!newSelectedTypes.includes(leaveType) && newEntitlements[leaveType]) {
        delete newEntitlements[leaveType];
      }
      setLeaveEntitlements(newEntitlements);

      return {
        ...prev,
        selectedLeaveTypes: newSelectedTypes
      };
    });
  };

  const handleEntitlementChange = (leaveType, value) => {
    const numValue = parseFloat(value) || 0;
    setLeaveEntitlements(prev => ({
      ...prev,
      [leaveType]: {
        entitled: numValue,
        used: 0,
        remaining: numValue
      }
    }));
  };

  const handleSubmit = () => {
    
    if (!employeeData.name.trim()) {
      alert('Please enter employee name');
      return;
    }

    if (employeeData.selectedLeaveTypes.length === 0) {
      alert('Please select at least one leave type');
      return;
    }

    const newEmployee = {
      name: employeeData.name.trim(),
      department: employeeData.department,
      leaveTypes: { ...leaveEntitlements }
    };

    onAddEmployee(newEmployee);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-employee-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Employee</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
            <div className="form-group">
              <label><strong>Employee Name:</strong></label>
              <input
                type="text"
                value={employeeData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter employee name..."
                required
              />
            </div>

            <div className="form-group">
              <label><strong>Department:</strong></label>
              <select
                value={employeeData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="form-group">
              <label><strong>Eligible for Leave Types:</strong></label>
              <div className="leave-type-checkboxes">
                {availableLeaveTypes.map(leaveType => (
                  <label key={leaveType} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={employeeData.selectedLeaveTypes.includes(leaveType)}
                      onChange={() => handleLeaveTypeToggle(leaveType)}
                    />
                    {leaveType}
                  </label>
                ))}
              </div>
            </div>

            {/* Entitlements Table */}
            {employeeData.selectedLeaveTypes.length > 0 && (
              <div className="entitlements-section">
                <h3>Leave Entitlements</h3>
                {employeeData.selectedLeaveTypes.map(leaveType => (
                  <div key={leaveType} className="entitlement-row">
                    <div className="leave-type-name">{leaveType}</div>
                    <div className="entitlement-input">
                      <label>Entitled Days:</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={leaveEntitlements[leaveType]?.entitled || 0}
                        onChange={(e) => handleEntitlementChange(leaveType, e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="add-btn" onClick={handleSubmit}>
            Add Employee
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;