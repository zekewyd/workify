import React, { useState, useEffect } from 'react';
import DataTable from "react-data-table-component";
import { FaFilter } from "react-icons/fa";
import './EmployeeAttendanceLogs.css';
import api from "../../../api/api";

const EmployeeAttendanceLogs = () => {
  const [selectedDate, setSelectedDate] = useState('2024-02-02');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const statusOptions = ["Present", "Absent", "Late", "Half-Day", "Leave"];

  useEffect(() => {
    // build query params based on filters
    let params = {};
    if (selectedDate) params.date = selectedDate;

    api.get("/attendance-logs", { params }) 
      .then(res => {
        // map backend
        const logs = res.data.map((log, idx) => {
          const calculated = calculateHours(log.clockIn, log.clockOut, log.status);

          return {
            id: log._id,
            date: log.date,
            clockIn: log.clockIn,
            clockOut: log.clockOut,
            status: log.status,
            ...calculated
          };
        });
        setAttendanceData(logs);
      })
      .catch(err => {
        console.error("Error fetching employee attendance logs:", err);
        setAttendanceData([]);
      });
  }, [selectedDate]);

  // Filter attendance data based on search term and selected status
  const filteredData = attendanceData.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.date.includes(searchTerm) || 
                         item.status.toLowerCase().includes(searchLower);
    const matchesStatus = selectedStatus === "" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Toggle filter dropdown
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Handle status selection
  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setIsFilterOpen(false);
  };

  // Clear filter
  const clearFilter = () => {
    setSelectedStatus("");
    setIsFilterOpen(false);
  };

  const calculateHours = (clockIn, clockOut, status = "PRESENT") => {
    if (clockIn === '--' || clockOut === '--' || !clockIn || !clockOut) {
      return { totalHrs: '0.0', regularHrs: '0.0', overtime: '0.0' };
    }
    const startTime = new Date(`2024-01-01 ${clockIn}`);
    const endTime = new Date(`2024-01-01 ${clockOut}`);
    const diffMs = endTime - startTime;
    const totalHours = diffMs / (1000 * 60 * 60);

    let regularHrs = 8;
    if (status.toUpperCase() === "HALF DAY") regularHrs = 4;
    if (status.toUpperCase() === "ABSENT" || status.toUpperCase() === "LEAVE") regularHrs = 0;

    const overtime = regularHrs > 0 ? Math.max(0, totalHours - regularHrs) : 0;

    return {
      totalHrs: parseFloat(totalHours.toFixed(1)),
      regularHrs: parseFloat(regularHrs.toFixed(1)),
      overtime: parseFloat(overtime.toFixed(1))
    };
  };

  // Define columns for DataTable
  const columns = [
    {
      name: "Date",
      selector: row => row.date,
      sortable: true,
      width: "15%",
    },
    {
      name: "Clock In",
      selector: row => row.clockIn,
      sortable: true,
      width: "12%",
    },
    {
      name: "Clock Out",
      selector: row => row.clockOut,
      sortable: true,
      width: "12%",
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      width: "15%",
      cell: (row) => (
        <span className={`status-badge ${row.status.toLowerCase().replace(' ', '-')}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Total Hrs",
      selector: row => row.totalHrs,
      sortable: true,
      width: "12%",
    },
    {
      name: "Regular Hrs",
      selector: row => row.regularHrs,
      sortable: true,
      width: "12%",
    },
    {
      name: "Overtime",
      selector: row => row.overtime,
      sortable: true,
      width: "12%",
    },
  ];

  // Custom styles for DataTable matching your reference
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#003f7d',
        fontWeight: 'bold',
        color: '#fff',
        fontSize: '14px',
      },
    },
    rows: {
      style: {
        minHeight: '55px',
        fontSize: '12px',
        backgroundColor: '#ffffff',
        color: '#000000',
      },
    },
    pagination: {
      style: {
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e0e0e0',
      },
    },
  };

  return (
    <div className="employee-attendance-logs">
      <div className="attendance-table-container">
        <div className="attendance-controls-container">
          <div className="attendance-search-container">
            <input
              type="text"
              placeholder="Search by date or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="attendance-search-input"
            />
          </div>
          <div className="attendance-date-container">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="attendance-date-input"
            />
          </div>
          <div className="attendance-filter-container">
            <button 
              className={`attendance-filter-button ${selectedStatus ? 'active' : ''}`}
              onClick={toggleFilter}
            >
              <FaFilter />
            </button>
            {isFilterOpen && (
              <div className="attendance-filter-dropdown">
                <div className="attendance-filter-dropdown-header">
                  <span>Filter by Status</span>
                  <button 
                    className="attendance-clear-filter-btn"
                    onClick={clearFilter}
                  >
                    Clear
                  </button>
                </div>
                <div className="attendance-filter-options">
                  <div 
                    className={`attendance-filter-option ${selectedStatus === "" ? 'active' : ''}`}
                    onClick={() => handleStatusSelect("")}
                  >
                    All Status
                  </div>
                  {statusOptions.map(status => (
                    <div 
                      key={status}
                      className={`attendance-filter-option ${selectedStatus === status ? 'active' : ''}`}
                      onClick={() => handleStatusSelect(status)}
                    >
                      {status}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          paginationPerPage={6}
          paginationRowsPerPageOptions={[6, 12, 18, 24]}
          pointerOnHover
        />
      </div>
    </div>
  );
};

export default EmployeeAttendanceLogs;