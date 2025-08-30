import React, { useState, useEffect } from 'react';
import './AssignDepartmentModal.css';
import api from '../../../api/api';

const AssignDepartmentModal = ({ isOpen, onClose, onAssignDepartment }) => {
  const [formData, setFormData] = useState({
    userId: "",
    employeeName: "",
    departmentId: "",
    jobTitle: "",
  });

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // fetch employees & departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resUsers = await api.get("/emp-info/all");
        setEmployees(resUsers.data);

        const resDept = await api.get("/department");
        setDepartments(resDept.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    if (isOpen) fetchData();
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // search employee typing
    if (name === "employeeName") {
      setFormData((prev) => ({ ...prev, employeeName: value }));

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
      return;
    }

    // normal select changes
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "departmentId") {
      const dept = departments.find((d) => d._id === value);
      setJobTitles(dept ? dept.jobTitles : []);
      setFormData((prev) => ({ ...prev, jobTitle: "" }));
    }

    if (error) setError("");
  };

  const handleEmployeeSelect = (employee) => {
    const displayName =
      `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
      employee.userID?.email ||
      "Unknown";

    setFormData((prev) => ({
      ...prev,
      employeeName: displayName,
      userId: employee.userID?._id || employee._id,
    }));
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId || !formData.departmentId || !formData.jobTitle) {
      setError("Please select an employee, a department, and a job title");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const payload = {
        userId: formData.userId,
        departmentId: formData.departmentId,
        jobTitle: formData.jobTitle,
      };

      const res = await api.put("/user-department/assign", payload);
      onAssignDepartment(res.data);

      // reset
      setFormData({ userId: "", employeeName: "", departmentId: "", jobTitle: "" });
      setJobTitles([]);
      onClose();
    } catch (err) {
      console.error("Error assigning department:", err);
      setError(err.response?.data?.message || "Failed to assign department");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ userId: "", employeeName: "", departmentId: "", jobTitle: "" });
    setJobTitles([]);
    setError("");
    onClose();
  };

  const selectedDepartment = departments.find(
    (dept) => dept._id === formData.departmentId
  );


  if (!isOpen) return null;

  return (
    <div className="assign-department-modal-overlay" onClick={handleClose}>
      <div className="assign-department-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="assign-department-modal-header">
          <h2>Assign Department to User</h2>
          <button className="assign-department-close-button" onClick={handleClose}>×</button>
        </div>

        {error && <div className="assign-department-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="assign-department-form">
          {/* Employee Search Input */}
          <div className="assign-department-form-group">
            <label htmlFor="employeeName">Employee</label>
            <div className="assign-department-dropdown-container">
              <input
                type="text"
                id="employeeName"
                name="employeeName"
                value={formData.employeeName}
                onChange={handleInputChange}
                required
                placeholder="Type to search employee"
                autoComplete="off"
                disabled={isLoading}
              />
              {showDropdown && filteredEmployees.length > 0 && (
                <div className="assign-department-dropdown-menu">
                  {filteredEmployees.map((employee) => {
                    const displayName =
                      `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
                      employee.userID?.email ||
                      "Unknown";
                    return (
                      <div
                        key={employee._id}
                        className="assign-department-dropdown-item"
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

          <div className="assign-department-form-group">
            <label htmlFor="departmentId">Department</label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>

          <div className="assign-department-form-group">
            <label htmlFor="jobTitle">Job Title</label>
            {(selectedDepartment?.jobTitles?.length ?? 0) > 0 ? (
              <select
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Job Title</option>
                {selectedDepartment.jobTitles.map((jt, index) => (
                  <option key={index} value={jt}>
                    {jt}
                  </option>
                ))}
              </select>
            ) : (
              <p>No job titles available for this department</p>
            )}
          </div>

          <div className="assign-department-form-actions">
            <button 
              type="button" 
              className="assign-department-cancel-button" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="assign-department-submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDepartmentModal;