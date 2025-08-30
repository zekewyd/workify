import React, { useState, useEffect } from 'react';
import DataTable from "react-data-table-component";
import './AdminAttendanceLogs.css';
import AddLogsModal from './Modals/AddLogsModal';
import { FaCheckCircle, FaTimesCircle, FaEdit } from "react-icons/fa";
import api from "../../../api/api";
import { FaFilter } from "react-icons/fa";

const AdminAttendanceLogs = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedDate, setSelectedDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRow, setEditingRow] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/department");
        const departmentNames = response.data.map(dept => dept.departmentName).sort();
        setDepartments(departmentNames);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setDepartments([]);
      }
    };

    fetchDepartments();
  }, []);

  // fetch attendance logs
  useEffect(() => {
    const fetchAttendanceLogs = async () => {
      try {
        setLoading(true);
        // build query params based on filters
        let params = {};
        // only filter dept if not all dept
        if (selectedDepartment && selectedDepartment !== "All Departments") {
          params.department = selectedDepartment;
        }
        // only filter date if selectedDate is not empty
        if (selectedDate) {
          params.date = selectedDate;
        }

        const res = await api.get("/attendance-logs", { params });
        console.log("Attendance logs from backend:", res.data);
        const logs = res.data.map((log, idx) => {
          let regularHrs = 8.0;
          if (log.status && log.status.toUpperCase() === "HALF DAY") regularHrs = 4.0;
          if (
            log.status &&
            (log.status.toUpperCase() === "ABSENT" || log.status.toUpperCase() === "LEAVE")
          )
            regularHrs = 0.0;

          return {
            id: log._id,
            employeeName: log.employeeName,
            department: log.department,
            date: log.date,
            clockIn: log.clockIn,
            clockOut: log.clockOut,
            status: log.status,
            totalHrs: Number(log.totalHrs ?? 0).toFixed(1),
            regularHrs: regularHrs.toFixed(1),
            overtime: Number(log.overtime ?? 0).toFixed(1),
          };
        });
        setAttendanceData(logs);
        setError(null);
      } catch (err) {
        console.error("Error fetching attendance logs:", err);
        setAttendanceData([]);
        setError("Failed to load attendance logs. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceLogs();
  }, [selectedDepartment, selectedDate]);

  const handleEdit = (id) => {
    setEditingRow(id);
  };

  const handleSave = (id, updatedData) => {
    setAttendanceData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updatedData } : item
      )
    );
    setEditingRow(null);
  };

  const handleCancel = () => {
    setEditingRow(null);
  };

  const handleAddLog = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleSaveNewLog = (newLogData) => {
    const { clockIn, clockOut } = newLogData;
    const calculated = calculateHours(clockIn, clockOut);

    const newId = Math.max(0, ...attendanceData.map(item => item.id)) + 1;
    const newLogEntry = {
      id: newId,
      ...newLogData,
      ...calculated 
    };

    setAttendanceData(prev => [...prev, newLogEntry]);
    setShowAddModal(false);
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

  const EditableCell = ({ value, onChange, type = "text", options = null }) => {
    if (options) {
      return (
        <select 
          value={value}
          onChange={onChange}
          className="admin-attendance-edit-select"
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }
    
    return (
      <input 
        type={type}
        value={value !== '--' ? value : ''}
        onChange={onChange}
        className="admin-attendance-edit-input"
      />
    );
  };

  const filteredData = attendanceData.filter(item =>
    item.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setSelectedDepartment('All Departments');
    setIsFilterOpen(false);
  };

  const columns = [
    {
      name: "Employee Name",
      selector: row => row.employeeName,
      sortable: true,
      width: "15%",
      sortFunction: (rowA, rowB) => {
        return rowA.employeeName.localeCompare(rowB.employeeName);
      },
      cell: (row) => (
        <span style={{ color: '#000000' }}>
          {row.employeeName}
        </span>
      ),
    },
    {
      name: "Department",
      selector: row => row.department,
      sortable: true,
      width: "12%",
      center: true,
      cell: (row) => (
        <span style={{ color: '#000000' }}>
          {row.department}
        </span>
      ),
    },
    {
      name: "Date",
      selector: row => row.date,
      sortable: true,
      width: "10%",
      center: true,
      cell: (row) => editingRow === row.id ? (
        <EditableCell 
          type="date"
          value={row.date}
          onChange={(e) => {
            const newData = [...attendanceData];
            const index = newData.findIndex(item => item.id === row.id);
            newData[index].date = e.target.value;
            setAttendanceData(newData);
          }}
        />
      ) : (
        <span style={{ color: '#000000' }}>
          {row.date}
        </span>
      ),
    },
    {
      name: "Clock In",
      selector: row => row.clockIn,
      sortable: true,
      width: "10%",
      center: true,
      cell: (row) => editingRow === row.id ? (
        <EditableCell 
          type="time"
          value={row.clockIn}
          onChange={(e) => {
            const newData = [...attendanceData];
            const index = newData.findIndex(item => item.id === row.id);
            newData[index].clockIn = e.target.value || '--';
            setAttendanceData(newData);
          }}
        />
      ) : row.clockIn,
    },
    {
      name: "Clock Out",
      selector: row => row.clockOut,
      sortable: true,
      width: "10%",
      center: true,
      cell: (row) => editingRow === row.id ? (
        <EditableCell 
          type="time"
          value={row.clockOut}
          onChange={(e) => {
            const newData = [...attendanceData];
            const index = newData.findIndex(item => item.id === row.id);
            newData[index].clockOut = e.target.value || '--';
            setAttendanceData(newData);
          }}
        />
      ) : row.clockOut,
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      width: "10%",
      center: true,
      cell: (row) => editingRow === row.id ? (
        <EditableCell 
          value={row.status}
          options={['Present', 'Absent', 'Late', 'Half Day', 'Leave']}
          onChange={(e) => {
            const newData = [...attendanceData];
            const index = newData.findIndex(item => item.id === row.id);
            newData[index].status = e.target.value;
            setAttendanceData(newData);
          }}
        />
      ) : (
        <span className={`admin-attendance-status-badge ${row.status.toLowerCase().replace(' ', '-')}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Total Hrs",
      selector: row => row.totalHrs,
      sortable: true,
      width: "8%",
      center: true,
      cell: (row) => (
        <span style={{ color: '#000000' }}>
          {row.totalHrs}
        </span>
      ),
    },
    {
      name: "Regular Hrs",
      selector: row => row.regularHrs,
      sortable: true,
      width: "8%",
      center: true,
      cell: (row) => (
        <span style={{ color: '#000000' }}>
          {row.regularHrs}
        </span>
      ),
    },
    {
      name: "Overtime",
      selector: row => row.overtime,
      sortable: true,
      width: "8%",
      center: true,
      cell: (row) => (
        <span style={{ color: '#000000' }}>
          {row.overtime}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => editingRow === row.id ? (
        <div className="flex gap-2 justify-center">
          <button 
            className="admin-attendance-save-button" 
            onClick={async () => {
              const calculatedHours = calculateHours(row.clockIn, row.clockOut);
              const payload = {
                clockIn: row.clockIn,
                clockOut: row.clockOut,
                status: row.status,
                date: row.date,
                ...calculatedHours
              };

              try {
                await api.put(`/attendance-logs/${row.id}`, payload);
                handleSave(row.id, { ...payload });
              } catch (err) {
                alert("Error updating attendance log: " + (err.response?.data?.message || err.message));
              }
            }}
            title="Save Changes"
          >
            <FaCheckCircle size={16} />
          </button>
          <button 
            className="admin-attendance-cancel-button" 
            onClick={handleCancel}
            title="Cancel Changes"
          >
            <FaTimesCircle size={16} />
          </button>
        </div>
      ) : (
        <button 
          className="admin-attendance-update-button"
          onClick={() => handleEdit(row.id)}
          title="Update Attendance"
        >
          <FaEdit size={16} />
        </button>
      ),
      width: "9%",
      center: true,
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

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

  const conditionalRowStyles = [
    {
      when: row => editingRow === row.id,
      style: {
        background: 'linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%)',
        border: '2px solid #FFD699',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(255, 165, 0, 0.15)',
        color: '#000000', 
        '&:hover': {
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%)',
          borderColor: '#FFB366',
          boxShadow: '0 6px 16px rgba(255, 165, 0, 0.2)',
          color: '#000000', 
        },
      },
    },
  ];

  if (loading) {
    return (
      <div className="admin-attendance-logs">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-attendance-logs">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={() => window.location.reload()}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-attendance-logs">
      <div className="admin-attendance-control-container">
        <div className="admin-attendance-search-container">
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-attendance-search-input"
            placeholder="Search employees..."
          />
        </div>

        <div className="admin-attendance-filter-group">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="admin-attendance-date-input"
          />
        </div>
        
        <div className="admin-attendance-filter-container">
          <button 
            className={`admin-attendance-filter-button ${selectedDepartment !== 'All Departments' ? 'active' : ''}`}
            onClick={toggleFilter}
          >
            <FaFilter />
          </button>
          {isFilterOpen && (
            <div className="admin-attendance-filter-dropdown">
              <div className="admin-attendance-filter-dropdown-header">
                <span>Filter by Department</span>
                <button 
                  className="admin-attendance-clear-filter-btn"
                  onClick={clearFilter}
                >
                  Clear
                </button>
              </div>
              <div className="admin-attendance-filter-options">
                <div
                  className={`admin-attendance-filter-option ${selectedDepartment === 'All Departments' ? 'active' : ''}`}
                  onClick={() => handleDepartmentSelect('All Departments')}
                >
                  All Departments
                </div>
                {departments.map((department) => (
                  <div
                    key={department}
                    className={`admin-attendance-filter-option ${selectedDepartment === department ? 'active' : ''}`}
                    onClick={() => handleDepartmentSelect(department)}
                  >
                    {department}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className="admin-attendance-add-logs-btn" onClick={handleAddLog}>Add Logs</button>
      </div>

      <div className="admin-attendance-table-container">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          conditionalRowStyles={conditionalRowStyles}
          paginationPerPage={6}
          paginationRowsPerPageOptions={[6, 12, 18, 24]}
          pointerOnHover
        />
      </div>

      <AddLogsModal 
        show={showAddModal}
        onClose={handleCloseModal}
        onSave={handleSaveNewLog}
        calculateHours={calculateHours}
      />
    </div>
  );
};

export default AdminAttendanceLogs;