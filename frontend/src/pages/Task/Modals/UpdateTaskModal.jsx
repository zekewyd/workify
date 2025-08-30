import React, { useState, useEffect } from "react";
import "./UpdateTaskModal.css";
import api from "../../../api/api";

const UpdateTaskModal = ({ isOpen, onClose, task, onUpdateTask }) => {
  const [formData, setFormData] = useState({
    taskName: "",
    description: "",
    assignedTo: "", 
    assignedToId: "",
    dueDate: "",
    status: "",
  });

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // fetch all employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/emp-info/all");
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  // prefill form 
  useEffect(() => {
  if (task) {
    let fullName = "";

    // if task.assignedTo is an object, extract what needed
    if (typeof task.assignedTo === "object" && task.assignedTo !== null) {
      fullName = `${task.assignedTo.username || ""}`; 
      // or use firstName + lastName 
    } else {
      fullName = task.assignedTo || "";
    }

    setFormData({
      taskName: task.taskName || "",
      description: task.description || "",
      assignedTo: fullName,                // always string for input
      assignedToId:
        typeof task.assignedTo === "object"
          ? task.assignedTo._id
          : task.assignedToId || "",
      dueDate: task.dueDate
        ? task.dueDate.split("T")[0] // ISO format "YYYY-MM-DD"
        : "",
      status: task.status || "in progress",
    });
  }
}, [task]);

  // filter employees when typing
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

  // when selecting employee from dropdown
  const handleEmployeeSelect = (emp) => {
    const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`;
    setFormData((prev) => ({
      ...prev,
      assignedTo: fullName,
      assignedToId: emp._id, // save actual MongoDB id
    }));
    setShowDropdown(false);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // build payload that matches backend schema
    const payload = {
      taskName: formData.taskName,
      description: formData.description,
      assignedTo: formData.assignedToId, // 
      dueDate: new Date(formData.dueDate).toISOString(), // standardize
      status: formData.status,
    };

    const res = await api.put(`/tasks/${task.id}`, payload);

    // normalize for parent
    const updatedTask = {
      ...res.data,
      assignedTo: `${res.data.assignedTo?.firstName || ""} ${res.data.assignedTo?.lastName || ""}`.trim(),
      assignedBy: `${res.data.assignedBy?.firstName || ""} ${res.data.assignedBy?.lastName || ""}`.trim(),
      department: res.data.department?.departmentName || "",
      dueDate: new Date(res.data.dueDate).toLocaleDateString(),
    };

    onUpdateTask(task.id, updatedTask);
    onClose();
  } catch (err) {
    console.error("Error updating task:", err);
  }
};

if (!isOpen) return null;

  return (
    <div className="update-task-modal-overlay">
      <div className="update-task-modal">
        <div className="update-task-modal-header">
          <h2>Update Task</h2>
          <button className="update-task-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="update-task-form">
          {error && (
            <div className="update-task-error">
              {error}
            </div>
          )}

          <div className="update-task-form-group">
            <label htmlFor="taskName">Task Name</label>
            <input
              type="text"
              id="taskName"
              name="taskName"
              value={formData.taskName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="update-task-form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              required
            />
          </div>

          <div className="update-task-form-group">
            <label htmlFor="assignedTo">Assigned To</label>
            <div className="update-task-dropdown-container">
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
                <div className="update-task-dropdown-menu">
                  {filteredEmployees.map((emp) => {
                    const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`;
                    return (
                      <div
                        key={emp._id}
                        className="update-task-dropdown-item"
                        onClick={() => handleEmployeeSelect(emp)}
                      >
                        {fullName}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="update-task-form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
            />
          </div>

        <div className="update-task-form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="in progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="update-task-modal-actions">
            <button
              type="button"
              className="update-task-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="update-task-submit-btn"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTaskModal;