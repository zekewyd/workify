import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { FaFilter, FaEdit, FaTrash } from "react-icons/fa";
import AddTaskModal from "./Modals/AddTaskModal";
import UpdateTaskModal from "./Modals/UpdateTaskModal";
import "./Task.css";
import api from "../../api/api";

function Task() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // fetch tasks 
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/tasks");
        // format data to ensure consistent structure
        const mappedTasks = res.data.map((task) => ({
          id: task._id,
          taskName: task.taskName,
          description: task.description,
          assignedTo: task.assignedTo?.fullName || "",
          assignedBy: task.assignedBy?.username || "",
          department: task.department?.departmentName || "",
          dueDate: task.dueDate,
          status: task.status,
        }));
        setTasks(mappedTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    fetchTasks();
  }, []);
  
  const uniqueStatuses = [...new Set(tasks.map(task => task.status))].sort();

  const filteredTasks = tasks
    .filter(task => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        task.taskName.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.assignedTo.toLowerCase().includes(searchLower);
      const matchesStatus = selectedStatus === "" || task.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // normalize statuses to lowercase
      const statusA = (a.status || "").toLowerCase();
      const statusB = (b.status || "").toLowerCase();

      // completed tasks always at the bottom
      if (statusA === "completed" && statusB !== "completed") return 1;
      if (statusA !== "completed" && statusB === "completed") return -1;

      // for "pending" and "in progress", sort by due date descending
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateB - dateA; // (latest first)
    });

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setSelectedStatus("");
    setIsFilterOpen(false);
  };

  const handleAddTask = (newTask) => {
 
    const taskWithId = {
      ...newTask,
      id: String(tasks.length + 1),
      status: "In Progress" 
    };
    
   
    setTasks(prevTasks => [taskWithId, ...prevTasks]);
  };

  const handleUpdateTask = (taskId, updatedData) => {
    try {
     
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? {
            ...task,
            taskName: updatedData.taskName,
            description: updatedData.description,
            assignedTo: updatedData.assignedTo, // Use the display name directly
            dueDate: new Date(updatedData.dueDate).toLocaleDateString(),
            status: updatedData.status || task.status // Keep existing status if not provided
          } : task
        )
      );
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleDeleteTask = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskToDelete));
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const columns = [
    {
      name: "Task Name",
      selector: row => row.taskName,
      sortable: true,
      width: "15%",
      minWidth: "120px",
      wrap: true
    },
    {
      name: "Description",
      selector: row => row.description,
      sortable: true,
      width: "20%",
      minWidth: "150px",
      wrap: true,
    },
    {
      name: "Assigned To",
      selector: row => row.assignedTo,
      sortable: true,
      width: "11%",
      minWidth: "100px",
    },
    {
      name: "Assigned By",
      selector: row => row.assignedBy,
      sortable: true,
      width: "11%",
      minWidth: "100px",
    },
    {
      name: "Department",
      selector: row => row.department,
      sortable: true,
      center: "true",
      width: "11%",
      minWidth: "100px",
    },
    {
      name: "Due Date",
      selector: row => new Date(row.dueDate).toLocaleDateString(),
      sortable: true,
      width: "10%",
      minWidth: "90px",
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      center: "true",
      width: "10%",
      minWidth: "90px",
      cell: row => (
        <span className={`task-status-badge status-${row.status.toLowerCase().replace(' ', '-')}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Action",
      center: true,
      width: "12%",
      minWidth: "110px",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            style={{
              backgroundColor: '#ff5003',
              color: 'white',
              border: 'none',
              padding: '10px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTask(row);
              setIsUpdateModalOpen(true);
            }}
            title="Edit Task"
          >
            <FaEdit size={14} />
          </button>
          <button
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTask(row.id);
            }}
            title="Delete Task"
          >
            <FaTrash size={14} />
          </button>
        </div>
      ),
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
        padding: '5px',
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
    <div className="task-container">
      <div className="task-table-container">
        <div className="task-controls-container">
          <div className="task-search-container">
            <input
              type="text"
              placeholder="Search by task name, description, or assigned to..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="task-search-input"
            />
          </div>
          <button className="add-task-button" onClick={() => setIsModalOpen(true)}>
            Add Task
          </button>
          <div className="task-filter-container">
            <button 
              className={`task-filter-button ${selectedStatus ? 'active' : ''}`}
              onClick={toggleFilter}
            >
              <FaFilter />
            </button>
            {isFilterOpen && (
              <div className="task-filter-dropdown">
                <div className="task-filter-dropdown-header">
                  <span>Filter by Status</span>
                  <button 
                    className="task-clear-filter-btn"
                    onClick={clearFilter}
                  >
                    Clear
                  </button>
                </div>
                <div className="task-filter-options">
                  <div 
                    className={`task-filter-option ${selectedStatus === "" ? 'active' : ''}`}
                    onClick={() => handleStatusSelect("")}
                  >
                    All Statuses
                  </div>
                  {uniqueStatuses.map(status => (
                    <div 
                      key={status}
                      className={`task-filter-option ${selectedStatus === status ? 'active' : ''}`}
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
          data={filteredTasks}
          pagination
          highlightOnHover
          responsive
          customStyles={customStyles}
          paginationPerPage={6}
          paginationRowsPerPageOptions={[6, 12, 18, 24]}
          pointerOnHover
        />
      </div>
      
      <AddTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <UpdateTaskModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onUpdateTask={handleUpdateTask}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="deleteTask-modal-overlay">
          <div className="deleteTask-modal-content">
            <h3 className="deleteTask-modal-header">Confirm Delete</h3>
            <p>Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="deleteTask-modal-footer">
              <button 
                className="deleteTask-cancel-button" 
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button 
                className="deleteTask-save-button" 
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Task;