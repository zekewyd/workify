import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Upload, X } from 'lucide-react';
import './EmployeeLeaveManagement.css';

const EmployeeLeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaveRequests, setLeaveRequests] = useState([]);
  
  const [leaveBalances, setLeaveBalances] = useState({
    'Vacation': { entitled: 15, used: 0, remaining: 15 },
    'Medical': { entitled: 15, used: 0, remaining: 15 },
    'Maternity': { entitled: 105, used: 0, remaining: 105 },
    'Bereavement': { entitled: 5, used: 0, remaining: 5 },
    'Personal': { entitled: 3, used: 0, remaining: 3 }
  });
  
  const [formData, setFormData] = useState({
    employeeName: '',
    department: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachment: null
  });
  
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Philippines holidays for 2025-2026
  const holidays = {
    
    '2025-01-01': 'New Year\'s Day',
    '2025-04-09': 'Day of Valor',
    '2025-04-17': 'Maundy Thursday',
    '2025-04-18': 'Good Friday',
    '2025-05-01': 'Labor Day',
    '2025-06-12': 'Independence Day',
    '2025-08-25': 'National Heroes Day',
    '2025-11-01': 'All Saints\' Day',
    '2025-11-30': 'Bonifacio Day',
    '2025-12-25': 'Christmas Day',
    '2025-12-30': 'Rizal Day',
    '2025-12-31': 'New Year\'s Eve',
    
    // 2026
    '2026-01-01': 'New Year\'s Day',
    '2026-04-02': 'Maundy Thursday',
    '2026-04-03': 'Good Friday',
    '2026-04-09': 'Day of Valor',
    '2026-05-01': 'Labor Day',
    '2026-06-12': 'Independence Day',
    '2026-08-31': 'National Heroes Day',
    '2026-11-01': 'All Saints\' Day',
    '2026-11-30': 'Bonifacio Day',
    '2026-12-25': 'Christmas Day',
    '2026-12-30': 'Rizal Day',
    '2026-12-31': 'New Year\'s Eve'
  };
  
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setCalculatedDays(diffDays);
    }
  }, [formData.startDate, formData.endDate]);
  
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  const formatDate = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!formData.employeeName || !formData.department || !formData.leaveType || !formData.startDate || !formData.endDate) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    const leaveTypeKey = formData.leaveType.split(' ')[0];
    const balance = leaveBalances[leaveTypeKey];
    
    if (calculatedDays > balance.remaining) {
      setErrorMessage(`Insufficient balance. You have ${balance.remaining} days remaining for ${formData.leaveType} Leave`);
      return;
    }
    
    const newRequest = {
      id: Date.now(), 
      employeeName: formData.employeeName,
      department: formData.department,
      startDate: formData.startDate,
      endDate: formData.endDate,
      leaveType: formData.leaveType,
      days: calculatedDays,
      status: 'Pending Approval',
      reason: formData.reason
    };
    
    setLeaveRequests(prev => [...prev, newRequest]);
    
    
    setLeaveBalances(prev => ({
      ...prev,
      [leaveTypeKey]: {
        ...prev[leaveTypeKey],
        used: prev[leaveTypeKey].used + calculatedDays,
        remaining: prev[leaveTypeKey].remaining - calculatedDays
      }
    }));
    
    setSuccessMessage('Leave request submitted successfully!');
   
    setFormData({
      employeeName: '',
      department: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      attachment: null
    });
    setCalculatedDays(0);
  };
  
  const handleReset = () => {
    setFormData({
      employeeName: '',
      department: '',
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      attachment: null
    });
    setCalculatedDays(0);
    setErrorMessage('');
    setSuccessMessage('');
  };
  
  const cancelRequest = (id) => {
    const requestToCancel = leaveRequests.find(req => req.id === id);
    if (requestToCancel) {
     
      const leaveTypeKey = requestToCancel.leaveType.split(' ')[0];
      setLeaveBalances(prev => ({
        ...prev,
        [leaveTypeKey]: {
          ...prev[leaveTypeKey],
          used: prev[leaveTypeKey].used - requestToCancel.days,
          remaining: prev[leaveTypeKey].remaining + requestToCancel.days
        }
      }));
    }
    
    setLeaveRequests(prev => prev.filter(req => req.id !== id));
    setSuccessMessage('Leave request cancelled successfully!');
  };
  
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    
   
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
    }
    
   
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const holiday = holidays[dateStr];
      
      days.push(
        <div key={day} className="day-cell">
          <div className="day-number">{day}</div>
          {holiday && (
            <div className="holiday-container">
              <span className="holiday-badge">Holiday</span>
              <span className="holiday-name">{holiday}</span>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="calendar-wrapper">
        <div className="calendar-header">
          <button className="nav-btn" onClick={() => navigateMonth(-1)}>
            <ChevronLeft size={20} />
          </button>
          <div className="month-year">{formatDate(currentDate)}</div>
          <button className="nav-btn" onClick={() => navigateMonth(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="calendar-container">
          <div className="calendar-grid">
            <div className="day-header sun">SUN</div>
            <div className="day-header">MON</div>
            <div className="day-header">TUE</div>
            <div className="day-header">WED</div>
            <div className="day-header">THU</div>
            <div className="day-header">FRI</div>
            <div className="day-header sat">SAT</div>
            {days}
          </div>
        </div>
      </div>
    );
  };
  
  const renderLeaveRequest = () => (
    <div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}
      
      <div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Employee Name *</label>
            <input
              type="text"
              name="employeeName"
              value={formData.employeeName}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter employee name"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="HR">HR</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Leave Type *</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleInputChange}
              className="form-control"
              required
            >
              <option value="">Select Leave Type</option>
              <option value="Vacation">Vacation Leave</option>
              <option value="Medical">Medical Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Bereavement">Bereavement Leave</option>
              <option value="Personal">Personal Leave</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Number of Days</label>
            <input
              type="number"
              value={calculatedDays}
              className="form-control"
              readOnly
              style={{ background: '#f8f9fa' }}
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Attachment (Optional)</label>
            <label className="file-upload">
              <input
                type="file"
                name="attachment"
                onChange={handleInputChange}
                accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
              />
              <div className="upload-btn">
                <Upload size={16} />
                {formData.attachment ? formData.attachment.name : 'Choose File'}
              </div>
            </label>
          </div>
          
          <div className="form-group">
            <label className="form-label">Reason / Remarks</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="form-control"
              rows="3"
              placeholder="Please provide reason for your leave request"
            />
          </div>
        </div>
        
        <div className="btn-group">
          <button type="button" onClick={handleSubmit} className="btn btn-primary">
            Submit Request
          </button>
          <button type="button" onClick={handleReset} className="btn btn-reset">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
  
  const renderStatus = () => (
    <div>
      {leaveRequests.length === 0 ? (
        <div className="empty-state">
          <p>No leave requests found. Submit a leave request to see it here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Date</th>
                <th>Leave Type</th>
                <th>No. of Days</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map(request => (
                <tr key={request.id}>
                  <td>{request.employeeName}</td>
                  <td>{request.department}</td>
                  <td>{request.startDate} to {request.endDate}</td>
                  <td>{request.leaveType}</td>
                  <td>{request.days}</td>
                  <td>
                    <span className={`status-badge ${
                      request.status === 'Pending Approval' ? 'status-pending' :
                      request.status === 'Approved' ? 'status-approved' : 'status-rejected'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {request.status === 'Pending Approval' && (
                      <button 
                        onClick={() => cancelRequest(request.id)}
                        className="btn btn-danger btn-small"
                      >
                        <X size={14} />
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
  
  const renderSummary = () => (
    <div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Entitled Days</th>
              <th>Used Days</th>
              <th>Remaining Days</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(leaveBalances).map(([type, balance]) => (
              <tr key={type}>
                <td>{type} Leave</td>
                <td>{balance.entitled}</td>
                <td>{balance.used}</td>
                <td style={{ color: balance.remaining <= 2 ? '#dc3545' : '#28a745', fontWeight: '600' }}>
                  {balance.remaining}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  return (
    <div className="leave-management">
      <div className="container">
        <div className="tabs">
          {[
            { key: 'calendar', label: 'Calendar', icon: Calendar },
            { key: 'request', label: 'Leave Request' },
            { key: 'status', label: 'Status' },
            { key: 'summary', label: 'Leave Summary' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab ${activeTab === tab.key ? 'active' : ''}`}
            >
              {tab.icon && <tab.icon size={16} />}
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="content">
          {activeTab === 'calendar' && renderCalendar()}
          {activeTab === 'request' && renderLeaveRequest()}
          {activeTab === 'status' && renderStatus()}
          {activeTab === 'summary' && renderSummary()}
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaveManagement;