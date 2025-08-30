import React, { useState, useEffect } from "react";
import api from "../../../api/api";
import "./EmployeeUpdateModal.css";

const EmployeeUpdateModal = ({ isOpen, onClose, employee, onUpdateEmployee }) => {
  const [formData, setFormData] = useState({
    employeeNumber: "",
    hiredDate: "",
    jobTitle: "",
    department: "",
    currentRole: ""
  });

  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [availableJobTitles, setAvailableJobTitles] = useState([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const roleOptions = [
    "Employee",
    "HR", 
  ];

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setIsLoadingDepartments(true);
        const { data } = await api.get("/department");
        
        setDepartmentData(data);
        
        const departmentNames = data.map(dept => dept.departmentName).sort();
        setAvailableDepartments(departmentNames);
      } catch (err) {
        console.error("Error fetching departments:", err);
        // Fallback to hardcoded options if API fails
        setAvailableDepartments([
          "Sales",
          "Marketing", 
          "Compliance",
          "Human Resources",
          "Finance",
          "IT",
          "Operations"
        ]);
        setDepartmentData([]);
      } finally {
        setIsLoadingDepartments(false);
      }
    };

    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);


  useEffect(() => {
    if (!formData.department || departmentData.length === 0) {
      setAvailableJobTitles([]);
      return;
    }

   
    const selectedDepartment = departmentData.find(
      dept => dept.departmentName === formData.department
    );

    if (selectedDepartment && selectedDepartment.jobTitles) {
    
      const jobTitles = selectedDepartment.jobTitles
        .filter(title => title && title.trim() !== "")
        .sort();
      setAvailableJobTitles(jobTitles);
    } else {
      setAvailableJobTitles([]);
    }
  }, [formData.department, departmentData]);

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        employeeNumber: employee.employeeNumber || "",
        hiredDate: employee.hiredDate || "",
        jobTitle: employee.jobTitle || "",
        department: employee.department || "",
        currentRole: employee.currentRole || ""
      });
    }
  }, [employee, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };
      
 
      if (name === 'department' && value !== prev.department) {
        newFormData.jobTitle = "";
      }
      
      return newFormData;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (employee) {
      const { currentRole, ...updateData } = formData;
      onUpdateEmployee(employee._id, updateData);
    }
    onClose();
  };

  const handleCancel = () => {
    if (employee) {
      setFormData({
        employeeNumber: employee.employeeNumber || "",
        hiredDate: employee.hiredDate || "",
        jobTitle: employee.jobTitle || "",
        department: employee.department || "",
        currentRole: employee.currentRole || ""
      });
    }
    onClose();
  };

  if (!isOpen || !employee) return null;

  return (
    <div className="update-modal-overlay">
      <div className="update-modal-content">
        <div className="update-modal-header">
          <h2>Update Employee Information</h2>
          <button 
            className="update-modal-close"
            onClick={handleCancel}
            type="button"
          >
            ×
          </button>
        </div>
        
        <div className="employee-info-header">
          <h3>{employee.name}</h3>
          <p>{employee.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="update-form">
          <div className="form-group">
            <label htmlFor="employeeNumber">Employee Number</label>
            <input
              type="text"
              id="employeeNumber"
              name="employeeNumber"
              value={formData.employeeNumber}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hiredDate">Hired Date</label>
            <input
              type="text"
              id="hiredDate"
              name="hiredDate"
              value={formData.hiredDate}
              onChange={handleInputChange}
              className="form-input"
              placeholder="MM-DD-YYYY"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="jobTitle">Job Title</label>
            <select
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              className="form-select"
              required
              disabled={!formData.department || isLoadingDepartments}
            >
              <option value="">
                {!formData.department 
                  ? "Select department first" 
                  : isLoadingDepartments 
                  ? "Loading..." 
                  : "Select Job Title"}
              </option>
              {availableJobTitles.map((jobTitle) => (
                <option key={jobTitle} value={jobTitle}>
                  {jobTitle}
                </option>
              ))}
            </select>
            {formData.department && availableJobTitles.length === 0 && !isLoadingDepartments && (
              <small className="no-options-note">No job titles available for this department</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="form-select"
              required
              disabled={isLoadingDepartments}
            >
              <option value="">
                {isLoadingDepartments ? "Loading departments..." : "Select Department"}
              </option>
              {availableDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            {isLoadingDepartments && (
              <small className="loading-note">Fetching departments...</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="currentRole">Current Role</label>
            <select
              id="currentRole"
              name="currentRole"
              value={formData.currentRole}
              onChange={handleInputChange}
              className="form-select disabled"
              disabled
              style={{ 
                opacity: 0.5, 
                cursor: 'not-allowed',
                backgroundColor: '#f5f5f5' 
              }}
            >
              <option value="">Select Role</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <small className="role-restriction-note">
              * Only administrators can edit employee roles
            </small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={isLoadingDepartments}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeUpdateModal;