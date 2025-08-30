import React, { useState, useEffect } from 'react';
import DataTable from "react-data-table-component";
import { FaFilter, FaEdit, FaEye } from "react-icons/fa";
import './SchedulingPage.css';
import ScheduleInformationModal from './Modals/ScheduleInformationModal';
import EditScheduleModal from './Modals/EditScheduleModal';
import ViewDetailsModal from './Modals/ViewDetailsModal';
import api from "../../api/api";

const SchedulingPage = () => {
  const [rawSchedules, setRawSchedules] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScheduleType, setSelectedScheduleType] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredSchedules, setFilteredSchedules] = useState([]);

  
  const scheduleTypes = ["Full time", "Half Day"];
  const getScheduleDate = (schedule) => {
    const dateField = schedule.startDate || schedule.createdDate || schedule.dateCreated || schedule.createdAt || schedule.effectiveDate;
    
    if (!dateField) {

      return new Date();
    }
    
    return new Date(dateField);
  };

  const sortSchedulesByStartDate = (schedulesToSort) => {
    return [...schedulesToSort].sort((a, b) => {
      const dateA = getScheduleDate(a);
      const dateB = getScheduleDate(b);
      return dateB - dateA; 
    });
  };

 // fetch schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const { data } = await api.get("/schedule");
        const sortedData = sortSchedulesByStartDate(data);
        setRawSchedules(sortedData);
        setFilteredSchedules(sortedData);
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    };
    fetchSchedules();
  }, []);

  // filtering
  useEffect(() => {
    let filtered = rawSchedules;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(schedule =>
        schedule.scheduleName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by schedule type (case-insensitive)
    if (selectedScheduleType) {
      filtered = filtered.filter(schedule =>
        schedule.scheduleType && 
        schedule.scheduleType.toLowerCase() === selectedScheduleType.toLowerCase()
      );
    }
    
    filtered = sortSchedulesByStartDate(filtered);
    
    setFilteredSchedules(filtered);
  }, [searchTerm, selectedScheduleType, rawSchedules]);

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleScheduleTypeSelect = (scheduleType) => {
    setSelectedScheduleType(scheduleType);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setSelectedScheduleType("");
    setIsFilterOpen(false);
  };

  const handleAddSchedule = (newSchedule) => {
    const updatedSchedules = sortSchedulesByStartDate([...rawSchedules, newSchedule]);
    setRawSchedules(updatedSchedules);
    setIsModalOpen(false);
  };

  const handleUpdateSchedule = (updatedSchedule) => {
    const updatedSchedules = rawSchedules.map(sch => 
      sch._id === updatedSchedule._id ? updatedSchedule : sch
    );
    const sortedSchedules = sortSchedulesByStartDate(updatedSchedules);
    setRawSchedules(sortedSchedules);
    setIsEditModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleEditClick = (schedule) => {
    setSelectedSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (schedule) => {
    setSelectedSchedule(schedule);
    setIsViewModalOpen(true);
  };

  const columns = [
    {
      name: "Schedule Name",
      selector: row => row.scheduleName,
      sortable: true,
      width: "20%",
      sortFunction: (rowA, rowB) => {
        return rowA.scheduleName.localeCompare(rowB.scheduleName);
      },
    },
    {
      name: "Day",
      selector: row => row.workDays && row.workDays.length > 0 ? row.workDays.join(', ') : 'No days selected',
      sortable: true,
      width: "25%",
    },
    {
      name: "Time",
      selector: row => `${row.workStart} - ${row.workEnd}`,
      sortable: true,
      width: "20%",
    },
    {
      name: "Schedule Type",
      selector: row => row.scheduleType,
      sortable: true,
      width: "15%",
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="schedule-actions">
          <button 
            className="schedule-action-btn update-btn"
            onClick={() => handleEditClick(row)}
            title="Update Schedule"
          >
            <FaEdit size={14} />
          </button>
          <button 
            className="schedule-action-btn view-btn"
            onClick={() => handleViewDetails(row)}
            title="View Details"
          >
            <FaEye size={14} />
          </button>
        </div>
      ),
      width: "20%",
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

  return (
    <div className="scheduling-page">
      <div className="schedule-controls-container">
        <div className="schedule-search-container">
          <input
            type="text"
            placeholder="Search by Schedule Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="schedule-search-input"
          />
        </div>
        
        <button 
          className="add-schedule-button"
          onClick={() => setIsModalOpen(true)}
        >
          Add Schedule
        </button>

        <div className="schedule-filter-container">
          <button 
            className={`schedule-filter-button ${selectedScheduleType ? 'active' : ''}`}
            onClick={toggleFilter}
          >
            <FaFilter />
          </button>
          {isFilterOpen && (
            <div className="schedule-filter-dropdown">
              <div className="schedule-filter-dropdown-header">
                <span>Filter by Schedule Type</span>
                <button 
                  className="schedule-clear-filter-btn"
                  onClick={clearFilter}
                >
                  Clear
                </button>
              </div>
              <div className="schedule-filter-options">
                <div 
                  className={`schedule-filter-option ${selectedScheduleType === "" ? 'active' : ''}`}
                  onClick={() => handleScheduleTypeSelect("")}
                >
                  All Types
                </div>
                {scheduleTypes.map(scheduleType => (
                  <div 
                    key={scheduleType}
                    className={`schedule-filter-option ${selectedScheduleType === scheduleType ? 'active' : ''}`}
                    onClick={() => handleScheduleTypeSelect(scheduleType)}
                  >
                    {scheduleType}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="schedule-table-container">
        <DataTable
          columns={columns}
          data={filteredSchedules}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          paginationPerPage={6}
          paginationRowsPerPageOptions={[6, 12, 18, 24]}
          pointerOnHover
        />
      </div>

      {isModalOpen && (
        <ScheduleInformationModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddSchedule}
        />
      )}

      {isEditModalOpen && selectedSchedule && (
        <EditScheduleModal
          schedule={selectedSchedule}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedSchedule(null);
          }}
          onSave={handleUpdateSchedule}
        />
      )}

      {isViewModalOpen && selectedSchedule && (
        <ViewDetailsModal
          schedule={selectedSchedule}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedSchedule(null);
          }}
        />
      )}
    </div>
  );
};

export default SchedulingPage;