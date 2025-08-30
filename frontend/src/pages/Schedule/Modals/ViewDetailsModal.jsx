import React from 'react';
import './ViewDetailsModal.css';

const ViewDetailsModal = ({ schedule, onClose }) => {

const dayMap = {
  'S': 'Sunday',
  'M': 'Monday',
  'T': 'Tuesday',
  'W': 'Wednesday',
  'Th': 'Thursday',
  'F': 'Friday',
  'Sa': 'Saturday'
};

const getScheduleSummary = (days) => {
  if (!days || days.length === 0) return 'N/A';
  const weekdays = ['M', 'T', 'W', 'Th', 'F'];
  const allDays = ['S', ...weekdays, 'Sa'];
  if (days.length === 5 && weekdays.every(d => days.includes(d))) return 'Monday - Friday';
  if (days.length === 7 && allDays.every(d => days.includes(d))) return 'Sunday - Saturday';
  return days.map(d => dayMap[d]).join(', ');
};

const formatDate = (dateString) => {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timeString) => {
  if (!timeString) return 'Not set';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getWorkDaysShort = (days) => {
  if (!days || days.length === 0) return 'N/A';
  return days.join(', ');
};

const getTimeRange = (start, end) => {
  if (!start || !end) return 'N/A';
  return `${start} - ${end}`;
};

if (!schedule) return null;

  return (
    <div className="view-modal-overlay">
      <div className="view-modal-container">
        <div className="view-modal-header">
          <h2>Schedule Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="view-modal-content">
          <div className="details-section">
            <h3>Schedule Information</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Schedule Name</label>
                <span>{schedule.scheduleName || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <label>Schedule Type</label>
                <span className={`schedule-type ${schedule.scheduleType?.toLowerCase().replace(' ', '-')}`}>
                  {schedule.scheduleType || 'N/A'}
                </span>
              </div>
              <div className="detail-item full-width">
                <label>Description</label>
                <span>{schedule.scheduleDescription || 'No description provided'}</span>
              </div>
              <div className="detail-item">
                <label>Start Date</label>
                <span>{formatDate(schedule.startDate)}</span>
              </div>
              <div className="detail-item">
                <label>End Date</label>
                <span>{formatDate(schedule.endDate)}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Assigned Employees</h3>
            <div className="details-employee-list">
              {schedule.employees && schedule.employees.length > 0 ? (
                schedule.employees.map(emp => (
                  <div key={emp._id} className="details-employee-item">
                    <div className="details-employee-info">
                      <div className="details-employee-name">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="employee-details">
                        <span className="details-employee-id">ID: {emp.employeeNo}</span>
                        <span className="details-employee-email">{emp.email}</span>
                        {emp.jobTitle && <span className="details-employee-job">{emp.jobTitle}</span>}
                        {emp.department && <span className="details-employee-dept">{emp.department}</span>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="details-employee-item empty">
                  <div className="details-employee-info">
                    <div className="details-employee-name">No employees assigned</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="details-section">
            <h3>Work Schedule</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Work Days</label>
                <span>{getWorkDaysShort(schedule.workDays)}</span>
              </div>
              <div className="detail-item">
                <label>Schedule Summary</label>
                <span>{getScheduleSummary(schedule.workDays)}</span>
              </div>
              <div className="detail-item">
                <label>Work Start Time</label>
                <span>{formatTime(schedule.workStart)}</span>
              </div>
              <div className="detail-item">
                <label>Work End Time</label>
                <span>{formatTime(schedule.workEnd)}</span>
              </div>
              <div className="detail-item">
                <label>Total Hours</label>
                <span>{schedule.workStart && schedule.workEnd ? 
                  (() => {
                    const start = new Date(`2000-01-01T${schedule.workStart}`);
                    const end = new Date(`2000-01-01T${schedule.workEnd}`);
                    const diff = (end - start) / (1000 * 60 * 60);
                    return `${diff} hours`;
                  })() : 'N/A'
                }</span>
              </div>
              <div className="detail-item">
                <label>Time Range</label>
                <span>{getTimeRange(schedule.workStart, schedule.workEnd)}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Attendance Policies</h3>
            <div className="details-grid">
              <div className="detail-item">
                <label>Lateness Grace Period</label>
                <span>{schedule.latenessGrace || 0} minutes</span>
              </div>
              <div className="detail-item">
                <label>Absence Grace Period</label>
                <span>{schedule.absenceGrace || 0} minutes</span>
              </div>
            </div>
            <div className="policy-info">
              <div className="policy-item">
                <div className="policy-icon lateness">⏰</div>
                <div className="policy-text">
                  <strong>Lateness Policy</strong>
                  <p>Employee will be marked as late if they arrive more than {schedule.latenessGrace || 0} minutes after their scheduled start time.</p>
                </div>
              </div>
              <div className="policy-item">
                <div className="policy-icon absence">🚫</div>
                <div className="policy-text">
                  <strong>Absence Policy</strong>
                  <p>Employee will be marked as absent if they arrive more than {schedule.absenceGrace || 0} minutes after their scheduled start time.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="details-section">
            <h3>Schedule Status</h3>
            <div className="status-container">
              <div className="status-badge active">
                <span className="status-dot"></span>
                Active Schedule
              </div>
              <div className="status-info">
                <p>This schedule is currently active and will apply to the assigned employee during the specified date range.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="view-modal-footer">
          <div className="footer-buttons">
            <button className="btn-close" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;