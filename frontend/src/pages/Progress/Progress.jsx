import React, { useState , useEffect} from "react";
import DataTable from "react-data-table-component";
import { FaFilter, FaCheck } from "react-icons/fa";
import "./Progress.css";
import api from "../../api/api";

function ProgressList() {
  const userRole = localStorage.getItem("userRole") || "employee";
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({
    hoursWorked: "",
    completionDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [Progress, setProgress] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

// fetch progress logs
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await api.get("/progress");
        // format data to ensure consistent structure
        const mappedData = res.data.map(item => ({
          _id: item._id,
          taskID: item.taskID?._id || "",
          name: item.userID?.fullName || "",
          taskName: item.taskID?.taskName || "",
          department: item.userID?.department?.departmentName || "",
          status: item.progressStatus || "",
          hoursWorked: item.hoursWorked || 0,
          completionDate: item.completionDate
            ? new Date(item.completionDate).toLocaleDateString("en-US")
            : "00-00-0000",
        }));
        setProgress(mappedData);
      } catch (err) {
        console.error("Error fetching progress:", err);
        setError("Failed to load progress data");
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // fetch available departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data } = await api.get("/department");
        const departmentNames = data.map(dept => dept.departmentName).sort();
        setAvailableDepartments(departmentNames);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };

    fetchDepartments();
  }, []);
  
  const parseDate = (dateString) => {
    const [month, day, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const filteredProgress = Progress
    .filter(progress => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = progress.taskName.toLowerCase().includes(searchLower);
      const matchesDepartment = selectedDepartment === "" || progress.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      // normalize status to lowercase
      const statusA = (a.status || "").toLowerCase();
      const statusB = (b.status || "").toLowerCase();

      // completed logs at the bottom
      if (statusA === "completed" && statusB !== "completed") return 1;
      if (statusA !== "completed" && statusB === "completed") return -1;

      // in progress/pending, sort by completionDate descending
      const dateA = parseDate(a.completionDate);
      const dateB = parseDate(b.completionDate);
      return dateB - dateA; // latest first
    });

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setSelectedDepartment("");
    setIsFilterOpen(false);
  };

  
  const handleMarkAsDone = (task) => {
    console.log("Clicked row:", task);
    setSelectedTask(task);
    setFormData({ hoursWorked: "", completionDate: "" });
    setShowLogModal(true);
  };

  const handleSubmitProgress = async () => {
    if (!selectedTask) return;

    try {
      const payload = {
        taskID: selectedTask.taskID,
        hoursWorked: Number(formData.hoursWorked),
        completionDate: formData.completionDate,
      };

      console.log("Submitting payload:", payload);
      const res = await api.post("/progress/log", payload);
      console.log("Progress logged:", res.data); 

      // refresh list after update
      const updatedRes = await api.get("/progress");
      const mappedData = updatedRes.data.map(item => ({
        _id: item._id,
        taskID: item.taskID?._id || "",
        name: item.userID?.fullName || "",
        taskName: item.taskID?.taskName || "",
        department: item.userID?.department?.departmentName || "",
        status: item.progressStatus || "",
        hoursWorked: item.hoursWorked || 0,
        completionDate: item.completionDate
          ? new Date(item.completionDate).toLocaleDateString("en-US")
          : "00-00-0000",
      }));
      setProgress(mappedData);

      setShowLogModal(false);
    } catch (err) {
      console.error("Error logging progress:", err);
      alert("Failed to log progress. Please try again.");
    }
  };

  const baseColumns = [
    {
      name: "Name",
      selector: row => row.name,
      sortable: true,
      width: "18%",
      sortFunction: (rowA, rowB) => {
        return rowA.name.localeCompare(rowB.name);
      },
    },
    {
      name: "Task Name",
      selector: row => row.taskName,
      sortable: true,
      width: "18%",
      sortFunction: (rowA, rowB) => {
        return rowA.taskName.localeCompare(rowB.taskName);
      },
    },
    {
      name: "Department",
      selector: row => row.department,
      sortable: true,
      width: "12%",
      sortFunction: (rowA, rowB) => {
        return rowA.department.localeCompare(rowB.department);
      },
    },
    {
      name: "Hrs Worked",
      selector: row => `${row.hoursWorked} hrs`,
      sortable: true,
      center: true,
      width: "12%",
      sortFunction: (rowA, rowB) => {
        return rowA.hoursWorked - rowB.hoursWorked;
      },
    },
    {
      name: "Date",
      selector: row => row.completionDate,
      sortable: true,
      width: "12%",
      center: true,
      sortFunction: (rowA, rowB) => {
        const dateA = parseDate(rowA.completionDate);
        const dateB = parseDate(rowB.completionDate);
        return dateB - dateA; 
      },
    },
    {
      name: "Status",
      selector: row => row.status,
      width: "15%",
      center: true,
      cell: (row) => {
        const status = row.status?.toLowerCase();
        let statusClass = "";
        
        if (status === "completed") {
          statusClass = "status-completed";
        } else if (status === "on progress" || status === "in progress") {
          statusClass = "status-on-progress";
        } else if (status === "pending") {
          statusClass = "status-pending";
        }
        
        return (
          <span className={statusClass}>
            {row.status?.toUpperCase()}
          </span>
        );
      }
    },
  ];
  // hide action column for non-employees
    if (userRole === "employee") {
      baseColumns.push({
          name: "Action",
          width: "13%",
          center: true,
          cell: (row) => {
            const status = row.status?.toLowerCase();
            const isCompleted = status === "completed";
            
            return (
              <button
                style={{
                  backgroundColor: isCompleted ? '#6c757d' : '#028a0f',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '20px',
                  cursor: isCompleted ? 'default' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  width: '100px', 
                  height: '32px', 
                  textAlign: 'center',
                  opacity: isCompleted ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleMarkAsDone(row)}
                disabled={isCompleted}
              >
                <FaCheck size={12} />
                {isCompleted ? "Done" : "Mark as Done"}
              </button>
            );
          },
          ignoreRowClick: true,  
          allowOverflow: true,  
          button: true,
        });
    }
    const columns = baseColumns;

  if (loading) return <p>Loading progress...</p>;
  if (error) return <p>{error}</p>;

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
    <div className="progress-container">
      <div className="progress-table-container">
        <div className="progress-controls-container">
          <div className="progress-search-container">
            <input
              type="text"
              placeholder="Search by task name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="progress-search-input"
            />
          </div>
          <div className="progress-filter-container">
            <button 
              className={`progress-filter-button ${selectedDepartment ? 'active' : ''}`}
              onClick={toggleFilter}
            >
              <FaFilter />
            </button>
            {isFilterOpen && (
              <div className="progress-filter-dropdown">
                <div className="progress-filter-dropdown-header">
                  <span>Filter by Department</span>
                  <button 
                    className="progress-clear-filter-btn"
                    onClick={clearFilter}
                  >
                    Clear
                  </button>
                </div>
                <div className="progress-filter-options">
                  <div 
                    className={`progress-filter-option ${selectedDepartment === "" ? 'active' : ''}`}
                    onClick={() => handleDepartmentSelect("")}
                  >
                    All Departments
                  </div>
                  {availableDepartments.map(department => (
                    <div 
                      key={department}
                      className={`progress-filter-option ${selectedDepartment === department ? 'active' : ''}`}
                      onClick={() => handleDepartmentSelect(department)}
                    >
                      {department}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <DataTable
          columns={columns}
          data={filteredProgress}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          paginationPerPage={6}
          paginationRowsPerPageOptions={[6, 12, 18, 24]}
          pointerOnHover
        />

        {showLogModal && (
          <div className="progress-log-backdrop">
            <div className="progress-log-modal">
              <h3>Log Progress</h3>
              <div>
                <label>Hours Worked</label>
                <input
                  type="number"
                  value={formData.hoursWorked}
                  onChange={(e) =>
                    setFormData({ ...formData, hoursWorked: e.target.value })
                  }
                />
              </div>
              <div>
                <label>Completion Date</label>
                <input
                  type="date"
                  value={formData.completionDate}
                  onChange={(e) =>
                    setFormData({ ...formData, completionDate: e.target.value })
                  }
                />
              </div>
              <div className="progress-log-actions">
                <button onClick={handleSubmitProgress}>Submit</button>
                <button onClick={() => setShowLogModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProgressList;