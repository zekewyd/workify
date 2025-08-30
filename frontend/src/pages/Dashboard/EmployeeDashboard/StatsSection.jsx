import React, { useEffect, useState } from 'react'; 
import { Clock, Timer, Users } from 'lucide-react'; 
import './StatsSection.css'; 
import api from "../../../api/api";
 
const StatsSection = ({  
  calculateWorkedHours,  
  handleClockIn,  
  handleClockOut,  
  clockInTime,  
  clockOutTime,  
  formatTimeForDisplay,  
  currentStatus  
}) => { 
  const [recentLogs, setRecentLogs] = useState([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    lateCount: 0,
    absencesCount: 0
  });

  useEffect(() => {
    // get logs for last 15 days
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 14); // last 15 days including today
    const formattedStart = startDate.toISOString().slice(0,10);
    const formattedEnd = today.toISOString().slice(0,10);

    api.get("/attendance-logs", { params: { start: formattedStart, end: formattedEnd } })
      .then(res => {
        setRecentLogs(res.data);

        // calculate stats
        let totalHours = 0;
        let lateCount = 0;
        let absencesCount = 0;
        res.data.forEach(log => {
          totalHours += calculateHours(log.clockIn, log.clockOut, log.status);
          if (log.status === "Late") lateCount += 1;
          if (log.status === "Absent") absencesCount += 1;
        });

        setStats({
          totalHours: totalHours.toFixed(1),
          lateCount,
          absencesCount
        });
      })
      .catch(err => {
        setRecentLogs([]);
        setStats({ totalHours: 0, lateCount: 0, absencesCount: 0 });
      });
  }, []);

// calculate hours
const calculateHours = (clockIn, clockOut, status = "Present") => {
  if (clockIn === '--' || clockOut === '--' || !clockIn || !clockOut) return 0;
  const start = new Date(`2024-01-01 ${clockIn}`);
  const end = new Date(`2024-01-01 ${clockOut}`);
  const diffMs = end - start;
  const hours = diffMs / (1000 * 60 * 60);

  let cap = 8;
  if (status === "Half Day") cap = 4;
  if (status === "Absent" || status === "Leave") cap = 0;

  return Math.min(hours, cap);
};

  return ( 
    <div className="stats-grid"> 
      <div className="card-gradient"> 
        <div className="summary-card-header"> 
          <h3 className="summary-card-title">Today's Summary</h3> 
          <p className="summary-card-subtitle">Let's get this day started</p> 
        </div> 
        <div> 
          <div className="summary-hours">{calculateWorkedHours()} hrs</div> 
          <div className="clock-buttons"> 
            <button  
              onClick={handleClockIn} 
              disabled={clockInTime && !clockOutTime} 
              className="clock-button" 
            > 
              Clock In 
            </button> 
            <button  
              onClick={handleClockOut} 
              disabled={!clockInTime || clockOutTime} 
              className="clock-button" 
            > 
              Clock Out 
            </button> 
          </div> 
          <div className="clock-times"> 
            <div className="clock-time-item"> 
              <div>Clock-In Time</div> 
              <div>{formatTimeForDisplay(clockInTime)}</div> 
            </div> 
            <div className="clock-time-item"> 
              <div>Clock-Out Time</div> 
              <div>{formatTimeForDisplay(clockOutTime)}</div> 
            </div> 
          </div> 
        </div> 
      </div> 
 
      <div className="stat-card"> 
        <div className="stat-card-content"> 
          <h3 className="stat-card-title">Total Hours Worked (Last 15d)</h3> 
          <div className="stat-number">{stats.totalHours}</div> 
        </div> 
        <div className="stat-card-icon-container"> 
          <Clock className="stat-card-icon text-blue-500" /> 
          <div className="online-indicator"></div> 
        </div> 
      </div> 
 
      <div className="stat-card stat-card-late"> 
        <div className="stat-card-content"> 
          <h3 className="stat-card-title">Number of Late Resumptions (15d)</h3> 
          <div className="stat-number">{stats.lateCount}</div> 
        </div> 
        <div className="stat-card-icon-container"> 
          <Timer className="stat-card-icon text-orange-500" /> 
          <div className="online-indicator"></div> 
        </div> 
      </div> 
 
      <div className="stat-card stat-card-absences"> 
        <div className="stat-card-content"> 
          <h3 className="stat-card-title">Number of Absences (15d)</h3> 
          <div className="stat-number">{stats.absencesCount}</div>  
        </div> 
        <div className="stat-card-icon-container"> 
          <Users className="stat-card-icon text-red-500" /> 
          <div className="online-indicator"></div> 
        </div> 
      </div> 
    </div> 
  ); 
}; 
 
export default StatsSection;