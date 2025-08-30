import React, { useState } from 'react';
import './AdminAttendanceReport.css';

const AdminAttendanceReport = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('February');
  const [searchTerm, setSearchTerm] = useState('');

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
      id: '',
      name: 'Regine Hambiol',
      attendance: {
        1: 'P', 2: 'P', 3: 'L', 4: 'P', 5: 'P', 6: 'OFF', 7: 'OFF',
        8: 'P', 9: 'A', 10: 'P', 11: 'P', 12: 'P', 13: 'OFF', 14: 'OFF',
        15: 'P', 16: 'P', 17: 'H', 18: 'P', 19: 'P', 20: 'OFF', 21: 'OFF',
        22: 'P', 23: 'P', 24: 'P', 25: 'L', 26: 'P', 27: 'OFF', 28: 'OFF',
        29: 'P'
      },
      totalPresent: 18,
      totalAbsent: 1,
      totalLeaves: 3
    },
    {
      id: '',
      name: 'Lim Alcovendas',
      attendance: {
        1: 'P', 2: 'P', 3: 'P', 4: 'P', 5: 'P', 6: 'OFF', 7: 'OFF',
        8: 'P', 9: 'P', 10: 'P', 11: 'L', 12: 'L', 13: 'OFF', 14: 'OFF',
        15: 'P', 16: 'P', 17: 'P', 18: 'P', 19: 'A', 20: 'OFF', 21: 'OFF',
        22: 'P', 23: 'P', 24: 'H', 25: 'P', 26: 'P', 27: 'OFF', 28: 'OFF',
        29: 'P'
      },
      totalPresent: 17,
      totalAbsent: 1,
      totalLeaves: 4
    },
    {
      id: '',
      name: 'Klei Ishia Pagatpatan',
      attendance: {
        1: 'L', 2: 'P', 3: 'P', 4: 'NP', 5: 'NP', 6: 'OFF', 7: 'OFF',
        8: 'NP', 9: 'L', 10: 'NP', 11: 'L', 12: 'L', 13: 'OFF', 14: 'OFF',
        15: 'NP', 16: 'NP', 17: 'NP', 18: 'NP', 19: 'NP', 20: 'OFF', 21: 'OFF',
        22: 'NP', 23: 'NP', 24: 'NP', 25: 'NP', 26: 'NP', 27: 'OFF', 28: 'OFF',
        29: 'NP'
      },
      totalPresent: 1,
      totalAbsent: 0,
      totalLeaves: 21
    }
  ];

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
      case 'NP': return 'not-present';
      default: return '';
    }
  };

  const getAttendanceLabel = (status) => {
    switch(status) {
      case 'P': return 'Present';
      case 'A': return 'Absent';
      case 'L': return 'Late';
      case 'H': return 'Half Day';
      case 'OFF': return 'Off Day';
      case 'NP': return 'Not Present';
      default: return 'Not Marked';
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(selectedMonth);
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(
        <th key={i} className="adminAttendance-report-day-header">
          {i}
        </th>
      );
    }
    return days;
  };

  const renderEmployeeRow = (employee) => {
    const days = [];
    const daysInMonth = getDaysInMonth(selectedMonth);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const status = employee.attendance[i] || 'NM';
      days.push(
        <td key={i} className={`adminAttendance-report-attendance-cell ${getAttendanceColor(status)}`}>
          {status}
        </td>
      );
    }
    
    return (
      <tr key={employee.id}>
        <td className="adminAttendance-report-employee-info">
          <div className="adminAttendance-report-employee-id">{employee.id}</div>
          <div className="adminAttendance-report-employee-name">{employee.name}</div>
        </td>
        {days}
        <td className="adminAttendance-report-summary-cell present">{employee.totalPresent}</td>
        <td className="adminAttendance-report-summary-cell absent">{employee.totalAbsent}</td>
        <td className="adminAttendance-report-summary-cell leaves">{employee.totalLeaves}</td>
      </tr>
    );
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToExcel = () => {
  
    const headers = ['Employee ID', 'Employee Name'];
    const daysInMonth = getDaysInMonth(selectedMonth);

    for (let i = 1; i <= daysInMonth; i++) {
      headers.push(`Day ${i}`);
    }
    headers.push('Total Present', 'Total Absent', 'Total Leaves');
    
    let csvContent = headers.join(',') + '\n';
    
  
    filteredEmployees.forEach(employee => {
      const row = [employee.id, `"${employee.name}"`];
      
    
      for (let i = 1; i <= daysInMonth; i++) {
        row.push(employee.attendance[i] || 'NM');
      }
      
      row.push(employee.totalPresent, employee.totalAbsent, employee.totalLeaves);
      csvContent += row.join(',') + '\n';
    });
    

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-report-${selectedMonth}-${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="admin-attendance-report">
      <div className="adminAttendance-report-control-container">
        <div className="adminAttendance-report-search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or ID..."
            className="adminAttendance-report-search-input"
          />
        </div>

        <div className="adminAttendance-report-filter-group">
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="adminAttendance-report-filter-select"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
        </div>

        <div className="adminAttendance-report-filter-group">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="adminAttendance-report-filter-select"
          >
            {Object.keys(monthDays).map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="adminAttendance-report-container">
        <div className="adminAttendance-report-table-wrapper">
          <table className="adminAttendance-report-table">
            <thead>
              <tr>
                <th className="adminAttendance-report-header">Employee</th>
                {renderCalendarDays()}
                <th className="adminAttendance-report-summary-header present">Total Present</th>
                <th className="adminAttendance-report-summary-header absent">Total Absent</th>
                <th className="adminAttendance-report-summary-header leaves">Total Leaves</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(renderEmployeeRow)}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-attendance-table-footer">
        <div className="adminAttendance-report-legend">
          <div className="adminAttendance-report-legend-item">
            <span className="adminAttendance-report-legend-color present"></span>
            <span>Present (P)</span>
          </div>
          <div className="adminAttendance-report-legend-item">
            <span className="adminAttendance-report-legend-color absent"></span>
            <span>Absent (A)</span>
          </div>
          <div className="adminAttendance-report-legend-item">
            <span className="adminAttendance-report-legend-color late"></span>
            <span>Late (L)</span>
          </div>
          <div className="adminAttendance-report-legend-item">
            <span className="adminAttendance-report-legend-color half-day"></span>
            <span>Half Day (H)</span>
          </div>
          <div className="adminAttendance-report-legend-item">
            <span className="adminAttendance-report-legend-color off-day"></span>
            <span>Off Day (OFF)</span>
          </div>
        </div>

        <div className="adminAttendance-report-action-buttons">
          <button className="adminAttendance-report-export-btn" onClick={exportToExcel}>Export to Excel</button>
          <button className="adminAttendance-report-print-btn" onClick={exportToPDF}>Export PDF</button>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceReport;