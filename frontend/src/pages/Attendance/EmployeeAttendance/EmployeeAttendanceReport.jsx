import React, { useState } from 'react';
import './EmployeeAttendanceReport.css';

const EmployeeAttendanceReport = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('February');

  const monthDays = {
    'January': 31,
    'February': 29, 
    'March': 31,
    'April': 30,
    'May': 31,
    'June': 30,
    'July': 31,
    'August': 31,
    'September': 30,
    'October': 31,
    'November': 30,
    'December': 31
  };


  const employees = [
    {
      id: 'EMP001',
      name: 'Regine Hambiol',
      department: 'Information Technology',
      attendance: {
        1: 'P', 2: 'P', 3: 'L', 4: 'P', 5: 'P', 6: 'OFF', 7: 'OFF',
        8: 'P', 9: 'A', 10: 'P', 11: 'P', 12: 'P', 13: 'OFF', 14: 'OFF',
        15: 'P', 16: 'P', 17: 'H', 18: 'P', 19: 'P', 20: 'OFF', 21: 'OFF',
        22: 'P', 23: 'P', 24: 'P', 25: 'L', 26: 'P', 27: 'OFF', 28: 'OFF',
        29: 'P'
      }
    },
    {
      id: 'EMP002',
      name: 'Lim Alcovendas',
      department: 'Human Resources',
      attendance: {
        1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'OFF', 7: 'OFF',
        8: 'P', 9: 'P', 10: 'P', 11: 'L', 12: 'L', 13: 'OFF', 14: 'OFF',
        15: 'P', 16: 'P', 17: 'P', 18: 'P', 19: 'A', 20: 'OFF', 21: 'OFF',
        22: 'P', 23: 'P', 24: 'H', 25: 'P', 26: 'P', 27: 'OFF', 28: 'OFF',
        29: 'P'
      }
    },
    {
      id: 'EMP003',
      name: 'Klei Ishia Pagatpatan',
      department: 'Finance',
      attendance: {
        1: 'L', 2: 'P', 3: 'P', 4: 'NM', 5: 'NM', 6: 'OFF', 7: 'OFF',
        8: 'NM', 9: 'L', 10: 'NM', 11: 'L', 12: 'L', 13: 'OFF', 14: 'OFF',
        15: 'NM', 16: 'NM', 17: 'NM', 18: 'NM', 19: 'NM', 20: 'OFF', 21: 'OFF',
        22: 'NM', 23: 'NM', 24: 'NM', 25: 'NM', 26: 'NM', 27: 'OFF', 28: 'OFF',
        29: 'NM'
      }
    }
  ];

  
  const currentEmployee = employees[0];

  const getDaysInMonth = (month) => {
    return monthDays[month] || 31;
  };

  const getAttendanceColor = (status) => {
    switch(status) {
      case 'P': return 'present';
      case 'A': return 'absent';
      case 'L': return 'late';
      case 'H': return 'half-day';
      case 'OFF': return 'off-day';
      case 'NM': return 'not-marked';
      default: return 'not-marked';
    }
  };

  const getAttendanceLabel = (status) => {
    switch(status) {
      case 'P': return 'Present';
      case 'A': return 'Absent';
      case 'L': return 'Late';
      case 'H': return 'Half Day';
      case 'OFF': return 'Off Day';
      case 'NM': return 'Not Marked';
      default: return 'Not Marked';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(selectedMonth);
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <th key={i} className="day-header">
          {i}
        </th>
      );
    }
    return days;
  };

  const renderAttendanceRow = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(selectedMonth);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const status = currentEmployee.attendance[i] || 'NM';
      days.push(
        <td key={i} className={`attendance-cell ${getAttendanceColor(status)}`} title={getAttendanceLabel(status)}>
          {status}
        </td>
      );
    }
    
    return days;
  };

  const exportToExcel = () => {
 
    const headers = ['Date', 'Status', 'Description'];
    let csvContent = headers.join(',') + '\n';

    csvContent += `Employee Attendance Report - ${selectedMonth} ${selectedYear}\n`;
    csvContent += `Employee: ${currentEmployee.name} (${currentEmployee.id})\n`;
    csvContent += `Department: ${currentEmployee.department}\n\n`;
    csvContent += headers.join(',') + '\n';
    
  
    const daysInMonth = getDaysInMonth(selectedMonth);
    for (let i = 1; i <= daysInMonth; i++) {
      const status = currentEmployee.attendance[i] || 'NM';
      const description = getAttendanceLabel(status);
      csvContent += `${selectedMonth} ${i} ${selectedYear},${status},"${description}"\n`;
    }
    
   
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentEmployee.name}-attendance-${selectedMonth}-${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="employee-attendance-report">
      <div className="page-header">
        <h2>My Attendance Report</h2>
      </div>

      <div className="legend-section">
        <h3>Legend</h3>
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color present"></span>
            <span>Present (P)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color absent"></span>
            <span>Absent (A)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color late"></span>
            <span>Late (L)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color half-day"></span>
            <span>Half Day (H)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color off-day"></span>
            <span>Off Day (OFF)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color not-marked"></span>
            <span>Not Marked (NM)</span>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Year</label>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="filter-select"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Month</label>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-select"
          >
            {Object.keys(monthDays).map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="report-container">
        <div className="table-wrapper">
          <table className="attendance-report-table">
            <thead>
              <tr>
                <th className="employee-header">Employee</th>
                {renderCalendarDays()}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="employee-info">
                  <div className="employee-name">{currentEmployee.name}</div>
                </td>
                {renderAttendanceRow()}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="action-buttons">
        <button className="download-btn" onClick={exportToExcel}>Export to Excel</button>
        <button className="print-btn" onClick={exportToPDF}>Export PDF</button>
      </div>
    </div>
  );
};

export default EmployeeAttendanceReport;