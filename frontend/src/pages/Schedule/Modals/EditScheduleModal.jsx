import React, { useState, useEffect } from 'react';
import './EditScheduleModal.css';
import api from "../../../api/api";

const EditScheduleModal = ({ schedule, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    scheduleName: '',
    scheduleDescription: '',
    startDate: '',
    endDate: '',
    scheduleType: '',
    workDays: [],
    workStart: '00:00',
    workEnd: '00:00',
    latenessGrace: 10,
    absenceGrace: 20,
    employeeName: '',
    employeeNo: '',
    department: '',
    jobTitle: ''
  });

  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  // fetch all employees for selection
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get("/emp-info/all");
        setAvailableEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (schedule) {
      // is this right?? the code below
    setSelectedEmployees(schedule.employees ? schedule.employees.map(e => e._id) : []);
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      // pad month and day
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${month}-${day}`;
    };
    
      setFormData({
        scheduleName: schedule.scheduleName || '',
        scheduleDescription: schedule.scheduleDescription || '',
        startDate: formatDate(schedule.startDate) || '',
        endDate: formatDate(schedule.endDate) || '',
        scheduleType: schedule.scheduleType || '',
        workDays: schedule.workDays || [],
        workStart: schedule.workStart || '00:00',
        workEnd: schedule.workEnd || '00:00',
        latenessGrace: schedule.latenessGrace || 10,
        absenceGrace: schedule.absenceGrace || 20,
        employeeName: schedule.employeeName || '',
        employeeNo: schedule.employeeNo || '',
        department: schedule.department || '',
        jobTitle: schedule.jobTitle || ''
      });
    }
  }, [schedule]);

  const handleEmployeeToggle = (id) => {
    setSelectedEmployees(prev =>
      prev.includes(id)
        ? prev.filter(eid => eid !== id)
        : [...prev, id]
    );
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleWorkDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day]
    }));
  };

  const formatWorkDays = (days) => {
    const dayMap = {
      'S': 'Sunday',
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'Th': 'Thursday',
      'F': 'Friday',
      'Sa': 'Saturday'
    };

    if (days.length === 0) return 'No days selected';
    if (days.length === 5 && ['M', 'T', 'W', 'Th', 'F'].every(d => days.includes(d))) {
      return 'Monday - Friday';
    }
    if (days.length === 7) return 'Sunday - Saturday';
    
    return days.map(d => dayMap[d]).join(', ');
  };

  const handleSave = async () => {
    if (!schedule || !schedule._id) {
      alert("Schedule ID is missing. Cannot update.");
      return;
    }
    try {
      const payload = {
        scheduleName: formData.scheduleName,
        scheduleDescription: formData.scheduleDescription,
        startDate: formData.startDate,
        endDate: formData.endDate,
        scheduleType: formData.scheduleType,
        workDays: formData.workDays,
        workStart: formData.workStart,
        workEnd: formData.workEnd,
        latenessGrace: formData.latenessGrace,
        absenceGrace: formData.absenceGrace,
        selectedEmployees: selectedEmployees,
      };

      const { data } = await api.put(`/schedule/${schedule._id}`, payload);

      onSave(data.schedule); 
      onClose();
    } catch (err) {
      console.error("Error updating schedule:", err);
      alert("Failed to update schedule");
    }
  };

  const isFormValid = () => {
    return formData.scheduleName && 
           formData.scheduleDescription && 
           formData.startDate && 
           formData.workDays.length > 0 && 
           formData.workStart && 
           formData.workEnd;
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-container">
        <div className="edit-modal-header">
          <h2>Edit Schedule</h2>
          <button className="schedule-close-button" onClick={onClose}>×</button>
        </div>

        <div className="edit-modal-content">
          <div className="edit-section">
            <h3>Schedule Information</h3>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label>Schedule Name *</label>
                <input
                  type="text"
                  value={formData.scheduleName}
                  onChange={(e) => handleInputChange('scheduleName', e.target.value)}
                  placeholder="Enter schedule name"
                />
              </div>
              <div className="edit-form-group">
                <label>Schedule Type</label>
                <select
                  value={formData.scheduleType}
                  onChange={(e) => handleInputChange('scheduleType', e.target.value)}
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>
            </div>
            <div className="edit-form-group">
              <label>Schedule Description *</label>
              <textarea
                value={formData.scheduleDescription}
                onChange={(e) => handleInputChange('scheduleDescription', e.target.value)}
                placeholder="What will the employees in this schedule do?"
                rows="3"
              />
            </div>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="edit-section">
            <h3>Assign Employees</h3>
            <div className="employee-list">
              {availableEmployees.map(emp => (
                <label key={emp._id} style={{ display: "block", marginBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(emp._id)}
                    onChange={() => handleEmployeeToggle(emp._id)}
                  />
                  {emp.firstName} {emp.lastName} ({emp.employeeNo})
                </label>
              ))}
            </div>
          </div>

          <div className="edit-section">
            <h3>Work Schedule</h3>
            <div className="edit-form-group">
              <label>Work Days *</label>
              <div className="work-days">
                {['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'].map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`day-button ${formData.workDays.includes(day) ? 'selected' : ''}`}
                    onClick={() => handleWorkDayToggle(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label>Work Start *</label>
                <input
                  type="time"
                  value={formData.workStart}
                  onChange={(e) => handleInputChange('workStart', e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label>Work End *</label>
                <input
                  type="time"
                  value={formData.workEnd}
                  onChange={(e) => handleInputChange('workEnd', e.target.value)}
                />
              </div>
            </div>
            <div className="edit-form-grid">
              <div className="edit-form-group">
                <label>Lateness Grace Period (mins)</label>
                <select
                  value={formData.latenessGrace}
                  onChange={(e) => handleInputChange('latenessGrace', parseInt(e.target.value))}
                >
                  <option value={5}>5 mins</option>
                  <option value={10}>10 mins</option>
                  <option value={15}>15 mins</option>
                  <option value={20}>20 mins</option>
                </select>
              </div>
              <div className="edit-form-group">
                <label>Absence Grace Period (mins)</label>
                <select
                  value={formData.absenceGrace}
                  onChange={(e) => handleInputChange('absenceGrace', parseInt(e.target.value))}
                >
                  <option value={20}>20 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="edit-modal-footer">
          <div className="footer-buttons">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button 
              className="btn-save" 
              onClick={handleSave}
              disabled={!isFormValid()}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;