import React, { useState, useMemo } from 'react';
import AddEmployee from './Modals/AddEmployee';
import './AdminLeaveBalances.css';

const AdminLeaveBalances = () => {
  const [filters, setFilters] = useState({
    employee: '',
    department: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [leaveBalancesData, setLeaveBalancesData] = useState({
    'Regine Hambiol': {
      department: 'IT',
      leaveTypes: {
        'Vacation Leave': { entitled: 15.00, used: 14.50, remaining: 0.50 },
        'Medical Leave': { entitled: 7.00, used: 2.00, remaining: 5.00 },
        'Maternity Leave': { entitled: 105.00, used: 0.00, remaining: 105.00 },
        
      }
    },
    'Lim Alcovendas': {
      department: 'HR',
      leaveTypes: {
        'Vacation Leave': { entitled: 15.00, used: 13.00, remaining: 2.00 },
        'Medical Leave Leave': { entitled: 7.00, used: 3.00, remaining: 4.00 },
        'Bereavement Leave': { entitled: 3.00, used: 0.00, remaining: 3.00 },
       
      }
    },
    'Kai Cruz': {
      department: 'Finance',
      leaveTypes: {
        'Vacation Leave': { entitled: 15.00, used: 13.50, remaining: 1.50 },
        'Medical Leave': { entitled: 7.00, used: 1.00, remaining: 6.00 },
        'Personal Leave': { entitled: 5.00, used: 2.00, remaining: 3.00 }
      }
    },
    'Klei Ishia Pagatpatan': {
      department: 'Operations',
      leaveTypes: {
        'Vacation Leave': { entitled: 15.00, used: 13.00, remaining: 2.00 },
        'Medical Leave': { entitled: 7.00, used: 4.00, remaining: 3.00 },
        'Maternity Leave': { entitled: 105.00, used: 0.00, remaining: 105.00 },
       
      }
    },
    'Ezekiel Olasiman': {
      department: 'IT',
      leaveTypes: {
        'Vacation Leave': { entitled: 15.00, used: 14.00, remaining: 1.00 },
        'Medical Leave': { entitled: 7.00, used: 6.00, remaining: 1.00 },
        'Maternity Leave': { entitled: 3.00, used: 2.00, remaining: 1.00 }
        
      }
    }
  });

  const [modalData, setModalData] = useState({});
  const [editableEmployeeData, setEditableEmployeeData] = useState({
    name: '',
    department: '',
    eligibleLeaveTypes: []
  });

  const employees = useMemo(() => {
    return Object.entries(leaveBalancesData).map(([name, data]) => ({
      name,
      department: data.department
    }));
  }, [leaveBalancesData]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesEmployee = !filters.employee || employee.name.toLowerCase().includes(filters.employee.toLowerCase());
      const matchesDepartment = !filters.department || employee.department === filters.department;
      
      return matchesEmployee && matchesDepartment;
    });
  }, [filters, employees]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReset = () => {
    setFilters({
      employee: '',
      department: ''
    });
  };

  const handleViewBalance = (employeeName) => {
    setSelectedEmployee(employeeName);
    setModalData({ ...leaveBalancesData[employeeName].leaveTypes });
    setEditableEmployeeData({
      name: employeeName,
      department: leaveBalancesData[employeeName].department,
      eligibleLeaveTypes: Object.keys(leaveBalancesData[employeeName].leaveTypes)
    });
    setShowModal(true);
  };

  const handleModalInputChange = (leaveType, field, value) => {
    const numValue = parseFloat(value) || 0;
    setModalData(prev => {
      const newData = { ...prev };
      newData[leaveType] = { ...newData[leaveType], [field]: numValue };
      
     
      if (field === 'entitled' || field === 'used') {
        newData[leaveType].remaining = newData[leaveType].entitled - newData[leaveType].used;
      }
      
      return newData;
    });
  };

  const handleEmployeeDataChange = (field, value) => {
    setEditableEmployeeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLeaveTypeToggle = (leaveType) => {
    setEditableEmployeeData(prev => {
      const newEligibleTypes = prev.eligibleLeaveTypes.includes(leaveType)
        ? prev.eligibleLeaveTypes.filter(type => type !== leaveType)
        : [...prev.eligibleLeaveTypes, leaveType];
      
     
      const newModalData = { ...modalData };
      if (newEligibleTypes.includes(leaveType) && !modalData[leaveType]) {
        newModalData[leaveType] = { entitled: 0, used: 0, remaining: 0 };
      } else if (!newEligibleTypes.includes(leaveType) && modalData[leaveType]) {
        delete newModalData[leaveType];
      }
      setModalData(newModalData);
      
      return {
        ...prev,
        eligibleLeaveTypes: newEligibleTypes
      };
    });
  };

  const handleSaveChanges = () => {
    const oldEmployeeName = selectedEmployee;
    const newEmployeeName = editableEmployeeData.name;
    
   
    const newEmployeeData = {
      department: editableEmployeeData.department,
      leaveTypes: { ...modalData }
    };
    
    setLeaveBalancesData(prev => {
      const newData = { ...prev };
      
    
      if (oldEmployeeName !== newEmployeeName && newData[oldEmployeeName]) {
        delete newData[oldEmployeeName];
      }
      
      
      newData[newEmployeeName] = newEmployeeData;
      
      return newData;
    });
    
    setShowModal(false);
  };

  const handleAddEmployee = (newEmployeeData) => {
    setLeaveBalancesData(prev => ({
      ...prev,
      [newEmployeeData.name]: {
        department: newEmployeeData.department,
        leaveTypes: newEmployeeData.leaveTypes
      }
    }));
  };

  const calculateUsagePercentage = (used, entitled) => {
    if (entitled === 0) return 0;
    return (used / entitled) * 100;
  };

  const getLeaveTypeColor = (leaveType) => {
    switch (leaveType) {
      case 'Vacation Leave':
        return 'leave-type-vacation';
      case 'Medical Leave':
        return 'leave-type-medical';
      case 'Maternity Leave':
        return 'leave-type-maternity';
      case 'Bereavement Leave':
        return 'leave-type-bereavement';
      case 'Personal Leave':
        return 'leave-type-personal';
      default:
        return '';
    }
  };

  const availableLeaveTypes = [
    'Vacation Leave',
    'Medical Leave', 
    'Maternity Leave',
    'Bereavement Leave',
    'Personal Leave'
  ];

  return (
    <div className="leave-balances">
      <div className="filter-section">
        <div className="filter-content">
          <div className="search-group">
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.employee}
              onChange={(e) => handleFilterChange('employee', e.target.value)}
              className="main-search-bar"
            />
          </div>
          
          <div className="add-employee-section">
            <button 
              className="add-employee-btn"
              onClick={() => setShowAddEmployee(true)}
            >
              Add Employee
            </button>
          </div>
        </div>
      </div>

      <div className="table-section">
        <table className="balances-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee, index) => (
              <tr key={index}>
                <td>{employee.name}</td>
                <td>
                  <span className="department-badge">{employee.department}</span>
                </td>
                <td>
                  <button 
                    className="view-balance-btn"
                    onClick={() => handleViewBalance(employee.name)}
                  >
                    View Balance
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span>Rows per page: {filteredEmployees.length}</span>
          <span>1-{filteredEmployees.length} of {filteredEmployees.length}</span>
          <div className="pagination-controls">
            <button>‹‹</button>
            <button>‹</button>
            <button>›</button>
            <button>››</button>
          </div>
        </div>
      </div>

      {/* Edit Employee Modal */}
      {showModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Leave Balance Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="employee-details-editable">
                <div className="editable-field">
                  <label><strong>Employee:</strong></label>
                  <input
                    type="text"
                    value={editableEmployeeData.name}
                    onChange={(e) => handleEmployeeDataChange('name', e.target.value)}
                  />
                </div>
                <div className="editable-field">
                  <label><strong>Department:</strong></label>
                  <select
                    value={editableEmployeeData.department}
                    onChange={(e) => handleEmployeeDataChange('department', e.target.value)}
                  >
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div className="editable-field">
                  <label><strong>Eligible for:</strong></label>
                  <div className="leave-type-checkboxes">
                    {availableLeaveTypes.map(leaveType => (
                      <label key={leaveType} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={editableEmployeeData.eligibleLeaveTypes.includes(leaveType)}
                          onChange={() => handleLeaveTypeToggle(leaveType)}
                        />
                        {leaveType}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {Object.entries(modalData).map(([leaveType, data]) => (
                <div key={leaveType} className="leave-type-section">
                  <h3 className="leave-type-header-text">
                    {leaveType}
                  </h3>
                  
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Entitled</th>
                        <th>Used</th>
                        <th>Remaining</th>
                        <th>Usage %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <input
                            type="number"
                            step="0.5"
                            value={data.entitled}
                            onChange={(e) => handleModalInputChange(leaveType, 'entitled', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.5"
                            value={data.used}
                            onChange={(e) => handleModalInputChange(leaveType, 'used', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.5"
                            value={data.remaining}
                            onChange={(e) => handleModalInputChange(leaveType, 'remaining', e.target.value)}
                          />
                        </td>
                        <td>
                          <div className="usage-bar">
                            <div 
                              className="usage-fill" 
                              style={{width: `${Math.min(calculateUsagePercentage(data.used, data.entitled), 100)}%`}}
                            ></div>
                            <span className="usage-text">
                              {calculateUsagePercentage(data.used, data.entitled).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="save-btn" onClick={handleSaveChanges}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <AddEmployee 
          onClose={() => setShowAddEmployee(false)}
          onAddEmployee={handleAddEmployee}
        />
      )}
    </div>
  );
};

export default AdminLeaveBalances;