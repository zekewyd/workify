import React, { useState, useEffect } from 'react';
import './ScheduleInformationModal.css';
import api from "../../../api/api";

const ScheduleInformationModal = ({ onClose, onSave }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    scheduleName: '',
    scheduleDescription: '',
    startDate: '',
    endDate: '',
    scheduleType: 'Full Time',
    workDays: [],
    workStart: '07:30',
    workEnd: '16:00',
    latenessGrace: 15,
    absenceGrace: 30,
    selectedEmployees: []
  });

  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/emp-info/all");
        console.log("Employees fetched:", res.data);

        // map the response
        const employees = res.data.map(emp => ({
          id: emp._id, // personalInfo _id
          employeeNo: emp.employeeNo,
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.userID?.email || "",
          department: emp.userID?.department?.departmentName || "",
          jobTitle: emp.userID?.jobTitle || ""
        }));

        setAvailableEmployees(employees);
        setFilteredEmployees(employees);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };

    fetchEmployees();
  }, []);


  useEffect(() => {
    setFilteredEmployees(availableEmployees);
  }, [availableEmployees]);


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

  const handleEmployeeSelect = (employee) => {
    setFormData(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.some(emp => emp.id === employee.id)
        ? prev.selectedEmployees.filter(emp => emp.id !== employee.id)
        : [...prev.selectedEmployees, employee]
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
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
        selectedEmployees: formData.selectedEmployees.map(emp => emp.id) // array of pInfoId
      };

      const res = await api.post("/schedule/create", payload);
      console.log("Schedule created:", res.data);

      // push the new schedule into parent table
      onSave(res.data.schedule);
      onClose(); // close modal
    } catch (err) {
      console.error("Error saving schedule:", err);
      alert("Failed to save schedule.");
    }
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.scheduleName && formData.scheduleDescription && formData.startDate;
      case 2:
        return formData.workDays.length > 0 && formData.workStart && formData.workEnd;
      case 3:
        return formData.selectedEmployees.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="addSchedule-modal-overlay">
      <div className="addSchedule-modal-container">
        <div className="addSchedule-modal-header">
          <h2>Create Schedule</h2>
          <button className="addSchedule-close-button" onClick={onClose}>×</button>
        </div>

        <div className="addSchedule-steps-indicator">
          <div className={`addSchedule-step ${currentStep >= 1 ? 'active' : ''}`}>
            <span className="addSchedule-step-number">1</span>
            <span className="addSchedule-step-label">Schedule Information</span>
          </div>
          <div className={`addSchedule-step ${currentStep >= 2 ? 'active' : ''}`}>
            <span className="addSchedule-step-number">2</span>
            <span className="addSchedule-step-label">Time Details</span>
          </div>
          <div className={`addSchedule-step ${currentStep >= 3 ? 'active' : ''}`}>
            <span className="addSchedule-step-number">3</span>
            <span className="addSchedule-step-label">Employees</span>
          </div>
        </div>

        <div className="addSchedule-modal-content">
          {currentStep === 1 && (
            <div className="addSchedule-step-content">
              <h3>Schedule Details</h3>
              <div className="addSchedule-form-group">
                <label>Schedule Name *</label>
                <input
                  type="text"
                  value={formData.scheduleName}
                  onChange={(e) => handleInputChange('scheduleName', e.target.value)}
                  placeholder="Enter schedule name"
                />
              </div>
              <div className="addSchedule-form-group">
                <label>Schedule Description *</label>
                <textarea
                  value={formData.scheduleDescription}
                  onChange={(e) => handleInputChange('scheduleDescription', e.target.value)}
                  placeholder="What will the employees in this schedule do?"
                  rows="4"
                />
              </div>
              <div className="addSchedule-form-row">
                <div className="addSchedule-form-group">
                  <label>Schedule Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="addSchedule-form-group">
                  <label>Schedule End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="addSchedule-form-group">
                <label>Schedule Type</label>
                <div className="addSchedule-schedule-type-options">
                  <label className="addSchedule-radio-option">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="Full Time"
                      checked={formData.scheduleType === 'Full Time'}
                      onChange={(e) => handleInputChange('scheduleType', e.target.value)}
                    />
                    <span>Full Time Schedule</span>
                    <small>Your employees would operate on set standard working hours.</small>
                  </label>
                  <label className="addSchedule-radio-option">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="Half Day"
                      checked={formData.scheduleType === 'Half Day'}
                      onChange={(e) => handleInputChange('scheduleType', e.target.value)}
                    />
                    <span>Half Day Schedule</span>
                    <small>Your employees would operate on half-day working hours.</small>
                  </label>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="addSchedule-step-content">
              <h3>Time Details</h3>
              <div className="addSchedule-form-group">
                <label>Select The Work Days</label>
                <div className="addSchedule-work-days">
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
              <div className="addSchedule-form-row">
                <div className="addSchedule-form-group">
                  <label>Work starts *</label>
                  <input
                    type="time"
                    value={formData.workStart}
                    onChange={(e) => handleInputChange('workStart', e.target.value)}
                  />
                </div>
                <div className="addSchedule-form-group">
                  <label>Work ends *</label>
                  <input
                    type="time"
                    value={formData.workEnd}
                    onChange={(e) => handleInputChange('workEnd', e.target.value)}
                  />
                </div>
              </div>
              <div className="addSchedule-form-row">
                <div className="addSchedule-form-group">
                  <label>Lateness starts after (mins) *</label>
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
                <div className="addSchedule-form-group">
                  <label>Absence starts after (mins) *</label>
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
          )}

          {currentStep === 3 && (
            <div className="addSchedule-step-content">
              <h3>Add Employees</h3>
              <div className="addSchedule-employees-section">
                <div className="addSchedule-search-container">
                  <input
                    type="text"
                    placeholder="Search by Employee Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="addSchedule-search-input"
                  />
                </div>
                <div className="addSchedule-employees-table-container">
                  <table className="addSchedule-employees-table">
                    <thead>
                      <tr>
                        <th>Select</th>
                        <th>Employee No.</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Job Title</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map(employee => (
                        <tr key={employee.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={formData.selectedEmployees.some(emp => emp.id === employee.id)}
                              onChange={() => handleEmployeeSelect(employee)}
                            />
                          </td>
                          <td>{employee.employeeNo}</td>
                          <td>{employee.name}</td>
                          <td>{employee.email}</td>
                          <td>{employee.department}</td>
                          <td>{employee.jobTitle}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="addSchedule-selected-employees">
                  <p>Selected: {formData.selectedEmployees.length} employees</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="addSchedule-modal-footer">
          <div className="addSchedule-footer-buttons">
            {currentStep > 1 && (
              <button className="addSchedule-btn-secondary" onClick={handlePrevious}>
                Previous
              </button>
            )}
            <button className="addSchedule-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            {currentStep < 3 ? (
              <button 
                className="addSchedule-btn-primary" 
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Next
              </button>
            ) : (
              <button 
                className="addSchedule-btn-primary" 
                onClick={handleSave}
                disabled={!isStepValid()}
              >
                Create Schedule
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleInformationModal;