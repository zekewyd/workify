import React, { useState, useEffect} from 'react';
import './AddLogsModal.css';
import api from "../../../../api/api";


const AddLogsModal = ({ show, onClose, onSave, calculateHours }) => {
  const [employees, setEmployees] = useState([]);
  const [newLog, setNewLog] = useState({
    employee: '',
    date: '',
    clockIn: '',
    clockOut: '',
    status: 'Present'
  });

  // fetch employees
  useEffect(() => {
    if (show) {
      api.get("/emp-info/all")
        .then(res => {
          console.log("Fetched employees:", res.data);
          setEmployees(res.data);
        })
        .catch(err => setEmployees([]));
    }
  }, [show]);

  const handleInputChange = (field, value) => {
    console.log(`InputChange: ${field} =`, value);
    setNewLog(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!newLog.employee || !newLog.date || !newLog.status) {
      alert('Please select Employee, Date and Status');
      return;
    }

    // prepare the request body
    const payload = {
      employee: newLog.employee, 
      date: newLog.date,
      status: newLog.status,
      clockIn: newLog.clockIn || '--',
      clockOut: newLog.clockOut || '--'
    };

    try {
      console.log("POST payload:", payload);
      const res = await api.post("/attendance-logs/create", payload);
      onSave(res.data); // pass the new log back to the parent
      setNewLog({
        employee: '',
        date: '',
        clockIn: '',
        clockOut: '',
        status: 'Present'
      });
    } catch (err) {
      alert("Error saving attendance log: " + (err.response?.data?.message || err.message));
    }
  };

  const handleClose = () => {
    setNewLog({
      employee: '',
      date: '',
      clockIn: '',
      clockOut: '',
      status: 'Present'
    });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="addLogs-modal-overlay" onClick={handleClose}>
      <div className="addLogs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="addLogs-modal-header">
          <h3>Add New Attendance Log</h3>
          <button className="addLogs-close-btn" onClick={handleClose}>×</button>
        </div>
        <div className="addLogs-modal-body">
          <div className="addLogs-form-row">
            <div className="addLogs-form-group">
              <label>Employee Name *</label>
              <select
                value={newLog.employee}
                onChange={(e) => handleInputChange('employee', e.target.value)}
                className="addLogs-form-select"
              >
                <option value="">Select Employee</option>
                {employees
                  .filter(emp => emp.userID && emp.userID._id)
                  .map(emp => (
                    <option key={emp._id} value={emp.userID._id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                ))}
              </select>
            </div>   
          </div>
          <div className="addLogs-form-row">
            <div className="addLogs-form-group">
              <label>Date *</label>
              <input
                type="date"
                value={newLog.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="addLogs-form-input"
              />
            </div>
            <div className="addLogs-form-group">
              <label>Status</label>
              <select
                value={newLog.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="addLogs-form-select"
              >
                <option value="">Select Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
          </div>
          <div className="addLogs-form-row">
            <div className="addLogs-form-group">
              <label>Clock In</label>
              <input
                type="time"
                value={newLog.clockIn}
                onChange={(e) => handleInputChange('clockIn', e.target.value)}
                className="addLogs-form-input"
              />
            </div>
            <div className="addLogs-form-group">
              <label>Clock Out</label>
              <input
                type="time"
                value={newLog.clockOut}
                onChange={(e) => handleInputChange('clockOut', e.target.value)}
                className="addLogs-form-input"
              />
            </div>
          </div>
          {newLog.clockIn && newLog.clockOut && (
            <div className="addLogs-hours-preview">
              <div className="addLogs-preview-item">
                <span>Total Hours: {calculateHours(newLog.clockIn, newLog.clockOut).totalHrs}</span>
              </div>
              <div className="addLogs-preview-item">
                <span>Regular Hours: {calculateHours(newLog.clockIn, newLog.clockOut).regularHrs}</span>
              </div>
              <div className="addLogs-preview-item">
                <span>Overtime: {calculateHours(newLog.clockIn, newLog.clockOut).overtime}</span>
              </div>
            </div>
          )}
        </div>
        <div className="addLogs-modal-footer">
          <button className="addLogs-cancel-btn" onClick={handleClose}>Cancel</button>
          <button className="addLogs-save-btn" onClick={handleSave}>Add Log</button>
        </div>
      </div>
    </div>
  );
};

export default AddLogsModal;