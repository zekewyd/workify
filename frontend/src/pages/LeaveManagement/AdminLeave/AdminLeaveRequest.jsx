import React, { useState, useMemo } from 'react';
import './AdminLeaveRequest.css';

const AdminLeaveRequest = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    fromDate: '2025-01-01',
    toDate: '2025-12-31',
    status: '',
    leaveType: '',
    department: '',
    employee: ''
  });

  // Mock data
  const [leaveData, setLeaveData] = useState([
    {
      id: 1,
      employeeName: 'Regine Hambiol',
      date: '2025-01-31',
      leaveType: 'Vacation',
      remainingDays: 0.50,
      numberOfDays: 0.50,
      status: 'Pending Approval',
      department: 'IT'
    },
    {
      id: 2,
      employeeName: 'Lim Alcovendas',
      date: '2025-02-27',
      leaveType: 'Vacation',
      remainingDays: 2.00,
      numberOfDays: 2.00,
      status: 'Pending Approval',
      department: 'HR'
    },
    {
      id: 3,
      employeeName: 'Klei Ishia Pagatpatan',
      date: '2025-02-01',
      leaveType: 'Vacation',
      remainingDays: 1.50,
      numberOfDays: 1.50,
      status: 'Pending Approval',
      department: 'Finance'
    },
    {
      id: 4,
      employeeName: 'Ezekiel Olasiman',
      date: '2025-03-01',
      leaveType: 'Vacation',
      remainingDays: 2.00,
      numberOfDays: 2.00,
      status: 'Approved',
      department: 'Operations'
    },
    {
      id: 5,
      employeeName: 'Kai Cruz',
      date: '2025-02-01',
      leaveType: 'Medical Leave',
      remainingDays: 1.00,
      numberOfDays: 1.00,
      status: 'Cancelled',
      department: 'IT'
    }
  ]);

  const filteredData = useMemo(() => {
    return leaveData.filter(item => {
      const matchesSearch = item.employeeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesLeaveType = !filters.leaveType || item.leaveType === filters.leaveType;
      const matchesDepartment = !filters.department || item.department === filters.department;
      const matchesEmployee = !filters.employee || item.employeeName.toLowerCase().includes(filters.employee.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesLeaveType && matchesDepartment && matchesEmployee;
    });
  }, [searchTerm, filters, leaveData]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleActionChange = (id, newStatus) => {
    if (newStatus && newStatus !== 'Select Action') {
      setLeaveData(prev => prev.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
    }
  };

  const handleReset = () => {
    setFilters({
      fromDate: '2025-01-01',
      toDate: '2025-12-31',
      status: '',
      leaveType: '',
      department: '',
      employee: ''
    });
    setSearchTerm('');
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending Approval':
        return 'status-pending';
      case 'Rejected':
        return 'status-rejected';
      case 'Cancelled':
        return 'status-cancelled';
      case 'Approved':
        return 'status-approved';
      default:
        return '';
    }
  };

  return (
    <div className="admin-leave-management">
      <div className="search-section">
        <div className="filter-row">
          <div className="date-group">
            <div className="date-field">
              <label>From</label>
              <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              />
            </div>
            <div className="date-field">
              <label>To</label>
              <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleFilterChange('toDate', e.target.value)}
              />
            </div>
            <div className="employee-field">
              <label>Employee</label>
              <input
                type="text"
                placeholder="Juan Dela Cruz..."
                value={filters.employee}
                onChange={(e) => handleFilterChange('employee', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="filter-row">
          <div className="dropdown-group">
            <div className="dropdown-field">
              <label>Department</label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              >
                <option value="">All</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
            <div className="dropdown-field">
              <label>Leave Type</label>
              <select
                value={filters.leaveType}
                onChange={(e) => handleFilterChange('leaveType', e.target.value)}
              >
                <option value="">All</option>
                <option value="Vacation">Vacation</option>
                <option value="Medical Leave">Medical Leave</option>
                <option value="Maternity">Maternity</option>
                <option value="Bereavement">Bereavement</option>
                <option value="Personal">Personal</option>
              </select>
            </div>
            <div className="dropdown-field">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="reset-btn" onClick={handleReset}>RESET</button>
          <button className="search-btn">SEARCH</button>
        </div>
      </div>

      <div className="table-section">
        <table className="leave-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Date</th>
              <th>Leave Type</th>
              <th>Remaining Days</th>
              <th>Number of Days</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td>{item.employeeName}</td>
                <td>{item.date}</td>
                <td>{item.leaveType}</td>
                <td>{item.remainingDays.toFixed(2)}</td>
                <td>{item.numberOfDays.toFixed(2)}</td>
                <td>
                  <span className={`status ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <select 
                    className="action-select"
                    onChange={(e) => handleActionChange(item.id, e.target.value)}
                    value=""
                  >
                    <option value="">Select Action</option>
                    <option value="Approved">Approve</option>
                    <option value="Rejected">Reject</option>
                    <option value="Cancelled">Cancel</option>
                    <option value="Pending Approval">Pending Approval</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span>Rows per page: 6</span>
          <span>1-{filteredData.length} of {filteredData.length}</span>
          <div className="pagination-controls">
            <button>‹‹</button>
            <button>‹</button>
            <button>›</button>
            <button>››</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveRequest;