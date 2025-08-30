import React, { useState, useEffect } from 'react';
import { Clock, Coffee, AlertCircle } from 'lucide-react';
import './CurrentTimeSection.css';

const CurrentTimeSection = ({ clockInTime, clockOutTime, currentStatus }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [breakRemainingTime, setBreakRemainingTime] = useState(3600); 
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakCompleted, setBreakCompleted] = useState(false); 

  // Sample employee data
  const employeeData = {
    name: "Regine Hambiol",
    email: "reginehambiol@company.com",
    employeeNumber: "0023-232348-2327",
    clockInTime: "08:00:00",
    clockOutTime: "18:30:00", // 6:30 PM (2.5 hours overtime including break)
    regularHours: 8,
    breakHours: 1
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval;
    if (isOnBreak && breakStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - breakStartTime) / 1000);
        const remaining = Math.max(0, 3600 - elapsed);
        setBreakRemainingTime(remaining);
        
        if (remaining === 0) {
          setIsOnBreak(false);
          setBreakStartTime(null);
          setBreakRemainingTime(0); 
          setBreakCompleted(true); 
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnBreak, breakStartTime]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBreakStart = () => {
    if (!isOnBreak && !breakCompleted) {
      setBreakStartTime(Date.now());
      setBreakRemainingTime(3600); 
      setIsOnBreak(true);
    }
  };

  const getBreakStatus = () => {
    if (breakCompleted) return "Completed";
    if (!isOnBreak && breakRemainingTime === 3600) return "Not Started";
    if (isOnBreak) return "In Progress";
    return "Ready";
  };

  const getBreakTime = () => {
    if (breakCompleted) return "01:00:00"; 
    if (!isOnBreak && breakRemainingTime === 3600) return "--";
    return formatDuration(breakRemainingTime);
  };

  return (
    <div className="bottom-cards-grid">
      <div className="card-white status-card">
        <div className="status-label">CURRENT TIME</div>
        <div>
          <Clock className="status-icon text-blue-500" />
        </div>
        <div className="status-value">{formatTime(currentTime)}</div>
        <div className="status-description">Live Time</div>
      </div>

      <div className={`card-white status-card break-card ${breakCompleted ? 'disabled' : ''}`}>
        <div className="status-label">BREAK TIME</div>
        <div>
          <Coffee className={`status-icon ${breakCompleted ? 'text-gray-400' : 'text-orange-500'}`} />
        </div>
        <div className="status-value">{getBreakTime()}</div>
        <div className="status-description">{getBreakStatus()}</div>
        {currentStatus === 'Clocked In' && !isOnBreak && !breakCompleted && breakRemainingTime === 3600 && (
          <button 
            className="break-button"
            onClick={handleBreakStart}
          >
            Start Break
          </button>
        )}
        {isOnBreak && (
          <div className="break-countdown">Countdown Active</div>
        )}
        {breakCompleted && (
          <div className="break-completed">Break Used</div>
        )}
      </div>

      <div className="card-white status-card">
        <div className="status-label">STATUS</div>
        <div>
          <AlertCircle className={`status-icon ${currentStatus === 'Clocked In' ? 'text-green-500' : 'text-red-500'}`} />
        </div>
        <div className="status-value">{currentStatus || 'Clocked Out'}</div>
        <div className="status-description">Current Status</div>
      </div>
    </div>
  );
};

export default CurrentTimeSection;