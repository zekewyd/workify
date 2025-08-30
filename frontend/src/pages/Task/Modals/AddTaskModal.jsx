import React, { useState, useEffect } from 'react';
import './AddTaskModal.css';
import api from "../../../api/api";

const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    assignedTo: "",
    assignedToId: "",
    dueDate: "",
  });

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // fetch all employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/emp-info/all");
        console.log("Employees fetched:", res.data);
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  // format date to MM/DD/YYYY for backend
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "assignedTo") {
      if (value) {
        const filtered = employees.filter((emp) => {
          const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
          const email = emp?.userID?.email?.toLowerCase() || "";
          return (
            fullName.includes(value.toLowerCase()) ||
            email.includes(value.toLowerCase())
          );
        });
        setFilteredEmployees(filtered);
        setShowDropdown(filtered.length > 0);
      } else {
        setFilteredEmployees([]);
        setShowDropdown(false);
      }
    }
  };

  // select employee from dropdown
  const handleEmployeeSelect = (employee) => {
    const displayName =
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
      employee.userID?.email ||
      "Unknown";

    setFormData((prev) => ({
      ...prev,
      assignedTo: displayName,             
      assignedToId: employee.userID?._id || "" 
    }));
    setShowDropdown(false);
  };

  // submit task
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.taskName ||
      !formData.description ||
      !formData.assignedToId ||
      !formData.dueDate
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        taskName: formData.taskName,
        description: formData.description,
        assignedTo: formData.assignedToId, // userID._id
        dueDate: formatDate(formData.dueDate), // backend requires MM/DD/YYYY
      };

      console.log("Sending payload:", payload);

      const res = await api.post("/tasks/create", payload);
      console.log("Response:", res.data);

      const formatEmployeeName = (emp) => {
        if (!emp) return "Unknown";
        return (
          emp.username ||
          `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
          emp.email ||
          "Unknown"
        );
      };

      const newTask = {
        id: res.data._id,
        taskName: res.data.taskName,
        description: res.data.description,
        assignedTo: formatEmployeeName(res.data.assignedTo),
        assignedBy: res.data.assignedBy?.username || "",
        department: res.data.department?.departmentName || "",  
        dueDate: new Date(res.data.dueDate).toLocaleDateString(),
        status: res.data.status,
      };

      if (onAddTask) onAddTask(newTask);

      // reset form
      setFormData({
        taskName: "",
        description: "",
        assignedTo: "",
        assignedToId: "",
        dueDate: "",
      });

      onClose();
    } catch (err) {
      console.error("Error creating task:", err.response?.data || err);
      alert("Failed to create task");
    }
  };

  const handleClose = () => {
    setFormData({
      taskName: "",
      description: "",
      assignedTo: "",
      assignedToId: "",
      dueDate: "",
    });
    setShowDropdown(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="addTask-modal-overlay">
      <div className="addTask-modal-container">
        <div className="addTask-modal-header">
          <h2>Add New Task</h2>
          <button className="addTask-close-button" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="addTask-task-form">
          <div className="addTask-form-group">
            <label htmlFor="taskName">Task Name</label>
            <input
              type="text"
              id="taskName"
              name="taskName"
              value={formData.taskName}
              onChange={handleInputChange}
              required
              placeholder="Enter task name"
            />
          </div>

          <div className="addTask-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows="3"
            />
          </div>

          <div className="addTask-form-group">
            <label htmlFor="assignedTo">Assigned To</label>
            <div className="addTask-dropdown-container">
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                required
                placeholder="Type to search employee"
                autoComplete="off"
              />
                {showDropdown && filteredEmployees.length > 0 && (
                  <div className="addTask-dropdown-menu">
                    {filteredEmployees.map((employee) => {
                      const displayName =
                          `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
                          employee.userID?.email ||
                          "Unknown";
                      return (
                        <div
                          key={employee._id}
                          className="addTask-dropdown-item"
                          onClick={() => handleEmployeeSelect(employee)}
                        >
                          {displayName}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          </div>  

          <div className="addTask-form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="addTask-form-actions">
            <button type="button" className="addTask-cancel-button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="addTask-submit-button">
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;